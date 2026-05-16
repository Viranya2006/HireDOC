"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-center gap-0 flex-wrap"
    >
      {steps.map((label, index) => {
        const completed = index < currentStep;
        const active = index === currentStep;

        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-data text-sm font-bold ${
                  completed
                    ? "bg-[#0F0F0F] text-white"
                    : active
                      ? "bg-[#C8F135] text-[#0F0F0F]"
                      : "bg-[#EDE8DC] text-[#6B6560]"
                }`}
              >
                {completed ? <Check className="w-5 h-5" /> : index + 1}
              </motion.div>
              <span
                className={`font-body text-xs mt-2 whitespace-nowrap ${
                  active ? "text-[#0F0F0F] font-semibold" : "text-[#6B6560]"
                }`}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="w-12 md:w-20 h-[2px] mx-2 mt-[-20px]">
                <div
                  className={`h-full ${completed ? "bg-[#0F0F0F]" : "bg-[#EDE8DC]"}`}
                />
              </div>
            )}
          </div>
        );
      })}
    </motion.div>
  );
}
