import { Request, Response } from "express";
import { Job } from "../models/Job";
import { Question } from "../models/Question";

export const setQuestions = async (req: Request, res: Response) => {
  const { job_id } = req.params;
  const { questions } = req.body as { questions: string[] };

  if (!Array.isArray(questions) || questions.length === 0) {
    return res
      .status(400)
      .json({ error: "questions must be a non-empty array of strings" });
  }

  const job = await Job.findOne({
    _id: job_id,
    recruiter_id: req.recruiter!._id,
  });
  if (!job) return res.status(404).json({ error: "Job not found" });

  await Question.deleteMany({ job_id });

  const docs = questions.map((text, i) => ({
    job_id,
    question_text: text,
    order_index: i,
  }));
  const created = await Question.insertMany(docs);

  res.json({ questions: created });
};

export const getQuestions = async (req: Request, res: Response) => {
  const { job_id } = req.params;

  const job = await Job.findOne({
    _id: job_id,
    recruiter_id: req.recruiter!._id,
  });
  if (!job) return res.status(404).json({ error: "Job not found" });

  const questions = await Question.find({ job_id })
    .sort({ order_index: 1 })
    .lean();
  res.json({ questions });
};
