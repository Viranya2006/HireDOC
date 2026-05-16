"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getCandidateById } from "@/lib/api/applications";
import type { Candidate } from "@/lib/types/application";
import { ScoreRing } from "@/components/score-ring";
import { SkillChip } from "@/components/skill-chip";
import { ROUTES } from "@/lib/constants/routes";

function CandidateDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const jobId = searchParams.get("jobId") || "";

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      return;
    }
    getCandidateById(id, jobId).then((data) => {
      setCandidate(data);
      setLoading(false);
    });
  }, [id, jobId]);

  if (!jobId) {
    return (
      <div className="p-8 text-center">
        <h1 className="font-display font-bold text-xl">Missing job context</h1>
        <Link href={ROUTES.dashboard} className="text-[#0057FF] mt-4 inline-block">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="font-body text-[#6B6560]">Loading candidate…</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="p-8 text-center">
        <h1 className="font-display font-bold text-xl">Candidate not found</h1>
        <Link href={ROUTES.dashboard} className="text-[#0057FF] mt-4 inline-block">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <Link
        href={ROUTES.dashboardForJob(candidate.jobId)}
        className="font-body text-sm text-[#0057FF] hover:underline mb-6 inline-block"
      >
        ← Back to dashboard
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-[#E8E2D9] p-8"
      >
        <motion.div className="flex flex-wrap items-start gap-6 mb-8">
          <ScoreRing score={candidate.score} size={120} />
          <div className="flex-1 min-w-[200px]">
            <h1 className="font-display font-extrabold text-2xl text-[#0F0F0F]">
              {candidate.name}
            </h1>
            <p className="font-body text-[#6B6560] mt-1">{candidate.email}</p>
            <p className="font-body text-sm text-[#6B6560] mt-2">
              Applied {candidate.appliedAgo}
            </p>
          </div>
        </motion.div>

        <p className="font-body text-[#0F0F0F] leading-relaxed mb-8">
          {candidate.summary}
        </p>

        {candidate.matchingSkills.length > 0 && (
          <div className="mb-6">
            <h2 className="font-display font-bold text-sm uppercase text-[#6B6560] mb-3">
              Matching skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {candidate.matchingSkills.map((skill) => (
                <SkillChip key={skill} label={skill} variant="mint" />
              ))}
            </div>
          </div>
        )}

        {candidate.gaps.length > 0 && (
          <div className="mb-6">
            <h2 className="font-display font-bold text-sm uppercase text-[#6B6560] mb-3">
              Gaps
            </h2>
            <div className="flex flex-wrap gap-2">
              {candidate.gaps.map((skill) => (
                <SkillChip key={skill} label={skill} variant="coral" />
              ))}
            </div>
          </div>
        )}

        {candidate.redFlags.length > 0 && (
          <motion.div className="mb-6">
            <h2 className="font-display font-bold text-sm uppercase text-[#FF4D2E] mb-3">
              Red flags
            </h2>
            <ul className="list-disc list-inside font-body text-sm text-[#6B6560] space-y-1">
              {candidate.redFlags.map((flag) => (
                <li key={flag}>{flag}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default function CandidateDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="font-body text-[#6B6560]">Loading…</p>
        </div>
      }
    >
      <CandidateDetailContent />
    </Suspense>
  );
}
