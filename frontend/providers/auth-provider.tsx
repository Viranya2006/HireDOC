"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_USER = {
  uid: "demo-recruiter",
  email: "recruiter@hiredoc.demo",
  displayName: "Demo Recruiter",
} as User;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isFirebaseConfigured();

  useEffect(() => {
    if (!configured) {
      const demo = localStorage.getItem("hiredoc_demo_session");
      setUser(demo === "1" ? DEMO_USER : null);
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsub();
  }, [configured]);

  const signIn = async (email: string, password: string) => {
    if (!configured) {
      localStorage.setItem("hiredoc_demo_session", "1");
      setUser(DEMO_USER);
      return;
    }
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase not initialized");
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    if (!configured) {
      localStorage.setItem("hiredoc_demo_session", "1");
      setUser(DEMO_USER);
      return;
    }
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase not initialized");
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    if (!configured) {
      localStorage.removeItem("hiredoc_demo_session");
      setUser(null);
      return;
    }
    const auth = getFirebaseAuth();
    if (auth) await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: configured,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
