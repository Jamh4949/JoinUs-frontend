// src/config/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, 
    GoogleAuthProvider,
    signInWithPopup,
    GithubAuthProvider,
    signInWithEmailAndPassword,
    } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);


const provider = new GoogleAuthProvider();


export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user; 
  } catch (error: any) {
    console.error("Error al loguear con google:", error);
    throw error;
  }
};

const githubProvider = new GithubAuthProvider();

export const loginWithGithub = () => {
  return signInWithPopup(auth, githubProvider)
    .then((result) => result.user)
    .catch((error) => {
      console.error("Error en GitHub login:", error);
      throw error;
    });
};

// EMAIL
export const loginWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
};