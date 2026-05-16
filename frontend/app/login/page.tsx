"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useAuth, getAuthErrorMessage } from "@/providers/auth-provider";
import { LimeButton } from "@/components/lime-button";
import { ROUTES } from "@/lib/constants/routes";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || ROUTES.jobsNew;
  const { signIn, signInWithGoogle, signUp, isConfigured } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const busy = loading || googleLoading;

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

  const handleGoogleSignIn = async () => {
    setError("");
    setInfo("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle(
        isSignUp ? organizationName || undefined : undefined,
      );
      router.push(redirect);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setGoogleLoading(false);
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
            ? "Sign up with Google instantly, or use email (verification required)."
            : "Sign in with Google or your email and password."}
      </p>

      {isSignUp && (
        <div className="mb-4">
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
        </div>
      )}

      {isConfigured && (
        <>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={busy}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-[rgba(15,15,15,0.15)] rounded-full font-body text-sm font-medium text-[#0F0F0F] hover:border-[rgba(15,15,15,0.3)] transition-colors disabled:opacity-50"
          >
            <GoogleIcon className="w-5 h-5 shrink-0" />
            {googleLoading ? "Signing in…" : "Continue with Google"}
          </button>

          <motion.div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <motion.div className="w-full border-t border-[rgba(15,15,15,0.10)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 font-body text-xs text-[#6B6560] uppercase tracking-wide">
                or
              </span>
            </div>
          </motion.div>
        </>
      )}

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
            placeholder="Enter your email..."
          />
        </div>
        <motion.div>
          <label className="font-body text-xs font-semibold text-[#6B6560] uppercase tracking-wide">
            Password
          </label>
          <motion.div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-11 rounded-xl border border-[rgba(15,15,15,0.15)] font-body text-sm focus:outline-none focus:border-[#C8F135]"
              placeholder="Enter your password..."
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#6B6560] hover:text-[#0F0F0F] transition-colors rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8F135]"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" aria-hidden />
              ) : (
                <Eye className="w-5 h-5" aria-hidden />
              )}
            </button>
          </motion.div>
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
          disabled={busy || !isConfigured}
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
          setShowPassword(false);
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

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
