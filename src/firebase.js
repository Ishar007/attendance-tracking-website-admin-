import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDcBqUBASnXalfys574F3THiWMbYCrmjLY",
    authDomain: "geo-location-based-website.firebaseapp.com",
    projectId: "geo-location-based-website",
    storageBucket: "geo-location-based-website.appspot.com",
    messagingSenderId: "207034214126",
    appId: "1:207034214126:web:cb5c8783dac988e5bc75ff",
    measurementId: "G-WWY5NJP8R6"
};

const app = initializeApp(firebaseConfig);

// 🔑 EXPORT BOTH
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);