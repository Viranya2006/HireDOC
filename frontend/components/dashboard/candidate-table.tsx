"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Candidate } from "@/lib/types/application";
import { ScoreRing } from "@/components/score-ring";
import { ROUTES } from "@/lib/constants/routes";

interface CandidateTableProps {
  jobId: string;
  candidates: Candidate[];
  selectedCandidate: Candidate | null;
  onSelectCandidate: (candidate: Candidate) => void;
}

function StatusBadge({ status }: { status: Candidate["status"] }) {
  const styles = {
    New: "bg-[#0057FF]/10 text-[#0057FF]",
    Shortlisted: "bg-[#00C896]/10 text-[#00C896]",
    Rejected: "bg-[#FF4D2E]/10 text-[#FF4D2E]",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full font-body text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export function CandidateTable({
  jobId,
  candidates,
  selectedCandidate,
  onSelectCandidate,
}: CandidateTableProps) {
  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-xl border border-[rgba(15,15,15,0.08)] overflow-hidden flex-1 flex flex-col"
    >
      <div className="grid grid-cols-[1fr_72px_1fr_92px_92px_104px] gap-3 px-4 py-2.5 bg-[#F6F7F9] border-b border-[rgba(15,15,15,0.10)]">
        <span className="font-body text-[#6B6560] text-[11px] font-semibold tracking-wider uppercase">
          Candidate
        </span>
        <span className="font-body text-[#6B6560] text-[11px] font-semibold tracking-wider uppercase">
          Score
        </span>
        <span className="font-body text-[#6B6560] text-[11px] font-semibold tracking-wider uppercase">
          Skills
        </span>
        <span className="font-body text-[#6B6560] text-[11px] font-semibold tracking-wider uppercase">
          Status
        </span>
        <span className="font-body text-[#6B6560] text-[11px] font-semibold tracking-wider uppercase">
          Applied
        </span>
        <span className="font-body text-[#6B6560] text-[11px] font-semibold tracking-wider uppercase">
          Action
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        {candidates.map((candidate, index) => {
          const isSelected = selectedCandidate?.id === candidate.id;
          const isEven = index % 2 === 1;

          return (
            <motion.div
              key={candidate.id}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.55 + index * 0.05,
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
              onClick={() => onSelectCandidate(candidate)}
              className={`grid grid-cols-[1fr_72px_1fr_92px_92px_104px] gap-3 px-4 py-2.5 items-center cursor-pointer transition-colors ${
                isSelected
                  ? "bg-[#F6F7F9]"
                  : isEven
                    ? "bg-[#FAFAF8]"
                    : "bg-white"
              } ${!isSelected && "hover:bg-[#F6F7F9]"}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#EDE8DC] flex items-center justify-center shrink-0">
                  <span className="font-body text-[#0F0F0F] text-xs font-semibold">
                    {candidate.initials}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-[13px] truncate">
                    {candidate.name}
                  </p>
                  <p className="font-body text-[#6B6560] text-xs truncate">
                    {candidate.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <ScoreRing score={candidate.score} size={28} strokeWidth={3} />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {candidate.skills.slice(0, 2).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 bg-[#00C896]/10 text-[#00C896] rounded font-body text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div>
                <StatusBadge status={candidate.status} />
              </div>

              <div>
                <span className="font-body text-[#6B6560] text-sm">
                  {candidate.appliedAgo}
                </span>
              </div>

              <div>
                <Link
                  href={ROUTES.candidate(jobId, candidate.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="px-2.5 py-1 border border-[rgba(15,15,15,0.15)] rounded-lg font-body text-xs font-medium hover:bg-[#C8F135] hover:border-[#C8F135] inline-block"
                >
                  Full brief
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
