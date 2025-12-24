// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBkO_LBcOMF2VOMywDKAP28yW7uiOvMPAs",
  authDomain: "yuma-f4924-3ccfd.firebaseapp.com",  // ← 수정
  databaseURL: "https://yuma-f4924-3ccfd-default-rtdb.firebaseio.com",  // ← 수정 (중요!)
  projectId: "yuma-f4924-3ccfd",  // ← 수정
  storageBucket: "yuma-f4924-3ccfd.firebasestorage.app",  // ← 수정
  messagingSenderId: "918394185102",
  appId: "1:918394185102:web:86181765bc32450c3f0df",
  measurementId: "G-K5R5RV2K60"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);