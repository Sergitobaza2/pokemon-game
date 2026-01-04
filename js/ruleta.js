import { auth, db, onAuthStateChanged, doc, getDoc, updateDoc, arrayUnion, increment } from './firebase-config.js';

// ✅ OPCIONES DE LA RULETA DIARIA
const WHEEL_OPTIONS = [
    { text: 'Un skip', type: 'skip', emoji: '⏭️', color: '#e91e63' },
    { text: 'Captura extra', type: 'extraCapture', emoji: '🪀', color: '#34495e' },
    { text: 'Poción', type: 'potion', emoji: '🧪', color: '#2ecc71' },
    { text: '1 tirada extra', type: 'bonusSpin', emoji: '🔄', color: '#3498db' },
    { text: 'Naturaleza', type: 'nature', emoji: '🌿', color: '#f1c40f' },
    { text: 'Miniseta', type: 'miniseta', emoji: '👕', color: '#9b59b6' },
    { text: 'Banear', type: 'ban', emoji: '🚫', color: '#e74c3c' },
    { text: '50 monedas extra', type: 'coins', value: 50, emoji: '💰', color: '#f39c12' }
];

let currentUserId = null;
let wheel = null;
let isSpinning = false;
let spinHistory = [];
let lastSpinTimestamp = null;
let bonusSpins = 0;
let countdownInterval = null;

const spinBtn = document.getElementById('spinBtn');
const resultDisplay = document.getElementById('result');
const backToMenuBtn = document.getElementById('backToMenuBtn');
const historyList = document.getElementById('historyList');
const countdownStatusEl = document.getElementById('dailyCountdownStatus');

// === INICIALIZAR RULETA ===
function initWheel() {
    const segments = WHEEL_OPTIONS.map(option => ({
        'fillStyle': option.color,
        'text': `${option.emoji}\n${option.text}`,
        'textFontSize': 70,
        'textFontFamily': 'Arial, sans-serif',
        'textFillStyle': '#ffffff',
        'textStrokeStyle': '#000000',
        'textLineWidth': 3,
        'textOrientation': 'horizontal',
        'textAlignment': 'center',
        'textMargin': 140
    }));
    
    wheel = new Winwheel({
        'canvasId': 'wheelCanvas',
        'numSegments': WHEEL_OPTIONS.length,
        'outerRadius': 1100,
        'innerRadius': 160,
        'textFontSize': 70,
        'textFontFamily': 'Arial, sans-serif',
        'textFillStyle': '#ffffff',
        'textStrokeStyle': '#000000',
        'textLineWidth': 10,
        'textOrientation': 'horizontal',
        'textAlignment': 'center',
        'textMargin': 140,
        'segments': segments,
        'animation': {
            'type': 'spinToStop',
            'duration': 6,
            'spins': 12,
            'callbackFinished': handleSpinResult,
            'callbackAfter': () => {}
        }
    });
    wheel.draw();
}

// === PUEDE GIRAR HOY? ===
function canSpinNow() {
    const now = Date.now();
    const hasDailySpin = lastSpinTimestamp && (now - lastSpinTimestamp < 24 * 60 * 60 * 1000);
    return bonusSpins > 0 || !hasDailySpin;
}

// === ACTUALIZAR CONTADOR ===
function updateCountdownAndButton() {
    const now = Date.now();
    const hasDailySpin = lastSpinTimestamp && (now - lastSpinTimestamp < 24 * 60 * 60 * 1000);
    const canSpin = bonusSpins > 0 || !hasDailySpin;

    spinBtn.disabled = !canSpin || isSpinning;

    if (bonusSpins > 0) {
        countdownStatusEl.textContent = `¡Tienes ${bonusSpins} tirada${bonusSpins !== 1 ? 's' : ''} extra!`;
        countdownStatusEl.className = "countdown-status ready";
    } else if (hasDailySpin) {
        const nextSpinTime = lastSpinTimestamp + 24 * 60 * 60 * 1000;
        const remaining = nextSpinTime - now;
        if (remaining > 0) {
            const h = Math.floor(remaining / (1000 * 60 * 60));
            const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((remaining % (1000 * 60)) / 1000);
            countdownStatusEl.textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            countdownStatusEl.className = "countdown-status waiting";
            if (!countdownInterval) {
                countdownInterval = setInterval(updateCountdownAndButton, 1000);
            }
            return;
        }
    }

    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    if (!hasDailySpin || bonusSpins > 0) {
        countdownStatusEl.textContent = "¡Gira hoy!";
        countdownStatusEl.className = "countdown-status ready";
    }
}

// === MANEJAR GIRO ===
async function handleSpin() {
    if (isSpinning || !canSpinNow()) return;

    isSpinning = true;
    resultDisplay.style.display = 'none';

    try {
        if (wheel.animation) {
            wheel.stopAnimation(false);
            wheel.rotationAngle = 0;
            wheel.draw();
        }
        wheel.animation.spins = 12 + Math.random() * 4;
        wheel.startAnimation();
    } catch (error) {
        console.error("Error al girar:", error);
        isSpinning = false;
    }
}

// === CONSUMIR TIRADA AL GIRAR ===
async function consumeSpin() {
    const userRef = doc(db, "users", currentUserId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) return;

    const data = userDoc.data();
    const currentBonus = data.bonusSpins || 0;

    if (currentBonus > 0) {
        await updateDoc(userRef, { bonusSpins: increment(-1) });
        bonusSpins = currentBonus - 1;
    } else {
        await updateDoc(userRef, { lastDailySpin: Date.now() });
        lastSpinTimestamp = Date.now();
    }
}

// === APLICAR RECOMPENSA TRAS GIRO ===
async function applyWheelEffect(option) {
    if (!currentUserId) return;
    try {
        const userRef = doc(db, "users", currentUserId);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) return;

        const now = Date.now();
        const updateData = {};

        switch (option.type) {
            case 'coins':
                updateData.coins = increment(50);
                break;
            case 'bonusSpin':
                updateData.bonusSpins = increment(2);
                bonusSpins += 2;
                break;
            case 'extraCapture':
            case 'skip':
            case 'potion':
            case 'nature':
            case 'miniseta':
            case 'ban':
                updateData.dailyRewards = arrayUnion({
                    id: now,
                    type: option.type,
                    text: option.text,
                    emoji: option.emoji,
                    timestamp: now,
                    used: false
                });
                break;
        }

        await updateDoc(userRef, updateData);
        updateCountdownAndButton();

    } catch (error) {
        console.error("Error al aplicar recompensa:", error);
        resultDisplay.textContent = 'Error al aplicar recompensa';
        resultDisplay.className = 'result-display error';
    }
}

// === AL FINALIZAR GIRO ===
async function handleSpinResult() {
    isSpinning = false;
    const optionIndex = wheel.getIndicatedSegmentNumber() - 1;
    const option = WHEEL_OPTIONS[optionIndex];

    await consumeSpin();
    await applyWheelEffect(option);

    resultDisplay.textContent = `¡${option.text}!`;
    resultDisplay.className = 'result-display winning';
    resultDisplay.style.display = 'block';

    addToHistoryAndSave(option);
}

// === HISTORIAL ===
async function addToHistoryAndSave(option) {
    const now = new Date();
    const historyItem = {
        text: option.text,
        type: option.type,
        emoji: option.emoji,
        time: now.toLocaleTimeString('es-ES'),
        date: now.toLocaleDateString('es-ES'),
        timestamp: now.getTime()
    };
    spinHistory.unshift(historyItem);
    if (spinHistory.length > 10) spinHistory = spinHistory.slice(0, 10);
    renderHistory();
    try {
        await updateDoc(doc(db, "users", currentUserId), { spinHistory: spinHistory });
    } catch (error) {
        console.error("Error al guardar historial:", error);
    }
}

function renderHistory() {
    historyList.innerHTML = spinHistory.length === 0 
        ? '<div class="history-empty">No has girado aún.</div>'
        : spinHistory.map(item => `
            <div class="history-item">
                <div class="history-content">
                    <span class="history-emoji">${item.emoji}</span>
                    <span class="history-text">${item.text}</span>
                </div>
                <div class="history-time">${item.time}</div>
            </div>
        `).join('');
}

async function loadHistoryFromFirebase() {
    if (!currentUserId) return;
    try {
        const userDoc = await getDoc(doc(db, "users", currentUserId));
        if (userDoc.exists()) {
            spinHistory = (userDoc.data().spinHistory || [])
                .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                .slice(0, 10);
            renderHistory();
        }
    } catch (error) {
        console.error("Error al cargar historial:", error);
    }
}

// === EVENTOS ===
spinBtn.addEventListener('click', handleSpin);
backToMenuBtn.addEventListener('click', () => {
    if (countdownInterval) clearInterval(countdownInterval);
    window.location.href = 'menu.html';
});

// === INICIALIZACIÓN ===
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserId = user.uid;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            lastSpinTimestamp = userData.lastDailySpin || null;
            bonusSpins = userData.bonusSpins || 0;
            await loadHistoryFromFirebase();
        }
        initWheel();
        updateCountdownAndButton();
    } else {
        window.location.href = 'index.html';
    }
});