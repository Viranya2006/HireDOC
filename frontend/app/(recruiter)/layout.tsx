import type { Metadata } from "next";
import { RecruiterShell } from "@/components/recruiter-shell";

export const metadata: Metadata = {
  title: "HireDoc AI — Recruiter",
  description: "AI-powered hiring workspace for recruiters",
};

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RecruiterShell>{children}</RecruiterShell>;
}
