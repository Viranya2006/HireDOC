import { Request, Response } from "express";
import { z } from "zod";
import { Recruiter } from "../models/Recruiter";

export const getMe = (req: Request, res: Response) => {
  res.json({ recruiter: req.recruiter });
};

const companySizeValues = ["1-10", "11-50", "51-200", "201-500", "500+"] as const;

const updateRecruiterSchema = z
  .object({
    full_name: z.string().trim().max(120).optional(),
    job_title: z.string().trim().max(120).optional(),
    phone: z.string().trim().max(40).optional(),
    organization_name: z.string().trim().max(120).optional(),
    website: z.string().trim().max(200).optional(),
    industry: z.string().trim().max(80).optional(),
    company_size: z
      .union([z.enum(companySizeValues), z.literal("")])
      .optional(),
    company_description: z.string().trim().max(2000).optional(),
  })
  .strict();

export const updateMe = async (req: Request, res: Response) => {
  const parsed = updateRecruiterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  if (Object.keys(parsed.data).length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  const $set: Record<string, string> = {};
  const $unset: Record<string, 1> = {};

  for (const [key, value] of Object.entries(parsed.data)) {
    if (value === "") {
      $unset[key] = 1;
    } else if (value !== undefined) {
      $set[key] = value;
    }
  }

  const update: { $set?: Record<string, string>; $unset?: Record<string, 1> } =
    {};
  if (Object.keys($set).length > 0) update.$set = $set;
  if (Object.keys($unset).length > 0) update.$unset = $unset;

  const recruiter = await Recruiter.findByIdAndUpdate(
    req.recruiter!._id,
    update,
    { new: true },
  );

  if (!recruiter) {
    return res.status(404).json({ error: "Recruiter not found" });
  }

  res.json({ recruiter });
};
