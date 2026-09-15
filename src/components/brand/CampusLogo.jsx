import React from "react";
import Link from "next/link";
import { Headphones } from "lucide-react";

export function CampusLogo({ size = "md", showText = true }) {
  const iconSizes = {
    sm: 18,
    md: 22,
    lg: 30,
  };

  const boxSizes = {
    sm: "w-8 h-8 rounded-lg",
    md: "w-10 h-10 rounded-xl",
    lg: "w-14 h-14 rounded-2xl",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  const resolvedBox = boxSizes[size] || boxSizes.md;
  const resolvedIcon = iconSizes[size] || iconSizes.md;
  const resolvedText = textSizes[size] || textSizes.md;

  return (
    <Link href="/" className="inline-flex items-center gap-2.5 group select-none">
      <div
        className={`${resolvedBox} bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-[0_2px_12px_rgba(124,58,237,0.4)] group-hover:scale-105 transition-transform`}
      >
        <Headphones size={resolvedIcon} className="text-white stroke-[2.2]" />
      </div>
      {showText && (
        <span className={`font-bold tracking-tight text-white ${resolvedText}`}>
          Campus<span className="text-violet-400">Tunes</span>
        </span>
      )}
    </Link>
  );
}
