"use client";

import { motion } from "framer-motion";
import { Brain, ClipboardList, ListChecks, Sparkles } from "lucide-react";
import { QuestionsEditor } from "@/components/dashboard/questions-editor";
import type { JDAnalysisResult } from "@/lib/api/minimax";

interface MiniMaxAnalysisProps {
  analysis?: JDAnalysisResult | null;
  questions: string[];
  onQuestionsChange: (questions: string[]) => void;
}

function PillList({
  items,
  variant,
}: {
  items: string[];
  variant: "required" | "nice" | "neutral";
}) {
  const styles =
    variant === "required"
      ? "bg-[#00C896] text-white"
      : variant === "nice"
        ? "bg-[#EDE8DC] text-[#6B6560]"
        : "bg-[#F6F7F9] text-[#0F0F0F]";

  if (items.length === 0) {
    return (
      <p className="font-body text-sm text-[#6B6560]">None extracted.</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((text, index) => (
        <motion.span
          key={`${text}-${index}`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.03, duration: 0.25 }}
          className={`px-2.5 py-1 font-body text-xs font-medium rounded-full ${styles}`}
        >
          {text}
        </motion.span>
      ))}
    </div>
  );
}

export function MiniMaxAnalysis({
  analysis,
  questions,
  onQuestionsChange,
}: MiniMaxAnalysisProps) {
  const req = analysis?.requirements;

  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 overflow-y-auto p-5"
    >
      <div className="max-w-[1000px] mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-[#C8F135] flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5 text-[#0F0F0F]" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display font-bold text-xl text-[#0F0F0F]">
              MiniMax Analysis
            </h2>
            <p className="font-body text-sm text-[#6B6560]">
              Extracted from your job description — review before publishing.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-[rgba(200,241,53,0.15)] rounded-full shrink-0">
            <Sparkles className="w-4 h-4 text-[#C8F135]" />
            <span className="font-body text-xs font-medium text-[#0F0F0F]">
              Done
            </span>
          </div>
        </div>

        {!req ? (
          <p className="font-body text-sm text-[#6B6560]">
            No analysis loaded. Run <strong>Analyze</strong> from the description
            step.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: 0.06,
                  duration: 0.45,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="bg-white rounded-xl p-5 border border-[rgba(15,15,15,0.08)] md:col-span-2"
              >
                <h3 className="font-display font-semibold text-sm text-[#0F0F0F] mb-4">
                  Skills detected
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-body text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                      Required
                    </p>
                    <PillList items={req.requiredSkills} variant="required" />
                  </div>
                  <div>
                    <p className="font-body text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                      Nice to have
                    </p>
                    <PillList items={req.niceToHaveSkills} variant="nice" />
                  </div>
                </div>
              </motion.div>

              {(req.experienceLevel?.trim() || req.mustHaveCriteria.length > 0) && (
                <motion.div
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: 0.12,
                    duration: 0.45,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="bg-white rounded-xl p-5 border border-[rgba(15,15,15,0.08)] md:col-span-2 space-y-4"
                >
                  {Boolean(req.experienceLevel?.trim()) && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <ListChecks className="w-4 h-4 text-[#0057FF]" />
                        <h3 className="font-display font-semibold text-sm text-[#0F0F0F]">
                          Experience level
                        </h3>
                      </div>
                      <p className="font-body text-sm text-[#6B6560]">
                        {req.experienceLevel.trim()}
                      </p>
                    </div>
                  )}
                  {req.mustHaveCriteria.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <ClipboardList className="w-4 h-4 text-[#00C896]" />
                        <h3 className="font-display font-semibold text-sm text-[#0F0F0F]">
                          Must-have criteria
                        </h3>
                      </div>
                      <ul className="space-y-2">
                        {req.mustHaveCriteria.map((line, index) => (
                          <motion.li
                            key={`${line}-${index}`}
                            initial={{ x: -6, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{
                              delay: 0.15 + index * 0.04,
                              duration: 0.3,
                            }}
                            className="flex items-start gap-2 font-body text-sm text-[#6B6560]"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00C896] mt-1.5 shrink-0" />
                            <span>{line}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}

              {req.responsibilities.length > 0 && (
                <motion.div
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: 0.18,
                    duration: 0.45,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="bg-white rounded-xl p-5 border border-[rgba(15,15,15,0.08)] md:col-span-2"
                >
                  <h3 className="font-display font-semibold text-sm text-[#0F0F0F] mb-3">
                    Responsibilities extracted
                  </h3>
                  <ul className="space-y-2">
                    {req.responsibilities.map((line, index) => (
                      <motion.li
                        key={`${line}-${index}`}
                        initial={{ x: -6, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                          delay: 0.2 + index * 0.04,
                          duration: 0.3,
                        }}
                        className="flex items-start gap-2 font-body text-sm text-[#6B6560]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C8F135] mt-1.5 shrink-0" />
                        <span>{line}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>

            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.22,
                duration: 0.45,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-5"
            >
              <QuestionsEditor
                title="Screening questions"
                description="Review AI-generated questions, edit wording, reorder, or add your own before candidates apply."
                questions={questions}
                onChange={onQuestionsChange}
                addLabel="Add screening question"
                placeholder="e.g. Describe your experience with React in production…"
              />
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}
