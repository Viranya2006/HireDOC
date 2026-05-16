import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Recruiter } from "../models/Recruiter";

const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export const sendOTP = async (req: Request, res: Response) => {
  const { email, organization_name } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email.toLowerCase(), {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  console.log(`[OTP] ${email}: ${otp}`);

  if (organization_name) {
    await Recruiter.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $setOnInsert: { email: email.toLowerCase(), organization_name } },
      { upsert: true, new: true },
    );
  }

  res.json({ message: "OTP sent", dev_otp: otp });
};

export const verifyOTP = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ error: "Email and OTP are required" });

  const key = email.toLowerCase();
  const stored = otpStore.get(key);
  if (!stored)
    return res.status(400).json({ error: "OTP not found. Request a new one." });
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    return res.status(400).json({ error: "OTP expired" });
  }
  if (stored.otp !== otp)
    return res.status(400).json({ error: "Invalid OTP" });

  otpStore.delete(key);

  const recruiter = await Recruiter.findOneAndUpdate(
    { email: key },
    { $setOnInsert: { email: key } },
    { upsert: true, new: true },
  );

  const token = jwt.sign(
    { recruiterId: recruiter!._id.toString() },
    env.jwtSecret,
    { expiresIn: "7d" },
  );

  res.json({ token, recruiter });
};

export const getMe = (req: Request, res: Response) => {
  res.json({ recruiter: req.recruiter });
};
