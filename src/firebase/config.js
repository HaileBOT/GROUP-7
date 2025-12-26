// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAP_061jQCQfetVOUX0NEXV7ycDs5JIRVg",
  authDomain: "peer-mentorship-platform-3cec1.firebaseapp.com",
  projectId: "peer-mentorship-platform-3cec1",
  storageBucket: "peer-mentorship-platform-3cec1.firebasestorage.app",
  messagingSenderId: "358665572338",
  appId: "1:358665572338:web:6065c28cd5768d1e60a56b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);