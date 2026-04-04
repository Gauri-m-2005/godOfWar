
    // Import the functions you need from the SDKs you need
      
    import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
    import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
    // TODO: Add SDKs for Firebase products that you want to use
    // https://firebase.google.com/docs/web/setup#available-libraries

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
        apiKey: "AIzaSyAgGHNBhqCVpw3fJAe8bu2U5z8lZJHdeLQ",
        authDomain: "streamasian-ad03e.firebaseapp.com",
        projectId: "streamasian-ad03e",
        storageBucket: "streamasian-ad03e.firebasestorage.app",
        messagingSenderId: "923462821005",
        appId: "1:923462821005:web:1575edbd8e7b920995eec4",
        measurementId: "G-XKC6ENNSPQ"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);

    // Initialize Firestore
    const db = getFirestore(app);

    export { db };