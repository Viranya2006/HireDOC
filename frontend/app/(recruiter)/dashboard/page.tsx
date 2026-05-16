"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { StatCards } from "@/components/dashboard/stat-cards";
import { CandidateTable } from "@/components/dashboard/candidate-table";
import { HiringBriefPanel } from "@/components/dashboard/hiring-brief-panel";
import { getCandidatesForJob } from "@/lib/api/applications";
import { getJobById } from "@/lib/api/jobs";
import type { Candidate } from "@/lib/types/application";
import type { Job } from "@/lib/types/job";
import { ROUTES } from "@/lib/constants/routes";

function DashboardContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId") || "";

  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    let pollTimer: ReturnType<typeof setInterval> | undefined;

    const load = async () => {
      const [jobData, candidateList] = await Promise.all([
        getJobById(jobId),
        getCandidatesForJob(jobId),
      ]);
      if (cancelled) return;
      setJob(jobData);
      setCandidates(candidateList);
      setSelectedCandidate((prev) =>
        prev && candidateList.some((c) => c.id === prev.id)
          ? prev
          : (candidateList[0] ?? null),
      );
      setLoading(false);

      const pending = candidateList.some((c) => c.score === 0);
      if (pending && !pollTimer) {
        pollTimer = setInterval(async () => {
          const updated = await getCandidatesForJob(jobId);
          if (cancelled) return;
          setCandidates(updated);
          if (!updated.some((c) => c.score === 0) && pollTimer) {
            clearInterval(pollTimer);
          }
        }, 4000);
      }
    };

    setLoading(true);
    load();

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [jobId]);

  const scored = candidates.filter((c) => c.score > 0);
  const stats = {
    totalApplicants: candidates.length,
    avgFitScore:
      scored.length > 0
        ? Math.round(
            scored.reduce((acc, c) => acc + c.score, 0) / scored.length,
          )
        : 0,
    topScore: {
      score: scored.length > 0 ? Math.max(...scored.map((c) => c.score)) : 0,
      name:
        scored.length > 0
          ? scored.reduce((prev, curr) =>
              curr.score > prev.score ? curr : prev,
            ).name
          : "—",
    },
    appliedToday: candidates.filter(
      (c) => c.appliedAgo.includes("h") || c.appliedAgo === "just now",
    ).length,
  };

  if (!jobId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-8">
        <p className="font-body text-[#6B6560]">
          Select a job from the sidebar or create one to view candidates.
        </p>
        <Link
          href={ROUTES.jobsNew}
          className="px-5 py-2.5 bg-[#C8F135] rounded-full font-display font-semibold text-sm"
        >
          Create a job
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="font-body text-[#6B6560]">Loading candidates…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader
        jobTitle={job?.title ?? "Job Dashboard"}
        applicantCount={stats.totalApplicants}
      />

      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="flex flex-col xl:flex-row gap-6 min-h-0">
          <div
            className={`flex flex-col gap-6 transition-all duration-300 ${
              selectedCandidate ? "flex-1" : "w-full"
            }`}
          >
            <StatCards stats={stats} />
            <CandidateTable
              jobId={jobId}
              candidates={candidates}
              selectedCandidate={selectedCandidate}
              onSelectCandidate={setSelectedCandidate}
            />
          </div>

          <AnimatePresence mode="wait">
            {selectedCandidate && (
              <div className="flex flex-col gap-3 xl:w-[400px] shrink-0">
                <Link
                  href={ROUTES.candidate(jobId, selectedCandidate.id)}
                  className="font-body text-sm text-[#0057FF] hover:underline self-end"
                >
                  Open full brief →
                </Link>
                <HiringBriefPanel
                  candidate={selectedCandidate}
                  onClose={() => setSelectedCandidate(null)}
                  onShortlist={() => {}}
                  onReject={() => {}}
                />
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="font-body text-[#6B6560]">Loading…</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
