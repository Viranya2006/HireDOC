import mongoose from "mongoose";
import { env, mongoDisplayUri } from "./env";

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseConnectPromise?: Promise<typeof mongoose>;
};

const MAX_CONNECT_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1500;

const mongooseOptions = {
  serverSelectionTimeoutMS: 15000,
  maxPoolSize: process.env.VERCEL === "1" ? 1 : 10,
  bufferCommands: false,
};

async function disconnectIfNeeded(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

async function connectOnce(): Promise<typeof mongoose> {
  const uri = env.mongodbUri;
  const conn = await mongoose.connect(uri, mongooseOptions);
  const { host, name } = mongoose.connection;
  console.log(`MongoDB connected (${host} / db: ${name})`);
  console.log(`URI: ${mongoDisplayUri(uri)}`);
  return conn;
}

async function connectWithRetries(): Promise<typeof mongoose> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_CONNECT_ATTEMPTS; attempt++) {
    try {
      return await connectOnce();
    } catch (err) {
      lastError = err;
      console.error(
        `MongoDB connection error (attempt ${attempt}/${MAX_CONNECT_ATTEMPTS}):`,
        err,
      );
      await disconnectIfNeeded();

      if (attempt < MAX_CONNECT_ATTEMPTS) {
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY_MS * attempt),
        );
      }
    }
  }

  if (process.env.VERCEL !== "1") {
    console.error(
      "\nLocal MongoDB tip: start Mongo with `npm run db:up` (Docker) or install MongoDB Community and run `mongod`.\n" +
        `Expected URI: ${mongoDisplayUri(env.mongodbUri)}\n`,
    );
    process.exit(1);
  }

  throw lastError;
}

export const connectDB = async (): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!globalForMongoose.mongooseConnectPromise) {
    globalForMongoose.mongooseConnectPromise = connectWithRetries().catch(
      (err) => {
        globalForMongoose.mongooseConnectPromise = undefined;
        throw err;
      },
    );
  }

  return globalForMongoose.mongooseConnectPromise;
};
