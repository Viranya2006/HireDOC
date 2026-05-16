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
  minimaxApiKey: process.env.MINIMAX_API_KEY ?? "",
  minimaxGroupId: process.env.MINIMAX_GROUP_ID ?? "",
} as const;

export function mongoDisplayUri(uri: string): string {
  try {
    const parsed = new URL(uri);
    if (parsed.password) parsed.password = "***";
    return parsed.toString();
  } catch {
    return uri;
  }
}
