import mongoose, { Document, Schema, Types } from "mongoose";

export interface AIRequirements {
  required_skills: string[];
  nice_to_have_skills: string[];
  responsibilities: string[];
  experience_level: string;
  must_have_criteria: string[];
  screening_questions: string[];
}

export interface IJob extends Document {
  recruiter_id: Types.ObjectId;
  title: string;
  company: string;
  location: string;
  job_type: "full-time" | "internship" | "contract" | "part-time";
  description: string;
  expires_at: Date;
  public_slug: string;
  ai_requirements: AIRequirements | null;
  is_published: boolean;
  created_at: Date;
}

const JobSchema = new Schema<IJob>(
  {
    recruiter_id: {
      type: Schema.Types.ObjectId,
      ref: "Recruiter",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, default: "Remote" },
    job_type: {
      type: String,
      enum: ["full-time", "internship", "contract", "part-time"],
      required: true,
    },
    description: { type: String, required: true },
    expires_at: { type: Date, required: true },
    public_slug: { type: String, required: true, unique: true, index: true },
    ai_requirements: { type: Schema.Types.Mixed, default: null },
    is_published: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

export const Job = mongoose.model<IJob>("Job", JobSchema);
