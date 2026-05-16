"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ExternalLink, ListChecks, MessageSquareText } from "lucide-react";
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
  draft: "bg-[#F6F7F9] text-[#6B6560] border-[#E8E2D9]",
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
  const totalQuestions = jobs.reduce(
    (total, job) =>
      total +
      (job.id === selectedJobId
        ? normalizeQuestions(questions).length
        : job.questionCount),
    0,
  );
  const activeJobs = jobs.filter((job) => job.status === "active").length;
  const selectedQuestionCount = normalizeQuestions(questions).length;

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
      <header className="h-16 bg-white border-b border-[#E8E2D9] px-4 md:px-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <h1 className="font-display font-extrabold text-[#0F0F0F] text-lg">
            Screening Questions
          </h1>
          <span className="px-2.5 py-1 bg-[#F6F7F9] rounded-full font-mono text-xs text-[#6B6560]">
            {jobs.length} jobs
          </span>
        </div>
        <Link
          href={ROUTES.jobsNew}
          className="px-3.5 py-2 bg-[#C8F135] rounded-full font-display font-semibold text-xs hover:scale-[1.02] transition-transform"
        >
          + New job
        </Link>
      </header>

      <div className="p-4 md:p-5">
        <div className="grid gap-3 md:grid-cols-3 mb-4">
          <div className="bg-white rounded-xl border border-[#E8E2D9] p-3">
            <p className="font-body text-[11px] font-semibold uppercase tracking-wide text-[#6B6560]">
              Jobs
            </p>
            <p className="font-data text-xl font-bold text-[#0F0F0F]">
              {jobs.length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-[#E8E2D9] p-3">
            <p className="font-body text-[11px] font-semibold uppercase tracking-wide text-[#6B6560]">
              Active jobs
            </p>
            <p className="font-data text-xl font-bold text-[#0F0F0F]">
              {activeJobs}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-[#E8E2D9] p-3">
            <p className="font-body text-[11px] font-semibold uppercase tracking-wide text-[#6B6560]">
              Questions
            </p>
            <p className="font-data text-xl font-bold text-[#0F0F0F]">
              {totalQuestions}
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 min-h-[calc(100vh-216px)]">
          <motion.aside
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-[276px] shrink-0 bg-white rounded-xl border border-[#E8E2D9] overflow-hidden flex flex-col max-h-[380px] lg:max-h-none"
          >
            <div className="px-3.5 py-3 border-b border-[#E8E2D9] bg-[#FAFAF8]">
              <p className="font-display font-semibold text-xs text-[#0F0F0F]">
                Choose a job
              </p>
              <p className="font-body text-[11px] text-[#6B6560] mt-0.5">
                Select a role to edit its public screening questions.
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
                      className={`w-full text-left px-3.5 py-2.5 transition-colors ${
                        isSelected
                          ? "bg-[#C8F135]"
                          : "hover:bg-[#FAFAF8]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-display font-bold text-[13px] text-[#0F0F0F] truncate">
                            {job.title}
                          </p>
                          <p className="font-body text-xs text-[#6B6560] truncate">
                            {job.company}
                          </p>
                        </div>
                        <span
                          className={`font-mono text-xs px-2 py-0.5 rounded-full shrink-0 ${
                            isSelected
                              ? "bg-white/70 text-[#0F0F0F]"
                              : "bg-[#F6F7F9] text-[#6B6560]"
                          }`}
                        >
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
                <div className="bg-white rounded-xl border border-[#E8E2D9] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <MessageSquareText className="w-4 h-4 text-[#5B7A12]" />
                        <h2 className="font-display font-extrabold text-base text-[#0F0F0F]">
                          {selectedJob.title}
                        </h2>
                      </div>
                      <p className="font-body text-xs text-[#6B6560] mt-0.5">
                        {selectedJob.company} · {selectedJob.location}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-display font-semibold capitalize ${statusStyles[selectedJob.status]}`}
                      >
                        {selectedJob.status}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-[#F6F7F9] text-[11px] font-body text-[#6B6560]">
                        {selectedQuestionCount} questions
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-[#F6F7F9] text-[11px] font-body text-[#6B6560]">
                        {selectedJob.applicants} applicants
                      </span>
                      <Link
                        href={ROUTES.dashboardForJob(selectedJob.id)}
                        className="px-3 py-1.5 text-xs font-body font-medium border border-[#E8E2D9] rounded-lg hover:bg-[#F6F7F9]"
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
                  <div className="mt-3 rounded-lg bg-[#F6F7F9] px-3 py-2">
                    <p className="font-body text-xs text-[#6B6560]">
                      These questions appear on the public apply form. Keep them
                      short, role-specific, and easy for candidates to answer.
                    </p>
                  </div>
                </div>

                {loadingQuestions ? (
                  <div className="bg-white rounded-xl border border-[#E8E2D9] p-10 text-center">
                    <p className="font-body text-[#6B6560]">
                      Loading questions…
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      {questionsDirty && (
                        <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-[#E8E2D9] bg-white px-4 py-3">
                          <p className="font-body text-xs text-[#6B6560]">
                            You have unsaved question changes for this job.
                          </p>
                          <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-2 bg-[#C8F135] rounded-lg font-display font-semibold text-xs disabled:opacity-50"
                          >
                            {saving ? "Saving..." : "Save now"}
                          </button>
                        </div>
                      )}
                      <QuestionsEditor
                        title="Questions for candidates"
                        description="Edit, reorder, or add screening questions. Changes apply to new applications immediately."
                        questions={questions}
                        onChange={setQuestions}
                        addLabel="Add screening question"
                        placeholder="e.g. What is your experience with our core stack?"
                      />
                    </div>
                    <div className="flex flex-wrap gap-3 justify-end">
                      <button
                        type="button"
                        onClick={() => setQuestions(savedQuestions)}
                        disabled={!questionsDirty || saving}
                        className="px-4 py-2 border border-[#E8E2D9] rounded-lg font-body text-xs text-[#6B6560] disabled:opacity-40"
                      >
                        Discard changes
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={!questionsDirty || saving}
                        className="px-5 py-2 bg-[#C8F135] rounded-lg font-display font-semibold text-xs disabled:opacity-50"
                      >
                        {saving ? "Saving…" : "Save questions"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-[#E8E2D9] p-10 text-center">
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
