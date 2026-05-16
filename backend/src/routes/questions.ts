import { Router } from "express";
import { setQuestions, getQuestions } from "../controllers/questionsController";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);
router.get("/:job_id", getQuestions);
router.put("/:job_id", setQuestions);
export default router;
