// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBkO_LBcOMF2VOMywDKAP28yW7uiOvMPAs",
  authDomain: "yuma-f4924-3ccfd.firebaseapp.com",
  databaseURL: "https://yuma-f4924-3ccfd-default-rtdb.firebaseio.com",
  projectId: "yuma-f4924-3ccfd",
  storageBucket: "yuma-f4924-3ccfd.firebasestorage.app",
  messagingSenderId: "918394185102",
  appId: "1:918394185102:web:86181765bc32450c3f0df",
  measurementId: "G-K5R5RV2K60"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
