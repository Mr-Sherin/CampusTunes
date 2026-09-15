"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Download,
  CheckCircle2,
  X,
  Music2,
  Sparkles,
  Radio,
  HardDrive,
  Copy,
  Check,
  Loader2,
  WifiOff,
} from "lucide-react";
import Image from "next/image";
import { downloadSong, saveSongOffline, isSongOffline } from "@/utils/downloader";

const QUALITY_OPTIONS = [
  {
    id: "320kbps",
    label: "320 kbps (Studio MP3)",
    desc: "Highest audio fidelity & maximum bass definition",
    multiplier: 40, // KB per sec
    badge: "Ultra HD",
    isRecommended: true,
  },
  {
    id: "256kbps",
    label: "256 kbps (High Quality)",
    desc: "Optimal balance between sound clarity & file size",
    multiplier: 32,
    badge: "HQ",
  },
  {
    id: "128kbps",
    label: "128 kbps (Data Saver)",
    desc: "Fast download, lightweight for cellular data",
    multiplier: 16,
    badge: "Fast",
  },
  {
    id: "wav",
    label: "Lossless Master (WAV)",
    desc: "Uncompressed 44.1 kHz / 16-bit broadcast PCM",
    multiplier: 176.4,
    badge: "Lossless",
  },
];

export function DownloadModal({ song, isOpen, onClose }) {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState("320kbps");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isSavingOffline, setIsSavingOffline] = useState(false);
  const [isOfflineSaved, setIsOfflineSaved] = useState(false);
  const [hasCopiedLink, setHasCopiedLink] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (song?.id) {
      setIsOfflineSaved(isSongOffline(song.id));
      setIsDownloaded(false);
      setDownloadProgress(0);
      setIsDownloading(false);
    }
  }, [song?.id, isOpen]);

  if (!isOpen || !song || !isMounted) return null;

  const durationSec = song.duration || 180;
  const currentOpt = QUALITY_OPTIONS.find((q) => q.id === selectedQuality) || QUALITY_OPTIONS[0];
  const estimatedSizeMb = ((durationSec * currentOpt.multiplier) / 1024).toFixed(1);

  const handleStartDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadProgress(10);

    try {
      await downloadSong(song, {
        quality: selectedQuality,
        onProgress: (pct) => setDownloadProgress(pct),
      });
      setDownloadProgress(100);
      setIsDownloaded(true);
      setTimeout(() => {
        setIsDownloading(false);
      }, 1200);
    } catch (err) {
      console.error("Modal download failed:", err);
      setIsDownloading(false);
    }
  };

  const handleSaveOffline = async () => {
    if (isSavingOffline) return;
    setIsSavingOffline(true);
    try {
      const success = await saveSongOffline(song);
      if (success) {
        setIsOfflineSaved(true);
      }
    } finally {
      setIsSavingOffline(false);
    }
  };

  const handleCopyStreamLink = () => {
    const videoId = song.youtubeId || (song.id?.startsWith("yt_") ? song.id.replace("yt_", "") : "");
    const streamUrl = `${window.location.origin}/api/download?id=${videoId}&title=${encodeURIComponent(
      song.title
    )}&artist=${encodeURIComponent(song.artist)}`;

    navigator.clipboard.writeText(streamUrl);
    setHasCopiedLink(true);
    setTimeout(() => setHasCopiedLink(false), 2000);
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200 select-none">
      <div className="bg-[#0d0c1b] border border-white/20 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.95)] space-y-6 relative zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-white/15 bg-[#161528] shadow-lg">
              <Image
                src={song.coverUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80"}
                alt={song.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1">
                <Sparkles size={12} /> High-Res Audio Downloader
              </span>
              <h3 className="font-display font-bold text-lg text-white truncate max-w-[280px]">
                {song.title}
              </h3>
              <p className="text-xs text-on-surface-variant truncate max-w-[280px]">
                {song.artist} • {Math.floor(durationSec / 60)}:{(durationSec % 60).toString().padStart(2, "0")}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-on-surface-variant hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quality Tier Selector */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
              <Radio size={14} className="text-primary" /> Select Audio Format & Bitrate
            </label>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              Est. ~{estimatedSizeMb} MB
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {QUALITY_OPTIONS.map((opt) => {
              const isSelected = selectedQuality === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedQuality(opt.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-1 relative group ${
                    isSelected
                      ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(168,85,247,0.3)] text-white"
                      : "bg-white/[0.03] border-white/10 hover:border-white/20 text-white/70 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{opt.label}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        opt.isRecommended
                          ? "bg-secondary/20 text-secondary border border-secondary/30"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-tight">{opt.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Download Progress Bar (When Active) */}
        {isDownloading && (
          <div className="space-y-1.5 bg-black/40 p-3 rounded-2xl border border-primary/30 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-violet-300 flex items-center gap-1.5">
                <Loader2 size={13} className="animate-spin text-primary" />
                Downloading track stream...
              </span>
              <span className="font-mono text-primary">{downloadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 rounded-full"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Action Buttons */}
        <div className="space-y-3 pt-1">
          <button
            onClick={handleStartDownload}
            disabled={isDownloading}
            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl cursor-pointer ${
              isDownloaded
                ? "bg-emerald-600 text-white shadow-emerald-600/30"
                : "bg-gradient-to-r from-primary to-secondary hover:brightness-110 active:scale-[0.98] text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            }`}
          >
            {isDownloading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Downloading Audio ({downloadProgress}%)...</span>
              </>
            ) : isDownloaded ? (
              <>
                <CheckCircle2 size={18} />
                <span>Track Downloaded Successfully!</span>
              </>
            ) : (
              <>
                <Download size={18} />
                <span>Download {currentOpt.label} (~{estimatedSizeMb} MB)</span>
              </>
            )}
          </button>

          {/* Secondary Actions: Offline Cache & Direct Stream Copy */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleSaveOffline}
              disabled={isSavingOffline || isOfflineSaved}
              className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isOfflineSaved
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400"
                  : "bg-white/[0.04] border-white/10 hover:bg-white/10 text-white/80 hover:text-white"
              }`}
            >
              {isSavingOffline ? (
                <Loader2 size={14} className="animate-spin text-primary" />
              ) : isOfflineSaved ? (
                <Check size={14} />
              ) : (
                <WifiOff size={14} />
              )}
              <span>{isOfflineSaved ? "Saved for Offline" : "Save for Offline"}</span>
            </button>

            <button
              onClick={handleCopyStreamLink}
              className="py-2.5 px-3 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {hasCopiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{hasCopiedLink ? "Audio Link Copied!" : "Copy Direct Link"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
