import Image from "next/image";
import { cn } from "@/lib/utils";

const sizeMap = {
  xs: { px: 20, rounded: "rounded-sm" },
  sm: { px: 24, rounded: "rounded-sm" },
  md: { px: 36, rounded: "rounded-lg" },
  lg: { px: 40, rounded: "rounded-lg" },
} as const;

type LogoSize = keyof typeof sizeMap;

interface LogoProps {
  size?: LogoSize;
  className?: string;
  priority?: boolean;
}

export function Logo({ size = "sm", className, priority }: LogoProps) {
  const { px, rounded } = sizeMap[size];

  return (
    <Image
      src="/logo-square.png"
      alt="HireDoc AI"
      width={px}
      height={px}
      className={cn(rounded, "object-contain shrink-0", className)}
      priority={priority}
    />
  );
}
