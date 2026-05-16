"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EvasiveButtonProps {
  children: ReactNode;
  className?: string;
  shouldEvade: boolean;
  onAllowedClick: () => void;
  onBlockedAttempt: () => void;
}

export function EvasiveButton({
  children,
  className,
  shouldEvade,
  onAllowedClick,
  onBlockedAttempt,
}: EvasiveButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!shouldEvade) {
      setOffset({ x: 0, y: 0 });
    }
  }, [shouldEvade]);

  const evade = (event?: PointerEvent<HTMLButtonElement>) => {
    if (!shouldEvade) return;

    onBlockedAttempt();

    const rect = buttonRef.current?.getBoundingClientRect();
    const centerX = rect ? rect.left + rect.width / 2 : 0;
    const centerY = rect ? rect.top + rect.height / 2 : 0;
    const xDirection = event && rect
      ? event.clientX <= centerX
        ? 1
        : -1
      : Math.random() > 0.5
        ? 1
        : -1;
    const yDirection = event && rect
      ? event.clientY <= centerY
        ? 1
        : -1
      : Math.random() > 0.5
        ? 1
        : -1;

    setOffset({
      x: xDirection * (220 + Math.random() * 90),
      y: yDirection * (56 + Math.random() * 42),
    });
  };

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      animate={offset}
      transition={{ duration: 0.06, ease: "linear" }}
      onPointerEnter={evade}
      onPointerMove={evade}
      onPointerDown={(event) => {
        if (shouldEvade) {
          event.preventDefault();
          evade(event);
        }
      }}
      onClick={(event) => {
        if (shouldEvade) {
          event.preventDefault();
          evade();
          return;
        }
        onAllowedClick();
      }}
      className={cn(className, shouldEvade && "will-change-transform")}
    >
      {children}
    </motion.button>
  );
}
