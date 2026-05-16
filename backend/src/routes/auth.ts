import { Router } from "express";
import { getMe, updateMe } from "../controllers/authController";
import { firebaseSession } from "../controllers/firebaseAuthController";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.post("/firebase-session", firebaseSession);
router.get("/me", authMiddleware, getMe);
router.patch("/me", authMiddleware, updateMe);
export default router;
