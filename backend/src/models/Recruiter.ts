import mongoose, { Document, Schema } from "mongoose";

export type CompanySize = "1-10" | "11-50" | "51-200" | "201-500" | "500+";

export interface IRecruiter extends Document {
  email: string;
  firebase_uid?: string;
  organization_name?: string;
  full_name?: string;
  job_title?: string;
  phone?: string;
  website?: string;
  industry?: string;
  company_size?: CompanySize;
  company_description?: string;
  created_at: Date;
  updated_at?: Date;
}

const RecruiterSchema = new Schema<IRecruiter>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    firebase_uid: { type: String, trim: true, sparse: true, unique: true },
    organization_name: { type: String, trim: true },
    full_name: { type: String, trim: true },
    job_title: { type: String, trim: true },
    phone: { type: String, trim: true },
    website: { type: String, trim: true },
    industry: { type: String, trim: true },
    company_size: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
    },
    company_description: { type: String, trim: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

export const Recruiter = mongoose.model<IRecruiter>(
  "Recruiter",
  RecruiterSchema,
);
