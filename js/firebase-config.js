import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    getDocs, 
    updateDoc,
    arrayUnion,
    serverTimestamp,
    increment  // ✅ AÑADIDO
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAVoEYJpqpWUsxjiKlF2vmRAysOI7gFGqk",
    authDomain: "locke-a370b.firebaseapp.com",
    projectId: "locke-a370b",
    storageBucket: "locke-a370b.firebasestorage.app",
    messagingSenderId: "645648099781",
    appId: "1:645648099781:web:c7fe686307032e001343ac"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { 
    auth, 
    db, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged, 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    getDocs, 
    updateDoc,
    arrayUnion,
    serverTimestamp,
    increment  // ✅ EXPORTADO
};