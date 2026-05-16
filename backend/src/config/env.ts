import dotenv from "dotenv";
import path from "node:path";

dotenv.config();

/** Local MongoDB default — no auth, database name `hiredoc`. */
export const DEFAULT_MONGODB_URI = "mongodb://127.0.0.1:27017/hiredoc";

const port = Number(process.env.PORT) || 5000;

export const env = {
  port,
  nodeEnv: process.env.NODE_ENV ?? "development",
  mongodbUri: process.env.MONGODB_URI?.trim() || DEFAULT_MONGODB_URI,
  jwtSecret:
    process.env.JWT_SECRET ?? "dev-jwt-secret-min-32-characters-long",
  uploadsDir: path.resolve(
    process.env.UPLOADS_DIR ?? path.join(process.cwd(), "uploads"),
  ),
  apiBaseUrl:
    process.env.API_BASE_URL?.replace(/\/$/, "") ??
    `http://localhost:${port}`,
  minimaxApiKey: normalizeMiniMaxApiKey(process.env.MINIMAX_API_KEY ?? ""),
  minimaxGroupId: (process.env.MINIMAX_GROUP_ID ?? "").trim(),
  firebaseServiceAccountJson:
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim() ?? "",
  smtpHost: process.env.SMTP_HOST?.trim() || "smtp.gmail.com",
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpUser: process.env.SMTP_USER?.trim() ?? "",
  smtpPass: process.env.SMTP_PASS?.trim() ?? "",
  emailFrom: process.env.EMAIL_FROM?.trim() ?? "",
  frontendUrl: process.env.FRONTEND_URL?.replace(/\/$/, "") ?? "",
} as const;

export function isSmtpConfigured(): boolean {
  return Boolean(env.smtpUser && env.smtpPass);
}

export function getEmailFrom(): string {
  if (env.emailFrom) return env.emailFrom;
  if (env.smtpUser) return `HireDoc <${env.smtpUser}>`;
  return "HireDoc <noreply@hiredoc.local>";
}

export function getFirebaseServiceAccount(): Record<string, unknown> | null {
  const raw = env.firebaseServiceAccountJson;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON");
  }
}

if (
  env.nodeEnv === "production" &&
  !env.firebaseServiceAccountJson
) {
  console.error(
    "FIREBASE_SERVICE_ACCOUNT_JSON is required in production",
  );
  process.exit(1);
}

/** Strip whitespace, quotes, and accidental `Bearer ` prefix from .env values. */
export function normalizeMiniMaxApiKey(raw: string): string {
  return raw.trim().replace(/^Bearer\s+/i, "").replace(/^["']|["']$/g, "");
}

/** Token Plan / Coding Plan keys (sk-cp-…) use OpenAI-compatible API without GroupId. */
export function isMiniMaxTokenPlanKey(apiKey: string): boolean {
  return apiKey.startsWith("sk-cp-");
}

export function getMinimaxConfig() {
  const apiKey = normalizeMiniMaxApiKey(
    process.env.MINIMAX_API_KEY ?? env.minimaxApiKey,
  );
  const groupId = (process.env.MINIMAX_GROUP_ID ?? env.minimaxGroupId).trim();
  const isTokenPlan = isMiniMaxTokenPlanKey(apiKey);
  return { apiKey, groupId, isTokenPlan };
}

export function mongoDisplayUri(uri: string): string {
  try {
    const parsed = new URL(uri);
    if (parsed.password) parsed.password = "***";
    return parsed.toString();
  } catch {
    return uri;
  }
}
