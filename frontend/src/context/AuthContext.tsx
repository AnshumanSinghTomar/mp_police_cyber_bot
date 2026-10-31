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

interface StoredAccount {
  email: string;
  passwordHash: string;
  displayName: string;
  createdAt: number;
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

// Secure SHA-256 password hashing using Browser Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getStoredAccounts(): Record<string, StoredAccount> {
  try {
    const raw = localStorage.getItem("mp_cyber_accounts");
    const accounts = raw ? JSON.parse(raw) : {};
    return accounts;
  } catch {
    return {};
  }
}

function saveAccount(acc: StoredAccount) {
  const accounts = getStoredAccounts();
  accounts[acc.email.toLowerCase().trim()] = acc;
  localStorage.setItem("mp_cyber_accounts", JSON.stringify(accounts));
}

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
    const saved = localStorage.getItem("mp_cyber_session");
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Pre-seed demo officer credentials on first load if not present
  useEffect(() => {
    (async () => {
      const accounts = getStoredAccounts();
      if (!accounts["officer@mppolice.gov.in"]) {
        const hash = await hashPassword("Police@123");
        saveAccount({
          email: "officer@mppolice.gov.in",
          passwordHash: hash,
          displayName: "Cyber Command Officer",
          createdAt: Date.now(),
        });
      }
    })();
  }, []);

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
    const cleanEmail = e.toLowerCase().trim();

    // 1. If Firebase is active and configured, use Firebase Auth
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

    // 2. Local Verified Account Authentication
    const accounts = getStoredAccounts();
    const stored = accounts[cleanEmail];

    if (!stored) {
      const err: any = new Error("No registered account found with this email.");
      err.code = "auth/user-not-found";
      throw err;
    }

    const inputHash = await hashPassword(p);
    if (inputHash !== stored.passwordHash) {
      const err: any = new Error("Incorrect password. Please verify and try again.");
      err.code = "auth/wrong-password";
      throw err;
    }

    const loggedUser: AuthUser = {
      uid: `officer-${Date.now()}`,
      email: stored.email,
      displayName: stored.displayName || cleanEmail.split("@")[0],
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
    const cleanEmail = e.toLowerCase().trim();

    // 1. If Firebase is active and configured, use Firebase Auth
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

    // 2. Local Account Registration with Unique Check
    const accounts = getStoredAccounts();
    if (accounts[cleanEmail]) {
      const err: any = new Error("An account with this email already exists.");
      err.code = "auth/email-already-in-use";
      throw err;
    }

    const passwordHash = await hashPassword(p);
    const newAccount: StoredAccount = {
      email: cleanEmail,
      passwordHash,
      displayName: cleanEmail.split("@")[0] || "Registered Citizen",
      createdAt: Date.now(),
    };
    saveAccount(newAccount);

    const citizenUser: AuthUser = {
      uid: `citizen-${Date.now()}`,
      email: cleanEmail,
      displayName: newAccount.displayName,
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
    const cleanEmail = e.toLowerCase().trim();

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

    const accounts = getStoredAccounts();
    if (!accounts[cleanEmail]) {
      const err: any = new Error("No account found with this email.");
      err.code = "auth/user-not-found";
      throw err;
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
