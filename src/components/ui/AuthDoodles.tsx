import React from "react";
import { Music, Disc, Sparkles, Radio, Mic, Heart } from "lucide-react";

export function AuthDoodles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
      <Music className="absolute top-10 left-10 text-primary animate-pulse" size={40} />
      <Disc className="absolute top-1/4 right-16 text-cyan-400 animate-spin" style={{ animationDuration: "10s" }} size={48} />
      <Sparkles className="absolute bottom-20 left-16 text-secondary" size={32} />
      <Radio className="absolute bottom-1/3 right-10 text-violet-400" size={36} />
      <Mic className="absolute top-1/2 left-8 text-pink-400" size={28} />
      <Heart className="absolute top-16 right-1/3 text-pink-500" size={30} />
    </div>
  );
}
