import { Readable } from "node:stream";
import { mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";
import { GridFSBucket, ObjectId } from "mongodb";
import { env } from "../config/env";
import { connectDB } from "../config/db";
import { CvFile } from "../models/CvFile";

const CVS_BUCKET = "cvs";
const CVS_DIR = path.join(env.uploadsDir, "cvs");

type CvStorageMode = "local" | "gridfs" | "mongo";

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "cv.pdf";
}

function getCvStorageMode(): CvStorageMode {
  const override = process.env.CV_STORAGE?.trim().toLowerCase();
  if (override === "local") return "local";
  if (override === "gridfs") return "gridfs";
  if (override === "mongo") return "mongo";
  if (process.env.VERCEL === "1") return "mongo";
  if (env.nodeEnv === "production") return "gridfs";
  return "local";
}

export function useMongoCvStorage(): boolean {
  return getCvStorageMode() === "mongo";
}

export function useGridFsCvStorage(): boolean {
  return getCvStorageMode() === "gridfs";
}

async function ensureMongoReady(): Promise<void> {
  await connectDB();
  if (!mongoose.connection.db) {
    throw new Error("MongoDB not connected");
  }
}

function getGridFsBucket(): GridFSBucket {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("MongoDB not connected");
  }
  return new mongoose.mongo.GridFSBucket(db, { bucketName: CVS_BUCKET });
}

async function saveCvToMongo(
  jobId: string,
  originalName: string,
  fileName: string,
  buffer: Buffer,
): Promise<{ relativePath: string; publicUrl: string }> {
  await ensureMongoReady();
  const doc = await CvFile.create({
    job_id: jobId,
    original_name: originalName,
    filename: fileName,
    content_type: "application/pdf",
    data: buffer,
  });
  const id = doc._id.toString();
  return {
    relativePath: id,
    publicUrl: `${env.apiBaseUrl}/api/applications/cv/${id}`,
  };
}

async function saveCvToGridFs(
  jobId: string,
  originalName: string,
  fileName: string,
  buffer: Buffer,
): Promise<{ relativePath: string; publicUrl: string }> {
  await ensureMongoReady();
  const bucket = getGridFsBucket();

  const fileId = await new Promise<ObjectId>((resolve, reject) => {
    const stream = bucket.openUploadStream(fileName, {
      metadata: { jobId, originalName },
      contentType: "application/pdf",
    });
    stream.on("error", reject);
    stream.on("finish", () => resolve(stream.id));
    stream.end(buffer);
  });

  const id = fileId.toString();
  return {
    relativePath: id,
    publicUrl: `${env.apiBaseUrl}/api/applications/cv/${id}`,
  };
}

export async function saveCv(
  jobId: string,
  originalName: string,
  buffer: Buffer,
): Promise<{ relativePath: string; publicUrl: string }> {
  const fileName = `${Date.now()}_${sanitizeFilename(originalName)}`;

  if (useMongoCvStorage()) {
    return saveCvToMongo(jobId, originalName, fileName, buffer);
  }

  if (useGridFsCvStorage()) {
    return saveCvToGridFs(jobId, originalName, fileName, buffer);
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
  if (useMongoCvStorage()) {
    await ensureMongoReady();
    const doc = await CvFile.findById(fileId).lean();
    if (!doc) return null;
    return {
      stream: Readable.from(doc.data),
      filename: doc.original_name,
    };
  }

  if (!useGridFsCvStorage()) {
    return null;
  }

  let oid: ObjectId;
  try {
    oid = new ObjectId(fileId);
  } catch {
    return null;
  }

  await ensureMongoReady();
  const bucket = getGridFsBucket();
  const files = await bucket.find({ _id: oid }).toArray();
  const file = files[0];
  if (!file) return null;

  return {
    stream: bucket.openDownloadStream(oid),
    filename: file.filename,
  };
}

export async function getCvJobId(fileId: string): Promise<string | null> {
  if (useMongoCvStorage()) {
    await ensureMongoReady();
    const doc = await CvFile.findById(fileId).select("job_id").lean();
    return doc?.job_id ?? null;
  }

  if (!useGridFsCvStorage()) return null;

  let oid: ObjectId;
  try {
    oid = new ObjectId(fileId);
  } catch {
    return null;
  }

  await ensureMongoReady();
  const bucket = getGridFsBucket();
  const files = await bucket.find({ _id: oid }).toArray();
  const jobId = files[0]?.metadata?.jobId;
  return typeof jobId === "string" ? jobId : null;
}

/** @deprecated Use getCvJobId */
export const getGridFsCvJobId = getCvJobId;

export async function deleteCvsForJob(jobId: string): Promise<void> {
  if (useMongoCvStorage()) {
    await ensureMongoReady();
    await CvFile.deleteMany({ job_id: jobId });
    return;
  }

  if (useGridFsCvStorage()) {
    await ensureMongoReady();
    const bucket = getGridFsBucket();
    const files = await bucket.find({ "metadata.jobId": jobId }).toArray();
    await Promise.all(files.map((file) => bucket.delete(file._id)));
    return;
  }

  const jobDir = path.join(CVS_DIR, jobId);
  await rm(jobDir, { recursive: true, force: true });
}
