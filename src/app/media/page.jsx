"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Music, ArrowLeft, Disc, Volume2, ShieldCheck, Download, ExternalLink } from "lucide-react";
import Link from "next/link";

function MediaStreamPlayer() {
  const searchParams = useSearchParams();
  const title = searchParams.get("title") || "Campus Audio Track";
  const artist = searchParams.get("artist") || "Campus Musician";
  const coverUrl = searchParams.get("cover") || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80";
  const audioUrlParam = searchParams.get("audioUrl") || searchParams.get("url");
  const youtubeId = searchParams.get("youtubeId") || searchParams.get("ytId");

  const [streamSrc, setStreamSrc] = useState(audioUrlParam || "");
  const [loading, setLoading] = useState(!audioUrlParam && !!youtubeId);
  const [error, setError] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // If direct audio URL provided
    if (audioUrlParam) {
      setStreamSrc(audioUrlParam);
      setLoading(false);
      return;
    }

    // If YouTube ID provided, fetch stream source
    if (youtubeId) {
      setLoading(true);
      fetch(`/api/download?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}&action=url&youtubeId=${encodeURIComponent(youtubeId)}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Stream extraction failed");
        })
        .then((data) => {
          if (data?.url) {
            setStreamSrc(data.url);
          } else {
            throw new Error("No URL found");
          }
        })
        .catch((err) => {
          console.warn("Direct stream note:", err);
          setError(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [audioUrlParam, youtubeId, title, artist]);

  const cleanFilename = `${artist} - ${title}.mp3`.replace(/[/\\?%*:|"<>]/g, "");

  const handleDirectDownload = () => {
    const params = new URLSearchParams({
      title,
      artist,
      mode: "attachment",
    });
    if (audioUrlParam) params.set("audioUrl", audioUrlParam);
    if (youtubeId) params.set("youtubeId", youtubeId);

    const a = document.createElement("a");
    a.href = `/api/download?${params.toString()}`;
    a.download = cleanFilename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const streamEndpoint = streamSrc || `/api/download?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}&mode=inline${youtubeId ? `&youtubeId=${encodeURIComponent(youtubeId)}` : ""}${audioUrlParam ? `&audioUrl=${encodeURIComponent(audioUrlParam)}` : ""}`;

  return (
    <div className="min-h-screen bg-[#07060e] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft size={18} />
          <span>Back to CampusTunes</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-zinc-400 font-mono">Media Player Stream</span>
        </div>
      </header>

      {/* Main Player Card */}
      <main className="w-full max-w-lg bg-[#110f1e]/90 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.8)] relative z-10 flex flex-col items-center text-center">
        {/* Album Artwork */}
        <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-2xl border border-white/10 mb-6 group bg-zinc-900">
          <Image
            src={coverUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white/90">
            <span className="text-[10px] font-bold tracking-wider uppercase bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md">
              Campus HD Audio
            </span>
          </div>
        </div>

        {/* Track Info */}
        <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight mb-1 max-w-full truncate">
          {title}
        </h1>
        <p className="text-sm text-zinc-400 font-medium mb-6">{artist}</p>

        {/* Instructions banner for 3-dots download */}
        <div className="w-full bg-violet-600/10 border border-violet-500/20 rounded-xl p-3 mb-5 flex items-center gap-3 text-left">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0 text-violet-400">
            <Download size={16} />
          </div>
          <div className="text-xs text-zinc-300">
            <p className="font-semibold text-white">Save to Downloads Folder:</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Click the <strong className="text-violet-300">three dots (⋮)</strong> on the audio player or use the button below to download <strong className="text-white">{cleanFilename}</strong>.
            </p>
          </div>
        </div>

        {/* Native Browser HTML5 Audio Player with 3-dots */}
        <div className="w-full flex flex-col items-center gap-3">
          <audio
            ref={audioRef}
            controls
            autoPlay
            src={streamEndpoint}
            className="w-full h-12 rounded-xl bg-zinc-800 outline-none accent-violet-500 shadow-lg"
          >
            Your browser does not support the audio element.
          </audio>

          {/* Quick Direct Download Button */}
          <button
            onClick={handleDirectDownload}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-600/25 transition-all cursor-pointer"
          >
            <Download size={16} />
            <span>Download {cleanFilename}</span>
          </button>
        </div>

        {/* Fallback helper only if stream portal needed */}
        {youtubeId && (
          <div className="mt-4 flex items-center justify-center">
            <a
              href={`https://loader.to/api/button/?url=https://www.youtube.com/watch?v=${youtubeId}&f=mp3`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 hover:underline transition-colors"
            >
              <span>Having trouble? Open audio download gateway</span>
              <ExternalLink size={12} />
            </a>
          </div>
        )}

        {/* Verified Badge */}
        <div className="mt-6 pt-4 border-t border-white/5 w-full flex items-center justify-center gap-2 text-[11px] text-zinc-500">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>CampusTunes Native Audio Delivery • Saved to Downloads</span>
        </div>
      </main>
    </div>
  );
}

export default function MediaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07060e] flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MediaStreamPlayer />
    </Suspense>
  );
}
