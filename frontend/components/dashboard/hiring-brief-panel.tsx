"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Check, AlertTriangle } from "lucide-react";
import type { Candidate } from "@/lib/types/application";
import { ScoreRing } from "@/components/score-ring";
import { SkillChip } from "@/components/skill-chip";
import {
  QuestionsEditor,
  normalizeQuestions,
} from "@/components/dashboard/questions-editor";
import { CandidateScreeningResponses } from "@/components/dashboard/candidate-screening-responses";
import { CandidateInterviewQuestions } from "@/components/dashboard/candidate-interview-questions";

interface HiringBriefPanelProps {
  candidate: Candidate;
  onClose: () => void;
  onShortlist: () => void;
  onReject: () => void;
  onInterviewQuestionsSave?: (questions: string[]) => Promise<void>;
  actionsDisabled?: boolean;
}

export function HiringBriefPanel({
  candidate,
  onClose,
  onShortlist,
  onReject,
  onInterviewQuestionsSave,
  actionsDisabled = false,
}: HiringBriefPanelProps) {
  const [interviewQuestions, setInterviewQuestions] = useState(
    candidate.questions,
  );
  const [savingQuestions, setSavingQuestions] = useState(false);
  const [editingQuestions, setEditingQuestions] = useState(false);

  useEffect(() => {
    setInterviewQuestions(candidate.questions);
    setEditingQuestions(false);
  }, [candidate.id, candidate.questions]);

  const questionsDirty =
    JSON.stringify(normalizeQuestions(interviewQuestions)) !==
    JSON.stringify(normalizeQuestions(candidate.questions));

  const handleSaveQuestions = async () => {
    if (!onInterviewQuestionsSave) return;
    const cleaned = normalizeQuestions(interviewQuestions);
    if (cleaned.length === 0) {
      return;
    }
    setSavingQuestions(true);
    try {
      await onInterviewQuestionsSave(cleaned);
      setEditingQuestions(false);
    } finally {
      setSavingQuestions(false);
    }
  };

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

        {candidate.answers && candidate.answers.length > 0 && (
          <CandidateScreeningResponses
            answers={candidate.answers}
            title="Screening Q&A"
            compact
          />
        )}

        {/* Interview Questions */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <h4 className="font-display font-bold text-[#0F0F0F] text-sm">
              Interview Questions
            </h4>
            {onInterviewQuestionsSave && candidate.questions.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (editingQuestions) {
                    if (questionsDirty) {
                      setInterviewQuestions(candidate.questions);
                    }
                    setEditingQuestions(false);
                  } else {
                    setEditingQuestions(true);
                  }
                }}
                className="font-body text-xs text-[#0057FF] hover:underline"
              >
                {editingQuestions ? "Close" : "Customize"}
              </button>
            )}
          </div>

          {editingQuestions && onInterviewQuestionsSave ? (
            <div className="space-y-3">
              <QuestionsEditor
                title=""
                hideHeader
                questions={interviewQuestions}
                onChange={setInterviewQuestions}
                addLabel="Add interview question"
                placeholder="e.g. Walk me through a challenging project…"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveQuestions}
                  disabled={
                    savingQuestions ||
                    !questionsDirty ||
                    normalizeQuestions(interviewQuestions).length === 0
                  }
                  className="flex-1 py-2.5 bg-[#0057FF] text-white rounded-xl font-body text-sm font-semibold disabled:opacity-50"
                >
                  {savingQuestions ? "Saving…" : "Save questions"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInterviewQuestions(candidate.questions);
                    setEditingQuestions(false);
                  }}
                  className="px-4 py-2.5 border rounded-xl font-body text-sm text-[#6B6560]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <CandidateInterviewQuestions
              questions={candidate.questions}
              title=""
              compact
            />
          )}
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
