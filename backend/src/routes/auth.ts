import { Router } from "express";
import { sendOTP, verifyOTP, getMe } from "../controllers/authController";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.get("/me", authMiddleware, getMe);
export default router;
