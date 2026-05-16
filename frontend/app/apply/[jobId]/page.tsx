"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getJobBySlug } from "@/lib/api/jobs";
import { submitApplication } from "@/lib/api/applications";
import { ApiError } from "@/lib/api/client";
import type { Job } from "@/lib/types/job";
import { toast } from "sonner";
import { JobDescription } from "@/components/job-description";
import { Logo } from "@/components/logo";

export default function ApplyPage() {
  const params = useParams();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    portfolio: "",
    resume: null as File | null,
    answers: [] as string[],
  });

  useEffect(() => {
    if (!jobId?.trim()) {
      setLoadError("Invalid application link.");
      setLoading(false);
      return;
    }

    setLoadError("");
    getJobBySlug(jobId)
      .then((data) => {
        setJob(data);
        if (data) {
          setFormData((f) => ({
            ...f,
            answers: data.questions.map(() => ""),
          }));
        }
      })
      .catch((err) => {
        setJob(null);
        setLoadError(
          err instanceof ApiError
            ? err.message
            : "Could not load this job. Check the link and try again.",
        );
      })
      .finally(() => setLoading(false));
  }, [jobId]);

  const updateAnswer = (index: number, value: string) => {
    const newAnswers = [...formData.answers];
    newAnswers[index] = value;
    setFormData({ ...formData, answers: newAnswers });
  };

  const handleSubmit = async () => {
    if (!job || !formData.name || !formData.email) return;
    if (!formData.resume) {
      setError("Please upload your resume (PDF).");
      return;
    }
    if (formData.resume.type !== "application/pdf") {
      setError("Resume must be a PDF file.");
      return;
    }
    if (formData.resume.size > 5 * 1024 * 1024) {
      setError("Resume must be 5MB or smaller.");
      return;
    }

    const answerMap: Record<string, string> = {};
    job.questions.forEach((q, i) => {
      if (formData.answers[i]?.trim()) {
        answerMap[q.id] = formData.answers[i];
      }
    });

    setError("");
    setSubmitting(true);
    try {
      await submitApplication({
        jobId: job.id,
        slug: job.slug,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        linkedin: formData.linkedin,
        portfolio: formData.portfolio,
        answers: formData.answers,
        resume: formData.resume,
        answerMap,
      });
      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to submit application";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <p className="font-body text-[#6B6560]">Loading job…</p>
      </div>
    );
  }

  if (!job) {
    const notPublished = loadError.toLowerCase().includes("not open");
    const expired = loadError.toLowerCase().includes("expired");
    const heading = notPublished
      ? "Not accepting applications yet"
      : expired
        ? "Job posting expired"
        : "Job not found";

    return (
      <motion.div className="min-h-screen bg-[#F5F0E8] flex flex-col items-center justify-center gap-4 p-8 text-center max-w-md mx-auto">
        <h1 className="font-display font-bold text-2xl">{heading}</h1>
        <p className="font-body text-[#6B6560]">
          {loadError ||
            "This application link may be wrong, or the job may have been removed."}
        </p>
        {notPublished && (
          <p className="font-body text-sm text-[#6B6560]">
            Recruiters: publish the job from your dashboard, then share the apply
            link again.
          </p>
        )}
        <Link href="/" className="text-[#0057FF] hover:underline">
          Back to home
        </Link>
      </motion.div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border p-8 max-w-md text-center"
        >
          <h1 className="font-display font-extrabold text-2xl mb-2">
            Application submitted!
          </h1>
          <p className="font-body text-[#6B6560]">
            Thanks, {formData.name}. MiniMax will screen your application and
            the recruiter will be in touch.
          </p>
        </motion.div>
      </div>
    );
  }

  const questionTexts = job.questions.map((q) => q.text);

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Navbar */}
      <nav className="h-[72px] bg-[#F5F0E8] border-b border-[#E8E2D9] px-8 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <Logo size="md" />
          <span className="font-display font-bold text-[#0F0F0F] text-lg">
            HireDoc AI
          </span>
        </Link>
        <span className="font-body text-sm text-[#6B6560]">
          Powered by MiniMax AI
        </span>
      </nav>

      {/* Content */}
      <main className="max-w-[900px] mx-auto px-6 py-12">
        {/* Job Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-white rounded-2xl border border-[#E8E2D9] p-8 mb-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display font-extrabold text-[#0F0F0F] text-3xl mb-2">
                {job.title}
              </h1>
              <div className="flex items-center gap-4 text-[#6B6560]">
                <span className="font-body text-sm">{job.company}</span>
                <span className="w-1 h-1 bg-[#6B6560] rounded-full" />
                <span className="font-body text-sm">{job.location}</span>
                <span className="w-1 h-1 bg-[#6B6560] rounded-full" />
                <span className="font-body text-sm capitalize">{job.type}</span>
                {job.salary && (
                  <>
                    <span className="w-1 h-1 bg-[#6B6560] rounded-full" />
                    <span className="font-body text-sm">{job.salary}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#00C896]/10 text-[#00C896] rounded-full font-display font-semibold text-xs">
                Open
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-[1fr_320px] gap-8">
          {/* Main Form */}
          <div className="space-y-6">
            {/* Step Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.1,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="flex items-center gap-4"
            >
              {[1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setStep(s)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-display font-semibold text-sm transition-all ${
                    step === s
                      ? "bg-[#C8F135] text-[#0F0F0F]"
                      : step > s
                        ? "bg-[#0F0F0F] text-white"
                        : "bg-white border border-[#E8E2D9] text-[#6B6560]"
                  }`}
                >
                  {step > s ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span>{s}</span>
                  )}
                  {s === 1 ? "Your Info" : "Screening Questions"}
                </button>
              ))}
            </motion.div>

            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.2,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="bg-white rounded-2xl border border-[#E8E2D9] p-8"
              >
                <h2 className="font-display font-bold text-[#0F0F0F] text-xl mb-6">
                  Your Information
                </h2>
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Alex Kim"
                        className="w-full px-4 py-3 bg-[#F5F0E8] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] placeholder:text-[#6B6560] focus:outline-none focus:border-[#C8F135] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="alex@email.com"
                        className="w-full px-4 py-3 bg-[#F5F0E8] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] placeholder:text-[#6B6560] focus:outline-none focus:border-[#C8F135] transition-colors"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-4 py-3 bg-[#F5F0E8] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] placeholder:text-[#6B6560] focus:outline-none focus:border-[#C8F135] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        value={formData.linkedin}
                        onChange={(e) =>
                          setFormData({ ...formData, linkedin: e.target.value })
                        }
                        placeholder="linkedin.com/in/alexkim"
                        className="w-full px-4 py-3 bg-[#F5F0E8] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] placeholder:text-[#6B6560] focus:outline-none focus:border-[#C8F135] transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                      Portfolio / GitHub
                    </label>
                    <input
                      type="url"
                      value={formData.portfolio}
                      onChange={(e) =>
                        setFormData({ ...formData, portfolio: e.target.value })
                      }
                      placeholder="https://github.com/alexkim"
                      className="w-full px-4 py-3 bg-[#F5F0E8] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] placeholder:text-[#6B6560] focus:outline-none focus:border-[#C8F135] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                      Resume *
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            resume: e.target.files?.[0] || null,
                          })
                        }
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="w-full px-4 py-6 bg-[#F5F0E8] border-2 border-dashed border-[#E8E2D9] rounded-xl text-center hover:border-[#C8F135] transition-colors">
                        <svg
                          className="w-8 h-8 text-[#6B6560] mx-auto mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="font-body text-sm text-[#6B6560]">
                          {formData.resume
                            ? formData.resume.name
                            : "Drop your resume here or click to upload"}
                        </p>
                        <p className="font-mono text-xs text-[#6B6560]/60 mt-1">
                          PDF only, up to 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-8">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 bg-[#C8F135] rounded-full font-display font-semibold text-sm text-[#0F0F0F] hover:scale-[1.02] transition-transform"
                  >
                    Continue to Questions
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.2,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="bg-white rounded-2xl border border-[#E8E2D9] p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="font-display font-bold text-[#0F0F0F] text-xl">
                    Screening Questions
                  </h2>
                  <span className="px-2 py-1 bg-[#0057FF]/10 text-[#0057FF] rounded font-mono text-xs">
                    AI Analyzed
                  </span>
                </div>
                <p className="font-body text-sm text-[#6B6560] mb-6">
                  Your answers will be analyzed by MiniMax AI to match you with
                  this role. Be thorough and specific.
                </p>
                <div className="space-y-6">
                  {questionTexts.map((question, index) => (
                    <div key={index}>
                      <label className="block font-display font-semibold text-sm text-[#0F0F0F] mb-2">
                        {index + 1}. {question}
                      </label>
                      <textarea
                        value={formData.answers[index]}
                        onChange={(e) => updateAnswer(index, e.target.value)}
                        rows={4}
                        placeholder="Type your answer here..."
                        className="w-full px-4 py-3 bg-[#F5F0E8] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] placeholder:text-[#6B6560] focus:outline-none focus:border-[#C8F135] transition-colors resize-none"
                      />
                    </div>
                  ))}
                </div>
                {error && (
                  <p className="font-body text-sm text-[#FF4D2E] mt-4">{error}</p>
                )}
                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border border-[#E8E2D9] rounded-full font-display font-semibold text-sm text-[#6B6560] hover:border-[#0F0F0F] hover:text-[#0F0F0F] transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-3 bg-[#C8F135] rounded-full font-display font-semibold text-sm text-[#0F0F0F] hover:scale-[1.02] transition-transform disabled:opacity-50"
                  >
                    {submitting ? "Submitting…" : "Submit Application"}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Job Details Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="bg-white rounded-2xl border border-[#E8E2D9] p-6 sticky top-[96px]"
            >
              <h3 className="font-display font-bold text-[#0F0F0F] text-sm mb-4">
                About This Role
              </h3>
              <JobDescription
                description={job.description}
                className="mb-6"
              />

              <h4 className="font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-3">
                Requirements
              </h4>
              <ul className="space-y-2 mb-6">
                {(job.requirements ?? []).map((req, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 font-body text-sm text-[#0F0F0F]"
                  >
                    <svg
                      className="w-4 h-4 text-[#00C896] mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {req}
                  </li>
                ))}
              </ul>

              <h4 className="font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-3">
                Benefits
              </h4>
              <ul className="space-y-2">
                {(job.benefits ?? []).map((benefit, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 font-body text-sm text-[#0F0F0F]"
                  >
                    <svg
                      className="w-4 h-4 text-[#C8F135] mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {benefit}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-[#E8E2D9]">
        <div className="max-w-[900px] mx-auto px-6 flex items-center justify-between">
          <span className="font-body text-sm text-[#6B6560]">
            Powered by HireDoc AI
          </span>
          <span className="font-mono text-xs text-[#6B6560]/60">
            Your data is encrypted and secure
          </span>
        </div>
      </footer>
    </div>
  );
}
