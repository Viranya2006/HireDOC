import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Recruiter } from "../models/Recruiter";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as {
      recruiterId: string;
    };
    const recruiter = await Recruiter.findById(decoded.recruiterId);
    if (!recruiter)
      return res.status(401).json({ error: "Recruiter not found" });
    req.recruiter = recruiter;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
