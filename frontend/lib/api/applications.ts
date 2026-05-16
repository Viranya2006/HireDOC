import type { Candidate, SubmitApplicationInput } from "@/lib/types/application";
import { MOCK_CANDIDATES } from "@/lib/mocks/candidates";
import { delay } from "./delay";

let candidatesStore: Candidate[] = [...MOCK_CANDIDATES];

export async function getCandidatesForJob(jobId: string): Promise<Candidate[]> {
  await delay();
  return candidatesStore
    .filter((c) => c.jobId === jobId)
    .sort((a, b) => b.score - a.score);
}

export async function getCandidateById(id: string): Promise<Candidate | null> {
  await delay(150);
  return candidatesStore.find((c) => c.id === id) ?? null;
}

export async function submitApplication(
  input: SubmitApplicationInput
): Promise<Candidate> {
  await delay(500);
  const initials = input.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const candidate: Candidate = {
    id: `c-${Date.now()}`,
    jobId: input.jobId,
    name: input.name,
    email: input.email,
    initials,
    role: "Applicant",
    score: 72 + Math.floor(Math.random() * 20),
    skills: [],
    status: "New",
    appliedAgo: "just now",
    matchingSkills: ["React", "TypeScript"],
    gaps: ["AWS"],
    redFlags: [],
    summary: "Application submitted. MiniMax evaluation pending (mock).",
    questions: input.answers,
    phone: input.phone,
    portfolio: input.portfolio,
    linkedin: input.linkedin,
  };

  candidatesStore = [candidate, ...candidatesStore];
  return candidate;
}
