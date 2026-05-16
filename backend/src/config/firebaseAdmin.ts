import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirebaseServiceAccount } from "./env";

let app: App | null = null;

export function getFirebaseAdminApp(): App | null {
  if (app) return app;
  const serviceAccount = getFirebaseServiceAccount();
  if (!serviceAccount) return null;

  if (getApps().length > 0) {
    app = getApps()[0]!;
    return app;
  }

  app = initializeApp({
    credential: cert(serviceAccount as Parameters<typeof cert>[0]),
  });
  return app;
}

export function getFirebaseAdminAuth() {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return null;
  return getAuth(adminApp);
}

export function isFirebaseAdminConfigured(): boolean {
  return getFirebaseServiceAccount() !== null;
}
