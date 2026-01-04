import { auth, db, onAuthStateChanged, doc, getDoc, updateDoc, arrayUnion } from './firebase-config.js';

const userCoins = document.getElementById('userCoins');
const cardsGrid = document.getElementById('cardsGrid');
const backBtn = document.getElementById('backBtn');
const cardsMessage = document.getElementById('cardsMessage');

let currentUserId = null;
let currentCoins = 100;

// ✅ LISTA DE OBJETOS COMPETITIVOS
const COMPETITIVE_ITEMS = [
    "Restos", "Vidasfera", "Casco dentado", "Chaleco asalto",
    "Seguro debilidad", "Banda focus", "Botas gruesas",
    "Cinta eleccion", "Gafas eleccion", "Pañuelo eleccion",
    "Dado trucado", "Globo helio", "Lodo negro", "Mineral evolutivo"
];

// ✅ NUEVO CATÁLOGO DE CARTAS
const cardsCatalog = [
    { id: 20, name: "Esquema", emoji: "📊", rarity: "Épica", price: 40, type: "esquema" },
    { id: 21, name: "Randomizar habilidad", emoji: "🎲", rarity: "Épica", price: 60, type: "randomizeAbility" },
    { id: 22, name: "Master Ball", emoji: "🎯", rarity: "Legendaria", price: 100, type: "masterBall" },
    { id: 23, name: "Revivir", emoji: "🕊️", rarity: "Rara", price: 50, type: "revive" },
    { id: 24, name: "3 skips", emoji: "⏭️", rarity: "Épica", price: 75, type: "skip", value: 3 },
    { id: 25, name: "MT", emoji: "💿", rarity: "Rara", price: 55, type: "mt" },
    { id: 26, name: "Objeto competitivo", emoji: "💎", rarity: "Épica", price: 80, type: "competitive" },
    { id: 27, name: "Pokemon aleatorio", emoji: "🌿", rarity: "Común", price: 50, type: "pokemon" },
    { id: 28, name: "Captura extra", emoji: "🪀", rarity: "Rara", price: 35, type: "extraCapture" },
    { id: 29, name: "Moneda prodigiosa", emoji: "🪙", rarity: "Legendaria", price: 120, type: "luckyCoin" },
    { id: 30, name: "Miniseta", emoji: "👕", rarity: "Común", price: 30, type: "miniseta" },
    { id: 31, name: "Megapiedra a elegir", emoji: "🪨", rarity: "Legendaria", price: 150, type: "megaStone" },
    { id: 32, name: "Copiar un pokemon", emoji: "📋", rarity: "Épica", price: 90, type: "copyPokemon" }
];

let isBuying = false;

function showMessage(text, isError = false) {
    cardsMessage.textContent = text;
    cardsMessage.className = isError ? 'message-container error' : 'message-container';
    cardsMessage.style.display = 'block';
    setTimeout(() => { cardsMessage.style.display = 'none'; }, 3000);
}

function renderCards() {
    cardsGrid.innerHTML = '';
    cardsCatalog.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = `card card-${card.type} ${currentCoins < card.price ? 'disabled' : ''}`;
        cardElement.innerHTML = `
            <div class="card-image">${card.emoji}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-rarity">${card.rarity}</div>
            <div class="card-price">💰 ${card.price}</div>
        `;
        if (currentCoins >= card.price) {
            cardElement.addEventListener('click', () => buyCard(card));
        }
        cardsGrid.appendChild(cardElement);
    });
}

async function buyCard(card) {
    if (isBuying) return;
    isBuying = true;

    if (currentCoins < card.price) {
        showMessage('¡No tienes suficientes monedas!', true);
        isBuying = false;
        return;
    }

    try {
        const userRef = doc(db, "users", currentUserId);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data() || {};
        let msg = `¡Has comprado ${card.name}!`;

        // ✅ CASO ESPECIAL: Pokemon aleatorio
        if (card.type === "pokemon") {
            // Sumar +1 al contador de usos
            const currentUsos = userData.randomEncountersAvailable || 0;
            const newUsos = currentUsos + 1;

            await updateDoc(userRef, {
                coins: currentCoins - card.price,
                randomEncountersAvailable: newUsos
            });

            currentCoins -= card.price;
            msg += ` +1 uso disponible (Total: ${newUsos}).`;

            // ✅ Opcional: redirigir a random-pokemon.html
            setTimeout(() => {
                window.location.href = 'random-pokemon.html';
            }, 1500);

        } else {
            // ✅ Todas las demás cartas: guardar en inventario
            const newCard = {
                id: card.id,
                name: card.name,
                type: card.type,
                emoji: card.emoji,
                rarity: card.rarity,
                timestamp: Date.now()
            };

            await updateDoc(userRef, {
                coins: currentCoins - card.price,
                cards: arrayUnion(newCard)
            });
        }

        currentCoins -= card.price;
        userCoins.textContent = currentCoins;
        renderCards();
        showMessage(msg);

    } catch (error) {
        console.error("Error al comprar carta:", error);
        showMessage('Error al comprar la carta', true);
    } finally {
        isBuying = false;
    }
}

backBtn.addEventListener('click', () => window.location.href = 'menu.html');

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