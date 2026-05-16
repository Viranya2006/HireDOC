import type { CreateJobInput, Job, JobRequirements } from "@/lib/types/job";
import { MOCK_JOBS } from "@/lib/mocks/jobs";
import { delay } from "./delay";

let jobsStore: Job[] = [...MOCK_JOBS];

const DRAFT_KEY = "hiredoc_job_draft";

export async function getJobs(): Promise<Job[]> {
  await delay();
  return [...jobsStore];
}

export async function getJobById(id: string): Promise<Job | null> {
  await delay(150);
  return jobsStore.find((j) => j.id === id) ?? null;
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  await delay(150);
  return jobsStore.find((j) => j.slug === slug || j.id === slug) ?? null;
}

export async function createJob(input: CreateJobInput): Promise<Job> {
  await delay();
  const job: Job = {
    id: `job-${Date.now()}`,
    slug: input.slug,
    title: input.title,
    company: input.company,
    location: input.location,
    type: input.type,
    description: input.description,
    questions: input.questions.map((text, i) => ({
      id: `q-${i}`,
      text,
    })),
    status: "draft",
    applicants: 0,
    shortlisted: 0,
    expiresAt: input.expiresAt,
  };
  jobsStore = [job, ...jobsStore];
  return job;
}

export async function publishJob(jobId: string): Promise<Job | null> {
  await delay();
  const index = jobsStore.findIndex((j) => j.id === jobId);
  if (index === -1) return null;
  jobsStore[index] = {
    ...jobsStore[index],
    status: "active",
    postedAt: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
  return jobsStore[index];
}

export async function updateJobRequirements(
  jobId: string,
  requirements: JobRequirements
): Promise<Job | null> {
  await delay();
  const index = jobsStore.findIndex((j) => j.id === jobId);
  if (index === -1) return null;
  jobsStore[index] = { ...jobsStore[index], aiRequirements: requirements };
  return jobsStore[index];
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
