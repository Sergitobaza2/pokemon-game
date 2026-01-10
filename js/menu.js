import { auth, db, onAuthStateChanged, doc, getDoc, updateDoc, arrayUnion, increment } from './firebase-config.js';

const userName = document.getElementById('userName');
const livesCount = document.getElementById('livesCount');
const coinsCount = document.getElementById('coinsCount');
const loseLifeBtn = document.getElementById('loseLifeBtn');
const logoutBtn = document.getElementById('logoutBtn');
const menuMessage = document.getElementById('menuMessage');
const badgesGrid = document.getElementById('badgesGrid');
const eliteBtn = document.getElementById('eliteBtn');
const ownedCardsList = document.getElementById('ownedCardsList');
const generatedPokemonList = document.getElementById('generatedPokemonList');
const usedCardsList = document.getElementById('usedCardsList');
const rewardsList = document.getElementById('rewardsList');

// ✅ Inicializado en 100
let currentUserId = null;
let currentLives = 100;
let currentCoins = 5;
let currentSpins = 2;

const KANTO_BADGES = [
    { id: 'boulder', name: 'Roca', icon: 'https://i.imgur.com/ENobYln.png', reward: { coins: 0, spins: 0 } },
    { id: 'cascade', name: 'Cascada', icon: 'https://i.imgur.com/rDQSFv6.png', reward: { coins: 0, spins: 0 } },
    { id: 'thunder', name: 'Trueno', icon: 'https://i.imgur.com/C0FTpbS.png', reward: { coins: 0, spins: 0 } },
    { id: 'rainbow', name: 'Arcoíris', icon: 'https://i.imgur.com/HrHK2mG.png', reward: { coins: 0, spins: 0 } },
    { id: 'soul', name: 'Alma', icon: 'https://i.imgur.com/vTtUoIt.png', reward: { coins: 0, spins: 0 } },
    { id: 'marsh', name: 'Pantano', icon: 'https://i.imgur.com/9lJclNy.png', reward: { coins: 0, spins: 0 } },
    { id: 'volcano', name: 'Volcán', icon: 'https://i.imgur.com/32D9BjC.png', reward: { coins: 0, spins: 0 } },
    { id: 'earth', name: 'Tierra', icon: 'https://i.imgur.com/oNb3Wfg.png', reward: { coins: 0, spins: 0 } }
];

function showMessage(text, isError = false) {
    menuMessage.textContent = text;
    menuMessage.className = isError ? 'message-container error' : 'message-container';
    menuMessage.style.display = 'block';
    setTimeout(() => { menuMessage.style.display = 'none'; }, 4000);
}

// ✅ Solo actualiza el contador numérico
function updateUI() {
    livesCount.textContent = currentLives;
    coinsCount.textContent = Math.max(0, currentCoins);
}

async function loseLife() {
    if (currentLives <= 0) return;
    try {
        const newLives = Math.max(currentLives - 1, 0);
        await updateDoc(doc(db, "users", currentUserId), { lives: newLives });
        currentLives = newLives;
        updateUI();
        showMessage('Has perdido una vida.');
    } catch (error) {
        console.error("Error al perder vida:", error);
        showMessage('Error al perder vida', true);
    }
}

function showBadgeCelebration(badge) {
    const celebrationEl = document.getElementById('badgeCelebration');
    const badgeImageEl = document.getElementById('celebrationBadgeImage');
    const badgeNameEl = document.getElementById('celebrationBadgeName');
    const coinsAmountEl = document.getElementById('celebrationRewardCoins');
    const spinsAmountEl = document.getElementById('celebrationRewardSpins');
    const spinsItem = spinsAmountEl.closest('.reward-item');

    badgeImageEl.src = badge.icon;
    badgeNameEl.textContent = `MEDALLA ${badge.name.toUpperCase()}`;
    coinsAmountEl.textContent = `+${badge.reward.coins}`;

    if (badge.reward.spins > 0) {
        spinsAmountEl.textContent = `+${badge.reward.spins}`;
        spinsItem.style.display = 'flex';
    } else {
        spinsItem.style.display = 'none';
    }

    celebrationEl.style.display = 'flex';
    celebrationEl.style.opacity = '1';
    celebrationEl.style.pointerEvents = 'auto';

    const contentEl = celebrationEl.querySelector('.celebration-content');
    contentEl.style.transform = 'scale(1)';
    contentEl.style.opacity = '1';

    setTimeout(() => {
        celebrationEl.style.display = 'none';
        contentEl.style.transform = 'scale(0.5)';
        contentEl.style.opacity = '0';
        spinsItem.style.display = 'flex';
    }, 4000);
}

function updateEliteButtonAfterBadges(userBadges) {
    const userDocRef = doc(db, "users", currentUserId);
    getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
            const eliteBeaten = docSnap.data().eliteBeaten || false;
            updateEliteButton(userBadges, eliteBeaten);
        }
    });
}

async function claimBadge(badge) {
    try {
        const userDocRef = doc(db, "users", currentUserId);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) return;

        const userData = userDoc.data();
        const currentBadges = userData.badges || {};
        // ✅ Usar 100 como fallback en la lógica de recompensas
        const currentLives = userData.lives ?? 100;
        const livesAtLastBadge = userData.livesAtLastBadge ?? 100;

        if (currentBadges[badge.id]) return;

        const badgeIndex = KANTO_BADGES.findIndex(b => b.id === badge.id);
        if (badgeIndex === -1) return;

        for (let i = 0; i < badgeIndex; i++) {
            if (!currentBadges[KANTO_BADGES[i].id]) {
                showMessage(`¡Debes obtener la Medalla ${KANTO_BADGES[i].name} primero!`, true);
                return;
            }
        }

        const livesLostSinceLastBadge = livesAtLastBadge - currentLives;
        const livesLostAdjusted = Math.max(livesLostSinceLastBadge, 0);
        const rewardCoins = Math.max(8 - livesLostAdjusted, 0);

        const newBadges = { ...currentBadges, [badge.id]: true };

        await updateDoc(userDocRef, {
            coins: increment(rewardCoins),
            spins: increment(badge.reward.spins),
            badges: newBadges,
            livesAtLastBadge: currentLives
        });

        currentCoins += rewardCoins;
        currentSpins += badge.reward.spins;
        updateUI();
        renderBadges(newBadges);

        badge.reward.coins = rewardCoins;
        showBadgeCelebration(badge);

        const livesText = livesLostAdjusted > 0 ? `( -${livesLostAdjusted} vidas)` : '';
        showMessage(`¡Medalla ${badge.name} obtenida! +${rewardCoins} monedas${livesText}.`);

        updateEliteButtonAfterBadges(newBadges);

    } catch (error) {
        console.error("Error al reclamar medalla:", error);
        showMessage("Error al reclamar la medalla", true);
    }
}

function showEliteCelebration(coins, spins) {
    const celebrationEl = document.getElementById('badgeCelebration');
    const badgeImageEl = document.getElementById('celebrationBadgeImage');
    const badgeNameEl = document.getElementById('celebrationBadgeName');
    const coinsAmountEl = document.getElementById('celebrationRewardCoins');
    const spinsAmountEl = document.getElementById('celebrationRewardSpins');
    const spinsItem = spinsAmountEl.closest('.reward-item');

    badgeImageEl.src = 'https://i.imgur.com/ENobYln.png';
    badgeNameEl.textContent = '¡CAMPEÓN DE KANTO!';
    coinsAmountEl.textContent = `+${coins}`;

    if (spins > 0) {
        spinsAmountEl.textContent = `+${spins}`;
        spinsItem.style.display = 'flex';
    } else {
        spinsItem.style.display = 'none';
    }

    celebrationEl.style.display = 'flex';
    celebrationEl.style.opacity = '1';
    celebrationEl.style.pointerEvents = 'auto';

    const contentEl = celebrationEl.querySelector('.celebration-content');
    contentEl.style.transform = 'scale(1)';
    contentEl.style.opacity = '1';

    setTimeout(() => {
        celebrationEl.style.display = 'none';
        contentEl.style.transform = 'scale(0.5)';
        contentEl.style.opacity = '0';
        spinsItem.style.display = 'flex';
    }, 4000);

    eliteBtn.disabled = true;
    eliteBtn.classList.add('disabled');
    eliteBtn.classList.remove('enabled');
    eliteBtn.innerHTML = `
        <span>LIGA COMPLETADA</span>
        <span class="btn-icon">🏆</span>
    `;
}

async function claimEliteLeague() {
    try {
        const userDocRef = doc(db, "users", currentUserId);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) return;

        const userData = userDoc.data();
        const userBadges = userData.badges || {};
        const eliteBeaten = userData.eliteBeaten || false;

        if (!allBadgesEarned(userBadges) || eliteBeaten) {
            return;
        }

        // ✅ Usar 100 como fallback
        const currentLives = userData.lives ?? 100;
        const livesAtLastBadge = userData.livesAtLastBadge ?? 100;

        const livesLostSinceLastBadge = livesAtLastBadge - currentLives;
        const livesLostAdjusted = Math.max(livesLostSinceLastBadge, 0);
        const rewardCoins = Math.max(6 - livesLostAdjusted, 0);

        await updateDoc(userDocRef, {
            coins: increment(rewardCoins),
            spins: increment(0),
            eliteBeaten: true
        });

        currentCoins += rewardCoins;
        updateUI();
        showEliteCelebration(rewardCoins, 0);

        showMessage(`¡Liga completada! +${rewardCoins} monedas${livesLostAdjusted > 0 ? ` (-${livesLostAdjusted} vidas)` : ''}.`);

    } catch (error) {
        console.error("Error al completar la Liga Pokémon:", error);
        showMessage("Error al reclamar la Liga", true);
    }
}

function allBadgesEarned(userBadges) {
    return KANTO_BADGES.every(badge => userBadges[badge.id] === true);
}

function updateEliteButton(userBadges, eliteBeaten) {
    const canClaim = allBadgesEarned(userBadges) && !eliteBeaten;
    eliteBtn.disabled = !canClaim;
    if (canClaim) {
        eliteBtn.classList.add('enabled');
        eliteBtn.classList.remove('disabled');
    } else {
        eliteBtn.classList.remove('enabled');
        eliteBtn.classList.add('disabled');
    }
}

function canEarnBadge(badgeId, userBadges) {
    const badgeIndex = KANTO_BADGES.findIndex(b => b.id === badgeId);
    if (badgeIndex === 0) return true;
    for (let i = 0; i < badgeIndex; i++) {
        if (!userBadges[KANTO_BADGES[i].id]) {
            return false;
        }
    }
    return true;
}

function renderBadges(userBadges) {
    badgesGrid.innerHTML = '';
    KANTO_BADGES.forEach(badge => {
        const earned = userBadges[badge.id] === true;
        const canEarn = canEarnBadge(badge.id, userBadges);
        let className = 'badge-item';
        if (earned) className += ' earned';
        else if (canEarn) className += ' available';
        else className += ' locked';

        const badgeEl = document.createElement('div');
        badgeEl.className = className;
        badgeEl.dataset.badgeId = badge.id;

        const badgeImage = document.createElement('img');
        badgeImage.className = 'badge-icon-img';
        badgeImage.src = badge.icon;
        badgeImage.alt = `Medalla ${badge.name}`;

        const badgeName = document.createElement('div');
        badgeName.className = 'badge-name';
        badgeName.textContent = badge.name;

        badgeEl.appendChild(badgeImage);
        badgeEl.appendChild(badgeName);

        if (!earned && canEarn) {
            badgeEl.addEventListener('click', () => {
                claimBadge(badge);
            });
        }
        badgesGrid.appendChild(badgeEl);
    });
}

async function removeCardFromInventory(cardId) {
    try {
        const userRef = doc(db, "users", currentUserId);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data() || {};
        const cards = userData.cards || [];
        const indexToRemove = cards.findIndex(c => c.id === cardId);
        if (indexToRemove === -1) return;

        const cardToRemove = cards[indexToRemove];
        const updatedCards = [...cards];
        updatedCards.splice(indexToRemove, 1);
        const usedCards = userData.usedCards || [];
        const updatedUsedCards = [...usedCards, cardToRemove];

        await updateDoc(userRef, {
            cards: updatedCards,
            usedCards: updatedUsedCards
        });

        renderOwnedCardsAndPokemon({ ...userData, cards: updatedCards, usedCards: updatedUsedCards });
        showMessage('Carta usada y movida al historial.');
    } catch (error) {
        console.error("Error al usar carta:", error);
        showMessage('Error al usar la carta', true);
    }
}

function renderRewards(userData) {
    const rewards = (userData.dailyRewards || [])
        .filter(r => !r.used)
        .filter(r => !['coins', 'bonusSpin', 'spins'].includes(r.type));

    if (rewards.length === 0) {
        rewardsList.innerHTML = '<div class="empty-state">No tienes recompensas.</div>';
        return;
    }

    rewardsList.innerHTML = rewards.map(r => `
        <div class="reward-item" data-reward-id="${r.id}">
            <div class="reward-name">${r.emoji} ${r.text}</div>
            <button class="use-reward-btn" data-reward-id="${r.id}">✓</button>
        </div>
    `).join('');

    document.querySelectorAll('.use-reward-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const rewardId = parseFloat(btn.dataset.rewardId);
            await useReward(rewardId);
        });
    });
}

async function useReward(rewardId) {
    try {
        const userRef = doc(db, "users", currentUserId);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) return;

        const userData = userDoc.data();
        const rewards = userData.dailyRewards || [];
        const rewardIndex = rewards.findIndex(r => r.id == rewardId);

        if (rewardIndex === -1 || rewards[rewardIndex].used) return;

        rewards[rewardIndex].used = true;
        const usedCards = userData.usedCards || [];
        usedCards.push({
            name: rewards[rewardIndex].text,
            emoji: rewards[rewardIndex].emoji,
            type: 'reward',
            timestamp: Date.now()
        });

        await updateDoc(userRef, {
            dailyRewards: rewards,
            usedCards: usedCards
        });

        showMessage(`¡Has usado ${rewards[rewardIndex].text}!`);
        renderRewards({ ...userData, dailyRewards: rewards });
        renderOwnedCardsAndPokemon({ ...userData, usedCards: usedCards });

    } catch (error) {
        console.error("Error al usar recompensa:", error);
        showMessage("Error al usar la recompensa", true);
    }
}

function renderOwnedCardsAndPokemon(userData) {
    const cards = userData.cards || [];
    const usedCards = userData.usedCards || [];

    if (cards.length === 0) {
        ownedCardsList.innerHTML = '<div class="empty-state">No has comprado cartas aún.</div>';
    } else {
        ownedCardsList.innerHTML = cards.map(c => `
            <div class="owned-card-item">
                <div class="owned-card-name">${c.name}</div>
                <button class="remove-card-btn" data-card-id="${c.id}">🗑️</button>
            </div>
        `).join('');

        document.querySelectorAll('.remove-card-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const cardId = parseInt(btn.dataset.cardId);
                await removeCardFromInventory(cardId);
            });
        });
    }

    if (usedCards.length === 0) {
        usedCardsList.innerHTML = '<div class="empty-state">No has usado ninguna carta aún.</div>';
    } else {
        usedCardsList.innerHTML = usedCards.map(c => `
            <div class="used-card-item">
                <div class="used-card-name">${c.emoji || ''} ${c.name}</div>
            </div>
        `).join('');
    }

    const encounters = userData.randomEncounters || [];
    if (encounters.length === 0) {
        generatedPokemonList.innerHTML = '<div class="empty-state">No hay Pokémon generados.</div>';
    } else {
        generatedPokemonList.innerHTML = encounters.map(p => {
            const typeBadges = p.types.map(type =>
                `<span class="pokemon-type-badge type-${type.toLowerCase()}">${type}</span>`
            ).join('');
            const movesList = p.moves.map(move => `<span class="move-tag">${move}</span>`).join('');

            const ivs = p.ivs || { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 };

            const statLabels = {
                hp: 'HP',
                attack: 'ATQ',
                defense: 'DF',
                specialAttack: 'SPATQ',
                specialDefense: 'SPD',
                speed: 'SPEED'
            };

            const ivBars = Object.entries(ivs).map(([statKey, value]) => {
                const percentage = (value / 31) * 100;
                const cleanStat = statKey.toLowerCase().replace(/[^a-z]/g, '');
                const displayLabel = statLabels[statKey] || statKey.toUpperCase();

                return `
                    <div class="iv-stat-row">
                        <div class="iv-stat-label">${displayLabel}</div>
                        <div class="iv-value-display">${value}/31</div>
                        <div class="iv-bar-container">
                            <div class="iv-fill" data-stat="${cleanStat}" style="width: ${percentage.toFixed(1)}%;"></div>
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <div class="generated-pokemon-item">
                    <img src="${p.imageUrl}" alt="${p.name}" class="pokemon-sprite">
                    <div class="pokemon-name">${p.name}</div>
                    <div class="pokemon-types">${typeBadges}</div>
                    <div class="pokemon-details">
                        <div><strong>Habilidad:</strong> <span>${p.ability}</span></div>
                        <div><strong>Naturaleza:</strong> <span>${p.nature}</span></div>
                    </div>
                    <div class="pokemon-moves">
                        <div class="moves-header">Movimientos</div>
                        <div class="moves-list">${movesList}</div>
                    </div>
                    <div class="pokemon-ivs-section">
                        <div class="ivs-title">ESTADÍSTICAS (IVs)</div>
                        ${ivBars}
                    </div>
                </div>
            `;
        }).join('');
    }
}

document.querySelectorAll('.nav-btn').forEach(item => {
    item.addEventListener('click', () => {
        const action = item.getAttribute('data-action');
        const paths = {
            ruleta: 'ruleta.html',
            randompokemon: 'random-pokemon.html',
            cartas: 'cartas.html',
            combates: 'combates.html'
        };
        if (paths[action]) {
            window.location.href = paths[action];
        } else {
            showMessage('Opción no disponible.', true);
        }
    });
});

loseLifeBtn.addEventListener('click', loseLife);
logoutBtn.addEventListener('click', () => {
    auth.signOut();
    window.location.href = 'index.html';
});
eliteBtn.addEventListener('click', claimEliteLeague);

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

            // ✅ Cargar con fallback a 100
            currentLives = userData.lives ?? 100;
            currentCoins = userData.coins ?? 5;
            currentSpins = userData.spins ?? 2;

            const updateData = {};
            let needsUpdate = false;

            // ✅ Corregido: todos los valores iniciales ahora usan 100 o 5
            if (userData.coins === undefined) { updateData.coins = 0; needsUpdate = true; }
            if (userData.spins === undefined) { updateData.spins = 2; needsUpdate = true; }
            if (userData.lives === undefined) { updateData.lives = 100; needsUpdate = true; } // ✅
            if (userData.winnerSpins === undefined) { updateData.winnerSpins = 0; needsUpdate = true; }
            if (userData.loserSpins === undefined) { updateData.loserSpins = 0; needsUpdate = true; }
            if (userData.livesAtLastBadge === undefined) { updateData.livesAtLastBadge = 100; needsUpdate = true; } // ✅

            if (needsUpdate) {
                await updateDoc(doc(db, "users", currentUserId), updateData);
                currentCoins = updateData.coins ?? currentCoins;
                currentSpins = updateData.spins ?? currentSpins;
                currentLives = updateData.lives ?? currentLives;
            }

            updateUI(); // ✅ Actualiza con el valor correcto

            // Inicializar medallas
            let userBadges = userData.badges || {};
            let badgesUpdated = false;
            const updatedBadges = { ...userBadges };

            KANTO_BADGES.forEach(badge => {
                if (updatedBadges[badge.id] === undefined) {
                    updatedBadges[badge.id] = false;
                    badgesUpdated = true;
                }
            });

            if (badgesUpdated) {
                await updateDoc(doc(db, "users", currentUserId), { badges: updatedBadges });
                userBadges = updatedBadges;
            }

            let eliteBeaten = userData.eliteBeaten ?? false;
            if (userData.eliteBeaten === undefined) {
                await updateDoc(doc(db, "users", currentUserId), { eliteBeaten: false });
            }

            renderBadges(userBadges);
            updateEliteButton(userBadges, eliteBeaten);
            renderOwnedCardsAndPokemon(userData);
            renderRewards(userData);
        } else {
            window.location.href = 'menu.html';
        }
    } else {
        window.location.href = 'index.html';
    }
});