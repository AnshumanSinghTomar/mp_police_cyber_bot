import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForFallbackMode12345678",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mp-police-cyberbot.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID || "mp-police-cyberbot",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mp-police-cyberbot.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456",
};

let app: FirebaseApp;
let auth: Auth;

try {
  app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (e) {
  console.warn("Firebase initialization warning (running in offline/demo fallback mode):", e);
  app = (getApps().length > 0 ? getApps()[0] : null) as any;
  auth = (app ? getAuth(app) : {}) as any;
}

export { auth };
export default app;
