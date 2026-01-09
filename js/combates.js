import { auth, db, onAuthStateChanged, doc, getDoc, updateDoc } from './firebase-config.js';

// === OPCIONES DE LAS RULETAS ===
const WINNER_OPTIONS = [
    { text: 'Objeto competitivo', type: 'competitive', emoji: '💎', color: '#9b59b6' },
    { text: 'Captura extra', type: 'extraCapture', emoji: '🪀', color: '#3498db' },
    { text: 'Skip', type: 'skip', emoji: '⏭️', color: '#e74c3c' },
    { text: 'Naturaleza', type: 'nature', emoji: '🌿', color: '#2ecc71' },
    { text: 'Habilidad oculta', type: 'hiddenAbility', emoji: '🌟', color: '#f39c12' },
    { text: 'Moneda prodigiosa', type: 'luckyCoin', emoji: '🪙', color: '#d35400' }
];

const LOSER_OPTIONS = [
    { text: 'Perder 1 vida', type: 'loseLife', emoji: '💔', color: '#c0392b' },
    { text: 'Perder 2 vidas', type: 'loseLife2', emoji: '💀', color: '#7f8c8d' },
    { text: 'Banear Pokémon', type: 'ban', emoji: '🚫', color: '#2c3e50' },
    { text: 'Pérdida de objeto', type: 'loseItem', emoji: '📦', color: '#8e44ad' },
    { text: 'Nada', type: 'nothing', emoji: '😐', color: '#bdc3c7' },
    { text: 'Revivir', type: 'revive', emoji: '🕊️', color: '#27ae60' }
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
        textFontSize: 60,
        textFontFamily: 'Arial, sans-serif',
        textFillStyle: '#ffffff',
        textStrokeStyle: '#000000',
        textLineWidth: 2,
        textOrientation: 'horizontal',
        textAlignment: 'center',
        textMargin: 120
    }));

    return new Winwheel({
        canvasId: canvasId,
        numSegments: options.length,
        outerRadius: 1100,
        innerRadius: 160,
        textFontSize: 60,
        textFontFamily: 'Arial, sans-serif',
        textFillStyle: '#ffffff',
        textStrokeStyle: '#000000',
        textLineWidth: 8,
        textOrientation: 'horizontal',
        textAlignment: 'center',
        textMargin: 120,
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
        document.getElementById('winnerResult').textContent = 'No tienes tiradas';
        document.getElementById('winnerResult').className = 'result-display error';
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
        document.getElementById('loserResult').textContent = 'No tienes tiradas';
        document.getElementById('loserResult').className = 'result-display error';
        isSpinning = false;
        return;
    }

    document.getElementById('loserResult').style.display = 'none';
    loserWheel.animation.spins = 8 + Math.random() * 4;
    loserWheel.startAnimation();
}

// === CONSUMIR TIRADA Y APLICAR EFECTO ===
async function consumeSpinAndApply(type, option) {
    try {
        const userRef = doc(db, "users", currentUserId);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) return;

        const data = userDoc.data();
        const updateData = {};

        if (type === 'winner') {
            updateData.winnerSpins = (data.winnerSpins || 1) - 1;
            // Aquí podrías añadir más lógica (ej: dar recompensas)
            showMessage('winner', `¡${option.text}!`);
        } else {
            updateData.loserSpins = (data.loserSpins || 1) - 1;
            // Aplicar efectos negativos
            if (option.type === 'loseLife') {
                updateData.lives = Math.max((data.lives || 100) - 1, 0);
            } else if (option.type === 'loseLife2') {
                updateData.lives = Math.max((data.lives || 100) - 2, 0);
            }
            showMessage('loser', `¡${option.text}!`);
        }

        await updateDoc(userRef, updateData);
        loadUserData();

    } catch (error) {
        console.error("Error al aplicar efecto:", error);
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

// === CALLBACKS ===
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

// === INICIALIZAR ===
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

// === AUTH ===
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserId = user.uid;
        await loadUserData();
        init();
    } else {
        window.location.href = 'index.html';
    }
});