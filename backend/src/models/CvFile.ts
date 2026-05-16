import mongoose, { Document, Schema } from "mongoose";

export interface ICvFile extends Document {
  job_id: string;
  original_name: string;
  filename: string;
  content_type: string;
  data: Buffer;
}

const CvFileSchema = new Schema<ICvFile>(
  {
    job_id: { type: String, required: true, index: true },
    original_name: { type: String, required: true },
    filename: { type: String, required: true },
    content_type: { type: String, default: "application/pdf" },
    data: { type: Buffer, required: true },
  },
  { timestamps: false },
);

export const CvFile = mongoose.model<ICvFile>("CvFile", CvFileSchema);
