"use client";

import type { CandidateAnswer } from "@/lib/types/application";

interface CandidateScreeningResponsesProps {
  answers?: CandidateAnswer[];
  title?: string;
  emptyMessage?: string;
  compact?: boolean;
}

export function CandidateScreeningResponses({
  answers,
  title = "Application responses",
  emptyMessage = "No screening responses for this application.",
  compact = false,
}: CandidateScreeningResponsesProps) {
  if (!answers?.length) {
    return (
      <div>
        <h2
          className={`font-display font-bold uppercase text-[#6B6560] mb-3 ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          {title}
        </h2>
        <p className="font-body text-sm text-[#6B6560] italic">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <h2
        className={`font-display font-bold uppercase text-[#6B6560] mb-3 ${
          compact ? "text-xs" : "text-sm"
        }`}
      >
        {title}
      </h2>
      <ol className="space-y-4">
        {answers.map((item, index) => (
          <li
            key={`${index}-${item.question.slice(0, 24)}`}
            className={
              compact
                ? "space-y-1.5"
                : "rounded-xl border border-[#E8E2D9] bg-[#FAFAF8] p-4 space-y-2"
            }
          >
            <div className="flex gap-2">
              <span className="font-data text-[#C8F135] text-sm font-bold shrink-0">
                {index + 1}.
              </span>
              <p className="font-display font-semibold text-sm text-[#0F0F0F]">
                {item.question}
              </p>
            </div>
            <p
              className={`font-body text-[#6B6560] leading-relaxed ${
                compact ? "text-sm pl-5" : "text-sm pl-5 border-l-2 border-[#C8F135]/40 ml-1"
              }`}
            >
              {item.answer}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
