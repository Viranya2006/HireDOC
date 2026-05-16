"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updatePassword,
  type User,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import {
  clearSessionCookie,
  clearToken,
  getToken,
  setSessionCookie,
  setToken,
} from "@/lib/auth/session";
import {
  exchangeFirebaseSession,
  getMe,
  updateRecruiter as patchRecruiter,
  type Recruiter,
  type UpdateRecruiterBody,
} from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";

interface AuthContextValue {
  recruiter: Recruiter | null;
  firebaseUser: User | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (organizationName?: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    organizationName?: string,
  ) => Promise<void>;
  resendVerification: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateRecruiter: (body: UpdateRecruiterBody) => Promise<Recruiter>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const PENDING_ORG_KEY = "hiredoc_pending_org";

async function syncAppSession(
  user: User,
  organizationName?: string,
): Promise<Recruiter> {
  const idToken = await user.getIdToken();
  const { token, recruiter } = await exchangeFirebaseSession(
    idToken,
    organizationName,
  );
  setToken(token);
  setSessionCookie();
  return recruiter;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isFirebaseConfigured();

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      const appToken = getToken();

      if (!user) {
        if (!appToken) {
          setRecruiter(null);
          setLoading(false);
          return;
        }
        setLoading(false);
        return;
      }

      if (appToken && user.emailVerified) {
        try {
          const { recruiter: r } = await getMe();
          setRecruiter(r);
        } catch {
          if (user.emailVerified) {
            try {
              const r = await syncAppSession(user);
              setRecruiter(r);
            } catch {
              clearToken();
              clearSessionCookie();
              setRecruiter(null);
            }
          }
        }
        setLoading(false);
        return;
      }

      setLoading(false);
    });

    return () => unsub();
  }, [configured]);

  const signInWithGoogle = useCallback(
    async (organizationName?: string) => {
      if (!configured) {
        throw new Error(
          "Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* to .env.local",
        );
      }
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Firebase not initialized");

      if (organizationName?.trim()) {
        localStorage.setItem(PENDING_ORG_KEY, organizationName.trim());
      }

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const credential = await signInWithPopup(auth, provider);

      const pendingOrg = localStorage.getItem(PENDING_ORG_KEY) ?? undefined;
      const r = await syncAppSession(
        credential.user,
        pendingOrg || organizationName?.trim() || undefined,
      );
      localStorage.removeItem(PENDING_ORG_KEY);
      setRecruiter(r);
    },
    [configured],
  );

  const signIn = useCallback(async (email: string, password: string) => {
    if (!configured) {
      throw new Error(
        "Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* to .env.local",
      );
    }
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase not initialized");

    const credential = await signInWithEmailAndPassword(auth, email, password);
    if (!credential.user.emailVerified) {
      await firebaseSignOut(auth);
      throw new Error(
        "Email not verified. Check your inbox for the verification link.",
      );
    }

    const pendingOrg = localStorage.getItem(PENDING_ORG_KEY) ?? undefined;
    const r = await syncAppSession(credential.user, pendingOrg || undefined);
    localStorage.removeItem(PENDING_ORG_KEY);
    setRecruiter(r);
  }, [configured]);

  const signUp = useCallback(
    async (email: string, password: string, organizationName?: string) => {
      if (!configured) {
        throw new Error(
          "Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* to .env.local",
        );
      }
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Firebase not initialized");

      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await sendEmailVerification(credential.user);
      if (organizationName?.trim()) {
        localStorage.setItem(PENDING_ORG_KEY, organizationName.trim());
      }
      await firebaseSignOut(auth);
      clearToken();
      clearSessionCookie();
      setRecruiter(null);
    },
    [configured],
  );

  const resendVerification = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth?.currentUser) {
      throw new Error("Sign in with your email and password first.");
    }
    await sendEmailVerification(auth.currentUser);
  }, []);

  const sendPasswordReset = useCallback(
    async (email: string) => {
      if (!configured) {
        throw new Error(
          "Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* to .env.local",
        );
      }
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Firebase not initialized");

      const trimmed = email.trim();
      if (!trimmed) {
        throw new Error("Enter your email address.");
      }

      const actionCodeSettings =
        typeof window !== "undefined"
          ? { url: `${window.location.origin}/login`, handleCodeInApp: false }
          : undefined;

      try {
        await sendPasswordResetEmail(auth, trimmed, actionCodeSettings);
      } catch (err) {
        if (
          err instanceof FirebaseError &&
          err.code === "auth/user-not-found"
        ) {
          return;
        }
        throw err;
      }
    },
    [configured],
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!configured) {
        throw new Error(
          "Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* to .env.local",
        );
      }
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Firebase not initialized");

      const user = auth.currentUser;
      if (!user?.email) {
        throw new Error("You must be signed in to change your password.");
      }

      const hasPasswordProvider = user.providerData.some(
        (p) => p.providerId === "password",
      );
      if (!hasPasswordProvider) {
        throw new Error(
          "Your account uses Google sign-in. Manage your password through Google, or use “Send reset email” to add a password.",
        );
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
    },
    [configured],
  );

  const updateRecruiter = useCallback(async (body: UpdateRecruiterBody) => {
    const { recruiter: updated } = await patchRecruiter(body);
    setRecruiter(updated);
    return updated;
  }, []);

  const signOut = useCallback(async () => {
    clearToken();
    clearSessionCookie();
    setRecruiter(null);
    const auth = getFirebaseAuth();
    if (auth) await firebaseSignOut(auth);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        recruiter,
        firebaseUser,
        loading,
        isConfigured: configured,
        signIn,
        signInWithGoogle,
        signUp,
        resendVerification,
        sendPasswordReset,
        changePassword,
        updateRecruiter,
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

export function getAuthErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/wrong-password":
        return "Current password is incorrect";
      case "auth/invalid-credential":
        return "Current password is incorrect";
      case "auth/weak-password":
        return "Password should be at least 6 characters";
      case "auth/requires-recent-login":
        return "For security, sign out and sign in again, then try changing your password.";
      case "auth/too-many-requests":
        return "Too many attempts. Wait a few minutes and try again.";
      case "auth/user-mismatch":
        return "Session expired. Sign out and sign in again.";
      default:
        break;
    }
  }
  if (err instanceof Error) {
    if (
      err.message.includes("auth/configuration-not-found") ||
      err.message.includes("CONFIGURATION_NOT_FOUND")
    ) {
      return "Firebase Authentication is not enabled for this project. In Firebase Console → Authentication, click Get started, then enable Email/Password under Sign-in method.";
    }
    if (err.message.includes("auth/invalid-credential")) {
      return "Invalid email or password";
    }
    if (err.message.includes("auth/email-already-in-use")) {
      return "An account with this email already exists";
    }
    if (err.message.includes("auth/weak-password")) {
      return "Password should be at least 6 characters";
    }
    if (err.message.includes("auth/popup-closed-by-user")) {
      return "Sign-in cancelled";
    }
    if (err.message.includes("auth/popup-blocked")) {
      return "Popup blocked. Allow popups for this site and try again.";
    }
    if (
      err.message.includes("auth/account-exists-with-different-credential")
    ) {
      return "An account with this email already exists. Sign in with email and password instead.";
    }
    if (err.message.includes("auth/operation-not-allowed")) {
      return "Google sign-in is not enabled. In Firebase Console → Authentication → Sign-in method, enable Google.";
    }
    if (err.message.includes("auth/invalid-email")) {
      return "Enter a valid email address";
    }
    if (err.message.includes("auth/missing-email")) {
      return "Enter your email address";
    }
    if (err.message.includes("auth/too-many-requests")) {
      return "Too many attempts. Wait a few minutes and try again.";
    }
    return err.message;
  }
  return "Something went wrong";
}
