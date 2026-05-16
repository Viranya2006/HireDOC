"use client";

import { motion } from "framer-motion";
import { X, Check, AlertTriangle } from "lucide-react";
import type { Candidate } from "@/lib/types/application";
import { ScoreRing } from "@/components/score-ring";
import { SkillChip } from "@/components/skill-chip";

interface HiringBriefPanelProps {
  candidate: Candidate;
  onClose: () => void;
  onShortlist: () => void;
  onReject: () => void;
  actionsDisabled?: boolean;
}

function LargeScoreRing({ score }: { score: number }) {
  const size = 80;
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 80) return "#00C896";
    if (score >= 60) return "#0057FF";
    return "#FF4D2E";
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(15,15,15,0.08)"
          strokeWidth="5"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth="5"
          strokeLinecap="round"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-data font-bold text-[#0F0F0F] text-[32px]">
        {score}
      </span>
    </div>
  );
}

export function HiringBriefPanel({
  candidate,
  onClose,
  onShortlist,
  onReject,
  actionsDisabled = false,
}: HiringBriefPanelProps) {
  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-[380px] bg-white rounded-xl overflow-hidden flex flex-col shrink-0 h-full"
    >
      {/* Header */}
      <div className="p-5 border-b border-[rgba(15,15,15,0.10)]">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#0057FF] flex items-center justify-center">
              <span className="font-body text-white text-sm font-semibold">
                {candidate.initials}
              </span>
            </div>
            <div>
              <h3 className="font-display font-extrabold text-[#0F0F0F] text-lg">
                {candidate.name}
              </h3>
              <p className="font-body text-[#6B6560] text-sm">{candidate.role}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-data text-[#6B6560] text-xs">
              Applied {candidate.appliedAgo}
            </p>
            <button
              onClick={onClose}
              className="mt-1 p-1 hover:bg-[#F5F0E8] rounded transition-colors"
            >
              <X className="w-4 h-4 text-[#6B6560]" />
            </button>
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center gap-4">
          <ScoreRing score={candidate.score} size={80} />
          <div>
            <p className="font-body text-[#6B6560] text-sm">Fit Score</p>
            <p className="font-data font-bold text-[#0F0F0F] text-lg">
              {candidate.score}/100 Match
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-5 space-y-5">
        {/* Matching Skills */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-4 h-4 text-[#00C896]" />
            <span className="font-body text-[#00C896] text-xs font-semibold uppercase tracking-wider">
              Matching Skills
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {candidate.matchingSkills.map((skill) => (
              <SkillChip key={skill} label={skill} variant="mint" />
            ))}
          </div>
        </div>

        {/* Gaps */}
        {candidate.gaps.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-[#FF4D2E]" />
              <span className="font-body text-[#FF4D2E] text-xs font-semibold uppercase tracking-wider">
                Gaps
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {candidate.gaps.map((gap) => (
                <SkillChip key={gap} label={gap} variant="coral" />
              ))}
            </div>
          </div>
        )}

        {/* Red Flags */}
        {candidate.redFlags.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#FF4D2E]">🚩</span>
              <span className="font-body text-[#FF4D2E] text-xs font-semibold uppercase tracking-wider">
                Red Flags
              </span>
            </div>
            {candidate.redFlags.map((flag, index) => (
              <p key={index} className="font-body text-[#6B6560] text-sm italic">
                {flag}
              </p>
            ))}
          </div>
        )}

        {/* AI Summary */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-4 h-4 bg-[#0057FF] rounded flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">AI</span>
            </span>
            <span className="font-body text-[#0057FF] text-xs font-semibold uppercase tracking-wider">
              AI Summary
            </span>
          </div>
          <p className="font-body text-[#6B6560] text-sm leading-relaxed">
            &ldquo;{candidate.summary}&rdquo;
          </p>
        </div>

        {/* Interview Questions */}
        <div>
          <h4 className="font-display font-bold text-[#0F0F0F] text-sm mb-3">
            Interview Questions
          </h4>
          <ol className="space-y-2">
            {candidate.questions.map((question, index) => (
              <li key={index} className="flex gap-2">
                <span className="font-data text-[#C8F135] text-sm font-bold shrink-0">
                  {index + 1}.
                </span>
                <p className="font-body text-[#0F0F0F] text-sm">{question}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Actions */}
      <div className="p-5 border-t border-[rgba(15,15,15,0.10)] flex gap-3">
        <button
          type="button"
          onClick={onShortlist}
          disabled={actionsDisabled}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#C8F135] rounded-xl font-body text-[#0F0F0F] text-sm font-semibold hover:bg-[#b8e125] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4" />
          Shortlist
        </button>
        <button
          type="button"
          onClick={onReject}
          disabled={actionsDisabled}
          className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-[#FF4D2E] rounded-xl font-body text-[#FF4D2E] text-sm font-semibold hover:bg-[#FF4D2E]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-4 h-4" />
          Reject
        </button>
      </div>
    </motion.div>
  );
}
