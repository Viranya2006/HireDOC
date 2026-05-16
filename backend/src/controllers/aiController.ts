import { Request, Response } from "express";
import { Job } from "../models/Job";
import {
  analyzeJobDescription,
  MiniMaxError,
} from "../services/minimaxService";

export const analyzeJD = async (req: Request, res: Response) => {
  const job = await Job.findOne({
    _id: req.params.job_id,
    recruiter_id: req.recruiter!._id,
  });
  if (!job) return res.status(404).json({ error: "Job not found" });

  try {
    const result = await analyzeJobDescription(job.description);
    job.ai_requirements = result;
    await job.save();
    res.json({ analysis: result });
  } catch (err: unknown) {
    if (err instanceof MiniMaxError) {
      return res.status(err.httpStatus).json({
        error: err.message,
        minimax_code: err.minimaxCode,
      });
    }
    const message = err instanceof Error ? err.message : "AI analysis failed";
    res.status(500).json({ error: message });
  }
};
