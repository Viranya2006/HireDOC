import mongoose, { Document, Schema } from "mongoose";

export interface IRecruiter extends Document {
  email: string;
  organization_name?: string;
  created_at: Date;
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
    organization_name: { type: String, trim: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

export const Recruiter = mongoose.model<IRecruiter>(
  "Recruiter",
  RecruiterSchema,
);
