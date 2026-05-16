"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Briefcase,
  ListChecks,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { getJobs } from "@/lib/api/jobs";
import type { Job } from "@/lib/types/job";
import { ROUTES } from "@/lib/constants/routes";
import { Logo } from "@/components/logo";

const navItems = [
  { icon: Briefcase, label: "All Jobs", path: "/jobs" },
  { icon: ListChecks, label: "Questions", path: "/jobs/questions" },
  { icon: Users, label: "Candidates", path: "/dashboard" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { recruiter, signOut } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);

  const jobId = searchParams.get("jobId") || jobs[0]?.id || "";

  useEffect(() => {
    getJobs().then(setJobs);
  }, []);

  const hrefWithJob = (path: string) => {
    if (
      path === "/jobs" ||
      path === "/jobs/questions" ||
      path === "/dashboard/settings"
    ) {
      return path === "/jobs/questions" && jobId
        ? `${path}?jobId=${jobId}`
        : path;
    }
    return `${path}?jobId=${jobId}`;
  };

  const handleSignOut = async () => {
    await signOut();
    router.push(ROUTES.home);
    onNavigate?.();
  };

  const displayName =
    recruiter?.full_name?.trim() ||
    recruiter?.organization_name?.trim() ||
    recruiter?.email?.split("@")[0] ||
    "Recruiter";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.aside
      initial={{ x: -248, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-[248px] h-screen bg-white border-r border-[rgba(15,15,15,0.10)] flex flex-col shrink-0 md:fixed left-0 top-0 z-20"
    >
      <div className="p-5">
        <Link href="/" className="flex items-center gap-3" onClick={onNavigate}>
          <div className="w-9 h-9 bg-[#C8F135] rounded-lg flex items-center justify-center">
            <span className="font-display font-bold text-[#0F0F0F] text-sm">
              H
            </span>
          </div>
          <span className="font-display font-bold text-[#0F0F0F] text-base">
          <Logo size="lg" />
          <span className="font-display font-bold text-[#0F0F0F] text-lg">
            HireDoc AI
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4">
        {navItems.map((item, index) => {
          const href = hrefWithJob(item.path);
          const isActive =
            pathname === item.path ||
            (item.path === "/dashboard" &&
              pathname === "/dashboard") ||
            (item.path === "/jobs" &&
              pathname.startsWith("/jobs") &&
              pathname !== "/jobs/questions") ||
            (item.path === "/jobs/questions" &&
              pathname === "/jobs/questions") ||
            (item.path === "/dashboard/settings" &&
              pathname === "/dashboard/settings");

          return (
            <motion.div
              key={item.label}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                delay: 0.1 + index * 0.05,
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Link
                href={href}
                onClick={onNavigate}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-1 transition-all ${
                  isActive
                    ? "bg-[#C8F135] text-[#0F0F0F]"
                    : "text-[#6B6560] hover:bg-[#F6F7F9] hover:text-[#0F0F0F]"
                }`}
              >
                <item.icon
                  className={`w-4 h-4 ${isActive ? "text-[#0F0F0F]" : ""}`}
                />
                <span className="font-body text-[13px] font-medium">
                  {item.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="px-4 pb-4">
        <Link
          href={ROUTES.jobsNew}
          onClick={onNavigate}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#C8F135] rounded-lg font-display font-semibold text-[13px] text-[#0F0F0F] hover:scale-[1.02] transition-transform"
        >
          <span className="text-base">+</span>
          Create New Job
        </Link>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full bg-[#0057FF] flex items-center justify-center">
            <span className="font-body text-white text-sm font-semibold">
              {initials}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-[#0F0F0F] text-sm font-medium truncate">
              {displayName}
            </p>
            <button
              type="button"
              onClick={handleSignOut}
              className="font-body text-[#6B6560] text-xs hover:text-[#FF4D2E] transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

export { Sidebar as DashboardSidebar };
