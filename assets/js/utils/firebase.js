import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAvkJhewJr-5xlCqOIVqNnf9QgRSecx3ZU",
  authDomain: "crownforge-web.firebaseapp.com",
  projectId: "crownforge-web",
  storageBucket: "crownforge-web.firebasestorage.app",
  messagingSenderId: "797474444783",
  appId: "1:797474444783:web:018a8e93573cd35879521a"
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
