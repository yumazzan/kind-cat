// Firebase 설정 - Firestore Database 사용
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBkO_LBcOMF2VOMywDKAP28yW7uiOvMPAs",
  authDomain: "yuma-f4924-3ccfd.firebaseapp.com",
  projectId: "yuma-f4924",
  storageBucket: "yuma-f4924-3ccfd.firebasestorage.app",
  messagingSenderId: "918394185102",
  appId: "1:918394185102:web:86181765bc32450c3f0df",
  measurementId: "G-K5R5RV2K60"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firestore 데이터베이스
export const db = getFirestore(app);

// Authentication (필요시)
export const auth = getAuth(app);

export default app;