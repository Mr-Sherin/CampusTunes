"use client";

import React, { useState } from "react";
import {
  X,
  Download,
  CheckCircle2,
  Loader2,
  Music2,
  FileAudio,
  Sparkles,
  ShieldCheck,
  Share2,
  Check,
  Disc,
} from "lucide-react";
import Image from "next/image";

export function DownloadModal({ isOpen, onClose, song }) {
  const [quality, setQuality] = useState("320");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");

  if (!isOpen || !song) return null;

  const cleanTitle = (song.title || "Track").trim();
  const cleanArtist = (song.artist || song.artist_name || "Campus Musician").trim();
  const filename = `${cleanArtist} - ${cleanTitle}.mp3`.replace(/[/\\?%*:|"<>]/g, "");

  const handleStartDownload = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);
    setProgressMsg("Connecting to studio audio stream...");

    try {
      const ytId =
        song.youtubeId ||
        (typeof song.id === "string" && song.id.startsWith("yt_")
          ? song.id.replace("yt_", "")
          : null);

      const targetAudioUrl = song.audioUrl || song.audio_url || null;

      // 1. Direct audio track (e.g. Supabase Campus upload)
      if (targetAudioUrl) {
        const params = new URLSearchParams({
          title: cleanTitle,
          artist: cleanArtist,
          audioUrl: targetAudioUrl,
        });

        const downloadEndpoint = `/api/download?${params.toString()}`;
        const a = document.createElement("a");
        a.href = downloadEndpoint;
        a.download = filename;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setIsDownloading(false);
        setDownloadSuccess(true);
        setProgressMsg("Downloaded to your device!");
        return;
      }

      // 2. YouTube audio track
      if (ytId) {
        setProgressMsg("Extracting studio audio bitstream...");
        let streamUrl = null;

        try {
          const checkRes = await fetch(
            `/api/download?title=${encodeURIComponent(cleanTitle)}&artist=${encodeURIComponent(cleanArtist)}&action=url&youtubeId=${encodeURIComponent(ytId)}`
          );
          if (checkRes.ok) {
            const checkData = await checkRes.json();
            if (checkData?.url) {
              streamUrl = checkData.url;
            }
          }
        } catch (checkErr) {
          console.warn("Direct stream extraction check:", checkErr);
        }

        if (streamUrl) {
          // Native Save As via stream proxy
          const params = new URLSearchParams({
            title: cleanTitle,
            artist: cleanArtist,
            audioUrl: streamUrl,
          });
          const downloadEndpoint = `/api/download?${params.toString()}`;
          const a = document.createElement("a");
          a.href = downloadEndpoint;
          a.download = filename;
          a.style.display = "none";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          setIsDownloading(false);
          setDownloadSuccess(true);
          setProgressMsg("Downloaded to your device!");
        } else {
          // Reliable converter portal fallback to avoid 404 "File wasn't available on site"
          const converterUrl = `https://loader.to/api/button/?url=https://www.youtube.com/watch?v=${ytId}&f=mp3`;
          window.open(converterUrl, "_blank", "noopener,noreferrer");

          setIsDownloading(false);
          setDownloadSuccess(true);
          setProgressMsg("Download stream opened!");
        }
        return;
      }

      throw new Error("No audio source available");
    } catch (err) {
      console.error("Modal download error:", err);
      setIsDownloading(false);
      setProgressMsg("Download failed. Please try again.");
    }
  };

  const handleCopyTrackLink = () => {
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/search?q=${encodeURIComponent(cleanTitle)}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#18162b] via-[#100e1f] to-[#090812] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-6 sm:p-7 text-white select-none overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Download size={16} />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white">Download Studio Track</h3>
              <p className="text-[11px] text-zinc-400">Save for offline campus listening</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Track Preview Card */}
        <div className="mt-5 p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-zinc-800 shadow-md">
            <Image
              src={
                song.coverUrl ||
                song.cover_url ||
                "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80"
              }
              alt={cleanTitle}
              fill
              className="object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-violet-300 uppercase tracking-widest bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20 mb-1">
              <Disc size={10} className="animate-spin text-violet-400" />
              {song.genre || "Campus Official"}
            </span>
            <h4 className="font-bold text-sm text-white truncate">{cleanTitle}</h4>
            <p className="text-xs text-zinc-400 truncate">{cleanArtist}</p>
          </div>
        </div>

        {/* Quality Selector */}
        <div className="mt-5 space-y-2">
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Audio Quality
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setQuality("320")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                quality === "320"
                  ? "bg-violet-600/20 border-violet-500/80 text-white shadow-sm shadow-violet-500/10"
                  : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">Studio HD</span>
                <span className="text-[10px] font-mono text-violet-300">320 kbps</span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">Full dynamic fidelity</p>
            </button>

            <button
              onClick={() => setQuality("192")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                quality === "192"
                  ? "bg-violet-600/20 border-violet-500/80 text-white shadow-sm shadow-violet-500/10"
                  : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">Standard</span>
                <span className="text-[10px] font-mono text-zinc-400">192 kbps</span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">Compact mobile size</p>
            </button>
          </div>
        </div>

        {/* Status Message */}
        {progressMsg && (
          <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5 text-xs">
            {isDownloading && <Loader2 size={15} className="animate-spin text-violet-400 shrink-0" />}
            {downloadSuccess && <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />}
            <span className={downloadSuccess ? "text-emerald-300 font-medium" : "text-zinc-300"}>
              {progressMsg}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            onClick={handleStartDownload}
            disabled={isDownloading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-600/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Downloading Track...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <CheckCircle2 size={16} className="text-emerald-300" />
                <span>Download Again</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Download MP3</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopyTrackLink}
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span>Track Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 size={14} />
                <span>Copy Track Share Link</span>
              </>
            )}
          </button>
        </div>

        {/* Security Badge */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-zinc-500">
          <ShieldCheck size={12} className="text-emerald-400" />
          <span>CampusTunes Verified Audio • DRM-Free for Student Use</span>
        </div>
      </div>
    </div>
  );
}
