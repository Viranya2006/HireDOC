import { getToken } from "@/lib/auth/session";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:5000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiFetchOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  formData?: FormData;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = false, formData } = options;

  const headers: Record<string, string> = {};

  if (auth) {
    const token = getToken();
    if (!token) {
      throw new ApiError("Not authenticated", 401);
    }
    headers.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined && !formData) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: formData ? formData : body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const errMsg =
      data &&
      typeof data === "object" &&
      "error" in data &&
      typeof (data as { error: unknown }).error === "string"
        ? (data as { error: string }).error
        : typeof data === "object" &&
            data !== null &&
            "error" in data &&
            typeof (data as { error: { fieldErrors?: unknown } }).error ===
              "object"
          ? "Validation failed"
          : `Request failed (${res.status})`;
    throw new ApiError(errMsg, res.status, data);
  }

  return data as T;
}

export { API_BASE };
