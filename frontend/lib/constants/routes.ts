export const ROUTES = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  jobs: "/jobs",
  jobsNew: "/jobs/new",
  settings: "/dashboard/settings",
  apply: (slug: string) => `/apply/${slug}`,
  candidate: (id: string) => `/dashboard/candidates/${id}`,
  dashboardForJob: (jobId: string) => `/dashboard?jobId=${jobId}`,
} as const;
