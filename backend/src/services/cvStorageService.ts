import { mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env";

const CVS_DIR = path.join(env.uploadsDir, "cvs");

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "cv.pdf";
}

export async function saveCv(
  jobId: string,
  originalName: string,
  buffer: Buffer,
): Promise<{ relativePath: string; publicUrl: string }> {
  const fileName = `${Date.now()}_${sanitizeFilename(originalName)}`;
  const relativePath = path.posix.join(jobId, fileName);
  const absolutePath = path.join(CVS_DIR, jobId, fileName);

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, buffer);

  const publicUrl = `${env.apiBaseUrl}/uploads/cvs/${relativePath}`;
  return { relativePath, publicUrl };
}

export async function deleteCvsForJob(jobId: string): Promise<void> {
  const jobDir = path.join(CVS_DIR, jobId);
  await rm(jobDir, { recursive: true, force: true });
}
