import { Request, Response } from "express";

export const getMe = (req: Request, res: Response) => {
  res.json({ recruiter: req.recruiter });
};
