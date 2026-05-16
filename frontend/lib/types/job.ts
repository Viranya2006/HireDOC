export type JobStatus = "active" | "draft" | "closed";
export type JobType = "full-time" | "internship" | "contract" | "part-time";

export interface JobQuestion {
  id: string;
  text: string;
}

export interface JobRequirements {
  requiredSkills: string[];
  niceToHaveSkills: string[];
  responsibilities: string[];
  experienceLevel: string;
  mustHaveCriteria: string[];
  screeningQuestions: string[];
}

export interface Job {
  id: string;
  slug: string;
  recruiterId?: string;
  title: string;
  company: string;
  department?: string;
  location: string;
  type: JobType;
  salary?: string;
  description: string;
  requirements?: string[];
  benefits?: string[];
  questions: JobQuestion[];
  status: JobStatus;
  expiresAt?: string;
  postedAt?: string;
  applicants: number;
  questionCount: number;
  shortlisted: number;
  aiRequirements?: JobRequirements;
}

export interface CreateJobInput {
  title: string;
  company: string;
  location: string;
  type: JobType;
  slug: string;
  expiresAt?: string;
  description: string;
  questions: string[];
}
