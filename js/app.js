import { 
    auth, 
    db,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged,
    doc,
    setDoc,
    getDoc
} from './firebase-config.js';

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');
const registerPassword = document.getElementById('registerPassword');
const registerPasswordConfirm = document.getElementById('registerPasswordConfirm');

// ✅ Cambia esto por tu email real
const ADMIN_EMAIL = "admin@locke.com";

showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
});

registerPassword.addEventListener('input', validatePasswords);
registerPasswordConfirm.addEventListener('input', validatePasswords);

function validatePasswords() {
    const password = registerPassword.value;
    const confirmPassword = registerPasswordConfirm.value;
    registerPassword.classList.remove('error');
    registerPasswordConfirm.classList.remove('error');
    if (password && confirmPassword && password !== confirmPassword) {
        registerPassword.classList.add('error');
        registerPasswordConfirm.classList.add('error');
        return false;
    }
    return true;
}

document.getElementById('register').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value.trim().toLowerCase();
    const password = registerPassword.value;
    const confirmPassword = registerPasswordConfirm.value;

    if (!validatePasswords()) {
        showMessage(registerMessage, 'Las contraseñas no coinciden', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage(registerMessage, 'La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }

    try {
        const role = email === ADMIN_EMAIL ? 'admin' : 'user';
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userData = { email, role };
        if (role === 'user') {
            userData.lives = 20;
            userData.coins = 100;
            userData.spins = 2;
            userData.randomEncountersAvailable = 0;
            userData.winnerSpins = 0;   // ✅ NUEVO
            userData.loserSpins = 0;    // ✅ NUEVO
        }

        await setDoc(doc(db, "users", user.uid), userData);
        const roleText = role === 'admin' ? 'administrador' : 'usuario normal';
        showMessage(registerMessage, `Registro exitoso como ${roleText}. Redirigiendo...`, 'success');
        
        document.getElementById('register').reset();
        registerPassword.classList.remove('error');
        registerPasswordConfirm.classList.remove('error');
        
        setTimeout(() => {
            window.location.href = role === 'admin' ? 'dashboard.html' : 'menu.html';
        }, 2000);

    } catch (error) {
        console.error("Error al registrar:", error);
        let errorMessage = "Error al registrar usuario";
        switch (error.code) {
            case 'auth/email-already-in-use': errorMessage = "El email ya está registrado"; break;
            case 'auth/invalid-email': errorMessage = "Formato de email inválido"; break;
            case 'auth/weak-password': errorMessage = "La contraseña es demasiado débil (mínimo 6 caracteres)"; break;
            default: errorMessage = "Error al crear la cuenta";
        }
        showMessage(registerMessage, errorMessage, 'error');
    }
});

document.getElementById('login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const target = userData.role === 'admin' ? 'dashboard.html' : 'menu.html';
            showMessage(loginMessage, `Iniciando sesión como ${userData.role === 'admin' ? 'administrador' : 'entrenador'}...`, 'success');
            setTimeout(() => window.location.href = target, 1500);
        } else {
            setTimeout(() => window.location.href = 'menu.html', 1500);
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        let errorMessage = error.code === 'auth/user-not-found' ? "Usuario no encontrado" : "Credenciales inválidas";
        showMessage(loginMessage, errorMessage, 'error');
    }
});

function showMessage(element, text, type) {
    element.textContent = text;
    element.className = type;
}