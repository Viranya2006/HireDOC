export default function RecruiterLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh] p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#C8F135] border-t-transparent rounded-full animate-spin" />
        <p className="font-body text-sm text-[#6B6560]">Loading…</p>
      </div>
    </div>
  );
}
