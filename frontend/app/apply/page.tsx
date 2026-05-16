import Link from "next/link";

export default function ApplyIndexPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col items-center justify-center gap-4 p-8 text-center max-w-md mx-auto">
      <h1 className="font-display font-bold text-2xl">Application link required</h1>
      <p className="font-body text-[#6B6560]">
        Open the full apply URL from the recruiter, for example{" "}
        <span className="font-mono text-sm">/apply/your-job-slug</span>.
      </p>
      <Link href="/" className="text-[#0057FF] hover:underline">
        Back to home
      </Link>
    </div>
  );
}
