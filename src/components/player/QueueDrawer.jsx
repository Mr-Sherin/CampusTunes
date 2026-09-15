"use client";

import React from "react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { X, Play, Pause, Music, Trash2, ListMusic } from "lucide-react";
import Image from "next/image";

export function QueueDrawer() {
  const {
    queue,
    currentSong,
    isPlaying,
    setCurrentSong,
    setIsPlaying,
    isQueueOpen,
    setIsQueueOpen,
    setQueue,
  } = usePlayerStore();

  if (!isQueueOpen) return null;

  const handlePlaySong = (song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const handleRemoveFromQueue = (e, songId) => {
    e.stopPropagation();
    setQueue(queue.filter((s) => s.id !== songId));
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998] flex justify-end animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md bg-[#0b0a16] border-l border-white/15 h-full flex flex-col p-6 shadow-2xl space-y-5 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <ListMusic size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Play Queue</h3>
              <p className="text-[11px] text-on-surface-variant">{queue.length} tracks in queue</p>
            </div>
          </div>

          <button
            onClick={() => setIsQueueOpen(false)}
            className="p-1.5 rounded-full text-on-surface-variant hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Queue List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 [scrollbar-width:none]">
          {queue.length > 0 ? (
            queue.map((song, idx) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <div
                  key={`${song.id}_${idx}`}
                  onClick={() => handlePlaySong(song)}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer group ${
                    isCurrent
                      ? "bg-violet-950/50 border border-violet-500/30 text-white"
                      : "hover:bg-white/[0.05] text-white/80 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-4 text-center text-xs font-mono text-on-surface-variant group-hover:text-primary">
                      {idx + 1}
                    </span>
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-[#161528]">
                      <Image src={song.coverUrl} alt={song.title} fill className="object-cover" sizes="40px" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${isCurrent ? "text-primary" : "text-white"}`}>
                        {song.title}
                      </p>
                      <p className="text-[11px] text-on-surface-variant truncate">{song.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-on-surface-variant">
                      {formatDuration(song.duration)}
                    </span>
                    <button
                      onClick={(e) => handleRemoveFromQueue(e, song.id)}
                      className="p-1.5 text-on-surface-variant hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Remove from queue"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 text-on-surface-variant space-y-2">
              <Music size={32} className="text-white/20 mx-auto" />
              <p className="text-xs font-bold text-white">Queue is empty</p>
              <p className="text-[11px]">Play a track or playlist to add songs here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
