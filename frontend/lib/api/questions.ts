import type { JobQuestion } from "@/lib/types/job";
import { apiFetch } from "./client";

interface QuestionsResponse {
  questions: { _id: string; question_text: string; order_index?: number }[];
}

export async function getJobQuestions(jobId: string): Promise<JobQuestion[]> {
  const { questions } = await apiFetch<QuestionsResponse>(
    `/api/questions/${jobId}`,
    { auth: true },
  );
  return questions.map((q) => ({
    id: q._id,
    text: q.question_text,
  }));
}

export async function setJobQuestions(
  jobId: string,
  questions: string[],
): Promise<void> {
  await apiFetch(`/api/questions/${jobId}`, {
    method: "PUT",
    auth: true,
    body: { questions },
  });
}
