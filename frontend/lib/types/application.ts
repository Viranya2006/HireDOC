export type CandidateStatus = "New" | "Shortlisted" | "Rejected";

export interface Candidate {
  id: string;
  jobId: string;
  name: string;
  email: string;
  initials: string;
  role: string;
  score: number;
  skills: string[];
  status: CandidateStatus;
  appliedAgo: string;
  matchingSkills: string[];
  gaps: string[];
  redFlags: string[];
  summary: string;
  questions: string[];
  phone?: string;
  location?: string;
  experience?: string;
  education?: string;
  portfolio?: string;
  linkedin?: string;
  github?: string;
  answers?: CandidateAnswer[];
  timeline?: TimelineEvent[];
}

export interface CandidateAnswer {
  question: string;
  answer: string;
  score: number;
}

export interface TimelineEvent {
  date: string;
  event: string;
  type: "info" | "success" | "warning";
}

export interface SubmitApplicationInput {
  jobId: string;
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  portfolio?: string;
  answers: string[];
  resumeFileName?: string;
}
