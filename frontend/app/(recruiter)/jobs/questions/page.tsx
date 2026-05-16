"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ExternalLink, ListChecks } from "lucide-react";
import { getJobs, getJobById } from "@/lib/api/jobs";
import { setJobQuestions } from "@/lib/api/questions";
import { ApiError } from "@/lib/api/client";
import type { Job } from "@/lib/types/job";
import { ROUTES } from "@/lib/constants/routes";
import {
  QuestionsEditor,
  normalizeQuestions,
} from "@/components/dashboard/questions-editor";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  active: "bg-[#00C896]/10 text-[#00C896] border-[#00C896]/20",
  draft: "bg-[#F5F0E8] text-[#6B6560] border-[#E8E2D9]",
  closed: "bg-[#FF4D2E]/10 text-[#FF4D2E] border-[#FF4D2E]/20",
};

function JobQuestionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobIdParam = searchParams.get("jobId");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [savedQuestions, setSavedQuestions] = useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) ?? null;

  const questionsDirty =
    JSON.stringify(normalizeQuestions(questions)) !==
    JSON.stringify(normalizeQuestions(savedQuestions));

  useEffect(() => {
    getJobs()
      .then((list) => {
        setJobs(list);
        const initial =
          jobIdParam && list.some((j) => j.id === jobIdParam)
            ? jobIdParam
            : list[0]?.id ?? null;
        setSelectedJobId(initial);
      })
      .finally(() => setLoadingJobs(false));
  }, [jobIdParam]);

  const loadQuestionsForJob = useCallback(async (jobId: string) => {
    setLoadingQuestions(true);
    try {
      const job = await getJobById(jobId);
      const texts = job?.questions.map((q) => q.text) ?? [];
      setQuestions(texts.length > 0 ? texts : [""]);
      setSavedQuestions(texts);
    } catch {
      toast.error("Failed to load questions");
      setQuestions([""]);
      setSavedQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedJobId) return;
    loadQuestionsForJob(selectedJobId);
  }, [selectedJobId, loadQuestionsForJob]);

  const selectJob = (jobId: string) => {
    setSelectedJobId(jobId);
    router.replace(ROUTES.jobQuestions(jobId), { scroll: false });
  };

  const handleSave = async () => {
    if (!selectedJobId) return;
    const cleaned = normalizeQuestions(questions);
    if (cleaned.length === 0) {
      toast.error("Add at least one screening question");
      return;
    }

    setSaving(true);
    try {
      await setJobQuestions(selectedJobId, cleaned);
      setQuestions(cleaned);
      setSavedQuestions(cleaned);
      setJobs((prev) =>
        prev.map((j) =>
          j.id === selectedJobId
            ? {
                ...j,
                questionCount: cleaned.length,
                questions: cleaned.map((text, i) => ({
                  id: `local-${i}`,
                  text,
                })),
              }
            : j,
        ),
      );
      toast.success("Screening questions saved");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to save questions",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingJobs) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="font-body text-[#6B6560]">Loading jobs…</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center">
        <ListChecks className="w-12 h-12 text-[#6B6560] mx-auto mb-4" />
        <h1 className="font-display font-extrabold text-xl mb-2">
          No jobs yet
        </h1>
        <p className="font-body text-[#6B6560] mb-6">
          Create a job and run MiniMax analysis to generate screening questions.
        </p>
        <Link
          href={ROUTES.jobsNew}
          className="inline-flex px-5 py-2.5 bg-[#C8F135] rounded-full font-display font-semibold text-sm"
        >
          Create a job
        </Link>
      </div>
    );
  }

  return (
    <>
      <header className="h-[72px] bg-white border-b border-[#E8E2D9] px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="font-display font-extrabold text-[#0F0F0F] text-xl">
            Screening Questions
          </h1>
          <span className="px-3 py-1 bg-[#F5F0E8] rounded-full font-mono text-xs text-[#6B6560]">
            {jobs.length} jobs
          </span>
        </div>
        <Link
          href={ROUTES.jobsNew}
          className="px-4 py-2.5 bg-[#C8F135] rounded-full font-display font-semibold text-sm hover:scale-[1.02] transition-transform"
        >
          + New job
        </Link>
      </header>

      <div className="p-4 md:p-8">
        <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-160px)]">
          <motion.aside
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-[320px] shrink-0 bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden flex flex-col max-h-[480px] lg:max-h-none"
          >
            <div className="px-4 py-3 border-b border-[#E8E2D9] bg-[#FAFAF8]">
              <p className="font-display font-semibold text-xs text-[#6B6560] uppercase">
                Jobs
              </p>
            </div>
            <ul className="overflow-y-auto flex-1 divide-y divide-[#E8E2D9]">
              {jobs.map((job) => {
                const isSelected = job.id === selectedJobId;
                const count = isSelected
                  ? normalizeQuestions(questions).length
                  : job.questionCount;

                return (
                  <li key={job.id}>
                    <button
                      type="button"
                      onClick={() => selectJob(job.id)}
                      className={`w-full text-left px-4 py-3.5 transition-colors ${
                        isSelected
                          ? "bg-[rgba(200,241,53,0.12)] border-l-[3px] border-l-[#C8F135]"
                          : "hover:bg-[#FAFAF8] border-l-[3px] border-l-transparent"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-display font-bold text-sm text-[#0F0F0F] truncate">
                            {job.title}
                          </p>
                          <p className="font-body text-xs text-[#6B6560] truncate">
                            {job.company}
                          </p>
                        </div>
                        <span className="font-mono text-xs text-[#6B6560] bg-[#F5F0E8] px-2 py-0.5 rounded-full shrink-0">
                          {count}
                        </span>
                      </div>
                      <span
                        className={`mt-2 inline-block px-2 py-0.5 rounded-full border text-[10px] font-display font-semibold capitalize ${statusStyles[job.status]}`}
                      >
                        {job.status}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.aside>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex-1 min-w-0"
          >
            {selectedJob ? (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-[#E8E2D9] p-5 md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="font-display font-extrabold text-lg text-[#0F0F0F]">
                        {selectedJob.title}
                      </h2>
                      <p className="font-body text-sm text-[#6B6560] mt-0.5">
                        {selectedJob.company} · {selectedJob.location}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={ROUTES.dashboardForJob(selectedJob.id)}
                        className="px-3 py-1.5 text-xs font-body font-medium border border-[#E8E2D9] rounded-lg hover:bg-[#F5F0E8]"
                      >
                        View candidates
                      </Link>
                      {selectedJob.status === "active" && (
                        <Link
                          href={ROUTES.apply(selectedJob.slug)}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-body font-medium text-[#0057FF] hover:underline"
                        >
                          Apply page
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                  <p className="font-body text-xs text-[#6B6560] mt-4">
                    These questions appear on the public apply form for this job.
                    Candidates answer them when submitting their application.
                  </p>
                </div>

                {loadingQuestions ? (
                  <div className="bg-white rounded-2xl border border-[#E8E2D9] p-12 text-center">
                    <p className="font-body text-[#6B6560]">
                      Loading questions…
                    </p>
                  </div>
                ) : (
                  <>
                    <QuestionsEditor
                      title="Questions for candidates"
                      description="Edit, reorder, or add screening questions. Changes apply to new applications immediately."
                      questions={questions}
                      onChange={setQuestions}
                      addLabel="Add screening question"
                      placeholder="e.g. What is your experience with our core stack?"
                    />
                    <div className="flex flex-wrap gap-3 justify-end">
                      <button
                        type="button"
                        onClick={() => setQuestions(savedQuestions)}
                        disabled={!questionsDirty || saving}
                        className="px-5 py-2.5 border border-[#E8E2D9] rounded-xl font-body text-sm text-[#6B6560] disabled:opacity-40"
                      >
                        Discard changes
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={!questionsDirty || saving}
                        className="px-6 py-2.5 bg-[#C8F135] rounded-xl font-display font-semibold text-sm disabled:opacity-50"
                      >
                        {saving ? "Saving…" : "Save questions"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E8E2D9] p-12 text-center">
                <p className="font-body text-[#6B6560]">
                  Select a job to view its screening questions.
                </p>
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </>
  );
}

export default function JobQuestionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="font-body text-[#6B6560]">Loading…</p>
        </div>
      }
    >
      <JobQuestionsContent />
    </Suspense>
  );
}
