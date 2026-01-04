import { auth, db, onAuthStateChanged, doc, getDoc, updateDoc, arrayUnion, increment } from './firebase-config.js';

let currentUserId = null;
let winnerWheel = null;
let loserWheel = null;
let isSpinning = false;

const winnerSpinsCount = document.getElementById('winnerSpinsCount');
const loserSpinsCount = document.getElementById('loserSpinsCount');
const winnerSpinBtn = document.getElementById('winnerSpinBtn');
const loserSpinBtn = document.getElementById('loserSpinBtn');
const winnerResult = document.getElementById('winnerResult');
const loserResult = document.getElementById('loserResult');
const backToMenuBtn = document.getElementById('backToMenuBtn');

const WINNER_REWARDS = [
    { text: "Objeto competitivo", type: "competitive", emoji: "💎", color: "#9b59b6" },
    { text: "Cambiar Pokémon rival", type: "changeRival", emoji: "🔄", color: "#3498db" },
    { text: "2 minisetas", type: "miniseta", value: 2, emoji: "👕", color: "#e91e63" },
    { text: "Revivir", type: "revive", emoji: "🕊️", color: "#2ecc71" },
    { text: "100 monedas", type: "coins", value: 100, emoji: "💰", color: "#f1c40f" },
    { text: "Randomizar habilidad", type: "randomizeAbility", emoji: "🎲", color: "#8e44ad" },
    { text: "Master Ball", type: "masterBall", emoji: "🎯", color: "#f39c12" },
    { text: "Pokemon aleatorio", type: "pokemon", emoji: "🌿", color: "#1abc9c" }
];

const LOSER_REWARDS = [
    { text: "50 monedas", type: "coins", value: 50, emoji: "💰", color: "#f39c12" },
    { text: "1 chapa de cada tipo", type: "badgeSet", emoji: "🏅", color: "#34495e" },
    { text: "Liberar pokemon", type: "release", emoji: "🕊️", color: "#27ae60" },
    { text: "Pokemon baneado", type: "ban", emoji: "🚫", color: "#e74c3c" },
    { text: "Piedra evolutiva", type: "evolutionStone", emoji: "🔮", color: "#9b59b6" },
    { text: "Restos", type: "restos", emoji: "🍖", color: "#7f8c8d" },
    { text: "-50 monedas", type: "coins", value: -50, emoji: "💸", color: "#c0392b" },
    { text: "Naturaleza", type: "nature", emoji: "🌿", color: "#2ecc71" }
];

function initWheels() {
    const OUTER_RADIUS = 1100;
    const INNER_RADIUS = 240;
    const TEXT_FONT_SIZE = 65;
    const TEXT_MARGIN = 80;

    winnerWheel = new Winwheel({
        'canvasId': 'winnerWheelCanvas',
        'numSegments': WINNER_REWARDS.length,
        'outerRadius': OUTER_RADIUS,
        'innerRadius': INNER_RADIUS,
        'textFontSize': TEXT_FONT_SIZE,
        'textFontFamily': 'Arial, sans-serif',
        'textFillStyle': '#ffffff',
        'textStrokeStyle': '#000000',
        'textLineWidth': 4,
        'textOrientation': 'horizontal',
        'textAlignment': 'center',
        'textMargin': TEXT_MARGIN,
        'segments': WINNER_REWARDS.map(opt => ({
            'fillStyle': opt.color,
            'text': `${opt.emoji}\n${opt.text}`
        })),
        'animation': {
            'type': 'spinToStop',
            'duration': 6,
            'spins': 10,
            'callbackFinished': () => handleSpinResult('winner')
        }
    });

    loserWheel = new Winwheel({
        'canvasId': 'loserWheelCanvas',
        'numSegments': LOSER_REWARDS.length,
        'outerRadius': OUTER_RADIUS,
        'innerRadius': INNER_RADIUS,
        'textFontSize': TEXT_FONT_SIZE,
        'textFontFamily': 'Arial, sans-serif',
        'textFillStyle': '#ffffff',
        'textStrokeStyle': '#000000',
        'textLineWidth': 4,
        'textOrientation': 'horizontal',
        'textAlignment': 'center',
        'textMargin': TEXT_MARGIN,
        'segments': LOSER_REWARDS.map(opt => ({
            'fillStyle': opt.color,
            'text': `${opt.emoji}\n${opt.text}`
        })),
        'animation': {
            'type': 'spinToStop',
            'duration': 6,
            'spins': 10,
            'callbackFinished': () => handleSpinResult('loser')
        }
    });

    winnerWheel.draw();
    loserWheel.draw();
}

function showMessage(el, text, isError = false) {
    el.textContent = text;
    el.className = isError ? 'result-display error' : 'result-display winning';
    setTimeout(() => { el.textContent = ''; el.className = 'result-display'; }, 5000);
}

async function handleSpinResult(type) {
    isSpinning = false;
    const wheel = type === 'winner' ? winnerWheel : loserWheel;
    const optionIndex = wheel.getIndicatedSegmentNumber() - 1;
    const option = type === 'winner' ? WINNER_REWARDS[optionIndex] : LOSER_REWARDS[optionIndex];
    const resultEl = type === 'winner' ? winnerResult : loserResult;

    try {
        const userRef = doc(db, "users", currentUserId);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) return;

        const updateData = {};
        let addToRewards = true;

        if (option.type === 'coins') {
            updateData.coins = increment(option.value);
            addToRewards = false;
        } else if (option.type === 'pokemon') {
            updateData.randomEncountersAvailable = increment(1);
            addToRewards = false;
        } else {
            const rewardEntry = {
                id: Date.now() + Math.random(),
                type: option.type,
                text: option.text,
                emoji: option.emoji,
                timestamp: Date.now(),
                used: false
            };
            updateData.dailyRewards = arrayUnion(rewardEntry);
        }

        if (type === 'winner') {
            updateData.winnerSpins = increment(-1);
        } else {
            updateData.loserSpins = increment(-1);
        }

        await updateDoc(userRef, updateData);
        showMessage(resultEl, `¡${option.text}!`);
        loadUserData();

    } catch (error) {
        console.error("Error al aplicar recompensa:", error);
        showMessage(resultEl, "Error al aplicar recompensa", true);
        isSpinning = false; // ✅ Asegurar desbloqueo en error
    }
}

// ✅ FUNCIÓN CORREGIDA: Evita el atasco
async function spinWheel(type) {
    if (isSpinning) return;
    isSpinning = true;

    const wheel = type === 'winner' ? winnerWheel : loserWheel;

    // ✅ Detener animación previa y reiniciar
    if (wheel.animation) {
        wheel.stopAnimation(false);
    }
    wheel.rotationAngle = 0;
    wheel.draw();

    // ✅ Nueva animación
    wheel.animation.spins = 10 + Math.random() * 5;
    wheel.startAnimation();
}

async function loadUserData() {
    const userDoc = await getDoc(doc(db, "users", currentUserId));
    if (!userDoc.exists()) return;

    const data = userDoc.data();
    const winnerSpins = data.winnerSpins || 0;
    const loserSpins = data.loserSpins || 0;

    winnerSpinsCount.textContent = winnerSpins;
    loserSpinsCount.textContent = loserSpins;

    winnerSpinBtn.disabled = winnerSpins <= 0;
    loserSpinBtn.disabled = loserSpins <= 0;
}

winnerSpinBtn.addEventListener('click', () => spinWheel('winner'));
loserSpinBtn.addEventListener('click', () => spinWheel('loser'));
backToMenuBtn.addEventListener('click', () => window.location.href = 'menu.html');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserId = user.uid;
        await loadUserData();
        initWheels();
    } else {
        window.location.href = 'index.html';
    }
});