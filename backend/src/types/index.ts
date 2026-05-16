import { IRecruiter } from "../models/Recruiter";

declare global {
  namespace Express {
    interface Request {
      recruiter?: IRecruiter;
    }
  }
}
