import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Replace these values with your Firebase Web App configuration.
// Firebase Console -> Project settings -> Your apps -> Web app
const firebaseConfig = {
  apiKey: "AIzaSyAeMO7IQccd__FbzTGBlt-ttgb2unCyGNw",
  authDomain: "smart-manhole-466a8.firebaseapp.com",
  databaseURL: "https://smart-manhole-466a8-default-rtdb.firebaseio.com",
  projectId: "smart-manhole-466a8",
  storageBucket: "smart-manhole-466a8.firebasestorage.app",
  messagingSenderId: "305093782314",
  appId: "1:305093782314:web:e998c08099018a8f90cc53"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);