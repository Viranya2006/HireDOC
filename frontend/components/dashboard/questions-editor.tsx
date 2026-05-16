"use client";

import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";

export function normalizeQuestions(questions: string[]): string[] {
  return questions.map((q) => q.trim()).filter(Boolean);
}

export interface QuestionsEditorProps {
  title: string;
  description?: string;
  questions: string[];
  onChange: (questions: string[]) => void;
  minQuestions?: number;
  addLabel?: string;
  placeholder?: string;
  hideHeader?: boolean;
}

export function QuestionsEditor({
  title,
  description,
  questions,
  onChange,
  minQuestions = 1,
  addLabel = "Add question",
  placeholder = "Enter a question…",
  hideHeader = false,
}: QuestionsEditorProps) {
  const updateQuestion = (index: number, value: string) => {
    const next = [...questions];
    next[index] = value;
    onChange(next);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= minQuestions) return;
    onChange(questions.filter((_, i) => i !== index));
  };

  const addQuestion = () => {
    onChange([...questions, ""]);
  };

  const moveQuestion = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= questions.length) return;
    const next = [...questions];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div
      className={
        hideHeader
          ? ""
          : "bg-white rounded-xl p-5 border border-[rgba(15,15,15,0.08)]"
      }
    >
      {!hideHeader && (
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-display font-semibold text-sm text-[#0F0F0F]">
              {title}
            </h3>
            {description && (
              <p className="font-body text-xs text-[#6B6560] mt-1">
                {description}
              </p>
            )}
          </div>
          <span className="font-data text-xs text-[#6B6560] bg-[#F6F7F9] px-2.5 py-1 rounded-full shrink-0">
            {questions.length}{" "}
            {questions.length === 1 ? "question" : "questions"}
          </span>
        </div>
      )}

      <ol className="space-y-3">
        {questions.map((question, index) => (
          <li key={index} className="flex gap-2 items-start">
            <div className="flex flex-col shrink-0 pt-2">
              <button
                type="button"
                onClick={() => moveQuestion(index, -1)}
                disabled={index === 0}
                className="p-1 text-[#6B6560] hover:text-[#0F0F0F] disabled:opacity-25"
                aria-label="Move up"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => moveQuestion(index, 1)}
                disabled={index === questions.length - 1}
                className="p-1 text-[#6B6560] hover:text-[#0F0F0F] disabled:opacity-25"
                aria-label="Move down"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <span className="font-data text-[#C8F135] text-sm font-bold pt-2.5 w-5 shrink-0">
              {index + 1}.
            </span>
            <textarea
              value={question}
              onChange={(e) => updateQuestion(index, e.target.value)}
              rows={2}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 rounded-lg border border-[rgba(15,15,15,0.12)] font-body text-sm text-[#0F0F0F] resize-y min-h-[40px] focus:border-[#C8F135] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => removeQuestion(index)}
              disabled={questions.length <= minQuestions}
              className="p-2 mt-1 text-[#6B6560] hover:text-[#FF4D2E] hover:bg-[#FF4D2E]/10 rounded-lg transition-colors disabled:opacity-25 disabled:pointer-events-none"
              aria-label="Remove question"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={addQuestion}
        className="mt-4 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-[rgba(15,15,15,0.2)] font-body text-xs text-[#6B6560] hover:border-[#C8F135] hover:text-[#0F0F0F] transition-colors w-full justify-center"
      >
        <Plus className="w-4 h-4" />
        {addLabel}
      </button>
    </div>
  );
}
