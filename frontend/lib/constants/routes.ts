export const ROUTES = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  jobs: "/jobs",
  jobsNew: "/jobs/new",
  jobQuestions: (jobId?: string) =>
    jobId ? `/jobs/questions?jobId=${jobId}` : "/jobs/questions",
  settings: "/dashboard/settings",
  apply: (slug: string) => `/apply/${slug}`,
  candidate: (jobId: string, id: string) =>
    `/dashboard/candidates/${id}?jobId=${jobId}`,
  dashboardForJob: (jobId: string) => `/dashboard?jobId=${jobId}`,
} as const;
