import React from "react";
import Link from "next/link";
import { Headphones } from "lucide-react";

interface CampusLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function CampusLogo({ size = "md", showText = true }: CampusLogoProps) {
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

  return (
    <Link href="/" className="inline-flex items-center gap-2.5 group select-none">
      <div
        className={`${boxSizes[size]} bg-gradient-to-tr from-violet-600 via-primary to-cyan-400 p-0.5 shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all`}
      >
        <div className="w-full h-full bg-[#0c0a18] rounded-[inherit] flex items-center justify-center text-white">
          <Headphones size={iconSizes[size]} className="text-violet-300 group-hover:scale-110 transition-transform" />
        </div>
      </div>
      {showText && (
        <span className={`font-display font-black tracking-tight text-white ${textSizes[size]}`}>
          Campus<span className="text-primary">Tunes</span>
        </span>
      )}
    </Link>
  );
}
