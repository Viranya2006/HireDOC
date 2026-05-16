import Link from "next/link";
import { cn } from "@/lib/utils";

interface LimeButtonProps {
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  children: React.ReactNode;
  className?: string;
  variant?: "lime" | "dark";
  disabled?: boolean;
}

export function LimeButton({
  href,
  onClick,
  type = "button",
  children,
  className,
  variant = "lime",
  disabled,
}: LimeButtonProps) {
  const base =
    "inline-flex items-center justify-center px-6 py-3 font-display font-semibold text-sm rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

  const styles =
    variant === "lime"
      ? "bg-[#C8F135] text-[#0F0F0F] hover:shadow-[0_8px_32px_rgba(200,241,53,0.4)]"
      : "bg-[#0F0F0F] text-[#C8F135] hover:bg-[#1a1a1a]";

  const classes = cn(base, styles, className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
