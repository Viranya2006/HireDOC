import { Request, Response } from "express";
import { Job } from "../models/Job";
import { Question } from "../models/Question";
import { Application } from "../models/Application";
import { extractTextFromPDF } from "../services/cvParserService";
import { evaluateCandidate } from "../services/minimaxService";
import { calculateFitScore } from "../services/scoringService";
import {
  getCvJobId,
  openCvReadStream,
  saveCv,
} from "../services/cvStorageService";
import { sendDecisionEmail } from "../services/emailService";
import type { RecruiterStatus } from "../models/Application";

export const submitApplication = async (req: Request, res: Response) => {
  try {
    return await submitApplicationHandler(req, res);
  } catch (err) {
    console.error("submitApplication failed:", err);
    return res.status(500).json({ error: "Failed to submit application" });
  }
};

async function submitApplicationHandler(req: Request, res: Response) {
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
  } catch (err) {
    console.error("saveCv failed:", err);
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
      const fitScore = calculateFitScore(aiResult.model_evidence);
      const aiSummary = {
        ...aiResult,
        overall_score: fitScore.overall_score,
        grade: fitScore.grade,
        fit_breakdown: fitScore.fit_breakdown,
      };

      await Application.findByIdAndUpdate(application._id, {
        score: fitScore.overall_score,
        ai_summary: aiSummary,
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
}

export const downloadCv = async (req: Request, res: Response) => {
  const { file_id } = req.params;

  const jobId = await getCvJobId(file_id);
  if (!jobId) {
    return res.status(404).json({ error: "CV not found" });
  }

  const job = await Job.findOne({
    _id: jobId,
    recruiter_id: req.recruiter!._id,
  });
  if (!job) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const opened = await openCvReadStream(file_id);
  if (!opened) {
    return res.status(404).json({ error: "CV not found" });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${opened.filename.replace(/"/g, "")}"`,
  );
  opened.stream.pipe(res);
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
      "_id candidate_name candidate_email score ai_recommendation recruiter_status created_at",
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

  const questions = await Question.find({ job_id: job._id })
    .sort({ order_index: 1 })
    .lean();

  const rawAnswers = application.answers as
    | Record<string, string>
    | Map<string, string>
    | undefined;
  const answerMap: Record<string, string> =
    rawAnswers instanceof Map
      ? Object.fromEntries(rawAnswers)
      : { ...(rawAnswers ?? {}) };

  const screening_responses = questions.map((q) => {
    const questionId = q._id.toString();
    return {
      question_id: questionId,
      question_text: q.question_text,
      answer: answerMap[questionId] ?? "",
    };
  });

  res.json({
    application: {
      ...application,
      screening_responses,
    },
  });
};

export const updateApplicationDecision = async (
  req: Request,
  res: Response,
) => {
  const { job_id, application_id } = req.params;
  const decision = req.body?.decision as RecruiterStatus | undefined;

  if (decision !== "shortlisted" && decision !== "rejected") {
    return res.status(400).json({
      error: 'decision must be "shortlisted" or "rejected"',
    });
  }

  const job = await Job.findOne({
    _id: job_id,
    recruiter_id: req.recruiter!._id,
  }).lean();
  if (!job) return res.status(404).json({ error: "Job not found" });

  const application = await Application.findOne({
    _id: application_id,
    job_id: job._id,
  });
  if (!application)
    return res.status(404).json({ error: "Application not found" });

  application.recruiter_status = decision;
  application.decision_at = new Date();

  try {
    await sendDecisionEmail(decision, {
      candidateName: application.candidate_name,
      candidateEmail: application.candidate_email,
      jobTitle: job.title,
      company: job.company,
      location: job.location,
      score: application.score,
      aiSummary: application.ai_summary,
    });
    application.decision_email_sent_at = new Date();
  } catch (err) {
    console.error("Decision email failed:", err);
    return res.status(502).json({
      error:
        err instanceof Error
          ? err.message
          : "Failed to send notification email",
    });
  }

  await application.save();

  res.json({ application: application.toObject() });
};

export const updateInterviewQuestions = async (
  req: Request,
  res: Response,
) => {
  const { job_id, application_id } = req.params;
  const { questions } = req.body as { questions: string[] };

  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({
      error: "questions must be a non-empty array of strings",
    });
  }

  const cleaned = questions
    .map((q) => String(q).trim())
    .filter(Boolean);
  if (cleaned.length === 0) {
    return res.status(400).json({
      error: "At least one non-empty question is required",
    });
  }

  const job = await Job.findOne({
    _id: job_id,
    recruiter_id: req.recruiter!._id,
  });
  if (!job) return res.status(404).json({ error: "Job not found" });

  const application = await Application.findOne({
    _id: application_id,
    job_id: job._id,
  });
  if (!application)
    return res.status(404).json({ error: "Application not found" });

  if (!application.ai_summary) {
    return res.status(400).json({
      error: "Interview questions are not available until AI scoring completes",
    });
  }

  application.ai_summary = {
    ...application.ai_summary,
    suggested_interview_questions: cleaned,
  };
  application.markModified("ai_summary");
  await application.save();

  res.json({ application: application.toObject() });
};
