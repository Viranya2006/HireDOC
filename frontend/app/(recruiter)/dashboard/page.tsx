"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  const jobId = searchParams.get("jobId") || "job-1";

  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getJobById(jobId), getCandidatesForJob(jobId)]).then(
      ([jobData, candidateList]) => {
        setJob(jobData);
        setCandidates(candidateList);
        const defaultCandidate =
          candidateList.find((c) => c.name === "Alex Kim") ??
          candidateList[0] ??
          null;
        setSelectedCandidate(defaultCandidate);
        setLoading(false);
      }
    );
  }, [jobId]);

  const stats = {
    totalApplicants: candidates.length,
    avgFitScore:
      candidates.length > 0
        ? Math.round(
            candidates.reduce((acc, c) => acc + c.score, 0) / candidates.length
          )
        : 0,
    topScore: {
      score:
        candidates.length > 0
          ? Math.max(...candidates.map((c) => c.score))
          : 0,
      name:
        candidates.length > 0
          ? candidates.reduce((prev, curr) =>
              curr.score > prev.score ? curr : prev
            ).name
          : "—",
    },
    appliedToday: candidates.filter(
      (c) => c.appliedAgo.includes("h") || c.appliedAgo === "just now"
    ).length,
  };

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
              candidates={candidates}
              selectedCandidate={selectedCandidate}
              onSelectCandidate={setSelectedCandidate}
            />
          </div>

          <AnimatePresence mode="wait">
            {selectedCandidate && (
              <div className="flex flex-col gap-3 xl:w-[400px] shrink-0">
                <Link
                  href={ROUTES.candidate(selectedCandidate.id)}
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
