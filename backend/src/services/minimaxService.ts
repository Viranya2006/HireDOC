import axios from "axios";

const minimaxClient = axios.create({
  baseURL: "https://api.minimax.chat/v1",
  headers: {
    Authorization: `Bearer ${process.env.MINIMAX_API_KEY}`,
    "Content-Type": "application/json",
  },
});

async function callMiniMax(prompt: string): Promise<string> {
  const response = await minimaxClient.post(
    `/text/chatcompletion_v2?GroupId=${process.env.MINIMAX_GROUP_ID}`,
    {
      model: "abab6.5s-chat",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
    },
  );
  return response.data.choices[0].message.content;
}

export async function analyzeJobDescription(jobDescription: string) {
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
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}

export async function evaluateCandidate(
  jobDescription: string,
  cvText: string,
  answers: Record<string, string>,
  questions: { _id: string; question_text: string }[],
) {
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
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}
