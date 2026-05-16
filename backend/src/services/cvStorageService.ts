import { Readable } from "node:stream";
import { mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";
import { GridFSBucket, ObjectId } from "mongodb";
import { env } from "../config/env";

const CVS_BUCKET = "cvs";
const CVS_DIR = path.join(env.uploadsDir, "cvs");

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "cv.pdf";
}

export function useGridFsCvStorage(): boolean {
  return (
    env.nodeEnv === "production" ||
    process.env.CV_STORAGE === "gridfs" ||
    process.env.VERCEL === "1"
  );
}

function getGridFsBucket(): GridFSBucket {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("MongoDB not connected");
  }
  return new mongoose.mongo.GridFSBucket(db, { bucketName: CVS_BUCKET });
}

export async function saveCv(
  jobId: string,
  originalName: string,
  buffer: Buffer,
): Promise<{ relativePath: string; publicUrl: string }> {
  const fileName = `${Date.now()}_${sanitizeFilename(originalName)}`;

  if (useGridFsCvStorage()) {
    const bucket = getGridFsBucket();

    const fileId = await new Promise<ObjectId>((resolve, reject) => {
      const stream = bucket.openUploadStream(fileName, {
        metadata: { jobId, originalName },
        contentType: "application/pdf",
      });
      stream.on("error", reject);
      stream.on("finish", () => resolve(stream.id));
      Readable.from(buffer).pipe(stream);
    });

    const id = fileId.toString();
    return {
      relativePath: id,
      publicUrl: `${env.apiBaseUrl}/api/applications/cv/${id}`,
    };
  }

  const relativePath = path.posix.join(jobId, fileName);
  const absolutePath = path.join(CVS_DIR, jobId, fileName);

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, buffer);

  const publicUrl = `${env.apiBaseUrl}/uploads/cvs/${relativePath}`;
  return { relativePath, publicUrl };
}

export async function openCvReadStream(
  fileId: string,
): Promise<{ stream: NodeJS.ReadableStream; filename: string } | null> {
  if (!useGridFsCvStorage()) {
    return null;
  }

  let oid: ObjectId;
  try {
    oid = new ObjectId(fileId);
  } catch {
    return null;
  }

  const bucket = getGridFsBucket();
  const files = await bucket.find({ _id: oid }).toArray();
  const file = files[0];
  if (!file) return null;

  return {
    stream: bucket.openDownloadStream(oid),
    filename: file.filename,
  };
}

export async function getGridFsCvJobId(fileId: string): Promise<string | null> {
  if (!useGridFsCvStorage()) return null;

  let oid: ObjectId;
  try {
    oid = new ObjectId(fileId);
  } catch {
    return null;
  }

  const bucket = getGridFsBucket();
  const files = await bucket.find({ _id: oid }).toArray();
  const jobId = files[0]?.metadata?.jobId;
  return typeof jobId === "string" ? jobId : null;
}

export async function deleteCvsForJob(jobId: string): Promise<void> {
  if (useGridFsCvStorage()) {
    const bucket = getGridFsBucket();
    const files = await bucket.find({ "metadata.jobId": jobId }).toArray();
    await Promise.all(files.map((file) => bucket.delete(file._id)));
    return;
  }

  const jobDir = path.join(CVS_DIR, jobId);
  await rm(jobDir, { recursive: true, force: true });
}
