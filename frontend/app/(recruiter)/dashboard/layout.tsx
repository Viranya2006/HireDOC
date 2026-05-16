import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recruiter Dashboard | HireDoc AI",
  description: "AI-powered candidate screening and ranking dashboard for recruiters",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
