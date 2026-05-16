import axios from "axios";
import { getMinimaxConfig } from "../config/env";
import type { AIRequirements } from "../models/Job";

const MINIMAX_BASE_URL =
  process.env.MINIMAX_API_BASE_URL?.trim() || "https://api.minimax.io/v1";
const MINIMAX_MODEL = process.env.MINIMAX_MODEL?.trim() || "MiniMax-M2.7";

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
      max_tokens: 2000,
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
      temperature: 1,
      max_tokens: 2000,
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

async function callMiniMax(prompt: string): Promise<string> {
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
  overall_score: number;
  matching_skills: string[];
  missing_skills: string[];
  experience_match: string;
  answer_quality: string;
  red_flags: string[];
  recruiter_summary: string;
  suggested_interview_questions: string[];
  recommendation: string;
}

export async function evaluateCandidate(
  jobDescription: string,
  cvText: string,
  answers: Record<string, string>,
  questions: { _id: string; question_text: string }[],
): Promise<CandidateEvaluation> {
  const formattedAnswers = questions
    .map((q) => `Q: ${q.question_text}\nA: ${answers[q._id] || "(no answer)"}`)
    .join("\n\n");

  const prompt = `Compare this candidate's CV and screening answers against the job description.
Return ONLY a valid JSON object with no extra text or markdown.
Return this exact structure:
{
  "overall_score": 85,
  "matching_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1"],
  "experience_match": "Strong match - 4 years in relevant field",
  "answer_quality": "Detailed and relevant answers with good technical depth",
  "red_flags": ["concern1"],
  "recruiter_summary": "2-3 sentence summary for the recruiter",
  "suggested_interview_questions": ["question1", "question2", "question3"],
  "recommendation": "strong_yes|yes|maybe|no"
}

Job Description:
${jobDescription}

Candidate CV:
${cvText}

Screening Answers:
${formattedAnswers}`;

  const raw = await callMiniMax(prompt);
  return parseMiniMaxJson<CandidateEvaluation>(raw);
}
