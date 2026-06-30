
import { initializeApp } from "firebase/app";


import { getAuth, GoogleAuthProvider } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyDYq_-lfGfzvmCrOcDgGYOdHQlCaRBlpRQ",
  authDomain: "t-zone-f06ca.firebaseapp.com",
  projectId: "t-zone-f06ca",
  storageBucket: "t-zone-f06ca.firebasestorage.app",
  messagingSenderId: "726344284793",
  appId: "1:726344284793:web:9cf9808592d725959472a8",
  measurementId: "G-ETMGGJXBJD"
};


const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);


export const googleProvider = new GoogleAuthProvider();