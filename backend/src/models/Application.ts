import mongoose, { Document, Schema, Types } from "mongoose";

export interface AISummary {
  overall_score: number;
  grade?: string;
  matching_skills: string[];
  missing_skills: string[];
  experience_match: string;
  answer_quality: string;
  red_flags: string[];
  recruiter_summary: string;
  suggested_interview_questions: string[];
  recommendation: "strong_yes" | "yes" | "maybe" | "no";
  model_evidence?: unknown;
  fit_breakdown?: unknown;
}

export type RecruiterStatus = "shortlisted" | "rejected";

export interface IApplication extends Document {
  job_id: Types.ObjectId;
  candidate_name: string;
  candidate_email: string;
  cv_file_url: string;
  answers: Record<string, string>;
  score: number | null;
  ai_summary: AISummary | null;
  ai_recommendation: "strong_yes" | "yes" | "maybe" | "no" | null;
  recruiter_status: RecruiterStatus | null;
  decision_at: Date | null;
  decision_email_sent_at: Date | null;
  created_at: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    job_id: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    candidate_name: { type: String, required: true, trim: true },
    candidate_email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    cv_file_url: { type: String, required: true },
    answers: { type: Map, of: String, default: {} },
    score: { type: Number, default: null },
    ai_summary: { type: Schema.Types.Mixed, default: null },
    ai_recommendation: {
      type: String,
      enum: ["strong_yes", "yes", "maybe", "no", null],
      default: null,
    },
    recruiter_status: {
      type: String,
      enum: ["shortlisted", "rejected", null],
      default: null,
    },
    decision_at: { type: Date, default: null },
    decision_email_sent_at: { type: Date, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

ApplicationSchema.index({ job_id: 1, candidate_email: 1 }, { unique: true });
ApplicationSchema.index({ job_id: 1, score: -1 });

export const Application = mongoose.model<IApplication>(
  "Application",
  ApplicationSchema,
);
