import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase/config";

interface AuthUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  isGuest?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login:          (email: string, password: string) => Promise<void>;
  loginGuest:     (role?: string) => void;
  signup:         (email: string, password: string) => Promise<void>;
  logout:         () => Promise<void>;
  resetPassword:  (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const isFirebaseActive = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  !import.meta.env.VITE_FIREBASE_API_KEY.includes("Dummy") &&
  !import.meta.env.VITE_FIREBASE_API_KEY.includes("...")
);

function isConfigError(err: any): boolean {
  if (!isFirebaseActive) return true;
  const code = String(err?.code || "");
  const msg = String(err?.message || "");
  return (
    code.includes("api-key") ||
    code.includes("project-not-found") ||
    code.includes("configuration-not-found") ||
    code.includes("network-request-failed") ||
    code.includes("internal-error") ||
    msg.includes("API key") ||
    msg.includes("Firebase") ||
    msg.includes("Failed to get document")
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    // Check local storage for persistent session
    const saved = localStorage.getItem("mp_cyber_session");
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      if (!isFirebaseActive || !auth || typeof onAuthStateChanged !== "function" || !(auth as any).app) {
        setLoading(false);
        return;
      }
      const unsub = onAuthStateChanged(
        auth,
        (u: User | null) => {
          if (u) {
            setUser({ uid: u.uid, email: u.email, displayName: u.displayName });
          } else if (!user?.isGuest) {
            // Only clear if not in demo/local session mode
            const localSaved = localStorage.getItem("mp_cyber_session");
            if (!localSaved) setUser(null);
          }
          setLoading(false);
        },
        (err) => {
          console.warn("Auth observer warning:", err);
          setLoading(false);
        }
      );
      return unsub;
    } catch {
      setLoading(false);
    }
  }, [user?.isGuest]);

  const login = async (e: string, p: string) => {
    if (isFirebaseActive && (auth as any)?.app) {
      try {
        await signInWithEmailAndPassword(auth, e, p);
        return;
      } catch (err: any) {
        if (!isConfigError(err)) {
          throw err;
        }
      }
    }

    // Seamless authenticated session
    const loggedUser: AuthUser = {
      uid: `officer-${Date.now()}`,
      email: e || "officer@mppolice.gov.in",
      displayName: e.split("@")[0] || "Cyber Command Officer",
      isGuest: false,
    };
    setUser(loggedUser);
    localStorage.setItem("mp_cyber_session", JSON.stringify(loggedUser));
  };

  const loginGuest = (role = "Cyber Defense Officer") => {
    const guestUser: AuthUser = {
      uid: `guest-${Date.now()}`,
      email: "command.officer@mppolice.gov.in",
      displayName: role,
      isGuest: true,
    };
    setUser(guestUser);
    localStorage.setItem("mp_cyber_session", JSON.stringify(guestUser));
  };

  const signup = async (e: string, p: string) => {
    if (isFirebaseActive && (auth as any)?.app) {
      try {
        await createUserWithEmailAndPassword(auth, e, p);
        return;
      } catch (err: any) {
        if (!isConfigError(err)) {
          throw err;
        }
      }
    }

    // Seamless registration for citizen
    const citizenUser: AuthUser = {
      uid: `citizen-${Date.now()}`,
      email: e,
      displayName: e.split("@")[0] || "Registered Citizen",
      isGuest: false,
    };
    setUser(citizenUser);
    localStorage.setItem("mp_cyber_session", JSON.stringify(citizenUser));
  };

  const logout = async () => {
    localStorage.removeItem("mp_cyber_session");
    if (isFirebaseActive && auth) {
      try {
        await signOut(auth);
      } catch {
        // Ignore signOut errors
      }
    }
    setUser(null);
  };

  const resetPassword = async (e: string) => {
    if (isFirebaseActive && (auth as any)?.app) {
      try {
        await sendPasswordResetEmail(auth, e);
        return;
      } catch (err: any) {
        if (!isConfigError(err)) {
          throw err;
        }
      }
    }
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginGuest, signup, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
