import express from "express";
import cors from "cors";
import path from "node:path";

import "./types";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { getFirebaseAdminApp } from "./config/firebaseAdmin";
import authRoutes from "./routes/auth";
import jobRoutes from "./routes/jobs";
import questionRoutes from "./routes/questions";
import applicationRoutes from "./routes/applications";
import aiRoutes from "./routes/ai";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = env.port;

const corsOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];
if (env.frontendUrl) {
  corsOrigins.push(env.frontendUrl);
}

app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/uploads/cvs",
  express.static(path.join(env.uploadsDir, "cvs")),
);

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/ai", aiRoutes);
app.use(errorHandler);

connectDB().then(() => {
  const firebaseApp = getFirebaseAdminApp();
  if (firebaseApp) {
    console.log("Firebase Admin initialized");
  } else if (env.nodeEnv === "development") {
    console.warn(
      "Firebase Admin not configured — set FIREBASE_SERVICE_ACCOUNT_JSON for auth",
    );
  }
  app.listen(PORT, () => console.log(`HireDoc AI running on port ${PORT}`));
});
