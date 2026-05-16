"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Briefcase, CheckCircle2, Clock, Users } from "lucide-react";
import { getJobs } from "@/lib/api/jobs";
import type { Job } from "@/lib/types/job";
import { ROUTES } from "@/lib/constants/routes";
import { LimeButton } from "@/components/lime-button";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  active: "bg-[#00C896]/10 text-[#00C896] border-[#00C896]/20",
  draft: "bg-[#F6F7F9] text-[#6B6560] border-[#E8E2D9]",
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

  const activeJobs = jobs.filter((job) => job.status === "active").length;
  const draftJobs = jobs.filter((job) => job.status === "draft").length;
  const totalApplicants = jobs.reduce((total, job) => total + job.applicants, 0);
  const totalQuestions = jobs.reduce(
    (total, job) => total + job.questionCount,
    0,
  );
  const stats = [
    { label: "Total jobs", value: jobs.length, icon: Briefcase },
    { label: "Active", value: activeJobs, icon: CheckCircle2 },
    { label: "Drafts", value: draftJobs, icon: Clock },
    { label: "Applicants", value: totalApplicants, icon: Users },
  ];

  return (
    <>
      <header className="h-16 bg-white border-b border-[#E8E2D9] px-4 md:px-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <h1 className="font-display font-extrabold text-[#0F0F0F] text-lg">
            All Jobs
          </h1>
          <span className="px-2.5 py-1 bg-[#F6F7F9] rounded-full font-mono text-xs text-[#6B6560]">
            {jobs.length} total
          </span>
        </div>
        <LimeButton href={ROUTES.jobsNew}>+ Create New Job</LimeButton>
      </header>

      <div className="p-4 md:p-5">
        <div className="grid gap-3 md:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="bg-white rounded-xl border border-[#E8E2D9] p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs font-semibold uppercase tracking-wide text-[#6B6560]">
                    {stat.label}
                  </span>
                  <Icon className="w-4 h-4 text-[#5B7A12]" />
                </div>
                <p className="mt-2 font-data text-2xl font-bold text-[#0F0F0F]">
                  {stat.value}
                </p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job, index) => (
            <motion.article
              key={job.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + index * 0.04 }}
              className="bg-white rounded-xl border border-[#E8E2D9] p-5 flex flex-col gap-4 hover:border-[#D8D0C4] hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={ROUTES.dashboardForJob(job.id)}
                    className="font-display font-bold text-base text-[#0F0F0F] hover:text-[#5B7A12]"
                  >
                    {job.title}
                  </Link>
                  <p className="font-body text-xs text-[#6B6560] mt-1">
                    {job.department ?? job.company}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full border text-[11px] font-display font-semibold capitalize shrink-0 ${statusStyles[job.status]}`}
                >
                  {job.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-[#FAFAF8] p-3">
                  <p className="font-body text-[11px] uppercase text-[#6B6560]">
                    Applicants
                  </p>
                  <p className="font-data font-semibold text-[#0F0F0F]">
                    {job.applicants}
                  </p>
                </div>
                <div className="rounded-lg bg-[#FAFAF8] p-3">
                  <p className="font-body text-[11px] uppercase text-[#6B6560]">
                    Questions
                  </p>
                  <p className="font-data font-semibold text-[#0F0F0F]">
                    {job.questionCount}
                  </p>
                </div>
              </div>

              <div className="font-body text-xs text-[#6B6560] space-y-1">
                <p>{job.location}</p>
                <p>{job.postedAt ? `Posted ${job.postedAt}` : "Not posted yet"}</p>
              </div>

              <div className="mt-auto flex flex-wrap gap-2">
                <Link
                  href={ROUTES.dashboardForJob(job.id)}
                  className="px-3 py-1.5 text-xs font-body font-medium bg-[#EEF7D3] rounded-lg hover:bg-[#E2F0B8]"
                >
                  Candidates
                </Link>
                <Link
                  href={ROUTES.jobQuestions(job.id)}
                  className="px-3 py-1.5 text-xs font-body font-medium border border-[#E8E2D9] rounded-lg hover:bg-[#F6F7F9]"
                >
                  Questions
                </Link>
                <button
                  type="button"
                  onClick={() => copyApplyLink(job)}
                  disabled={job.status !== "active"}
                  className="px-3 py-1.5 text-xs font-body font-medium border border-[#E8E2D9] rounded-lg hover:bg-[#C8F135] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  Copy link
                </button>
                {job.status === "active" && (
                  <Link
                    href={ROUTES.apply(job.slug)}
                    target="_blank"
                    className="px-3 py-1.5 text-xs font-body font-medium text-[#0057FF] hover:underline"
                  >
                    Preview
                  </Link>
                )}
              </div>
            </motion.article>
          ))}
        </div>

        {jobs.length > 0 && (
          <p className="mt-4 font-body text-xs text-[#6B6560]">
            {totalQuestions} screening questions across {jobs.length} jobs.
          </p>
        )}
      </div>
    </>
  );
}
