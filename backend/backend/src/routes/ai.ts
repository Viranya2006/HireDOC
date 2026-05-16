import { Router } from "express";
import { analyzeJD } from "../controllers/aiController";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);
router.post("/analyze-jd/:job_id", analyzeJD);
export default router;
