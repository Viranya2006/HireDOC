import { apiFetch } from "./client";

export type CompanySize = "1-10" | "11-50" | "51-200" | "201-500" | "500+";

export interface Recruiter {
  _id: string;
  email: string;
  organization_name?: string;
  firebase_uid?: string;
  full_name?: string;
  job_title?: string;
  phone?: string;
  website?: string;
  industry?: string;
  company_size?: CompanySize;
  company_description?: string;
}

export type UpdateRecruiterBody = Partial<
  Pick<
    Recruiter,
    | "full_name"
    | "job_title"
    | "phone"
    | "organization_name"
    | "website"
    | "industry"
    | "company_description"
  >
> & {
  company_size?: CompanySize | "";
};

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

export async function updateRecruiter(
  body: UpdateRecruiterBody,
): Promise<{ recruiter: Recruiter }> {
  return apiFetch("/api/auth/me", {
    method: "PATCH",
    body,
    auth: true,
  });
}
