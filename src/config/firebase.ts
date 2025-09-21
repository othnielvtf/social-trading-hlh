import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC1svmxKz7tVz-BZ_fl5ix2zK2cDRtCGlA",
  authDomain: "social-trading-9d08b.firebaseapp.com",
  projectId: "social-trading-9d08b",
  storageBucket: "social-trading-9d08b.firebasestorage.app",
  messagingSenderId: "1034048124076",
  appId: "1:1034048124076:web:18ba8ec699483bd2bb1b09"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

export default app;
