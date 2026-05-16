"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/providers/auth-provider";
import { LimeButton } from "@/components/lime-button";
import { ROUTES } from "@/lib/constants/routes";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || ROUTES.jobsNew;
  const { signIn, signUp, isConfigured } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const setSessionCookie = () => {
    document.cookie =
      "hiredoc_session=1; path=/; max-age=86400; SameSite=Lax";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      setSessionCookie();
      router.push(redirect);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Authentication failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
      <nav className="h-16 border-b border-[rgba(15,15,15,0.10)] px-6 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#C8F135] rounded-sm" />
          <span className="font-display font-bold text-lg">HireDoc AI</span>
        </Link>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-2xl border border-[rgba(15,15,15,0.10)] p-8 shadow-sm"
        >
          <h1 className="font-display font-extrabold text-2xl text-[#0F0F0F] mb-2">
            {isSignUp ? "Create account" : "Recruiter sign in"}
          </h1>
          <p className="font-body text-sm text-[#6B6560] mb-6">
            {isConfigured
              ? "Sign in with your organization email."
              : "Firebase is not configured — use any email/password for demo mode."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-body text-xs font-semibold text-[#6B6560] uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-4 py-3 rounded-xl border border-[rgba(15,15,15,0.15)] font-body text-sm focus:outline-none focus:border-[#C8F135]"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="font-body text-xs font-semibold text-[#6B6560] uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-4 py-3 rounded-xl border border-[rgba(15,15,15,0.15)] font-body text-sm focus:outline-none focus:border-[#C8F135]"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="font-body text-sm text-[#FF4D2E]">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#C8F135] rounded-full font-display font-semibold text-[#0F0F0F] hover:scale-[1.02] transition-transform disabled:opacity-50"
            >
              {loading
                ? "Please wait…"
                : isSignUp
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="mt-4 w-full font-body text-sm text-[#0057FF] hover:underline"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Need an account? Sign up"}
          </button>

          <div className="mt-6 pt-6 border-t border-[rgba(15,15,15,0.10)] text-center">
            <LimeButton href={ROUTES.home} variant="dark" className="text-sm py-2">
              ← Back to home
            </LimeButton>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
