// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add your Firebase configuration here
// Aonde encontrar essas chaves: 
// 1. Vá para o seu projeto no Firebase Console: https://console.firebase.google.com/
// 2. Clique no ícone de engrenagem (Configurações do projeto) no canto superior esquerdo.
// 3. Na aba "Geral", role para baixo até a seção "Seus apps".
// 4. Clique no ícone </> para ver a configuração do seu aplicativo da web.
// 5. Copie o objeto firebaseConfig e cole aqui.

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
