import axios from "axios";
import { getMinimaxConfig } from "../config/env";
import type { AIRequirements } from "../models/Job";
import type {
  CandidateModelEvidence,
  Recommendation,
} from "./scoringService";

const MINIMAX_BASE_URL =
  process.env.MINIMAX_API_BASE_URL?.trim() || "https://api.minimax.io/v1";
const MINIMAX_MODEL = process.env.MINIMAX_MODEL?.trim() || "MiniMax-M2.7";
const MINIMAX_MAX_ATTEMPTS = 3;

type MiniMaxNativeResponse = {
  base_resp?: { status_code?: number; status_msg?: string };
  choices?: Array<{ message?: { content?: string } }> | null;
};

type MiniMaxOpenAIMessage = {
  content?: string | null;
  reasoning_details?: Array<{ text?: string }>;
};

type MiniMaxOpenAIResponse = {
  base_resp?: { status_code?: number; status_msg?: string };
  choices?: Array<{
    message?: MiniMaxOpenAIMessage;
  }>;
  error?: { message?: string };
};

/** Remove M2.7 thinking blocks before JSON extraction. */
function stripMiniMaxThinking(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/redacted_thinking>/gi, "")
    .replace(/[\s\S]*?<\/think>/gi, "")
    .trim();
}

function messageTextFromOpenAI(message?: MiniMaxOpenAIMessage | null): string {
  if (!message) return "";
  if (typeof message.content === "string" && message.content.trim()) {
    return stripMiniMaxThinking(message.content);
  }
  if (Array.isArray(message.reasoning_details)) {
    const joined = message.reasoning_details
      .map((d) => d.text ?? "")
      .join("\n")
      .trim();
    if (joined) return stripMiniMaxThinking(joined);
  }
  return "";
}

function parseMiniMaxJson<T>(raw: string): T {
  const cleaned = stripMiniMaxThinking(raw)
    .replace(/```json\s*|```/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new MiniMaxError(
      "MiniMax response did not contain a JSON object",
      502,
    );
  }
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    throw new MiniMaxError("MiniMax returned invalid JSON", 502);
  }
}

export class MiniMaxError extends Error {
  constructor(
    message: string,
    public readonly httpStatus: number,
    public readonly minimaxCode?: number,
  ) {
    super(message);
    this.name = "MiniMaxError";
  }
}

function isEmptyContentError(err: unknown): boolean {
  return (
    err instanceof MiniMaxError &&
    err.message.includes("no message content")
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function assertMiniMaxConfigured() {
  const { apiKey, groupId, isTokenPlan } = getMinimaxConfig();
  if (!apiKey) {
    throw new MiniMaxError(
      "MINIMAX_API_KEY is missing in backend .env",
      503,
    );
  }
  if (!isTokenPlan && !groupId) {
    throw new MiniMaxError(
      "MINIMAX_GROUP_ID is required for pay-as-you-go API keys (not Token Plan sk-cp- keys)",
      503,
    );
  }
}

function mapMiniMaxError(
  baseCode: number,
  baseMsg: string,
  isTokenPlan: boolean,
): MiniMaxError {
  if (baseCode === 2049) {
    return new MiniMaxError(
      "Invalid MiniMax API key. Create a pay-as-you-go key at platform.minimax.io → API Keys, or a Token Plan key at Billing → Token Plan.",
      401,
      baseCode,
    );
  }
  if (baseCode === 1004) {
    return new MiniMaxError(
      isTokenPlan
        ? "MiniMax Token Plan key rejected (1004). Use the key from Billing → Token Plan (sk-cp-…), ensure a subscription or Credits are active, and leave MINIMAX_GROUP_ID empty or remove it."
        : "MiniMax API key does not match MINIMAX_GROUP_ID (1004). Copy both from the same pay-as-you-go project at platform.minimax.io → API Keys.",
      401,
      baseCode,
    );
  }
  if (baseCode === 1008) {
    return new MiniMaxError(
      "MiniMax account has insufficient balance. Add credits at platform.minimax.io",
      402,
      baseCode,
    );
  }
  return new MiniMaxError(baseMsg, 502, baseCode);
}

function extractNativeContent(data: MiniMaxNativeResponse): string {
  const baseCode = data.base_resp?.status_code ?? 0;
  const baseMsg = data.base_resp?.status_msg ?? "MiniMax API error";
  const { isTokenPlan } = getMinimaxConfig();

  if (baseCode !== 0) {
    throw mapMiniMaxError(baseCode, baseMsg, isTokenPlan);
  }

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new MiniMaxError(
      "MiniMax returned no message content (empty choices)",
      502,
    );
  }
  return stripMiniMaxThinking(content);
}

function extractOpenAIContent(data: MiniMaxOpenAIResponse): string {
  const baseCode = data.base_resp?.status_code ?? 0;
  const baseMsg =
    data.base_resp?.status_msg ??
    data.error?.message ??
    "MiniMax API error";

  if (baseCode !== 0) {
    throw mapMiniMaxError(baseCode, baseMsg, true);
  }

  const content = messageTextFromOpenAI(data.choices?.[0]?.message);
  if (!content) {
    throw new MiniMaxError(
      "MiniMax returned no message content (empty choices)",
      502,
    );
  }
  return content;
}

async function callMiniMaxNative(
  prompt: string,
  apiKey: string,
  groupId: string,
): Promise<string> {
  const url = `${MINIMAX_BASE_URL}/text/chatcompletion_v2?GroupId=${groupId}`;
  const response = await axios.post<MiniMaxNativeResponse>(
    url,
    {
      model: MINIMAX_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 4000,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 60_000,
    },
  );
  return extractNativeContent(response.data);
}

async function callMiniMaxOpenAI(
  prompt: string,
  apiKey: string,
): Promise<string> {
  const url = `${MINIMAX_BASE_URL}/chat/completions`;
  const response = await axios.post<MiniMaxOpenAIResponse>(
    url,
    {
      model: MINIMAX_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 4000,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 60_000,
    },
  );
  return extractOpenAIContent(response.data);
}

async function callMiniMaxOnce(prompt: string): Promise<string> {
  assertMiniMaxConfigured();
  const { apiKey, groupId, isTokenPlan } = getMinimaxConfig();

  try {
    if (isTokenPlan) {
      return await callMiniMaxOpenAI(prompt, apiKey);
    }
    return await callMiniMaxNative(prompt, apiKey, groupId);
  } catch (err: unknown) {
    const ax = err as {
      response?: {
        status?: number;
        data?: MiniMaxNativeResponse & MiniMaxOpenAIResponse;
      };
      message?: string;
    };

    const data = ax.response?.data;
    if (data?.base_resp) {
      if (isTokenPlan) {
        return extractOpenAIContent(data);
      }
      return extractNativeContent(data);
    }

    const openaiMsg = data?.error?.message;
    if (openaiMsg) {
      const codeMatch = openaiMsg.match(/\((\d{4})\)/);
      const code = codeMatch ? Number(codeMatch[1]) : 1004;
      throw mapMiniMaxError(code, openaiMsg, isTokenPlan);
    }

    if (err instanceof MiniMaxError) {
      throw err;
    }

    throw new MiniMaxError(
      ax.message ?? "MiniMax request failed",
      ax.response?.status && ax.response.status < 500
        ? ax.response.status
        : 502,
    );
  }
}

async function callMiniMax(prompt: string): Promise<string> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MINIMAX_MAX_ATTEMPTS; attempt += 1) {
    try {
      return await callMiniMaxOnce(prompt);
    } catch (err) {
      lastError = err;
      if (!isEmptyContentError(err) || attempt === MINIMAX_MAX_ATTEMPTS) {
        throw err;
      }

      console.warn(
        `MiniMax returned empty content, retrying candidate request (${attempt}/${MINIMAX_MAX_ATTEMPTS})`,
      );
      await sleep(500 * attempt);
    }
  }

  throw lastError;
}

export async function analyzeJobDescription(
  jobDescription: string,
): Promise<AIRequirements> {
  const prompt = `Analyze this job description and return ONLY a valid JSON object with no extra text or markdown.
Return this exact structure:
{
  "required_skills": ["skill1", "skill2"],
  "nice_to_have_skills": ["skill1", "skill2"],
  "responsibilities": ["resp1", "resp2"],
  "experience_level": "junior|mid|senior",
  "must_have_criteria": ["criteria1"],
  "screening_questions": ["question1", "question2", "question3", "question4", "question5"]
}

Job Description:
${jobDescription}`;

  const raw = await callMiniMax(prompt);
  return parseMiniMaxJson<AIRequirements>(raw);
}

export interface CandidateEvaluation {
  matching_skills: string[];
  missing_skills: string[];
  experience_match: string;
  answer_quality: string;
  red_flags: string[];
  recruiter_summary: string;
  suggested_interview_questions: string[];
  recommendation: Recommendation;
  model_evidence: CandidateModelEvidence;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeRecommendation(value: unknown): Recommendation {
  return value === "strong_yes" ||
    value === "yes" ||
    value === "maybe" ||
    value === "no"
    ? value
    : "maybe";
}

function normalizeCandidateEvaluation(value: unknown): CandidateEvaluation {
  const root = asRecord(value);
  return {
    matching_skills: stringArray(root.matching_skills),
    missing_skills: stringArray(root.missing_skills),
    experience_match: stringValue(root.experience_match),
    answer_quality: stringValue(root.answer_quality),
    red_flags: stringArray(root.red_flags),
    recruiter_summary: stringValue(root.recruiter_summary),
    suggested_interview_questions: stringArray(
      root.suggested_interview_questions,
    ),
    recommendation: normalizeRecommendation(root.recommendation),
    model_evidence: asRecord(root.model_evidence) as CandidateModelEvidence,
  };
}

export async function evaluateCandidate(
  jobDescription: string,
  cvText: string,
  answers: Record<string, string>,
  questions: { _id: string; question_text: string }[],
  aiRequirements?: AIRequirements | null,
): Promise<CandidateEvaluation> {
  const formattedAnswers = questions
    .map((q) => `Q: ${q.question_text}\nA: ${answers[q._id] || "(no answer)"}`)
    .join("\n\n");
  const requiredSkills = aiRequirements?.required_skills ?? [];
  const niceToHaveSkills = aiRequirements?.nice_to_have_skills ?? [];
  const canonicalSkillsText =
    requiredSkills.length > 0 || niceToHaveSkills.length > 0
      ? `Canonical JD skills to evaluate exactly:
Required skills (${requiredSkills.length}): ${JSON.stringify(requiredSkills)}
Nice-to-have skills (${niceToHaveSkills.length}): ${JSON.stringify(niceToHaveSkills)}

Use these canonical lists for skills matching. Do not add extra skill requirements, rename requirements, or change total_count.`
      : "No canonical JD skills were pre-extracted. Infer skills from the job description once and keep totals conservative.";

  const prompt = `Compare this candidate's CV and screening answers against the job description.
Return ONLY a valid JSON object with no extra text or markdown.
Do NOT create or return an overall fit score. The backend will calculate the final score.
Return counts and section evidence only. Keep all numeric scores within 0 to 100.

Return this exact structure:
{
  "matching_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1"],
  "experience_match": "Strong match - 4 years in relevant field",
  "answer_quality": "Detailed and relevant answers with good technical depth",
  "red_flags": ["concern1"],
  "recruiter_summary": "2-3 sentence summary for the recruiter",
  "suggested_interview_questions": ["question1", "question2", "question3"],
  "recommendation": "strong_yes|yes|maybe|no",
  "model_evidence": {
    "skills": {
      "required": {
        "matched_count": 0,
        "total_count": 0,
        "matched": ["skill from JD also found in CV"],
        "missing": ["required skill from JD not found in CV"]
      },
      "nice_to_have": {
        "matched_count": 0,
        "total_count": 0,
        "matched": ["nice-to-have skill from JD also found in CV"],
        "missing": ["nice-to-have skill from JD not found in CV"]
      }
    },
    "experience": {
      "active": true,
      "score": 0,
      "reason": "Short explanation of relevant experience match"
    },
    "education": {
      "active": true,
      "score": 0,
      "reason": "Short explanation of education match"
    },
    "projects": {
      "active": true,
      "score": 0,
      "matched_count": 0,
      "total_count": 0,
      "matched": ["matched project/tool evidence"],
      "missing": ["missing project/tool requirement"]
    },
    "job_title": {
      "active": true,
      "score": 0,
      "reason": "Short explanation of title match"
    },
    "certifications": {
      "matched_count": 0,
      "total_count": 0,
      "matched": ["matched certification"],
      "missing": ["missing certification"]
    }
  }
}

Rules:
- For skills, use the Canonical JD skills section below when it is present. required.total_count must equal the canonical required skill count, and nice_to_have.total_count must equal the canonical nice-to-have skill count.
- If a canonical skill is only weakly implied in the CV, do not count it as matched. Put it in missing and explain uncertainty in recruiter_summary if important.
- matched_count must never be greater than total_count.
- For non-skill sections, set active=false when the job description does not ask for that section. Example: education.active=false if no education requirement is stated.
- For non-skill active sections, score is the section match only, not a weighted final score.
- Use screening answers only as supporting evidence for experience, project, and skill claims. Do not count unsupported claims as strongly as CV evidence.

${canonicalSkillsText}

Job Description:
${jobDescription}

Candidate CV:
${cvText}

Screening Answers:
${formattedAnswers}`;

  const raw = await callMiniMax(prompt);
  return normalizeCandidateEvaluation(parseMiniMaxJson<unknown>(raw));
}
