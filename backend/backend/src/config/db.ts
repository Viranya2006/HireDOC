import mongoose from "mongoose";
import { env, mongoDisplayUri } from "./env";

export const connectDB = async (): Promise<void> => {
  const uri = env.mongodbUri;

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    const { host, name } = mongoose.connection;
    console.log(`MongoDB connected (${host} / db: ${name})`);
    console.log(`URI: ${mongoDisplayUri(uri)}`);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    console.error(
      "\nLocal MongoDB tip: start Mongo with `npm run db:up` (Docker) or install MongoDB Community and run `mongod`.\n" +
        `Expected URI: ${mongoDisplayUri(uri)}\n`,
    );
    process.exit(1);
  }
};
