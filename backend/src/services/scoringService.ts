export type Recommendation = "strong_yes" | "yes" | "maybe" | "no";

export type CountMatchEvidence = {
  matched_count?: unknown;
  total_count?: unknown;
  matched?: unknown;
  missing?: unknown;
};

export type ScoredSectionEvidence = {
  active?: unknown;
  score?: unknown;
  reason?: unknown;
  matched_count?: unknown;
  total_count?: unknown;
  matched?: unknown;
  missing?: unknown;
};

export type CandidateModelEvidence = {
  skills?: {
    required?: CountMatchEvidence;
    nice_to_have?: CountMatchEvidence;
  };
  experience?: ScoredSectionEvidence;
  education?: ScoredSectionEvidence;
  projects?: ScoredSectionEvidence;
  job_title?: ScoredSectionEvidence;
  certifications?: CountMatchEvidence;
};

export type SkillRequirements = {
  required_skills?: unknown;
  nice_to_have_skills?: unknown;
};

type SectionKey =
  | "skills"
  | "experience"
  | "education"
  | "projects"
  | "job_title";

type RawSectionScore = {
  active: boolean;
  score: number;
  reason?: string;
  details?: Record<string, unknown>;
};

const SECTION_WEIGHTS: Record<SectionKey, number> = {
  skills: 40,
  experience: 30,
  education: 10,
  projects: 10,
  job_title: 10,
};

const REQUIRED_SKILL_VALUE = 1;
const NICE_TO_HAVE_SKILL_VALUE = 0.6;
const CERTIFICATION_MATCH_BONUS = 2.5;
const MAX_CERTIFICATION_BONUS = 5;

export type SanitizedCountEvidence = {
  matched_count: number;
  total_count: number;
  matched: string[];
  missing: string[];
};

export type SectionBreakdown = {
  active: boolean;
  base_weight: number;
  adjusted_weight: number;
  score: number;
  weighted_score: number;
  reason?: string;
  details?: Record<string, unknown>;
};

export type FitBreakdown = {
  overall_score: number;
  grade: string;
  active_weight_total: number;
  certifications_bonus: number;
  sections: Record<SectionKey, SectionBreakdown>;
};

export type FitScoreResult = {
  overall_score: number;
  grade: string;
  fit_breakdown: FitBreakdown;
};

function asFiniteNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clampScore(value: unknown): number {
  return Math.round(clamp(asFiniteNumber(value), 0, 100));
}

function safeCount(value: unknown): number {
  return Math.floor(clamp(asFiniteNumber(value), 0, Number.MAX_SAFE_INTEGER));
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function sanitizeCountEvidence(
  evidence: CountMatchEvidence | undefined,
): SanitizedCountEvidence {
  const total = safeCount(evidence?.total_count);
  const matched = clamp(safeCount(evidence?.matched_count), 0, total);

  return {
    matched_count: matched,
    total_count: total,
    matched: stringList(evidence?.matched),
    missing: stringList(evidence?.missing),
  };
}

function withCanonicalSkillTotal(
  evidence: SanitizedCountEvidence,
  canonicalSkills: string[],
): SanitizedCountEvidence {
  if (canonicalSkills.length === 0) return evidence;

  return {
    ...evidence,
    matched_count: clamp(evidence.matched_count, 0, canonicalSkills.length),
    total_count: canonicalSkills.length,
  };
}

function isSectionActive(section: ScoredSectionEvidence | undefined): boolean {
  if (!section) return false;
  if (typeof section.active === "boolean") return section.active;
  if (typeof section.active === "string") {
    return section.active.trim().toLowerCase() === "true";
  }
  return section.score !== undefined;
}

function reasonFrom(
  section: ScoredSectionEvidence | undefined,
): string | undefined {
  return typeof section?.reason === "string" && section.reason.trim()
    ? section.reason.trim()
    : undefined;
}

function scoreToGrade(score: number): string {
  if (score >= 85) return "Strong Match";
  if (score >= 70) return "Good Match";
  if (score >= 50) return "Average Match";
  return "Weak Match";
}

function buildInactiveSection(baseWeight: number): SectionBreakdown {
  return {
    active: false,
    base_weight: baseWeight,
    adjusted_weight: 0,
    score: 0,
    weighted_score: 0,
  };
}

function getRawSectionScores(
  evidence: CandidateModelEvidence,
  skillRequirements?: SkillRequirements,
): Record<SectionKey, RawSectionScore> {
  const canonicalRequiredSkills = stringList(
    skillRequirements?.required_skills,
  );
  const canonicalNiceToHaveSkills = stringList(
    skillRequirements?.nice_to_have_skills,
  );
  const required = withCanonicalSkillTotal(
    sanitizeCountEvidence(evidence.skills?.required),
    canonicalRequiredSkills,
  );
  const niceToHave = withCanonicalSkillTotal(
    sanitizeCountEvidence(evidence.skills?.nice_to_have),
    canonicalNiceToHaveSkills,
  );
  const requiredMatchedValue = required.matched_count * REQUIRED_SKILL_VALUE;
  const niceMatchedValue =
    niceToHave.matched_count * NICE_TO_HAVE_SKILL_VALUE;
  const requiredTotalValue = required.total_count * REQUIRED_SKILL_VALUE;
  const niceTotalValue = niceToHave.total_count * NICE_TO_HAVE_SKILL_VALUE;
  const skillsMatchedValue = requiredMatchedValue + niceMatchedValue;
  const skillsTotalValue = requiredTotalValue + niceTotalValue;
  const skillsScore =
    skillsTotalValue > 0
      ? Math.round((skillsMatchedValue / skillsTotalValue) * 100)
      : 0;

  return {
    skills: {
      active: skillsTotalValue > 0,
      score: clampScore(skillsScore),
      details: {
        required,
        nice_to_have: niceToHave,
        required_skill_value: REQUIRED_SKILL_VALUE,
        nice_to_have_skill_value: NICE_TO_HAVE_SKILL_VALUE,
        matched_value: Number(skillsMatchedValue.toFixed(2)),
        total_value: Number(skillsTotalValue.toFixed(2)),
      },
    },
    experience: {
      active: isSectionActive(evidence.experience),
      score: clampScore(evidence.experience?.score),
      reason: reasonFrom(evidence.experience),
    },
    education: {
      active: isSectionActive(evidence.education),
      score: clampScore(evidence.education?.score),
      reason: reasonFrom(evidence.education),
    },
    projects: {
      active: isSectionActive(evidence.projects),
      score: clampScore(evidence.projects?.score),
      reason: reasonFrom(evidence.projects),
      details: {
        counts: sanitizeCountEvidence(evidence.projects),
      },
    },
    job_title: {
      active: isSectionActive(evidence.job_title),
      score: clampScore(evidence.job_title?.score),
      reason: reasonFrom(evidence.job_title),
    },
  };
}

export function calculateFitScore(
  evidence: CandidateModelEvidence | undefined,
  skillRequirements?: SkillRequirements,
): FitScoreResult {
  const safeEvidence = evidence ?? {};
  const rawSections = getRawSectionScores(safeEvidence, skillRequirements);
  const activeWeightTotal = (Object.keys(SECTION_WEIGHTS) as SectionKey[])
    .filter((key) => rawSections[key].active)
    .reduce((total, key) => total + SECTION_WEIGHTS[key], 0);

  const sections = (Object.keys(SECTION_WEIGHTS) as SectionKey[]).reduce(
    (acc, key) => {
      const raw = rawSections[key];
      const baseWeight = SECTION_WEIGHTS[key];

      if (!raw.active || activeWeightTotal === 0) {
        acc[key] = buildInactiveSection(baseWeight);
        return acc;
      }

      const adjustedWeight = (baseWeight / activeWeightTotal) * 100;
      const weightedScore = raw.score * (adjustedWeight / 100);

      acc[key] = {
        active: true,
        base_weight: baseWeight,
        adjusted_weight: Number(adjustedWeight.toFixed(2)),
        score: raw.score,
        weighted_score: Number(weightedScore.toFixed(2)),
        ...(raw.reason ? { reason: raw.reason } : {}),
        ...(raw.details ? { details: raw.details } : {}),
      };
      return acc;
    },
    {} as Record<SectionKey, SectionBreakdown>,
  );

  const certificationEvidence = sanitizeCountEvidence(
    safeEvidence.certifications,
  );
  const certificationsBonus = Math.min(
    certificationEvidence.matched_count * CERTIFICATION_MATCH_BONUS,
    MAX_CERTIFICATION_BONUS,
  );
  const weightedTotal = Object.values(sections).reduce(
    (total, section) => total + section.weighted_score,
    0,
  );
  const overallScore = Math.round(
    clamp(weightedTotal + certificationsBonus, 0, 100),
  );
  const grade = scoreToGrade(overallScore);

  return {
    overall_score: overallScore,
    grade,
    fit_breakdown: {
      overall_score: overallScore,
      grade,
      active_weight_total: activeWeightTotal,
      certifications_bonus: certificationsBonus,
      sections,
    },
  };
}
