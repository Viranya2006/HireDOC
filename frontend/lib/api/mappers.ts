import type { Job, JobQuestion, JobRequirements, JobStatus } from "@/lib/types/job";
import type { Candidate, CandidateStatus } from "@/lib/types/application";

function formatAppliedAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function initialsFromName(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function recommendationToStatus(
  rec: string | null | undefined,
): CandidateStatus {
  if (!rec) return "New";
  if (rec === "strong_yes" || rec === "yes") return "Shortlisted";
  if (rec === "no") return "Rejected";
  return "New";
}

export interface BackendQuestion {
  _id: string;
  question_text: string;
  order_index?: number;
}

export interface BackendJob {
  _id: string;
  recruiter_id?: string;
  title: string;
  company: string;
  location?: string;
  job_type: string;
  description: string;
  expires_at: string;
  public_slug: string;
  ai_requirements?: BackendAIRequirements | null;
  is_published: boolean;
  created_at?: string;
  application_count?: number;
  questions?: BackendQuestion[];
}

export interface BackendAIRequirements {
  required_skills: string[];
  nice_to_have_skills: string[];
  responsibilities: string[];
  experience_level: string;
  must_have_criteria: string[];
  screening_questions: string[];
}

export interface BackendApplicationListItem {
  _id: string;
  candidate_name: string;
  candidate_email: string;
  score: number | null;
  ai_recommendation: string | null;
  created_at: string;
}

export interface BackendAISummary {
  overall_score: number;
  matching_skills: string[];
  missing_skills: string[];
  experience_match: string;
  answer_quality: string;
  red_flags: string[];
  recruiter_summary: string;
  suggested_interview_questions: string[];
  recommendation: string;
}

export interface BackendApplicationDetail {
  _id: string;
  job_id: string;
  candidate_name: string;
  candidate_email: string;
  cv_file_url: string;
  answers: Record<string, string>;
  score: number | null;
  ai_summary: BackendAISummary | null;
  ai_recommendation: string | null;
  created_at: string;
}

function jobStatus(job: BackendJob): JobStatus {
  if (job.expires_at && new Date(job.expires_at) < new Date()) {
    return "closed";
  }
  return job.is_published ? "active" : "draft";
}

function mapQuestions(questions?: BackendQuestion[]): JobQuestion[] {
  if (!questions?.length) return [];
  return questions.map((q) => ({
    id: q._id,
    text: q.question_text,
  }));
}

export function mapAIRequirementsToFrontend(
  ai: BackendAIRequirements,
): JobRequirements {
  return {
    requiredSkills: ai.required_skills ?? [],
    niceToHaveSkills: ai.nice_to_have_skills ?? [],
    responsibilities: ai.responsibilities ?? [],
    experienceLevel: ai.experience_level ?? "",
    mustHaveCriteria: ai.must_have_criteria ?? [],
    screeningQuestions: ai.screening_questions ?? [],
  };
}

export function mapJobFromBackend(
  job: BackendJob,
  extras?: { applicationCount?: number },
): Job {
  const applicants =
    extras?.applicationCount ?? job.application_count ?? 0;

  return {
    id: job._id,
    slug: job.public_slug,
    recruiterId: job.recruiter_id?.toString(),
    title: job.title,
    company: job.company,
    location: job.location ?? "Remote",
    type: job.job_type as Job["type"],
    description: job.description,
    questions: mapQuestions(job.questions),
    status: jobStatus(job),
    expiresAt: job.expires_at,
    postedAt: job.created_at
      ? new Date(job.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : undefined,
    applicants,
    shortlisted: 0,
    aiRequirements: job.ai_requirements
      ? mapAIRequirementsToFrontend(job.ai_requirements)
      : undefined,
  };
}

export function mapApplicationListItemToCandidate(
  app: BackendApplicationListItem,
  jobId: string,
): Candidate {
  return {
    id: app._id,
    jobId,
    name: app.candidate_name,
    email: app.candidate_email,
    initials: initialsFromName(app.candidate_name),
    role: "Applicant",
    score: app.score ?? 0,
    skills: [],
    status: recommendationToStatus(app.ai_recommendation),
    appliedAgo: formatAppliedAgo(app.created_at),
    matchingSkills: [],
    gaps: [],
    redFlags: [],
    summary:
      app.score === null
        ? "AI evaluation in progress…"
        : "Application received.",
    questions: [],
  };
}

export function mapApplicationDetailToCandidate(
  app: BackendApplicationDetail,
  jobId: string,
): Candidate {
  const summary = app.ai_summary;
  const base = mapApplicationListItemToCandidate(
    {
      _id: app._id,
      candidate_name: app.candidate_name,
      candidate_email: app.candidate_email,
      score: app.score,
      ai_recommendation: app.ai_recommendation,
      created_at: app.created_at,
    },
    jobId,
  );

  return {
    ...base,
    score: summary?.overall_score ?? app.score ?? 0,
    matchingSkills: summary?.matching_skills ?? [],
    gaps: summary?.missing_skills ?? [],
    redFlags: summary?.red_flags ?? [],
    summary: summary?.recruiter_summary ?? base.summary,
    experience: summary?.experience_match,
    questions: summary?.suggested_interview_questions ?? [],
    answers: Object.entries(app.answers ?? {}).map(([question, answer]) => ({
      question,
      answer,
      score: 0,
    })),
  };
}
