// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB78i_9tVvzWiW7PXd_wGzcrcB2q0lh79w",
  authDomain: "tailor-booking.firebaseapp.com",
  projectId: "tailor-booking",
  storageBucket: "tailor-booking.firebasestorage.app",
  messagingSenderId: "874302811317",
  appId: "1:874302811317:web:a396071bf4d3b9451422fc",
  measurementId: "G-791S4WZCNB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore
const db = getFirestore(app);

export { db };
