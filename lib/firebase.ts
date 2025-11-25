import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore/lite';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAg2rDR7DjeNZJBCgsOszkzeBgWh4nbToM",
  authDomain: "studio-8959591633-f42a3.firebaseapp.com",
  projectId: "studio-8959591633-f42a3",
  storageBucket: "studio-8959591633-f42a3.firebasestorage.app",
  messagingSenderId: "196649094103",
  appId: "1:196649094103:web:e031e5483737722602d992"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);