import { apiFetch } from "./client";

export interface Recruiter {
  _id: string;
  email: string;
  organization_name?: string;
}

export async function sendOtp(
  email: string,
  organizationName?: string,
): Promise<{ message: string; dev_otp?: string }> {
  return apiFetch("/api/auth/send-otp", {
    method: "POST",
    body: {
      email,
      ...(organizationName ? { organization_name: organizationName } : {}),
    },
  });
}

export async function verifyOtp(
  email: string,
  otp: string,
): Promise<{ token: string; recruiter: Recruiter }> {
  return apiFetch("/api/auth/verify-otp", {
    method: "POST",
    body: { email, otp },
  });
}

export async function getMe(): Promise<{ recruiter: Recruiter }> {
  return apiFetch("/api/auth/me", { auth: true });
}
