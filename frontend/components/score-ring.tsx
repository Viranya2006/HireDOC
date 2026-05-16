"use client";

import { motion } from "framer-motion";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  accentColor?: string;
  showColorByScore?: boolean;
}

function scoreColor(score: number): string {
  if (score >= 80) return "#00C896";
  if (score >= 60) return "#0057FF";
  return "#FF4D2E";
}

export function ScoreRing({
  score,
  size = 80,
  strokeWidth,
  accentColor,
  showColorByScore = true,
}: ScoreRingProps) {
  const stroke = strokeWidth ?? (size <= 40 ? 3 : size <= 80 ? 5 : 10);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color =
    accentColor ?? (showColorByScore ? scoreColor(score) : "#00C896");
  const fontSize = size <= 40 ? size * 0.35 : size <= 80 ? size * 0.3 : 24;

  return (
    <motion.div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(15,15,15,0.08)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={{
            strokeDasharray: circumference,
            strokeDashoffset: circumference,
          }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-data font-bold text-[#0F0F0F]"
        style={{ fontSize }}
      >
        {score}
      </span>
    </motion.div>
  );
}
