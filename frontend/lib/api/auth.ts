import { apiFetch } from "./client";

export interface Recruiter {
  _id: string;
  email: string;
  organization_name?: string;
  firebase_uid?: string;
}

export async function exchangeFirebaseSession(
  idToken: string,
  organizationName?: string,
): Promise<{ token: string; recruiter: Recruiter }> {
  return apiFetch("/api/auth/firebase-session", {
    method: "POST",
    body: {
      idToken,
      ...(organizationName ? { organization_name: organizationName } : {}),
    },
  });
}

export async function getMe(): Promise<{ recruiter: Recruiter }> {
  return apiFetch("/api/auth/me", { auth: true });
}
