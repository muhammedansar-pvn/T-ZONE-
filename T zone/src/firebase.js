// Import Firebase core
import { initializeApp } from "firebase/app";

// Import Authentication
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDYq_-lfGfzvmCrOcDgGYOdHQlCaRBlpRQ",
  authDomain: "t-zone-f06ca.firebaseapp.com",
  projectId: "t-zone-f06ca",
  storageBucket: "t-zone-f06ca.firebasestorage.app",
  messagingSenderId: "726344284793",
  appId: "1:726344284793:web:9cf9808592d725959472a8",
  measurementId: "G-ETMGGJXBJD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication
export const auth = getAuth(app);

// Google provider
export const googleProvider = new GoogleAuthProvider();