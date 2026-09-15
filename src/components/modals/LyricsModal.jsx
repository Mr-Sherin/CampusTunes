"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Mic2, Copy, Check, Loader2 } from "lucide-react";
import Image from "next/image";
import { usePlayerStore } from "@/store/usePlayerStore";

export function LyricsModal({ isOpen, onClose, song }) {
  const [copied, setCopied] = useState(false);
  const [lyricsData, setLyricsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const activeLineRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const { currentTime, duration, setSeekCommand, setPlaybackTime } = usePlayerStore();

  const ytId =
    song?.youtubeId ||
    (typeof song?.id === "string" && song.id.startsWith("yt_")
      ? song.id.replace("yt_", "")
      : "");

  useEffect(() => {
    if (!isOpen || !song) return;

    let isMounted = true;
    setLoading(true);
    setLyricsData(null);

    const params = new URLSearchParams({
      title: song.title || "",
      artist: song.artist || "",
      ...(ytId ? { youtubeId: ytId } : {}),
      ...(duration ? { duration: String(duration) } : {}),
    });

    fetch(`/api/lyrics?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setLyricsData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Lyrics load error:", err);
        if (isMounted) {
          setLyricsData({ found: false });
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, song?.id, song?.title, song?.artist, ytId, duration]);

  // Find active line index based on live currentTime
  const syncedLines = lyricsData?.syncedLines || [];
  const isSynced = Boolean(lyricsData?.isSynced && syncedLines.length > 0);

  let activeIndex = -1;
  if (isSynced) {
    for (let i = syncedLines.length - 1; i >= 0; i--) {
      if (currentTime >= syncedLines[i].time) {
        activeIndex = i;
        break;
      }
    }
  }

  // Smooth auto-scroll following the active line
  useEffect(() => {
    if (activeLineRef.current && isSynced) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeIndex, isSynced]);

  if (!isOpen || !song) return null;

  const handleCopy = () => {
    if (!lyricsData?.lines || lyricsData.lines.length === 0) return;
    const fullText = lyricsData.fullText || lyricsData.lines.join("\n");
    navigator.clipboard.writeText(`${song.title} - ${song.artist}\n\n${fullText}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLineClick = (time) => {
    if (typeof time === "number") {
      setSeekCommand(time);
      setPlaybackTime(time);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-[9999] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 select-none">
      {/* Clean Immersive Lyrics Window */}
      <div className="bg-[#0f0f14]/98 border border-white/[0.08] rounded-3xl max-w-2xl w-full h-[88vh] max-h-[720px] flex flex-col shadow-[0_30px_100px_rgba(0,0,0,0.95)] relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[120px] pointer-events-none" />

        {/* Top Header */}
        <div className="p-5 sm:px-8 border-b border-white/[0.06] flex items-center justify-between relative z-10 bg-[#0f0f14]/90 backdrop-blur-md">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-lg bg-[#18181f]">
              <Image
                src={song.coverUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80"}
                alt={song.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-base text-white truncate">
                {song.title}
              </h3>
              <p className="text-xs text-on-surface-variant truncate">
                {song.artist}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {lyricsData?.found && (
              <button
                onClick={handleCopy}
                className="p-2.5 rounded-full text-on-surface-variant hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Copy lyrics"
              >
                {copied ? <Check size={17} className="text-emerald-400" /> : <Copy size={17} />}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2.5 rounded-full text-on-surface-variant hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Lyrics Flow Container with Top & Bottom Fade Masks */}
        <div className="relative flex-1 overflow-hidden">
          {/* Top Gradient Fade */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#0f0f14] to-transparent z-10 pointer-events-none" />

          {/* Scrollable Lyrics Stream */}
          <div
            ref={scrollContainerRef}
            className="h-full overflow-y-auto px-6 sm:px-10 py-12 space-y-6 [scrollbar-width:none] scroll-smooth"
          >
            {loading ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center gap-3 text-on-surface-variant">
                <Loader2 size={32} className="animate-spin text-primary" />
                <p className="text-sm font-medium">Loading lyrics...</p>
              </div>
            ) : isSynced ? (
              syncedLines.map((line, index) => {
                const isActive = index === activeIndex;
                const isPast = index < activeIndex;

                return (
                  <div
                    key={index}
                    ref={isActive ? activeLineRef : null}
                    onClick={() => handleLineClick(line.time)}
                    className="cursor-pointer transition-all duration-200 py-1 text-left group"
                  >
                    <p
                      className={`font-display font-extrabold tracking-tight transition-all duration-200 leading-snug ${
                        isActive
                          ? "text-2xl sm:text-3xl text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.45)] scale-[1.01] origin-left"
                          : isPast
                          ? "text-lg sm:text-2xl text-white/45 group-hover:text-white/80"
                          : "text-lg sm:text-2xl text-white/20 group-hover:text-white/60"
                      }`}
                    >
                      {line.text}
                    </p>
                  </div>
                );
              })
            ) : lyricsData?.found && lyricsData.lines?.length > 0 ? (
              lyricsData.lines.map((line, index) => (
                <div key={index} className="py-1 text-left">
                  <p className="font-display font-bold text-lg sm:text-2xl text-white/85 leading-snug">
                    {line}
                  </p>
                </div>
              ))
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center gap-2 text-on-surface-variant">
                <Mic2 size={36} className="text-white/20 mb-2" />
                <p className="text-lg font-bold text-white">No lyrics available</p>
                <p className="text-xs text-on-surface-variant max-w-xs text-center">
                  We couldn't find lyrics for "{song.title}".
                </p>
              </div>
            )}
          </div>

          {/* Bottom Gradient Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0f0f14] to-transparent z-10 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
