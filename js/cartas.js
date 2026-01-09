import { auth, db, onAuthStateChanged, doc, getDoc, updateDoc, arrayUnion } from './firebase-config.js';

const userCoins = document.getElementById('userCoins');
const cardsGrid = document.getElementById('cardsGrid');
const backBtn = document.getElementById('backBtn');
const cardsMessage = document.getElementById('cardsMessage');

let currentUserId = null;
let currentCoins = 100;
let isBuying = false; // 🔒 Evita compras concurrentes

// ✅ LISTA DE OBJETOS COMPETITIVOS
const COMPETITIVE_ITEMS = [
    "Restos", "Vidasfera", "Casco dentado", "Chaleco asalto",
    "Seguro debilidad", "Banda focus", "Botas gruesas",
    "Cinta eleccion", "Gafas eleccion", "Pañuelo eleccion",
    "Dado trucado", "Globo helio", "Lodo negro", "Mineral evolutivo"
];

// ✅ CATÁLOGO DE CARTAS
const cardsCatalog = [
    { id: 20, name: "Esquema", emoji: "📊", rarity: "Épica", price: 10, type: "esquema" },
    { id: 21, name: "Randomizar habilidad", emoji: "🎲", rarity: "Épica", price: 10, type: "randomizeAbility" },
    { id: 22, name: "Master Ball", emoji: "🎯", rarity: "Legendaria", price: 3, type: "masterBall" },
    { id: 23, name: "Revivir", emoji: "🕊️", rarity: "Rara", price: 30, type: "revive" },
    { id: 24, name: "3 skips", emoji: "⏭️", rarity: "Épica", price: 3, type: "skip", value: 3 },
    { id: 26, name: "Objeto competitivo", emoji: "💎", rarity: "Épica", price: 4, type: "competitive" },
    { id: 27, name: "Pokemon aleatorio", emoji: "🌿", rarity: "Común", price: 5, type: "pokemon" },
    { id: 28, name: "Captura extra", emoji: "🪀", rarity: "Rara", price: 3, type: "extraCapture" },
    { id: 29, name: "Moneda prodigiosa", emoji: "🪙", rarity: "Legendaria", price: 1, type: "luckyCoin" },
    { id: 30, name: "Miniseta", emoji: "👕", rarity: "Común", price: 1, type: "miniseta" },
    { id: 31, name: "Megapiedra a elegir", emoji: "🪨", rarity: "Legendaria", price: 2, type: "megaStone" },
    { id: 32, name: "Copiar un pokemon", emoji: "📋", rarity: "Épica", price: 40, type: "copyPokemon" }
];

function showMessage(text, isError = false) {
    cardsMessage.textContent = text;
    cardsMessage.className = isError ? 'message-container error' : 'message-container';
    cardsMessage.style.display = 'block';
    setTimeout(() => { cardsMessage.style.display = 'none'; }, 3000);
}

// ✅ Desactivar/reactivar visualmente las cartas
function disableAllCards(disable) {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        if (disable) {
            card.classList.add('disabled');
            card.style.pointerEvents = 'none';
            card.style.opacity = '0.6';
        } else {
            renderCards(); // Restaura estado realista
        }
    });
}

// ✅ Renderizado seguro (sin listeners duplicados)
function renderCards() {
    cardsGrid.innerHTML = ''; // Destruye listeners anteriores
    cardsCatalog.forEach(card => {
        const isAffordable = currentCoins >= card.price;
        const cardElement = document.createElement('div');
        cardElement.className = `card card-${card.type} ${isAffordable ? '' : 'disabled'}`;
        cardElement.innerHTML = `
            <div class="card-image">${card.emoji}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-rarity">${card.rarity}</div>
            <div class="card-price">💰 ${card.price}</div>
        `;
        if (isAffordable) {
            cardElement.addEventListener('click', () => buyCard(card));
        }
        cardsGrid.appendChild(cardElement);
    });
}

// ✅ COMPRA SEGURA: usa saldo REMOTO como fuente de verdad
async function buyCard(card) {
    if (isBuying) return;

    isBuying = true;
    disableAllCards(true);

    try {
        const userRef = doc(db, "users", currentUserId);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            showMessage('Usuario no encontrado', true);
            return;
        }

        const userData = userDoc.data();
        const remoteCoins = userData.coins ?? 100; // ✅ Fuente de verdad

        if (remoteCoins < card.price) {
            showMessage('¡No tienes suficientes monedas!', true);
            return;
        }

        const newCoins = remoteCoins - card.price;
        let msg = `¡Has comprado ${card.name}!`;

        if (card.type === "pokemon") {
            // ✅ CORREGIDO: Añade un uso SIN redirigir
            const currentUsos = userData.randomEncountersAvailable || 0;
            const newUsos = currentUsos + 1;

            await updateDoc(userRef, {
                coins: newCoins,
                randomEncountersAvailable: newUsos
            });

            msg = `¡Has obtenido 1 uso para generar un Pokémon! (Total: ${newUsos})`;

        } else if (card.type === "competitive") {
            const randomItem = COMPETITIVE_ITEMS[Math.floor(Math.random() * COMPETITIVE_ITEMS.length)];
            const newCard = {
                id: card.id,
                name: randomItem,
                type: card.type,
                emoji: card.emoji,
                rarity: card.rarity,
                timestamp: Date.now()
            };

            await updateDoc(userRef, {
                coins: newCoins,
                cards: arrayUnion(newCard)
            });
            msg = `¡Has obtenido ${randomItem}!`;

        } else {
            const newCard = {
                id: card.id,
                name: card.name,
                type: card.type,
                emoji: card.emoji,
                rarity: card.rarity,
                timestamp: Date.now(),
                ...(card.value !== undefined && { value: card.value })
            };

            await updateDoc(userRef, {
                coins: newCoins,
                cards: arrayUnion(newCard)
            });
        }

        // ✅ Actualizar estado local con el valor confirmado
        currentCoins = newCoins;
        userCoins.textContent = currentCoins;
        renderCards();
        showMessage(msg);

    } catch (error) {
        console.error("Error al comprar carta:", error);
        showMessage('Error al procesar la compra', true);
    } finally {
        isBuying = false;
        disableAllCards(false);
    }
}

backBtn.addEventListener('click', () => window.location.href = 'menu.html');

// ✅ Inicialización
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserId = user.uid;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.role === 'admin') {
                window.location.href = 'dashboard.html';
                return;
            }
            currentCoins = userData.coins ?? 100;
            userCoins.textContent = currentCoins;
            if (userData.coins === undefined) {
                await updateDoc(doc(db, "users", user.uid), { coins: 100 });
                currentCoins = 100;
                userCoins.textContent = 100;
            }
            renderCards();
        } else {
            window.location.href = 'menu.html';
        }
    } else {
        window.location.href = 'index.html';
    }
});