"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { StepIndicator } from "@/components/dashboard/step-indicator";
import { MiniMaxAnalysis } from "@/components/dashboard/minimax-analysis";
import {
  createJob,
  publishJob,
  saveJobDraft,
  clearJobDraft,
} from "@/lib/api/jobs";
import { analyzeJD, type JDAnalysisResult } from "@/lib/api/minimax";
import { setJobQuestions } from "@/lib/api/questions";
import { normalizeQuestions } from "@/components/dashboard/questions-editor";
import { ApiError } from "@/lib/api/client";
import type { JobType } from "@/lib/types/job";
import { ROUTES } from "@/lib/constants/routes";
import { toast } from "sonner";
import { LimeButton } from "@/components/lime-button";

const STEPS = ["Details", "Description", "Analysis", "Publish"];

export default function JobCreationPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savingQuestions, setSavingQuestions] = useState(false);
  const [analysis, setAnalysis] = useState<JDAnalysisResult | null>(null);
  const [draftJobId, setDraftJobId] = useState<string | null>(null);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "Remote",
    type: "full-time" as JobType,
    slug: "",
    expiresAt: "",
    description: "",
    questions: [] as string[],
  });

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleAnalyze = async () => {
    if (!form.title.trim() || !form.company.trim()) {
      toast.error("Add job title and company on step 1");
      return;
    }
    if (form.description.trim().length < 50) {
      toast.error("Job description must be at least 50 characters");
      return;
    }
    setAnalyzing(true);
    try {
      const slug = form.slug || slugify(form.title);
      let jobId = draftJobId;
      if (!jobId) {
        const job = await createJob({
          ...form,
          slug,
          questions: [],
        });
        jobId = job.id;
        setDraftJobId(jobId);
      }

      const result = await analyzeJD(jobId);
      const questions = result.requirements.screeningQuestions;
      if (questions.length > 0) {
        await setJobQuestions(jobId, questions);
      }
      setAnalysis(result);
      setForm((f) => ({ ...f, questions, slug }));
      setStep(2);
      toast.success("MiniMax analysis complete");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Analysis failed",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveQuestionsAndContinue = async () => {
    const cleaned = normalizeQuestions(form.questions);
    if (cleaned.length === 0) {
      toast.error("Add at least one screening question");
      return;
    }
    if (!draftJobId) {
      toast.error("Complete analysis before continuing");
      return;
    }

    setSavingQuestions(true);
    try {
      await setJobQuestions(draftJobId, cleaned);
      setForm((f) => ({ ...f, questions: cleaned }));
      setStep(3);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to save questions",
      );
    } finally {
      setSavingQuestions(false);
    }
  };

  const handlePublish = async () => {
    if (!draftJobId) {
      toast.error("Complete analysis before publishing");
      return;
    }
    setPublishing(true);
    try {
      const published = await publishJob(draftJobId);
      if (published) {
        clearJobDraft();
        setPublishedSlug(published.slug);
        toast.success("Job published!");
      } else {
        toast.error("Failed to publish job");
      }
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to publish",
      );
    } finally {
      setPublishing(false);
    }
  };

  const handleSaveDraft = () => {
    saveJobDraft(form);
    toast.success("Draft saved locally");
  };

  if (publishedSlug) {
    const applyUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${ROUTES.apply(publishedSlug)}`
        : ROUTES.apply(publishedSlug);

    return (
      <div className="p-5 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-[#E8E2D9] p-6 text-center"
        >
          <h2 className="font-display font-extrabold text-2xl mb-2">
            Job published!
          </h2>
          <p className="font-body text-[#6B6560] mb-6">
            Share this link with candidates:
          </p>
          <code className="block p-4 bg-[#F6F7F9] rounded-xl text-sm break-all mb-6">
            {applyUrl}
          </code>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(applyUrl)}
              className="px-4 py-2 bg-[#C8F135] rounded-full font-display font-semibold text-xs"
            >
              Copy link
            </button>
            <LimeButton href={ROUTES.apply(publishedSlug)} variant="dark">
              Preview apply page
            </LimeButton>
            <LimeButton href={ROUTES.jobs}>Back to jobs</LimeButton>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-[rgba(15,15,15,0.10)] px-4 md:px-6 py-4 shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display font-extrabold text-xl">
              Create New Job
            </h1>
            <p className="font-body text-sm text-[#6B6560] mt-0.5">
              {form.title || "Untitled role"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-3 py-2 font-body text-xs text-[#6B6560] hover:text-[#0F0F0F]"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => router.push(ROUTES.jobs)}
              className="px-3 py-2 font-body text-xs text-[#FF4D2E]"
            >
              Cancel
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white border-b px-4 md:px-6 py-3">
        <StepIndicator steps={STEPS} currentStep={step} />
      </div>

      <div className="flex-1 overflow-auto flex flex-col min-h-0 p-4 md:p-6">
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[640px] mx-auto bg-white rounded-xl border p-6 space-y-4"
          >
            <div>
              <label className="font-body text-xs font-semibold uppercase text-[#6B6560]">
                Job title *
              </label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                    slug: slugify(e.target.value),
                  })
                }
                className="mt-1 w-full px-3 py-2.5 rounded-lg border focus:border-[#C8F135] outline-none text-sm"
                placeholder="Senior Frontend Engineer"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="font-body text-xs font-semibold uppercase text-[#6B6560]">
                  Company *
                </label>
                <input
                  value={form.company}
                  onChange={(e) =>
                    setForm({ ...form, company: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border focus:border-[#C8F135] outline-none text-sm"
                />
              </div>
              <div>
                <label className="font-body text-xs font-semibold uppercase text-[#6B6560]">
                  Location
                </label>
                <input
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border focus:border-[#C8F135] outline-none text-sm"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="font-body text-xs font-semibold uppercase text-[#6B6560]">
                  Job type
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value as JobType })
                  }
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border text-sm"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="font-body text-xs font-semibold uppercase text-[#6B6560]">
                  Public link slug
                </label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border font-mono text-sm"
                />
              </div>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-1 flex-col min-h-0 w-full max-w-[920px] mx-auto"
          >
            <div className="flex flex-1 flex-col min-h-[min(78vh,720px)] bg-white rounded-xl border border-[rgba(15,15,15,0.08)] shadow-[0_1px_3px_rgba(15,15,15,0.06)] p-6 md:p-8 pb-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <label
                    htmlFor="job-description"
                    className="font-body text-xs font-semibold uppercase tracking-wide text-[#6B6560]"
                  >
                    Job description *
                  </label>
                  <p className="font-body text-sm text-[#6B6560] mt-2 max-w-[52ch]">
                    Paste your full posting or bullet list. Aim for clarity on
                    role, responsibilities, and must-haves — you need at least
                    50 characters before analysis.
                  </p>
                </div>
                <p className="font-body text-xs text-[#6B6560] tabular-nums shrink-0">
                  {form.description.trim().length} characters
                </p>
              </div>
              <textarea
                id="job-description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                spellCheck
                className="flex-1 min-h-[320px] w-full resize-y rounded-xl border border-[rgba(15,15,15,0.12)] bg-[#F6F7F9] px-4 py-3.5 focus:border-[#C8F135] focus:bg-white focus:ring-2 focus:ring-[rgba(200,241,53,0.35)] focus:outline-none font-body text-sm leading-relaxed text-[#0F0F0F] placeholder:text-[#9a9490] transition-colors"
                placeholder="Paste or write the full job description…"
              />
              <p className="font-body text-xs text-[#9a9490] mt-4">
                Next: use{" "}
                <span className="font-semibold text-[#6B6560]">
                  Analyze with MiniMax
                </span>{" "}
                at the bottom to extract skills and screening questions.
              </p>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <MiniMaxAnalysis
            analysis={analysis}
            questions={form.questions}
            onQuestionsChange={(questions) =>
              setForm((f) => ({ ...f, questions }))
            }
          />
        )}

        {step === 3 && (
          <div className="max-w-[640px] mx-auto bg-white rounded-xl border p-6 text-center">
            <h2 className="font-display font-bold text-xl mb-4">Ready to publish?</h2>
            <p className="font-body text-[#6B6560] mb-6">
              {form.title} at {form.company} · {form.questions.length} screening
              questions
            </p>
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing || !draftJobId}
              className="px-6 py-3 bg-[#C8F135] rounded-full font-display font-semibold text-sm disabled:opacity-50"
            >
              {publishing ? "Publishing…" : "Publish job"}
            </button>
          </div>
        )}
      </div>

      {step < 3 && !publishedSlug && (
        <footer className="bg-white border-t border-[rgba(15,15,15,0.08)] px-4 md:px-6 py-4 flex justify-between items-center max-w-[1000px] mx-auto w-full shrink-0">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-xs text-[#6B6560] disabled:opacity-40"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            type="button"
            onClick={() => {
              if (step === 1) handleAnalyze();
              else if (step === 2) handleSaveQuestionsAndContinue();
              else setStep((s) => Math.min(3, s + 1));
            }}
            disabled={savingQuestions || (step === 1 && analyzing)}
            className={
              step === 1
                ? "flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-xs disabled:opacity-50 transition-colors [&:not(:disabled)]:shadow-sm bg-[#0057FF] text-white hover:bg-[#0046cc]"
                : "flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-xs disabled:opacity-50 transition-colors [&:not(:disabled)]:shadow-sm bg-[#C8F135] text-[#0F0F0F] hover:brightness-[0.96]"
            }
          >
            {step === 1 ? (
              analyzing ? (
                "Analyzing…"
              ) : (
                <>
                  <Sparkles className="w-4 h-4 shrink-0" />
                  Analyze with MiniMax
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </>
              )
            ) : step === 2 ? (
              savingQuestions ? (
                "Saving…"
              ) : (
                <>
                  Save & continue
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </>
              )
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4 shrink-0" />
              </>
            )}
          </button>
        </footer>
      )}
    </div>
  );
}
