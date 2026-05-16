import { Suspense } from "react";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
          <p className="font-body text-[#6B6560]">Loading…</p>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
