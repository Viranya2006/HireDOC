import type { CreateJobInput, Job, JobRequirements } from "@/lib/types/job";
import { apiFetch } from "./client";
import {
  mapJobFromBackend,
  type BackendJob,
} from "./mappers";

const DRAFT_KEY = "hiredoc_job_draft";

interface JobsListResponse {
  jobs: BackendJob[];
}

interface JobResponse {
  job: BackendJob;
}

interface PublishResponse {
  job: BackendJob;
  public_url: string;
}

function defaultExpiresAt(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString();
}

export async function getJobs(): Promise<Job[]> {
  const { jobs } = await apiFetch<JobsListResponse>("/api/jobs", {
    auth: true,
  });
  return jobs.map((j) =>
    mapJobFromBackend(j, { applicationCount: j.application_count }),
  );
}

export async function getJobById(id: string): Promise<Job | null> {
  try {
    const { job } = await apiFetch<JobResponse>(`/api/jobs/${id}`, {
      auth: true,
    });
    return mapJobFromBackend(job);
  } catch {
    return null;
  }
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  const { job } = await apiFetch<JobResponse>(
    `/api/jobs/public/${encodeURIComponent(slug.trim())}`,
  );
  return mapJobFromBackend({
    ...job,
    public_slug: job.public_slug ?? slug,
    is_published: true,
  });
}

export async function createJob(input: CreateJobInput): Promise<Job> {
  const expiresAt = input.expiresAt
    ? new Date(input.expiresAt).toISOString()
    : defaultExpiresAt();

  const { job } = await apiFetch<JobResponse>("/api/jobs", {
    method: "POST",
    auth: true,
    body: {
      title: input.title,
      company: input.company,
      location: input.location || "Remote",
      job_type: input.type,
      description: input.description,
      expires_at: expiresAt,
      public_slug: input.slug,
    },
  });

  return mapJobFromBackend(job);
}

export async function publishJob(jobId: string): Promise<Job | null> {
  try {
    const { job } = await apiFetch<PublishResponse>(
      `/api/jobs/${jobId}/publish`,
      { method: "POST", auth: true },
    );
    return mapJobFromBackend(job);
  } catch {
    return null;
  }
}

export async function updateJobRequirements(
  jobId: string,
  requirements: JobRequirements,
): Promise<Job | null> {
  try {
    const { job } = await apiFetch<JobResponse>(`/api/jobs/${jobId}`, {
      method: "PUT",
      auth: true,
      body: {
        ai_requirements: {
          required_skills: requirements.requiredSkills,
          nice_to_have_skills: requirements.niceToHaveSkills,
          responsibilities: requirements.responsibilities,
          experience_level: requirements.experienceLevel,
          must_have_criteria: requirements.mustHaveCriteria,
          screening_questions: requirements.screeningQuestions,
        },
      },
    });
    return mapJobFromBackend(job);
  } catch {
    return null;
  }
}

export function saveJobDraft(draft: Partial<CreateJobInput>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function loadJobDraft(): Partial<CreateJobInput> | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Partial<CreateJobInput>;
  } catch {
    return null;
  }
}

export function clearJobDraft(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
}
