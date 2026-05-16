"use client";

interface CandidateInterviewQuestionsProps {
  questions: string[];
  title?: string;
  emptyMessage?: string;
  compact?: boolean;
}

export function CandidateInterviewQuestions({
  questions,
  title = "Suggested interview questions",
  emptyMessage = "Interview questions will appear after AI scoring completes.",
  compact = false,
}: CandidateInterviewQuestionsProps) {
  const showTitle = Boolean(title);

  if (!questions.length) {
    return (
      <div>
        {showTitle && (
          <h2
            className={`font-display font-bold uppercase text-[#6B6560] mb-3 ${
              compact ? "text-xs" : "text-sm"
            }`}
          >
            {title}
          </h2>
        )}
        <p className="font-body text-sm text-[#6B6560] italic">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {showTitle && (
        <h2
          className={`font-display font-bold uppercase text-[#6B6560] mb-3 ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          {title}
        </h2>
      )}
      <ol className="space-y-2">
        {questions.map((question, index) => (
          <li key={index} className="flex gap-2">
            <span className="font-data text-[#0057FF] text-sm font-bold shrink-0">
              {index + 1}.
            </span>
            <p className="font-body text-sm text-[#0F0F0F]">{question}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
