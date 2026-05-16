"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface StatCardsProps {
  stats: {
    totalApplicants: number;
    avgFitScore: number;
    topScore: { score: number; name: string };
    appliedToday: number;
  };
}

function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1000;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(eased * value));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return <>{displayValue}</>;
}

const cards = [
  {
    key: "totalApplicants",
    label: "TOTAL APPLICANTS",
    getValue: (stats: StatCardsProps["stats"]) => stats.totalApplicants,
  },
  {
    key: "avgFitScore",
    label: "AVG FIT SCORE",
    getValue: (stats: StatCardsProps["stats"]) => stats.avgFitScore,
  },
  {
    key: "topScore",
    label: "TOP SCORE",
    getValue: (stats: StatCardsProps["stats"]) => stats.topScore.score,
    getSubtext: (stats: StatCardsProps["stats"]) => stats.topScore.name,
  },
  {
    key: "appliedToday",
    label: "APPLIED TODAY",
    getValue: (stats: StatCardsProps["stats"]) => stats.appliedToday,
  },
];

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {cards.map((card, index) => (
        <motion.div
          key={card.key}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.3 + index * 0.05,
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="bg-white rounded-xl border border-[rgba(15,15,15,0.08)] p-4 relative overflow-hidden"
        >
          <p className="font-body text-[#6B6560] text-[10px] font-semibold tracking-wider uppercase mb-1.5">
            {card.label}
          </p>
          <p className="font-data font-bold text-[#0F0F0F] text-[30px] leading-none">
            <AnimatedNumber value={card.getValue(stats)} delay={400 + index * 100} />
          </p>
          {card.getSubtext && (
            <p className="font-body text-[#6B6560] text-xs mt-1">
              {card.getSubtext(stats)}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
