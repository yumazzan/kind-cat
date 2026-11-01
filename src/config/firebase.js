// Firebase 설정 - Firestore Database + Storage
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firestore 데이터베이스
export const db = getFirestore(app);

// Storage (이미지 업로드)
export const storage = getStorage(app);

export default app;