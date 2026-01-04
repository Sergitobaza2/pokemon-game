// Número total de Pokémon oficiales (según PokeAPI: count = 1302)
const MAX_POKEMON_ID = 1302;

// Naturalezas en español (25 oficiales)
const NATURES_SPANISH = [
    "Fuerte", "Osada", "Miedosa", "Impasible", "Agitada",
    "Huraña", "Dócil", "Seria", "Afable", "Firme",
    "Pícara", "Tímida", "Alegre", "Ingenua", "Mansa",
    "Rara", "Tranquila", "Audaz", "Plácida", "Grosera",
    "Activa", "Floja", "Dócil", "Cauta", "Descuidada"
];

// Lista COMPLETA de movimientos en español
const MOVES_SPANISH = [
    "Cola Férrea", "Cola Dragón", "Ala de Acero", "Geocontrol", "Encanto", "Antiaéreo",
    "Cascada", "Giro Fuego", "Contraataque", "Colmillo Ígneo", "Lanzarrocas", "Puya Nociva",
    "Hoja Afilada", "Calcinación", "Confusión", "Bofetón Lodo", "Tornado", "Follaje",
    "Tajo Aéreo", "Garra Metal", "Destructor", "Arañazo", "Látigo Cepa", "Garra Umbría",
    "Dragoaliento", "Mordisco", "Hoja Mágica", "Golpe Roca", "Alarido", "Paranormal",
    "Finta", "Cabezazo Zen", "Ácido", "Vaho Gélido", "Palmeo", "Desenrollar",
    "Doble Patada", "Colmillo Rayo", "Poder Oculto", "Estoicismo", "Burbuja", "Pistola Agua",
    "Puño Bala", "Corte", "Placaje", "Ataque Rápido", "Canto Helado", "Lengüetazo",
    "Picotazo", "Ataque Ala", "Ascuas", "Golpe Kárate", "Patada Baja", "Golpe Bajo",
    "Picadura", "Shuriken de Agua", "Viento Feérico", "Acoso", "Voltiocambio", "Ataque Arena",
    "Eco Metálico", "Psicoonda", "Colmillo Hielo", "Infortunio", "Picotazo Veneno", "Psicocorte",
    "Disparo Lodo", "Chispa", "Impactrueno", "Corte Furia", "Derribo", "Semilladora",
    "Impresionar", "Rayo Carga", "Nieve Polvo", "Fijar Blanco", "Presente", "Bostezo",
    "Salpicadura", "Perforador", "Fisura", "Freeze Shock", "Distorsión", "Filo del Abismo",
    "Pulso Primigenio", "Rayo Umbrío", "Meteoimpacto", "Fuerza Equina", "Llama Fusión",
    "Rayo Fusión", "Rayo Meteórico", "Golpe Umbrío", "Resplandor", "Pájaro Osado",
    "Corte Vacío", "Mundo Gélido", "Aerochorro++", "Fuego Sagrado++", "Patada Salto Alta",
    "Electormenta", "Simún de Arena", "Vendaval Gélido", "Estruendo", "Tecno Shock",
    "Aerochorro+", "Fuego Sagrado+", "Bola Neblina", "Megacuerno", "Lluevehojas",
    "Aerochorro", "Acróbata", "Esfera Aural", "Espada Santa", "Retribución", "Fuego Sagrado",
    "Vendetta", "Fogonazo", "Plancha Voladora", "Premonición", "Ice Burn", "Furia Natural",
    "Vasto Impacto", "Vuelo", "Hidrocañón", "Gigaimpacto", "Tormenta Floral", "Cabezazo",
    "Deseo Oculto", "Lanzamugre", "Ventisca", "Cometa Draco", "Ala Mortífera", "Martillazo",
    "A Bocajarro", "Vendaval", "Roca Afilada", "Lariat Oscuro", "Ascenso Draco", "Poltergeist",
    "Patada Ígnea", "Puño Meteoro", "Planta Feroz", "Surf", "Sofoco", "Ataque Aéreo",
    "Electrocañón", "Onda Certera", "Trueno", "Foco Resplandor", "Terremoto", "Hidrobomba",
    "Onda Mental", "Hiperrayo", "Rueda Aural", "Meteorobola", "Hierba Lazo", "Voltio Cruel",
    "Latigazo", "Rayo Solar", "Ferropuño Doble", "V de Fuego", "Juego Sucio", "Cuerpo Pesado",
    "Llamarada", "Onda Tóxica", "Anillo Ígneo", "Alud", "Puño Dinámico", "Bomba Lodo",
    "Puño Furia", "Pisotón", "Bola Sombra", "Tajo Cruzado", "Abrecaminos", "Giro Vil",
    "Fuerza Lunar", "Lanzallamas", "Sincrorruido", "Hipercolmillo", "Rayo", "Psíquico",
    "Onda Ígnea", "Romperrocas", "Arenas Ardientes", "Triple Axel", "Lluvia Ígnea", "Llama Embrujada",
    "Triataque", "Última Baza", "Tijera X", "Carantoña", "Garra Dragón", "Cabeza de Hierro",
    "Avalancha", "Torch Song", "Tierra Viva", "Brillo Mágico", "Aria Burbuja", "Hueso Sombrío",
    "Fuerza Bruta", "Taladradora", "Puntada Sombría", "Hoja Aguda", "Pirotecnia", "Pico Taladro",
    "Flower Trick", "Carámbano", "Enfado", "Bomba Germen", "Sumisión", "Zumbido",
    "Rayo Hielo", "Demolición", "Hueso Palo", "Veneno X", "Joya de Luz", "Pulso Umbrío",
    "Salmuera", "Chispazo", "Placaje Eléctrico", "Pulso Dragón", "Upper Hand", "Psicocolmillo",
    "Puño Incremento", "Pedrada", "Descanso", "Golpe Cuerpo", "Puño Fuego", "Doble Rayo",
    "Puño Trueno", "Bomba Imán", "Acua Cola", "Puño Hielo", "Residuos", "Giro Bola",
    "Manto Espejo", "Tinieblas", "Bomba Fango", "Beso Drenaje", "Psicocarga", "Hidroariete",
    "Carga Parábola", "Puño Sombra", "Rayo Aurora", "Terratemblor", "Agua Lodosa", "Aguijón Letal",
    "Energibola", "Cornada", "Rayo Burbuja", "Tajo Umbrío", "Excavar", "Pulpocañón",
    "Aire Afilado", "Viento Aciago", "Golpe Aéreo", "Rueda Fuego", "Triturar", "Rapidez",
    "Hidropulso", "Tumba Rocas", "Psicorrayo", "Escaldar", "Puño Drenaje", "Disparo Espejo",
    "Hidrobomba", "Poder Pasado", "Puntapié", "Colmillo Veneno", "Arrumaco", "Constricción",
    "Viento Plata", "Viento Hielo", "Plancha", "Acua Jet", "Psicoataque", "Combate",
    "Nitrocarga", "Voz Cautivadora", "Agarre", "Ciclón", "Sombra Vil", "Ciclón de Hojas",
    "Bucle Arena", "Obstrucción", "Gigadrenado", "Danza Pluma", "Escaldar", "Megaagotar",
    "Constricción", "Bomba Ácida", "Frustración", "Behemoth Bash", "Behemoth Blade", "Chupavidas",
    "Garra Brutal", "Transformación"
];

// Lista COMPLETA de habilidades en español (Gen I-IX)
const ALL_ABILITIES_SPANISH = [
  "Hedor", "Llovizna", "Refuerzo", "Armadura Batalla", "Robustez", "Humedad", "Flexibilidad", "Velo Arena",
  "Estática", "Absorbe Voltios", "Absorbe Agua", "Despiste", "Cuerpo Climático", "Ojos Compuestos", "Insomnio",
  "Cambio de Tipo", "Inmunidad", "Absorbe Fuego", "Polvo Escudo", "Ritmo Propio", "Ventosas", "Intimidación",
  "Sombra Trampa", "Piel Áspera", "Muro Mágico", "Levitación", "Espora", "Sincronía", "Cuerpo Puro",
  "Cura Natural", "Pararrayos", "Dulzura", "Nado Rápido", "Clorofila", "Iluminación", "Rastro", "Potencia",
  "Punto Tóxico", "Foco Interno", "Armadura Ígnea", "Velo Agua", "Imán", "Insonorización", "Recolección",
  "Chorro Arena", "Presión", "Sebo", "Madrugar", "Cuerpo Llameante", "Huida", "Vista Lince", "Tenacidad",
  "Recogida", "Pereza", "Afán", "Encanto", "Más", "Menos", "Predicción", "Retención", "Mudar", "Agallas",
  "Escama Especial", "Líquido Lodo", "Espesura", "Llamas", "Torrente", "Enjambre", "Cabeza Roca", "Sequía",
  "Trampa Arena", "Ánimo", "Humo Blanco", "Potencia Pura", "Caparazón", "Tumbos", "Electromotor", "Competitivo",
  "Impasible", "Manto Níveo", "Voracidad", "Punto Ira", "Liviano", "Ignífugo", "Sencillez", "Piel Seca",
  "Descarga", "Puño Férreo", "Cura Tóxica", "Adaptabilidad", "Encadenado", "Hidratación", "Poder Solar",
  "Pies Rápidos", "Normalidad", "Francotirador", "Guardia Mágica", "Abrelatas", "Sublimación", "Toxico Plus",
  "Recolección", "Telepatía", "Cambia Suerte", "Abrigo", "Toque Tóxico", "Regeneración", "Orgullo",
  "Ímpetu Arena", "Piel Milagrosa", "Analista", "Ilusión", "Impostor", "Infiltración", "Momia", "Arrojo",
  "Justiciero", "Nerviosismo", "Rebotador", "Herbívoro", "Bromista", "Potencia Arena", "Pinchos", "Modo Zen",
  "Estrella Victoria", "Ráfaga Ígnea", "Tera Voltaje", "Aerodinámico", "Ruptura Aura", "Carrillo", "Don Floral",
  "Amigo Guardián", "Alas Vendaval", "Piel Vegetal", "Hambre", "Cuerpo Hielo", "Escamas Hielo", "Libero",
  "Ánimo Ligero", "Aura Persistente", "Alcance Largo", "Vínculo Parental", "Velo Pastel", "Cuerpo Perecedero",
  "Carterista", "Pixilación", "Construcción", "Alquimia", "Punto de Poder", "Mar Ancestral", "Armadura Prisma",
  "Cola Propulsora", "Proteico", "Zona Psíquica", "Punk Rock", "Sal Purificadora", "Majestuosidad",
  "Mano Rápida", "Receptor", "Temerario", "Refrigeración", "Maduración", "Sistema RKS", "Carga Rocosa",
  "Bancada", "Tenacidad", "Limpiapantallas", "Siembra", "Escudo Sombra", "Afilado", "Potencia Bruta",
  "Rompecoraza", "Inicio Lento", "Ímpetu Nieve", "Alerta Nieve", "Roca Sólida", "Corazón Alma", "Vapor",
  "Acero", "Espíritu Férreo", "Drenaje", "Mandíbula Fuerte", "Super Suerte", "Comandante", "Surfista",
  "Velo Dulce", "Simbiosis", "Tabla de Ruina", "Pelo Enredo", "Experto", "Cambio Tera", "Intercambio Térmico",
  "Filtro", "Garras Duras", "Residuos Tóxicos", "Transistor", "Triage", "Ignorante", "Inquietud", "Vasija de Ruina",
  "Espíritu Errante", "Burbuja", "Compactación", "Armadura Débil", "Cuerpo Horneado", "Remolino", "Cobardía",
  "Energía Eólica", "Jinete de Viento", "Olor Persistente", "Disemillar", "Termoconversión", "Coraza Ira",
  "Sal Purificadora", "Cuerpo Horneado", "Surcavientos", "Perro Guardián", "Transportarrocas", "Energía Eólica",
  "Cambio Heroico", "Comandar", "Dinamo", "Paleosíntesis", "Carga Cuark", "Cuerpo Áureo", "Caldero Debacle",
  "Espada Debacle", "Tablilla Debacle", "Abalorio Debacle", "Latido Oricálco", "Motor Hadrónico", "Oportunista",
  "Rumia", "Cortante", "General Supremo", "Unísono", "Capa Tóxica", "Cola Armadura", "Geofagia", "Poder Fúngico"
];

// DOM
const generateBtn = document.getElementById('generateBtn');
const pokemonDisplay = document.getElementById('pokemonDisplay');
const usosDisponiblesDisplay = document.getElementById('usosDisponiblesDisplay');
const body = document.body;

// Temas por tipo
const TYPE_THEMES = {
    normal: { bg: 'linear-gradient(135deg, #A8A878, #C0C0A0)', animation: 'pulseDefault' },
    fire: { bg: 'linear-gradient(135deg, #F08030, #EE8230, #CD5C08)', animation: 'pulseFire' },
    water: { bg: 'linear-gradient(135deg, #6890F0, #4A90E2, #2E70C0)', animation: 'pulseWater' },
    electric: { bg: 'linear-gradient(135deg, #F8D030, #FFD700, #FFA500)', animation: 'pulseElectric' },
    grass: { bg: 'linear-gradient(135deg, #78C850, #66BB6A, #43A047)', animation: 'pulseGrass' },
    ice: { bg: 'linear-gradient(135deg, #98D8D8, #B3E5FC, #81D4FA)', animation: 'pulseIce' },
    fighting: { bg: 'linear-gradient(135deg, #C03028, #D32F2F, #B71C1C)', animation: 'pulseFighting' },
    poison: { bg: 'linear-gradient(135deg, #A040A0, #AB47BC, #8E24AA)', animation: 'pulsePoison' },
    ground: { bg: 'linear-gradient(135deg, #E0C068, #D2B48C, #A0522D)', animation: 'pulseGround' },
    flying: { bg: 'linear-gradient(135deg, #A890F0, #9FA8DA, #7986CB)', animation: 'pulseFlying' },
    psychic: { bg: 'linear-gradient(135deg, #F85888, #EC407A, #D81B60)', animation: 'pulsePsychic' },
    bug: { bg: 'linear-gradient(135deg, #A8B820, #C0CA33, #9E9D24)', animation: 'pulseBug' },
    rock: { bg: 'linear-gradient(135deg, #B8A038, #D4A017, #B8860B)', animation: 'pulseRock' },
    ghost: { bg: 'linear-gradient(135deg, #705898, #7E57C2, #5E35B1)', animation: 'pulseGhost' },
    dragon: { bg: 'linear-gradient(135deg, #7038F8, #6A1B9A, #4A148C)', animation: 'pulseDragon' },
    dark: { bg: 'linear-gradient(135deg, #705848, #5D4037, #4E342E)', animation: 'pulseDark' },
    steel: { bg: 'linear-gradient(135deg, #B8B8D0, #90A4AE, #607D8B)', animation: 'pulseSteel' },
    fairy: { bg: 'linear-gradient(135deg, #EE99AC, #F48FB1, #F06292)', animation: 'pulseFairy' },
    default: { bg: 'linear-gradient(135deg, #64b3e7, #4a90e2, #3a6ea5)', animation: 'pulseDefault' }
};

const TYPE_ICONS = {
    normal: '⭕', fire: '🔥', water: '💧', electric: '⚡', grass: '🌿', ice: '❄️', fighting: '🥊',
    poison: '☠️', ground: '🌍', flying: '🕊️', psychic: '🌀', bug: '🪲', rock: '🪨', ghost: '👻',
    dragon: '🐉', dark: '🌑', steel: '⚙️', fairy: '🧚'
};

const PARTICLE_EMOJIS = {
    fire: '🔥', water: '💧', electric: '⚡', grass: '🍃', ice: '❄️', fighting: '💥', poison: '☠️',
    ground: '🪨', flying: '💨', psychic: '🌀', bug: '🦋', rock: '⛰️', ghost: '👻', dragon: '🐉',
    dark: '🌑', steel: '⚙️', fairy: '✨', normal: '⚪'
};

// === FUNCIONES ===

function applyBackgroundTheme(theme) {
    body.style.background = theme.bg;
    body.style.backgroundSize = '400% 400%';
    body.style.animation = `${theme.animation} 8s ease infinite`;
}

function getRandomAbility() {
    return ALL_ABILITIES_SPANISH[Math.floor(Math.random() * ALL_ABILITIES_SPANISH.length)];
}

function getRandomNature() {
    return NATURES_SPANISH[Math.floor(Math.random() * NATURES_SPANISH.length)];
}

function getRandomMoves(count = 4) {
    const shuffled = [...MOVES_SPANISH].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

function generateRandomIVs() {
    return {
        hp: Math.floor(Math.random() * 32),
        attack: Math.floor(Math.random() * 32),
        defense: Math.floor(Math.random() * 32),
        specialAttack: Math.floor(Math.random() * 32),
        specialDefense: Math.floor(Math.random() * 32),
        speed: Math.floor(Math.random() * 32)
    };
}

function renderPokemon(imageUrl, name, types, abilityName, natureName, ivs, moves) {
    const typeIcons = types.map(type => {
        const icon = TYPE_ICONS[type] || '❓';
        return `<span class="type-icon" data-type="${type}">${icon}</span>`;
    }).join('');

    const ivRows = [
        { label: "PS", value: ivs.hp },
        { label: "Ataque", value: ivs.attack },
        { label: "Defensa", value: ivs.defense },
        { label: "Ataq.Esp.", value: ivs.specialAttack },
        { label: "Def.Esp", value: ivs.specialDefense },
        { label: "Velocidad", value: ivs.speed }
    ].map(row => 
        `<div class="iv-stat">
            <span class="iv-stat-label">${row.label}</span>
            <div class="iv-values">
                <span class="iv-value">${row.value}</span>
                <span class="iv-max">/ 31</span>
            </div>
        </div>`
    ).join('');

    const movesList = moves.map(move => `<span class="move-item">${move}</span>`).join('');

    pokemonDisplay.innerHTML = `
        <div class="pokemon-enter">
            <div class="particles-container" id="particlesContainer"></div>
            <img src="${imageUrl}" alt="${name}" class="pokemon-image">
            <div class="pokemon-name">${name}</div>
            <div class="pokemon-types">${typeIcons}</div>
            <div class="pokemon-ability">
                <span class="ability-icon">🌟</span>
                <span class="ability-name">${abilityName}</span>
            </div>
            <div class="pokemon-nature">
                <span class="nature-icon">🌿</span>
                <span class="nature-name">${natureName}</span>
            </div>
            <div class="pokemon-moves">
                <div class="moves-header">Movimientos</div>
                <div class="moves-list">${movesList}</div>
            </div>
            <div class="pokemon-ivs">
                <div class="iv-header">IVs</div>
                ${ivRows}
            </div>
        </div>
    `;

    generateParticles(types);
}

function generateParticles(types) {
    const container = document.getElementById('particlesContainer');
    if (!container) return;
    container.innerHTML = '';
    types.slice(0, 2).forEach(type => {
        const emoji = PARTICLE_EMOJIS[type] || '✨';
        const particle = document.createElement('div');
        particle.textContent = emoji;
        particle.style.position = 'absolute';
        particle.style.fontSize = '24px';
        particle.style.opacity = '0.7';
        particle.style.animation = 'fadeInOut 2s ease-in-out';
        container.appendChild(particle);
    });
}

function updateUsosDisplay(count) {
    if (usosDisponiblesDisplay) {
        usosDisponiblesDisplay.textContent = `Usos: ${Math.max(0, count || 0)}`;
    }
}

function showMessage(text, isError = false) {
    let messageEl = document.querySelector('.pokemon-message');
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.className = 'pokemon-message';
        document.body.appendChild(messageEl);
    }
    messageEl.textContent = text;
    messageEl.className = isError ? 'pokemon-message error' : 'pokemon-message';
    messageEl.style.display = 'block';
    setTimeout(() => { messageEl.style.display = 'none'; }, 4000);
}

// === LÓGICA PRINCIPAL ===

async function loadInitialUsos() {
    const { auth, db, onAuthStateChanged, doc, getDoc } = await import('./firebase-config.js');
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            unsubscribe();
            if (!user) return window.location.href = 'index.html';
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (!userDoc.exists()) return window.location.href = 'menu.html';
                const usos = userDoc.data().randomEncountersAvailable || 0;
                updateUsosDisplay(usos);
                resolve();
            } catch (e) {
                updateUsosDisplay(0);
                resolve();
            }
        });
    });
}

async function generateRandomPokemon() {
    const { auth, db, doc, getDoc, updateDoc, arrayUnion } = await import('./firebase-config.js');
    const user = auth.currentUser;
    if (!user) return window.location.href = 'index.html';

    try {
        // ✅ LEER EL VALOR ACTUAL DE FIRESTORE JUSTO ANTES DE ACTUAR
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) return window.location.href = 'menu.html';

        const currentUsos = userDoc.data().randomEncountersAvailable || 0;

        if (currentUsos <= 0) {
            showMessage("No tienes usos disponibles. ¡Compra una carta 'Pokemon aleatorio' en la tienda!", true);
            updateUsosDisplay(0);
            return;
        }

        generateBtn.disabled = true;
        generateBtn.innerHTML = '<span class="button-text">BUSCANDO...</span><span class="button-icon">🔍</span>';

        // ✅ URL CORREGIDA: sin espacios
        const randomId = Math.floor(Math.random() * MAX_POKEMON_ID) + 1;
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}/`);
        if (!response.ok) throw new Error('Pokémon no encontrado');

        const data = await response.json();
        const name = data.name.charAt(0).toUpperCase() + data.name.slice(1);
        const types = data.types.map(t => t.type.name);
        const ability = getRandomAbility();
        const nature = getRandomNature();
        const moves = getRandomMoves(4);
        const ivs = generateRandomIVs();
        const imageUrl = data.sprites.other['official-artwork']?.front_default || data.sprites.front_default;

        const primaryType = types[0] || 'normal';
        applyBackgroundTheme(TYPE_THEMES[primaryType] || TYPE_THEMES.default);

        // ✅ ACTUALIZAR FIRESTORE
        await updateDoc(userDocRef, {
            randomEncountersAvailable: currentUsos - 1,
            randomEncounters: arrayUnion({
                name, types, ability, nature, moves, ivs, imageUrl, timestamp: Date.now()
            })
        });

        // ✅ ACTUALIZAR UI CON EL NUEVO VALOR
        updateUsosDisplay(currentUsos - 1);
        renderPokemon(imageUrl, name, types, ability, nature, ivs, moves);

    } catch (error) {
        console.error("Error al generar Pokémon:", error);
        showMessage("Error al generar Pokémon. Intenta de nuevo.", true);
        applyBackgroundTheme(TYPE_THEMES.default);

        // ✅ Recuperar valor real tras error
        try {
            const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
            const realUsos = userDoc.data().randomEncountersAvailable || 0;
            updateUsosDisplay(realUsos);
        } catch {
            updateUsosDisplay(0);
        }
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<span class="button-text">GENERAR</span><span class="button-icon">✨</span>';
    }
}

// === EVENTOS ===

document.addEventListener('DOMContentLoaded', async () => {
    await loadInitialUsos();
    if (generateBtn) {
        generateBtn.addEventListener('click', generateRandomPokemon);
    }
});

// === ESTILOS ===

(function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulseDefault { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes pulseFire { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes pulseWater { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes pulseElectric { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes pulseGrass { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes pulseIce { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes pulseFighting { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes pulsePoison { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes pulseGround { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes pulseFlying { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes pulsePsychic { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes pulseBug { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes pulseRock { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes pulseGhost { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes pulseDragon { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes pulseDark { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes pulseSteel { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes pulseFairy { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes fadeInOut {
            0%, 100% { opacity: 0; transform: scale(0.5); }
            50% { opacity: 0.8; transform: scale(1); }
        }
        .pokemon-message {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #27ae60;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-size: 0.9rem;
            z-index: 1000;
            border: 2px solid #219653;
        }
        .pokemon-message.error {
            background: #e74c3c;
            border-color: #c0392b;
        }
    `;
    document.head.appendChild(style);
})();