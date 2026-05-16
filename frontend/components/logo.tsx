import Image from "next/image";
import { cn } from "@/lib/utils";

const sizeMap = {
  xs: 20,
  sm: 24,
  md: 36,
  lg: 40,
} as const;

type LogoSize = keyof typeof sizeMap;

interface LogoProps {
  size?: LogoSize;
  className?: string;
  priority?: boolean;
}

export function Logo({ size = "sm", className, priority }: LogoProps) {
  const px = sizeMap[size];

  return (
    <Image
      src="/icon.png"
      alt="HireDoc AI"
      width={px}
      height={px}
      className={cn("shrink-0 object-contain", className)}
      priority={priority}
    />
  );
}
