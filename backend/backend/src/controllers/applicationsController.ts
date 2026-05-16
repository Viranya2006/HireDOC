import { Request, Response } from "express";
import { Job } from "../models/Job";
import { Question } from "../models/Question";
import { Application } from "../models/Application";
import { extractTextFromPDF } from "../services/cvParserService";
import { evaluateCandidate } from "../services/minimaxService";
import { saveCv } from "../services/cvStorageService";

export const submitApplication = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { candidate_name, candidate_email, answers } = req.body;
  const file = req.file;

  if (!candidate_name || !candidate_email || !file) {
    return res
      .status(400)
      .json({ error: "Name, email, and CV are required" });
  }

  const job = await Job.findOne({ public_slug: slug, is_published: true });
  if (!job) return res.status(404).json({ error: "Job not found" });
  if (new Date(job.expires_at) < new Date()) {
    return res.status(410).json({ error: "Application deadline has passed" });
  }

  const existing = await Application.findOne({
    job_id: job._id,
    candidate_email: candidate_email.toLowerCase(),
  });
  if (existing)
    return res
      .status(409)
      .json({ error: "You have already applied for this job" });

  let publicUrl: string;
  try {
    const saved = await saveCv(
      job._id.toString(),
      file.originalname,
      file.buffer,
    );
    publicUrl = saved.publicUrl;
  } catch {
    return res.status(500).json({ error: "Failed to save CV" });
  }

  let parsedAnswers: Record<string, string> = {};
  try {
    parsedAnswers =
      typeof answers === "string" ? JSON.parse(answers) : answers || {};
  } catch {
    parsedAnswers = {};
  }

  const application = await Application.create({
    job_id: job._id,
    candidate_name,
    candidate_email: candidate_email.toLowerCase(),
    cv_file_url: publicUrl,
    answers: parsedAnswers,
  });

  (async () => {
    try {
      const cvText = await extractTextFromPDF(file.buffer);
      const questions = await Question.find({ job_id: job._id })
        .sort({ order_index: 1 })
        .lean();

      const aiResult = await evaluateCandidate(
        job.description,
        cvText,
        parsedAnswers,
        questions.map((q) => ({
          _id: q._id.toString(),
          question_text: q.question_text,
        })),
      );

      await Application.findByIdAndUpdate(application._id, {
        score: aiResult.overall_score,
        ai_summary: aiResult,
        ai_recommendation: aiResult.recommendation,
      });
    } catch (err) {
      console.error("AI scoring failed:", err);
    }
  })();

  res.status(201).json({
    message: "Application submitted successfully",
    application_id: application._id,
  });
};

export const getApplicationsForJob = async (req: Request, res: Response) => {
  const { job_id } = req.params;

  const job = await Job.findOne({
    _id: job_id,
    recruiter_id: req.recruiter!._id,
  });
  if (!job) return res.status(404).json({ error: "Job not found" });

  const applications = await Application.find({ job_id })
    .select(
      "_id candidate_name candidate_email score ai_recommendation created_at",
    )
    .sort({ score: -1 })
    .lean();

  res.json({ applications });
};

export const getApplicationDetail = async (req: Request, res: Response) => {
  const { job_id, application_id } = req.params;

  const job = await Job.findOne({
    _id: job_id,
    recruiter_id: req.recruiter!._id,
  });
  if (!job) return res.status(404).json({ error: "Job not found" });

  const application = await Application.findOne({
    _id: application_id,
    job_id,
  }).lean();
  if (!application)
    return res.status(404).json({ error: "Application not found" });

  res.json({ application });
};
