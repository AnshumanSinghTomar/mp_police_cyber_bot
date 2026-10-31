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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(() => {
    // Check local storage for persistent guest/demo session
    const saved = localStorage.getItem("mp_cyber_session");
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const unsub = onAuthStateChanged(auth, (u: User | null) => {
        if (u) {
          setUser({ uid: u.uid, email: u.email, displayName: u.displayName });
        } else if (!user?.isGuest) {
          setUser(null);
        }
        setLoading(false);
      });
      return unsub;
    } catch {
      // If Firebase fails initialization due to dummy config
      setLoading(false);
    }
  }, [user?.isGuest]);

  const login = async (e: string, p: string) => {
    try {
      await signInWithEmailAndPassword(auth, e, p);
    } catch (err: any) {
      // If Firebase key is placeholder or invalid, allow fallback demo login for convenience
      if (err?.code === "auth/api-key-not-valid" || err?.message?.includes("API key not valid")) {
        const guestUser: AuthUser = {
          uid: "cyber-officer-demo",
          email: e || "officer@mppolice.gov.in",
          displayName: "Cyber Command Officer",
          isGuest: true,
        };
        setUser(guestUser);
        localStorage.setItem("mp_cyber_session", JSON.stringify(guestUser));
        return;
      }
      throw err;
    }
  };

  const loginGuest = (role = "Cyber Defense Officer") => {
    const guestUser: AuthUser = {
      uid: `officer-${Date.now()}`,
      email: "command.officer@mppolice.gov.in",
      displayName: role,
      isGuest: true,
    };
    setUser(guestUser);
    localStorage.setItem("mp_cyber_session", JSON.stringify(guestUser));
  };

  const signup = async (e: string, p: string) => {
    try {
      await createUserWithEmailAndPassword(auth, e, p);
    } catch (err: any) {
      if (err?.code === "auth/api-key-not-valid" || err?.message?.includes("API key not valid")) {
        loginGuest("Citizen User");
        return;
      }
      throw err;
    }
  };

  const logout = async () => {
    localStorage.removeItem("mp_cyber_session");
    try {
      await signOut(auth);
    } catch {
      // Ignore signOut errors on guest mode
    }
    setUser(null);
  };

  const resetPassword = (e: string) => sendPasswordResetEmail(auth, e);

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