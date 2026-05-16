import mongoose from "mongoose";
import { env, mongoDisplayUri } from "./env";

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseConnectPromise?: Promise<typeof mongoose>;
};

export const connectDB = async (): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!globalForMongoose.mongooseConnectPromise) {
    const uri = env.mongodbUri;
    globalForMongoose.mongooseConnectPromise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 10000,
        bufferCommands: false,
      })
      .then((conn) => {
        const { host, name } = mongoose.connection;
        console.log(`MongoDB connected (${host} / db: ${name})`);
        console.log(`URI: ${mongoDisplayUri(uri)}`);
        return conn;
      })
      .catch((err) => {
        globalForMongoose.mongooseConnectPromise = undefined;
        console.error("MongoDB connection error:", err);
        if (process.env.VERCEL !== "1") {
          console.error(
            "\nLocal MongoDB tip: start Mongo with `npm run db:up` (Docker) or install MongoDB Community and run `mongod`.\n" +
              `Expected URI: ${mongoDisplayUri(uri)}\n`,
          );
          process.exit(1);
        }
        throw err;
      });
  }

  return globalForMongoose.mongooseConnectPromise;
};
