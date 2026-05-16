"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth, getAuthErrorMessage } from "@/providers/auth-provider";
import { LimeButton } from "@/components/lime-button";
import { ROUTES } from "@/lib/constants/routes";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || ROUTES.jobsNew;
  const { signIn, signUp, isConfigured } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, organizationName || undefined);
        setInfo(
          "Account created. Check your email for a verification link, then sign in.",
        );
        setIsSignUp(false);
        setPassword("");
      } else {
        await signIn(email, password);
        router.push(redirect);
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-white rounded-2xl border border-[rgba(15,15,15,0.10)] p-8 shadow-sm"
    >
      <h1 className="font-display font-extrabold text-2xl text-[#0F0F0F] mb-2">
        {isSignUp ? "Create account" : "Recruiter sign in"}
      </h1>
      <p className="font-body text-sm text-[#6B6560] mb-6">
        {!isConfigured
          ? "Add Firebase keys to .env.local (see .env.example)."
          : isSignUp
            ? "We will send a verification email after sign-up."
            : "Sign in with your email and password."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <label className="font-body text-xs font-semibold text-[#6B6560] uppercase tracking-wide">
              Organization (optional)
            </label>
            <input
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="mt-1 w-full px-4 py-3 rounded-xl border border-[rgba(15,15,15,0.15)] font-body text-sm focus:outline-none focus:border-[#C8F135]"
              placeholder="Acme Inc."
            />
          </motion.div>
        )}
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
        <motion.div>
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
        </motion.div>
        {info && (
          <p className="font-body text-sm text-[#00C896] bg-[#00C896]/10 rounded-lg p-3">
            {info}
          </p>
        )}
        {error && (
          <p className="font-body text-sm text-[#FF4D2E]">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading || !isConfigured}
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
        onClick={() => {
          setIsSignUp(!isSignUp);
          setError("");
          setInfo("");
        }}
        className="mt-4 w-full font-body text-sm text-[#0057FF] hover:underline"
      >
        {isSignUp
          ? "Already have an account? Sign in"
          : "Need an account? Sign up"}
      </button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-6 pt-6 border-t border-[rgba(15,15,15,0.10)] text-center"
      >
        <LimeButton href={ROUTES.home} variant="dark" className="text-sm py-2">
          ← Back to home
        </LimeButton>
      </motion.div>
    </motion.div>
  );
}
