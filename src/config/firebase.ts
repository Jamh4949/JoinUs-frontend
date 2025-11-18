// src/config/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, 
    GoogleAuthProvider,
    signInWithPopup,
    GithubAuthProvider,
    signInWithEmailAndPassword,
    fetchSignInMethodsForEmail,
    linkWithCredential,
    GoogleAuthProvider as GoogleAuthProviderClass,
    GithubAuthProvider as GithubAuthProviderClass,
    } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

// Inicializar Firebase solo si hay configuración válida
let app;
let auth;
try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } else {
    console.warn("Firebase no está configurado. Algunas funciones de autenticación no estarán disponibles.");
  }
} catch (error) {
  console.error("Error al inicializar Firebase:", error);
}

export { auth };


const provider = auth ? new GoogleAuthProvider() : null;


export const loginWithGoogle = async () => {
  if (!auth || !provider) {
    throw new Error("Firebase no está configurado. Por favor, configura las variables de entorno de Firebase.");
  }
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user; 
  } catch (error: any) {
    console.error("Error al loguear con google:", error);
    
    // Handle account-exists-with-different-credential error
    if (error.code === 'auth/account-exists-with-different-credential') {
      const email = error.customData?.email;
      
      if (email) {
        alert(`Ya existe una cuenta con el correo ${email}. Por favor, inicia sesión con el método que usaste originalmente (GitHub o Email/Password).`);
      }
    }
    
    throw error;
  }
};

const githubProvider = auth ? new GithubAuthProvider() : null;

export const loginWithGithub = async () => {
  if (!auth || !githubProvider) {
    throw new Error("Firebase no está configurado. Por favor, configura las variables de entorno de Firebase.");
  }
  
  try {
    const result = await signInWithPopup(auth, githubProvider);
    return result.user;
  } catch (error: any) {
    console.error("Error en GitHub login:", error);
    
    // Handle account-exists-with-different-credential error
    if (error.code === 'auth/account-exists-with-different-credential') {
      const email = error.customData?.email;
      
      if (email) {
        alert(`Ya existe una cuenta con el correo ${email}. Por favor, inicia sesión con el método que usaste originalmente (Google o Email/Password).`);
      }
    }
    
    throw error;
  }
};

// EMAIL
export const loginWithEmail = async (email: string, password: string) => {
  if (!auth) {
    throw new Error("Firebase no está configurado. Por favor, configura las variables de entorno de Firebase.");
  }
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};