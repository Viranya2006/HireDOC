import mongoose, { Document, Schema, Types } from "mongoose";

export interface IQuestion extends Document {
  job_id: Types.ObjectId;
  question_text: string;
  order_index: number;
  created_at: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    job_id: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    question_text: { type: String, required: true },
    order_index: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

export const Question = mongoose.model<IQuestion>("Question", QuestionSchema);
