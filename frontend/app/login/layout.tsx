import Link from "next/link";
import { Suspense } from "react";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F6F7F9] flex flex-col">
      <nav className="h-16 border-b border-[rgba(15,15,15,0.10)] px-6 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#C8F135] rounded-sm" />
          <span className="font-display font-bold text-lg">HireDoc AI</span>
        </Link>
      </nav>
      <main className="flex-1 flex items-center justify-center p-6">
        <Suspense
          fallback={
            <p className="font-body text-[#6B6560]">Loading…</p>
          }
        >
          {children}
        </Suspense>
      </main>
    </div>
  );
}
