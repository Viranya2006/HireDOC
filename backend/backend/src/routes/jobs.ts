import { Router } from "express";
import {
  createJob,
  getMyJobs,
  getJobById,
  updateJob,
  publishJob,
  getPublicJob,
  deleteJob,
} from "../controllers/jobsController";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.get("/public/:slug", getPublicJob);
router.use(authMiddleware);
router.post("/", createJob);
router.get("/", getMyJobs);
router.get("/:id", getJobById);
router.put("/:id", updateJob);
router.post("/:id/publish", publishJob);
router.delete("/:id", deleteJob);
export default router;
