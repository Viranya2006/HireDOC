import { Router } from "express";
import multer from "multer";
import {
  submitApplication,
  downloadCv,
  getApplicationsForJob,
  getApplicationDetail,
  updateApplicationDecision,
} from "../controllers/applicationsController";
import { authMiddleware } from "../middleware/auth";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are accepted"));
    }
  },
});

const router = Router();

router.post("/apply/:slug", (req, res, next) => {
  upload.single("cv")(req, res, (err) => {
    if (err) {
      return res
        .status(400)
        .json({ error: err.message || "Invalid file upload" });
    }
    next();
  });
}, submitApplication);

router.use(authMiddleware);
router.get("/cv/:file_id", downloadCv);
router.get("/job/:job_id", getApplicationsForJob);
router.get("/job/:job_id/:application_id", getApplicationDetail);
router.post(
  "/job/:job_id/:application_id/decision",
  updateApplicationDecision,
);
export default router;
