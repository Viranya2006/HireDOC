import type { JobRequirements } from "@/lib/types/job";
import { apiFetch } from "./client";
import {
  mapAIRequirementsToFrontend,
  type BackendAIRequirements,
} from "./mappers";

export interface JDAnalysisResult {
  requirements: JobRequirements;
}

interface AnalyzeResponse {
  analysis: BackendAIRequirements;
}

export async function analyzeJD(jobId: string): Promise<JDAnalysisResult> {
  const { analysis } = await apiFetch<AnalyzeResponse>(
    `/api/ai/analyze-jd/${jobId}`,
    { method: "POST", auth: true },
  );

  const requirements = mapAIRequirementsToFrontend(analysis);
  return { requirements };
}
