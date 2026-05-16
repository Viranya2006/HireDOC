"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/providers/auth-provider";
import { LimeButton } from "@/components/lime-button";
import { ROUTES } from "@/lib/constants/routes";

type Step = "email" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || ROUTES.jobsNew;
  const { sendOtp, verifyOtp } = useAuth();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [otp, setOtp] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [devOtp, setDevOtp] = useState<string | undefined>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const code = await sendOtp(
        email,
        isSignUp ? organizationName || undefined : undefined,
      );
      setDevOtp(code);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
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
        {step === "email"
          ? isSignUp
            ? "Create account"
            : "Recruiter sign in"
          : "Enter verification code"}
      </h1>
      <p className="font-body text-sm text-[#6B6560] mb-6">
        {step === "email"
          ? "We will email you a one-time code to sign in."
          : `Code sent to ${email}`}
      </p>

      {step === "email" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
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
          {error && (
            <p className="font-body text-sm text-[#FF4D2E]">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#C8F135] rounded-full font-display font-semibold text-[#0F0F0F] hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          {devOtp && process.env.NODE_ENV === "development" && (
            <p className="font-body text-xs text-[#6B6560] bg-[#F5F0E8] rounded-lg p-3">
              Dev OTP: <strong className="font-mono">{devOtp}</strong>
            </p>
          )}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <label className="font-body text-xs font-semibold text-[#6B6560] uppercase tracking-wide">
              6-digit code
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="mt-1 w-full px-4 py-3 rounded-xl border border-[rgba(15,15,15,0.15)] font-body text-sm tracking-widest text-center focus:outline-none focus:border-[#C8F135]"
              placeholder="000000"
            />
          </motion.div>
          {error && (
            <p className="font-body text-sm text-[#FF4D2E]">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3 bg-[#C8F135] rounded-full font-display font-semibold text-[#0F0F0F] hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {loading ? "Verifying…" : "Verify & sign in"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setOtp("");
              setError("");
            }}
            className="w-full font-body text-sm text-[#6B6560] hover:text-[#0F0F0F]"
          >
            ← Use a different email
          </button>
        </form>
      )}

      {step === "email" && (
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="mt-4 w-full font-body text-sm text-[#0057FF] hover:underline"
        >
          {isSignUp
            ? "Already have an account? Sign in"
            : "Need an account? Sign up"}
        </button>
      )}

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
