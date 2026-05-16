"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getJobs } from "@/lib/api/jobs";
import type { Job } from "@/lib/types/job";
import { ROUTES } from "@/lib/constants/routes";
import { LimeButton } from "@/components/lime-button";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  active: "bg-[#00C896]/10 text-[#00C896] border-[#00C896]/20",
  draft: "bg-[#F5F0E8] text-[#6B6560] border-[#E8E2D9]",
  closed: "bg-[#FF4D2E]/10 text-[#FF4D2E] border-[#FF4D2E]/20",
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    getJobs().then(setJobs);
  }, []);

  const copyApplyLink = (job: Job) => {
    if (job.status !== "active") {
      toast.error("Publish this job before sharing the apply link.");
      return;
    }
    const url = `${window.location.origin}${ROUTES.apply(job.slug)}`;
    navigator.clipboard.writeText(url);
    toast.success("Apply link copied to clipboard");
  };

  return (
    <>
      <header className="h-[72px] bg-white border-b border-[#E8E2D9] px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="font-display font-extrabold text-[#0F0F0F] text-xl">
            All Jobs
          </h1>
          <span className="px-3 py-1 bg-[#F5F0E8] rounded-full font-mono text-xs text-[#6B6560]">
            {jobs.length} total
          </span>
        </div>
        <LimeButton href={ROUTES.jobsNew}>+ Create New Job</LimeButton>
      </header>

      <div className="p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden overflow-x-auto"
        >
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_200px] gap-4 px-6 py-4 bg-[#FAFAF8] border-b border-[#E8E2D9] min-w-[860px]">
            <span className="font-display font-semibold text-xs text-[#6B6560] uppercase">
              Job Title
            </span>
            <span className="font-display font-semibold text-xs text-[#6B6560] uppercase">
              Location
            </span>
            <span className="font-display font-semibold text-xs text-[#6B6560] uppercase">
              Applicants
            </span>
            <span className="font-display font-semibold text-xs text-[#6B6560] uppercase">
              Posted
            </span>
            <span className="font-display font-semibold text-xs text-[#6B6560] uppercase">
              Status
            </span>
            <span className="font-display font-semibold text-xs text-[#6B6560] uppercase">
              Actions
            </span>
          </div>

          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_200px] gap-4 px-6 py-4 items-center border-b border-[#E8E2D9] last:border-b-0 hover:bg-[#FAFAF8] min-w-[860px]"
            >
              <div>
                <Link
                  href={ROUTES.dashboardForJob(job.id)}
                  className="font-display font-bold text-sm text-[#0F0F0F] hover:text-[#0057FF]"
                >
                  {job.title}
                </Link>
                <p className="font-body text-xs text-[#6B6560]">
                  {job.department ?? job.company}
                </p>
              </div>
              <span className="font-body text-sm">{job.location}</span>
              <span className="font-mono text-sm font-medium">
                {job.applicants}
              </span>
              <span className="font-body text-sm text-[#6B6560]">
                {job.postedAt ?? "—"}
              </span>
              <span
                className={`px-3 py-1 rounded-full border text-xs font-display font-semibold capitalize w-fit ${statusStyles[job.status]}`}
              >
                {job.status}
              </span>
              <div className="flex gap-2 flex-wrap">
                <Link
                  href={ROUTES.jobQuestions(job.id)}
                  className="px-3 py-1.5 text-xs font-body font-medium border border-[#E8E2D9] rounded-lg hover:bg-[#F5F0E8]"
                >
                  Questions
                </Link>
                <button
                  type="button"
                  onClick={() => copyApplyLink(job)}
                  disabled={job.status !== "active"}
                  title={
                    job.status !== "active"
                      ? "Publish the job to share an apply link"
                      : "Copy public apply link"
                  }
                  className="px-3 py-1.5 text-xs font-body font-medium border border-[#E8E2D9] rounded-lg hover:bg-[#C8F135] hover:border-[#C8F135] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  Copy link
                </button>
                {job.status === "active" ? (
                  <Link
                    href={ROUTES.apply(job.slug)}
                    target="_blank"
                    className="px-3 py-1.5 text-xs font-body font-medium text-[#0057FF] hover:underline"
                  >
                    Preview
                  </Link>
                ) : (
                  <span className="px-3 py-1.5 text-xs font-body text-[#6B6560]">
                    Draft
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </>
  );
}
