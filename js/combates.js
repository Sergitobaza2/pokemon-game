import { auth, db, onAuthStateChanged, doc, getDoc, updateDoc, arrayUnion } from './firebase-config.js';

// === OPCIONES DE LA RULETA GANADORA ===
const WINNER_OPTIONS = [
    { text: 'Objeto competitivo', type: 'competitive', emoji: '💎', color: '#9b59b6' },
    { text: 'Cambio favorable', type: 'favorableSwitch', emoji: '🔄', color: '#3498db' },
    { text: '2 minisetas', type: 'twoMinisetas', emoji: '👕👕', color: '#e74c3c' },
    { text: 'Revivir', type: 'revive', emoji: '🕊️', color: '#2ecc71' },
    { text: '5 monedas extra', type: 'coins5', emoji: '💰+5', color: '#f1c40f' },
    { text: 'Randomizar habilidad', type: 'randomizeAbility', emoji: '🎲', color: '#8e44ad' },
    { text: 'Master Ball', type: 'masterBall', emoji: '🎯', color: '#d35400' },
    { text: 'Pokémon aleatorio', type: 'pokemon', emoji: '🌿', color: '#1abc9c' }
];

// === OPCIONES DE LA RULETA PERDEDORA ===
const LOSER_OPTIONS = [
    { text: '2 monedas extra', type: 'coins2', emoji: '💰+2', color: '#27ae60' },
    { text: 'Chapas', type: 'chapas', emoji: '🎖️', color: '#f39c12' },
    { text: 'Liberar Pokémon', type: 'releasePokemon', emoji: '🕊️', color: '#16a085' },
    { text: 'Pokémon baneado', type: 'ban', emoji: '🚫', color: '#c0392b' },
    { text: 'Piedra evolutiva', type: 'evolutionStone', emoji: '🪨', color: '#8e44ad' },
    { text: 'Restos', type: 'leftovers', emoji: '🍖', color: '#2c3e50' },
    { text: 'Dar 2 monedas', type: 'loseCoins2', emoji: '💸-2', color: '#7f8c8d' },
    { text: 'Naturaleza', type: 'nature', emoji: '🌿', color: '#27ae60' }
];

let currentUserId = null;
let winnerWheel = null;
let loserWheel = null;
let isSpinning = false;

// === CREAR UNA RULETA ===
function createWheel(canvasId, options, callback) {
    const segments = options.map(option => ({
        fillStyle: option.color,
        text: `${option.emoji}\n${option.text}`,
        textFontSize: 50,
        textFontFamily: 'Arial, sans-serif',
        textFillStyle: '#ffffff',
        textStrokeStyle: '#000000',
        textLineWidth: 2,
        textOrientation: 'horizontal',
        textAlignment: 'center',
        textMargin: 100
    }));

    return new Winwheel({
        canvasId: canvasId,
        numSegments: options.length,
        outerRadius: 1100,
        innerRadius: 160,
        textFontSize: 50,
        textFontFamily: 'Arial, sans-serif',
        textFillStyle: '#ffffff',
        textStrokeStyle: '#000000',
        textLineWidth: 8,
        textOrientation: 'horizontal',
        textAlignment: 'center',
        textMargin: 100,
        segments: segments,
        animation: {
            type: 'spinToStop',
            duration: 5,
            spins: 8 + Math.random() * 4,
            callbackFinished: callback,
            callbackAfter: () => {}
        }
    });
}

// === GIRO DE GANADOR ===
async function handleWinnerSpin() {
    if (isSpinning) return;
    isSpinning = true;

    const userDoc = await getDoc(doc(db, "users", currentUserId));
    const userData = userDoc.data();
    const spins = userData.winnerSpins || 0;

    if (spins <= 0) {
        showMessage('winner', 'No tienes tiradas', true);
        isSpinning = false;
        return;
    }

    document.getElementById('winnerResult').style.display = 'none';
    winnerWheel.animation.spins = 8 + Math.random() * 4;
    winnerWheel.startAnimation();
}

// === GIRO DE PERDEDOR ===
async function handleLoserSpin() {
    if (isSpinning) return;
    isSpinning = true;

    const userDoc = await getDoc(doc(db, "users", currentUserId));
    const userData = userDoc.data();
    const spins = userData.loserSpins || 0;

    if (spins <= 0) {
        showMessage('loser', 'No tienes tiradas', true);
        isSpinning = false;
        return;
    }

    document.getElementById('loserResult').style.display = 'none';
    loserWheel.animation.spins = 8 + Math.random() * 4;
    loserWheel.startAnimation();
}

// === CONSUMIR TIRADA Y APLICAR EFECTOS INMEDIATOS ===
async function consumeSpinAndApply(type, option) {
    try {
        const userRef = doc(db, "users", currentUserId);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) return;

        const data = userDoc.data();
        const now = Date.now();
        const updateData = {};

        // Consumir una tirada
        if (type === 'winner') {
            updateData.winnerSpins = (data.winnerSpins || 1) - 1;
        } else {
            updateData.loserSpins = (data.loserSpins || 1) - 1;
        }

        // ✅ APLICAR EFECTOS INMEDIATOS SEGÚN EL TIPO DE RECOMPENSA
        switch (option.type) {
            case 'coins5':
                updateData.coins = (data.coins || 0) + 5;
                break;
            case 'coins2':
                updateData.coins = (data.coins || 0) + 2;
                break;
            case 'loseCoins2':
                updateData.coins = Math.max((data.coins || 0) - 2, 0);
                break;
            case 'pokemon':
                updateData.randomEncountersAvailable = (data.randomEncountersAvailable || 0) + 1;
                break;
            // El resto (objetos, minisetas, etc.) no modifican recursos directamente
        }

        // Guardar en historial de recompensas (para ver en menú)
        const rewardEntry = {
            id: now,
            type: option.type,
            text: option.text,
            emoji: option.emoji,
            timestamp: now,
            used: false
        };
        updateData.dailyRewards = arrayUnion(rewardEntry);

        await updateDoc(userRef, updateData);
        showMessage(type, `¡${option.text}!`);
        loadUserData();

    } catch (error) {
        console.error("Error al aplicar recompensa:", error);
        showMessage(type, 'Error al procesar', true);
    } finally {
        isSpinning = false;
    }
}

function showMessage(type, text, isError = false) {
    const el = document.getElementById(type === 'winner' ? 'winnerResult' : 'loserResult');
    el.textContent = text;
    el.className = isError ? 'result-display error' : 'result-display winning';
    el.style.display = 'block';
}

// === CALLBACKS DE FINALIZACIÓN ===
function handleWinnerResult() {
    const idx = winnerWheel.getIndicatedSegmentNumber() - 1;
    const option = WINNER_OPTIONS[idx];
    consumeSpinAndApply('winner', option);
}

function handleLoserResult() {
    const idx = loserWheel.getIndicatedSegmentNumber() - 1;
    const option = LOSER_OPTIONS[idx];
    consumeSpinAndApply('loser', option);
}

// === CARGAR DATOS DEL USUARIO ===
async function loadUserData() {
    const userDoc = await getDoc(doc(db, "users", currentUserId));
    if (userDoc.exists()) {
        const data = userDoc.data();
        document.getElementById('winnerSpinsCount').textContent = data.winnerSpins || 0;
        document.getElementById('loserSpinsCount').textContent = data.loserSpins || 0;

        document.getElementById('winnerSpinBtn').disabled = (data.winnerSpins || 0) <= 0 || isSpinning;
        document.getElementById('loserSpinBtn').disabled = (data.loserSpins || 0) <= 0 || isSpinning;
    }
}

// === INICIALIZAR TODO ===
function init() {
    winnerWheel = createWheel('winnerWheelCanvas', WINNER_OPTIONS, handleWinnerResult);
    loserWheel = createWheel('loserWheelCanvas', LOSER_OPTIONS, handleLoserResult);
    winnerWheel.draw();
    loserWheel.draw();

    document.getElementById('winnerSpinBtn').addEventListener('click', handleWinnerSpin);
    document.getElementById('loserSpinBtn').addEventListener('click', handleLoserSpin);
    document.getElementById('backToMenuBtn').addEventListener('click', () => {
        window.location.href = 'menu.html';
    });
}

// === AUTH STATE ===
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserId = user.uid;
        await loadUserData();
        init();
    } else {
        window.location.href = 'index.html';
    }
});