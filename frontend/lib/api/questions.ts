import { apiFetch } from "./client";

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
