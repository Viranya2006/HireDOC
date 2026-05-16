import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { IRecruiter } from "../models/Recruiter";

export function issueAppToken(recruiter: IRecruiter): string {
  return jwt.sign(
    { recruiterId: recruiter._id.toString() },
    env.jwtSecret,
    { expiresIn: "7d" },
  );
}
