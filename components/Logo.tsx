"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  showText?: boolean;
}

export function Logo({
  className,
  iconClassName,
  showText = false,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3 group select-none", className)}>
      <div
        className={cn(
          "relative h-9 w-9  rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 overflow-hidden",
          iconClassName
        )}
      >
        {/* Abstract "P" + Calendar Grid SVG */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
        >
          {/* Calendar Grid Background Effect */}
          <rect
            x="5"
            y="6"
            width="14"
            height="13"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.3"
          />
          <path
            d="M5 10H19"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.3"
          />
          <path
            d="M9 6V19"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.3"
          />
          <path
            d="M14 6V19"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.3"
          />

          {/* Bold "P" shape with a priority accent */}
          <path
            d="M7 19V5H14C16.2091 5 18 6.79086 18 9C18 11.2091 16.2091 13 14 13H7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Subtle Priority Dot */}
          <circle
            cx="14"
            cy="9"
            r="1.5"
            fill="currentColor"
            className="animate-pulse"
          />
        </svg>

        {/* Gloss Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
      </div>

      {showText && (
        <span className="font-black text-2xl tracking-tighter text-foreground group-hover:text-primary transition-colors">
          Prioritize
        </span>
      )}
    </div>
  );
}
