import { Request, Response } from "express";
import { z } from "zod";
import { nanoid } from "nanoid";
import { Job } from "../models/Job";
import { Question } from "../models/Question";
import { Application } from "../models/Application";
import { deleteCvsForJob } from "../services/cvStorageService";

const createJobSchema = z.object({
  title: z.string().min(2),
  company: z.string().min(1),
  location: z.string().optional().default("Remote"),
  job_type: z.enum(["full-time", "internship", "contract", "part-time"]),
  description: z.string().min(50),
  expires_at: z.string().datetime(),
  public_slug: z.string().optional(),
});

export const createJob = async (req: Request, res: Response) => {
  const parsed = createJobSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const slug = parsed.data.public_slug || nanoid(8);

  try {
    const job = await Job.create({
      ...parsed.data,
      recruiter_id: req.recruiter!._id,
      public_slug: slug,
      expires_at: new Date(parsed.data.expires_at),
    });
    res.status(201).json({ job });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: number }).code === 11000
    ) {
      return res.status(400).json({ error: "Slug already taken" });
    }
    throw err;
  }
};

export const getMyJobs = async (req: Request, res: Response) => {
  const jobs = await Job.find({ recruiter_id: req.recruiter!._id })
    .sort({ created_at: -1 })
    .lean();

  const counts = await Application.aggregate([
    { $match: { job_id: { $in: jobs.map((j) => j._id) } } },
    { $group: { _id: "$job_id", count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(
    counts.map((c) => [c._id.toString(), c.count]),
  );

  const result = jobs.map((j) => ({
    ...j,
    application_count: countMap[j._id.toString()] || 0,
  }));
  res.json({ jobs: result });
};

export const getJobById = async (req: Request, res: Response) => {
  const job = await Job.findOne({
    _id: req.params.id,
    recruiter_id: req.recruiter!._id,
  }).lean();
  if (!job) return res.status(404).json({ error: "Job not found" });

  const questions = await Question.find({ job_id: job._id })
    .sort({ order_index: 1 })
    .lean();
  res.json({ job: { ...job, questions } });
};

export const updateJob = async (req: Request, res: Response) => {
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, recruiter_id: req.recruiter!._id },
    req.body,
    { new: true },
  );
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json({ job });
};

export const publishJob = async (req: Request, res: Response) => {
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, recruiter_id: req.recruiter!._id },
    { is_published: true },
    { new: true },
  );
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json({ job, public_url: `/apply/${job.public_slug}` });
};

export const getPublicJob = async (req: Request, res: Response) => {
  const slug = req.params.slug.trim();
  const job = await Job.findOne({ public_slug: slug })
    .select(
      "_id title company location job_type description expires_at public_slug is_published",
    )
    .lean();

  if (!job) {
    return res.status(404).json({ error: "Job not found", code: "NOT_FOUND" });
  }
  if (!job.is_published) {
    return res.status(403).json({
      error:
        "This job is not open for applications yet. Ask the recruiter to publish it first.",
      code: "NOT_PUBLISHED",
    });
  }
  if (new Date(job.expires_at) < new Date()) {
    return res.status(410).json({
      error: "This job posting has expired",
      code: "EXPIRED",
    });
  }

  const questions = await Question.find({ job_id: job._id })
    .select("_id question_text order_index")
    .sort({ order_index: 1 })
    .lean();

  res.json({ job: { ...job, questions } });
};

export const deleteJob = async (req: Request, res: Response) => {
  const job = await Job.findOneAndDelete({
    _id: req.params.id,
    recruiter_id: req.recruiter!._id,
  });
  if (!job) return res.status(404).json({ error: "Job not found" });

  await Question.deleteMany({ job_id: job._id });
  await Application.deleteMany({ job_id: job._id });
  await deleteCvsForJob(job._id.toString());

  res.json({ message: "Job deleted" });
};
