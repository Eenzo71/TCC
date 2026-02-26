import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDP8Fc-A253udPrfan9KrjmL08_hxgH34w",
  authDomain: "bus-flow-109c8.firebaseapp.com",
  projectId: "bus-flow-109c8",
  storageBucket: "bus-flow-109c8.firebasestorage.app",
  messagingSenderId: "546902883448",
  appId: "1:546902883448:web:26117e8f596d5fa0ea818d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);