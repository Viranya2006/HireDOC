"use client";

import { motion } from "framer-motion";
import { Download, Share2 } from "lucide-react";

interface DashboardHeaderProps {
  jobTitle: string;
  applicantCount: number;
}

export function DashboardHeader({ jobTitle, applicantCount }: DashboardHeaderProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="h-[72px] bg-white border-b border-[rgba(15,15,15,0.10)] px-8 flex items-center justify-between shrink-0"
    >
      {/* Left: Job Title + Applicant Count */}
      <div className="flex items-center gap-4">
        <h1 className="font-display font-extrabold text-[#0F0F0F] text-2xl">
          {jobTitle}
        </h1>
        <span className="px-3 py-1 bg-[#F5F0E8] rounded-full font-body text-[#6B6560] text-sm">
          {applicantCount} Applicants
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-4 py-2 border border-[rgba(15,15,15,0.10)] rounded-full font-body text-[#0F0F0F] text-sm font-medium hover:bg-[#F5F0E8] transition-colors">
          <Download className="w-4 h-4" />
          Export PDF
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#C8F135] rounded-full font-body text-[#0F0F0F] text-sm font-medium hover:bg-[#b8e125] transition-colors">
          <Share2 className="w-4 h-4" />
          Share Shortlist
        </button>
      </div>
    </motion.header>
  );
}
