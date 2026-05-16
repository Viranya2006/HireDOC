import { cn } from "@/lib/utils";

interface JobDescriptionProps {
  description: string;
  className?: string;
}

/**
 * Renders a job description with the same line breaks and spacing as entered
 * in the recruiter textarea (plain text; HTML is not interpreted).
 */
export function JobDescription({ description, className }: JobDescriptionProps) {
  return (
    <div
      className={cn(
        "font-body text-sm text-[#6B6560] leading-relaxed whitespace-pre-wrap break-words",
        className,
      )}
    >
      {description}
    </div>
  );
}
