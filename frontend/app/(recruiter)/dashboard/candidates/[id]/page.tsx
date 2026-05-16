"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getCandidateById } from "@/lib/api/applications";
import type { Candidate } from "@/lib/types/application";
import { ScoreRing } from "@/components/score-ring";
import { SkillChip } from "@/components/skill-chip";
import { ROUTES } from "@/lib/constants/routes";

export default function CandidateDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCandidateById(id).then((data) => {
      setCandidate(data);
      setLoading(false);
    });
  }, [id]);

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
    <>
      <header className="h-[72px] bg-white border-b border-[#E8E2D9] px-4 md:px-8 flex items-center gap-4 sticky top-0 z-10">
        <Link
          href={ROUTES.dashboardForJob(candidate.jobId)}
          className="p-2 hover:bg-[#F5F0E8] rounded-lg"
        >
          ←
        </Link>
        <div>
          <h1 className="font-display font-extrabold text-xl">{candidate.name}</h1>
          <p className="font-body text-sm text-[#6B6560]">{candidate.role}</p>
        </div>
      </header>

      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border p-6 flex flex-wrap items-center gap-6"
        >
          <ScoreRing score={candidate.score} size={80} />
          <div>
            <p className="font-body text-[#6B6560] text-sm">Fit Score</p>
            <p className="font-data font-bold text-2xl">
              {candidate.score}/100
            </p>
            <p className="font-body text-sm text-[#6B6560] mt-1">
              Applied {candidate.appliedAgo}
            </p>
          </div>
        </motion.div>

        <div className="bg-white rounded-2xl border p-6 space-y-4">
          <h2 className="font-display font-bold">AI Hiring Brief</h2>
          <p className="font-body text-[#6B6560] italic">
            &ldquo;{candidate.summary}&rdquo;
          </p>
          <div>
            <p className="font-body text-xs font-semibold text-[#00C896] uppercase mb-2">
              Matching skills
            </p>
            <div className="flex flex-wrap gap-2">
              {candidate.matchingSkills.map((s) => (
                <SkillChip key={s} label={s} variant="mint" />
              ))}
            </div>
          </div>
          {candidate.gaps.length > 0 && (
            <div>
              <p className="font-body text-xs font-semibold text-[#FF4D2E] uppercase mb-2">
                Gaps
              </p>
              <div className="flex flex-wrap gap-2">
                {candidate.gaps.map((g) => (
                  <SkillChip key={g} label={g} variant="coral" />
                ))}
              </div>
            </div>
          )}
        </div>

        {candidate.answers && candidate.answers.length > 0 && (
          <div className="bg-white rounded-2xl border p-6 space-y-4">
            <h2 className="font-display font-bold">Screening answers</h2>
            {candidate.answers.map((item, i) => (
              <div key={i} className="border-b border-[#E8E2D9] pb-4 last:border-0">
                <p className="font-display font-semibold text-sm mb-1">
                  {item.question}
                </p>
                <p className="font-body text-sm text-[#6B6560]">{item.answer}</p>
                <p className="font-mono text-xs text-[#00C896] mt-1">
                  Score: {item.score}/100
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
