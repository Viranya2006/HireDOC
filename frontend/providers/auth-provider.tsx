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
  clearSessionCookie,
  clearToken,
  getToken,
  setSessionCookie,
  setToken,
} from "@/lib/auth/session";
import {
  getMe,
  sendOtp as apiSendOtp,
  verifyOtp as apiVerifyOtp,
  type Recruiter,
} from "@/lib/api/auth";

interface AuthContextValue {
  recruiter: Recruiter | null;
  loading: boolean;
  sendOtp: (email: string, organizationName?: string) => Promise<string | undefined>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    getMe()
      .then(({ recruiter: r }) => setRecruiter(r))
      .catch(() => {
        clearToken();
        clearSessionCookie();
      })
      .finally(() => setLoading(false));
  }, []);

  const sendOtp = useCallback(
    async (email: string, organizationName?: string) => {
      const res = await apiSendOtp(email, organizationName);
      return res.dev_otp;
    },
    [],
  );

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    const { token, recruiter: r } = await apiVerifyOtp(email, otp);
    setToken(token);
    setSessionCookie();
    setRecruiter(r);
  }, []);

  const signOut = useCallback(() => {
    clearToken();
    clearSessionCookie();
    setRecruiter(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ recruiter, loading, sendOtp, verifyOtp, signOut }}
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
