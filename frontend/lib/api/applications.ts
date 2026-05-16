import type { Candidate, SubmitApplicationInput } from "@/lib/types/application";
import { apiFetch } from "./client";
import {
  mapApplicationDetailToCandidate,
  mapApplicationListItemToCandidate,
  type BackendApplicationDetail,
  type BackendApplicationListItem,
} from "./mappers";

interface ApplicationsListResponse {
  applications: BackendApplicationListItem[];
}

interface ApplicationDetailResponse {
  application: BackendApplicationDetail;
}

interface SubmitApplicationResponse {
  message: string;
  application_id: string;
}

export async function getCandidatesForJob(
  jobId: string,
): Promise<Candidate[]> {
  const { applications } = await apiFetch<ApplicationsListResponse>(
    `/api/applications/job/${jobId}`,
    { auth: true },
  );
  return applications.map((a) =>
    mapApplicationListItemToCandidate(a, jobId),
  );
}

export async function getCandidateById(
  id: string,
  jobId: string,
): Promise<Candidate | null> {
  try {
    const { application } = await apiFetch<ApplicationDetailResponse>(
      `/api/applications/job/${jobId}/${id}`,
      { auth: true },
    );
    return mapApplicationDetailToCandidate(application, jobId);
  } catch {
    return null;
  }
}

export interface SubmitApplicationOptions extends SubmitApplicationInput {
  slug: string;
  resume: File;
  answerMap: Record<string, string>;
}

export type CandidateDecision = "shortlisted" | "rejected";

export async function updateCandidateDecision(
  jobId: string,
  applicationId: string,
  decision: CandidateDecision,
): Promise<Candidate> {
  const { application } = await apiFetch<ApplicationDetailResponse>(
    `/api/applications/job/${jobId}/${applicationId}/decision`,
    {
      method: "POST",
      auth: true,
      body: { decision },
    },
  );
  return mapApplicationDetailToCandidate(application, jobId);
}

export async function submitApplication(
  input: SubmitApplicationOptions,
): Promise<void> {
  const formData = new FormData();
  formData.append("candidate_name", input.name);
  formData.append("candidate_email", input.email);
  formData.append("cv", input.resume);
  formData.append("answers", JSON.stringify(input.answerMap));

  await apiFetch<SubmitApplicationResponse>(
    `/api/applications/apply/${encodeURIComponent(input.slug)}`,
    { method: "POST", formData },
  );
}
