"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  Brain,
  Target,
  Users,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { ScoreRing } from "@/components/score-ring";
import { QuestionsEditor } from "@/components/dashboard/questions-editor";
import type { JDAnalysisResult } from "@/lib/api/minimax";

const analysisData = {
  overallScore: 92,
  metrics: [
    {
      icon: Target,
      label: "Role Clarity",
      score: 95,
      color: "#00C896",
      insight: "Clear responsibilities and expectations defined",
    },
    {
      icon: Users,
      label: "Candidate Pool",
      score: 88,
      color: "#0057FF",
      insight: "Estimated 2,400+ qualified candidates available",
    },
    {
      icon: TrendingUp,
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
    "Strong employer brand signals",
  ],
  suggestions: [
    "Add remote work policy details",
    "Include team size and structure",
    "Specify interview process timeline",
  ],
  requiredSkills: ["React", "TypeScript", "Node.js", "GraphQL", "AWS"],
  niceToHave: ["Python", "Docker", "CI/CD"],
};

function _UnusedScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#EDE8DC"
          strokeWidth="10"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#C8F135"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="font-data font-bold text-3xl text-[#0F0F0F]"
        >
          {score}
        </motion.span>
        <span className="font-body text-xs text-[#6B6560]">out of 100</span>
      </div>
    </div>
  );
}

function MetricBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="h-2 bg-[#EDE8DC] rounded-full overflow-hidden flex-1">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

interface MiniMaxAnalysisProps {
  analysis?: JDAnalysisResult | null;
  questions: string[];
  onQuestionsChange: (questions: string[]) => void;
}

export function MiniMaxAnalysis({
  analysis,
  questions,
  onQuestionsChange,
}: MiniMaxAnalysisProps) {
  const data = analysis
    ? {
        overallScore: analysis.overallScore,
        metrics: analysis.metrics,
        strengths: analysis.strengths,
        suggestions: analysis.suggestions,
        requiredSkills: analysis.requirements.requiredSkills,
        niceToHave: analysis.requirements.niceToHaveSkills,
      }
    : analysisData;
  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 overflow-y-auto p-6"
    >
      <div className="max-w-[1000px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#C8F135] flex items-center justify-center">
            <Brain className="w-6 h-6 text-[#0F0F0F]" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-[#0F0F0F]">
              MiniMax Analysis
            </h2>
            <p className="font-body text-sm text-[#6B6560]">
              AI-powered job posting optimization
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-[rgba(200,241,53,0.15)] rounded-full">
            <Sparkles className="w-4 h-4 text-[#C8F135]" />
            <span className="font-body text-sm font-medium text-[#0F0F0F]">
              Analysis Complete
            </span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-5">
          {/* Left Column - Overall Score */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-2xl p-6 border border-[rgba(15,15,15,0.08)]"
          >
            <h3 className="font-display font-semibold text-sm text-[#0F0F0F] mb-4">
              Overall Score
            </h3>
            <div className="flex justify-center mb-4">
              <ScoreRing
                score={data.overallScore}
                size={120}
                strokeWidth={10}
                accentColor="#C8F135"
                showColorByScore={false}
              />
            </div>
            <p className="font-body text-sm text-[#6B6560] text-center">
              Excellent job posting quality
            </p>
          </motion.div>

          {/* Middle Column - Metrics */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-2xl p-6 border border-[rgba(15,15,15,0.08)]"
          >
            <h3 className="font-display font-semibold text-sm text-[#0F0F0F] mb-4">
              Key Metrics
            </h3>
            <div className="space-y-4">
              {data.metrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <metric.icon
                      className="w-4 h-4"
                      style={{ color: metric.color }}
                    />
                    <span className="font-body text-sm text-[#0F0F0F]">
                      {metric.label}
                    </span>
                    <span className="font-data text-sm font-semibold text-[#0F0F0F] ml-auto">
                      {metric.score}
                    </span>
                  </div>
                  <MetricBar score={metric.score} color={metric.color} />
                  <p className="font-body text-xs text-[#6B6560] mt-1">
                    {metric.insight}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Skills Detected */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-2xl p-6 border border-[rgba(15,15,15,0.08)]"
          >
            <h3 className="font-display font-semibold text-sm text-[#0F0F0F] mb-4">
              Detected Skills
            </h3>
            <div className="mb-4">
              <p className="font-body text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                Required
              </p>
              <div className="flex flex-wrap gap-2">
                {data.requiredSkills.map((skill, index) => (
                  <motion.span
                    key={skill}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
                    className="px-3 py-1.5 bg-[#00C896] text-white font-body text-xs font-medium rounded-full"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>
            <div>
              <p className="font-body text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                Nice to Have
              </p>
              <div className="flex flex-wrap gap-2">
                {data.niceToHave.map((skill, index) => (
                  <motion.span
                    key={skill}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.05, duration: 0.3 }}
                    className="px-3 py-1.5 bg-[#EDE8DC] text-[#6B6560] font-body text-xs font-medium rounded-full"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Strengths Card */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-2xl p-6 border-t-4 border-t-[#00C896] border border-[rgba(15,15,15,0.08)] col-span-1"
          >
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-[#00C896]" />
              <h3 className="font-display font-semibold text-sm text-[#0F0F0F]">
                Strengths
              </h3>
            </div>
            <ul className="space-y-2">
              {data.strengths.map((strength, index) => (
                <motion.li
                  key={index}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.35 + index * 0.05, duration: 0.3 }}
                  className="flex items-start gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00C896] mt-1.5 shrink-0" />
                  <span className="font-body text-sm text-[#6B6560]">
                    {strength}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Suggestions Card */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-2xl p-6 border-t-4 border-t-[#FF4D2E] border border-[rgba(15,15,15,0.08)] col-span-2"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-[#FF4D2E]" />
              <h3 className="font-display font-semibold text-sm text-[#0F0F0F]">
                Suggestions to Improve
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {data.suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.05, duration: 0.3 }}
                  className="p-3 bg-[#F5F0E8] rounded-xl"
                >
                  <span className="font-body text-sm text-[#0F0F0F]">
                    {suggestion}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5"
        >
          <QuestionsEditor
            title="Screening questions"
            description="Review AI-generated questions, edit wording, reorder, or add your own before candidates apply."
            questions={questions}
            onChange={onQuestionsChange}
            addLabel="Add screening question"
            placeholder="e.g. Describe your experience with React in production…"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
