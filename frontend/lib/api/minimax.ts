import type { JobRequirements } from "@/lib/types/job";
import { apiFetch } from "./client";
import {
  mapAIRequirementsToFrontend,
  type BackendAIRequirements,
} from "./mappers";

export interface JDAnalysisResult {
  overallScore: number;
  requirements: JobRequirements;
  metrics: {
    label: string;
    score: number;
    color: string;
    insight: string;
  }[];
  strengths: string[];
  suggestions: string[];
}

interface AnalyzeResponse {
  analysis: BackendAIRequirements;
}

function buildMetrics(requirements: JobRequirements): JDAnalysisResult["metrics"] {
  const skillCount = requirements.requiredSkills.length;
  const score = Math.min(95, 70 + skillCount * 3);
  return [
    {
      label: "Role Clarity",
      score,
      color: "#00C896",
      insight: "Requirements extracted from your job description",
    },
    {
      label: "Screening Coverage",
      score: Math.min(
        95,
        60 + requirements.screeningQuestions.length * 8,
      ),
      color: "#0057FF",
      insight: `${requirements.screeningQuestions.length} screening questions generated`,
    },
    {
      label: "Experience Fit",
      score: 88,
      color: "#C8F135",
      insight: requirements.experienceLevel || "Experience level identified",
    },
  ];
}

export async function analyzeJD(jobId: string): Promise<JDAnalysisResult> {
  const { analysis } = await apiFetch<AnalyzeResponse>(
    `/api/ai/analyze-jd/${jobId}`,
    { method: "POST", auth: true },
  );

  const requirements = mapAIRequirementsToFrontend(analysis);
  const overallScore = Math.min(
    98,
    75 +
      requirements.requiredSkills.length * 2 +
      requirements.screeningQuestions.length * 3,
  );

  return {
    overallScore,
    requirements,
    metrics: buildMetrics(requirements),
    strengths: requirements.mustHaveCriteria.length
      ? requirements.mustHaveCriteria
      : ["Well-defined technical requirements"],
    suggestions: [
      "Review screening questions before publishing",
      "Confirm experience level matches your hiring bar",
    ],
  };
}
