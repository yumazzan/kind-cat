// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBkO_LBcOMF2VOMywDKAP28yW7uiOvMPAs",
  authDomain: "yuma-f4924.firebaseapp.com",
  databaseURL: "https://yuma-f4924-default-rtdb.firebaseio.com",
  projectId: "yuma-f4924",
  storageBucket: "yuma-f4924.firebasestorage.app",
  messagingSenderId: "918394185102",
  appId: "1:918394185102:web:861815765bc32450c3f0df",
  measurementId: "G-K5R5RV2K60"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);