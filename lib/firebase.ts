// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqzDAhJ1FVbc3NBB0i6fUCJDi6E7kdRVo",
  authDomain: "smart-meal-62240.firebaseapp.com",
  projectId: "smart-meal-62240",
  storageBucket: "smart-meal-62240.firebasestorage.app",
  messagingSenderId: "676248391862",
  appId: "1:676248391862:web:d42951c98a0fcb5faa5617"
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);




// --- PASTE YOUR FIREBASECONFIG FROM THE CONSOLE HERE ---
// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_PROJECT_ID.appspot.com",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID"
// };
// --------------------------------------------------------

// Initialize Firebase app (avoid re-initialization)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase services and export them
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };