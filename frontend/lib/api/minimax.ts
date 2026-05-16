import type { JobRequirements } from "@/lib/types/job";
import { delay } from "./delay";

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

export async function analyzeJD(description: string): Promise<JDAnalysisResult> {
  await delay(800);
  void description;

  return {
    overallScore: 92,
    requirements: {
      requiredSkills: ["React", "TypeScript", "Node.js", "GraphQL", "AWS"],
      niceToHaveSkills: ["Python", "Docker", "CI/CD"],
      responsibilities: [
        "Build and maintain frontend features",
        "Collaborate with design and backend teams",
        "Write tests and review code",
      ],
      experienceLevel: "Senior (5+ years)",
      mustHaveCriteria: [
        "Production React experience",
        "TypeScript proficiency",
        "Remote collaboration skills",
      ],
      screeningQuestions: [
        "Walk me through your most complex React project.",
        "How do you handle performance optimization in large apps?",
        "Describe your TypeScript experience in production.",
        "Are you available for full-time remote work?",
      ],
    },
    metrics: [
      {
        label: "Role Clarity",
        score: 95,
        color: "#00C896",
        insight: "Clear responsibilities and expectations defined",
      },
      {
        label: "Candidate Pool",
        score: 88,
        color: "#0057FF",
        insight: "Estimated 2,400+ qualified candidates available",
      },
      {
        label: "Market Fit",
        score: 91,
        color: "#C8F135",
        insight: "Competitive salary range for this role",
      },
    ],
    strengths: [
      "Well-defined technical requirements",
      "Competitive compensation package",
      "Clear growth opportunities mentioned",
    ],
    suggestions: [
      "Add remote work policy details",
      "Include team size and structure",
    ],
  };
}
