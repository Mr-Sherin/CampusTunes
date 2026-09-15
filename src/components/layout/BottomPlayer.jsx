"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Heart,
  ListPlus,
  Mic2,
  ListMusic,
  Download,
  CheckCircle2,
  Loader2,
  PanelRightOpen,
  PanelRightClose,
} from "lucide-react";
import Image from "next/image";
import { QueueDrawer } from "@/components/player/QueueDrawer";
import { AddToPlaylistModal } from "@/components/modals/AddToPlaylistModal";
import { LyricsModal } from "@/components/modals/LyricsModal";
import { DownloadModal } from "@/components/modals/DownloadModal";
import { downloadTrack } from "@/utils/downloader";
import { useAuthModalStore } from "@/store/useAuthModalStore";
import { createClient } from "@/utils/supabase/client";
import YouTube from "react-youtube";

export function BottomPlayer() {
  const audioRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const [isYtReady, setIsYtReady] = useState(false);

  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    seekCommand,
    repeatMode,
    isShuffle,
    likedSongIds,
    setIsPlaying,
    setPlaybackTime,
    setVolume,
    toggleMute,
    setSeekCommand,
    playNext,
    playPrevious,
    toggleShuffle,
    toggleRepeatMode,
    toggleLikeSong,
    isQueueOpen,
    setIsQueueOpen,
    isRightPanelOpen,
    toggleRightPanel,
  } = usePlayerStore();
  const { openAuthModal } = useAuthModalStore();

  const supabase = createClient();
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState(null);

  const directAudioUrl = currentSong?.audioUrl || currentSong?.audio_url;
  const isYouTube = Boolean(
    (!directAudioUrl && currentSong?.youtubeId) ||
    (currentSong?.source === "youtube" && !directAudioUrl)
  );

  const handleLikeClick = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      openAuthModal("save tracks to your Liked Songs collection");
      return;
    }
    if (currentSong) {
      toggleLikeSong(currentSong);
    }
  };

  const handlePlaylistClick = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      openAuthModal("add tracks to student playlists");
      return;
    }
    setShowPlaylistModal(true);
  };

  const handleDownload = () => {
    if (!currentSong) return;
    if (currentSong.download_enabled === false) {
      setDownloadStatus({ status: "error", message: "Downloads are disabled for this track." });
      setTimeout(() => setDownloadStatus(null), 3000);
      return;
    }
    downloadTrack(currentSong);
  };

  // Record real play event when listening threshold is reached (anti-spam)
  const playedThresholdRef = useRef(new Set());

  useEffect(() => {
    if (!currentSong?.id) return;
    if (currentTime >= 20 || (duration > 0 && currentTime >= duration * 0.3)) {
      if (!playedThresholdRef.current.has(currentSong.id)) {
        playedThresholdRef.current.add(currentSong.id);
        fetch("/api/plays", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ songId: currentSong.id }),
        }).catch((err) => console.error("Play record error:", err));
      }
    }
  }, [currentTime, duration, currentSong?.id]);

  // Synchronize Play / Pause across both HTML5 Audio and YouTube engines
  useEffect(() => {
    if (isPlaying) {
      if (isYouTube) {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === "function") {
          try {
            ytPlayerRef.current.playVideo();
          } catch (e) {
            console.warn("YouTube play error:", e);
          }
        }
      } else if (audioRef.current && directAudioUrl) {
        const p = audioRef.current.play();
        if (p !== undefined) {
          p.catch((err) => console.warn("Audio autoplay blocked:", err));
        }
      }
    } else {
      // Unconditional immediate pause on BOTH engines
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch (e) {}
      }
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === "function") {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch (e) {}
      }
    }
  }, [isPlaying, isYouTube, directAudioUrl, isYtReady, currentSong?.id, currentSong?.youtubeId]);

  // Synchronize Volume & Mute Commands across both engines
  useEffect(() => {
    if (audioRef.current && !isYouTube) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    if (ytPlayerRef.current && isYouTube) {
      try {
        if (isMuted) {
          if (typeof ytPlayerRef.current.mute === "function") ytPlayerRef.current.mute();
        } else {
          if (typeof ytPlayerRef.current.unMute === "function") ytPlayerRef.current.unMute();
          if (typeof ytPlayerRef.current.setVolume === "function") {
            ytPlayerRef.current.setVolume(Math.round(volume * 100));
          }
        }
      } catch (e) {}
    }
  }, [volume, isMuted, isYouTube, isYtReady]);

  // Timer Ticker for YouTube Player Time & Progress
  useEffect(() => {
    if (!isYouTube || !isPlaying || !isYtReady) return;

    const interval = setInterval(() => {
      if (ytPlayerRef.current) {
        try {
          const cur = ytPlayerRef.current.getCurrentTime() || 0;
          const dur = ytPlayerRef.current.getDuration() || duration || 0;
          setPlaybackTime(cur, dur > 0 ? dur : duration);
        } catch {}
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isYouTube, isPlaying, isYtReady, duration, setPlaybackTime]);

  const handleAudioTimeUpdate = () => {
    if (!audioRef.current || isYouTube) return;
    setPlaybackTime(audioRef.current.currentTime, audioRef.current.duration || 0);
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (isYouTube && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.seekTo(newTime, true);
      } catch {}
    } else if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setPlaybackTime(newTime);
  };

  const handleTogglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);

    if (!nextState) {
      // 1. Hardware-level pause on HTML5 Audio
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch (e) {}
      }
      if (typeof document !== "undefined") {
        document.querySelectorAll("audio").forEach((a) => {
          try { a.pause(); } catch (e) {}
        });
      }

      // 2. Hardware-level pause on YouTube Player API
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === "function") {
        try { ytPlayerRef.current.pauseVideo(); } catch (e) {}
      }

      // 3. Direct PostMessage broadcast fallback
      if (typeof document !== "undefined") {
        document.querySelectorAll("iframe").forEach((ifr) => {
          try {
            ifr.contentWindow?.postMessage(
              JSON.stringify({ event: "command", func: "pauseVideo", args: "" }),
              "*"
            );
          } catch (e) {}
        });
      }
    } else {
      if (isYouTube && ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === "function") {
        try { ytPlayerRef.current.playVideo(); } catch (e) {}
      } else if (audioRef.current && currentSong?.audioUrl) {
        const p = audioRef.current.play();
        if (p !== undefined) p.catch(() => {});
      }
    }
  };

  const onYtReady = (event) => {
    ytPlayerRef.current = event.target;
    setIsYtReady(true);
    if (event.target) {
      try {
        event.target.setVolume(Math.round((isMuted ? 0 : volume) * 100));
        if (isPlaying) {
          event.target.playVideo();
        } else {
          event.target.pauseVideo();
        }
      } catch (e) {}
    }
  };

  const onYtStateChange = (event) => {
    if (event.data === 1 && !isPlaying) {
      try {
        event.target.pauseVideo();
      } catch (e) {}
    } else if (event.data === 0) {
      playNext();
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!currentSong) return null;

  const isLiked = likedSongIds.has(currentSong.id);

  return (
    <>
      {/* Native HTML5 Audio for Campus Tracks */}
      {!isYouTube && (
        <audio
          ref={audioRef}
          src={currentSong.audioUrl}
          onTimeUpdate={handleAudioTimeUpdate}
          onEnded={playNext}
          autoPlay={isPlaying}
        />
      )}

      {/* Headless YouTube IFrame Engine for YouTube Tracks */}
      {isYouTube && currentSong.youtubeId && (
        <div className="fixed bottom-0 right-0 w-1 h-1 opacity-[0.01] pointer-events-none overflow-hidden z-[-1]" aria-hidden="true">
          <YouTube
            key={currentSong.youtubeId}
            videoId={currentSong.youtubeId}
            opts={{
              height: "10",
              width: "10",
              playerVars: {
                autoplay: isPlaying ? 1 : 0,
                controls: 0,
                playsinline: 1,
                rel: 0,
                enablejsapi: 1,
                origin: typeof window !== "undefined" ? window.location.origin : undefined,
              },
            }}
            onReady={onYtReady}
            onStateChange={onYtStateChange}
          />
        </div>
      )}

      <QueueDrawer />

      {/* Download Notification Toast */}
      {downloadStatus && (
        <div className="fixed bottom-24 right-6 z-[9999] animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="bg-[#121024]/95 border border-primary/40 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center gap-3 text-sm text-white">
            {downloadStatus.status === "downloading" && (
              <Loader2 size={17} className="animate-spin text-cyan-400 shrink-0" />
            )}
            {downloadStatus.status === "success" && (
              <CheckCircle2 size={17} className="text-emerald-400 shrink-0" />
            )}
            <span>{downloadStatus.message}</span>
          </div>
        </div>
      )}

      {/* Spotify Bottom Dock */}
      <div className="w-full h-[84px] bg-[#121212] border-t border-zinc-800/80 px-4 md:px-6 flex items-center justify-between select-none">
        {/* Left: Track Info & Add Button */}
        <div className="flex items-center gap-3.5 w-1/4 min-w-[180px]">
          <div
            className="relative w-14 h-14 rounded-md overflow-hidden shrink-0 shadow-md cursor-pointer group bg-zinc-800"
            onClick={toggleRightPanel}
          >
            <Image
              src={currentSong.coverUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80"}
              alt={currentSong.title}
              fill
              className="object-cover group-hover:scale-103 transition-transform"
              sizes="56px"
            />
          </div>

          <div className="truncate min-w-0 pr-2">
            <h4
              onClick={toggleRightPanel}
              className="text-sm font-medium text-white truncate cursor-pointer hover:underline"
            >
              {currentSong.title}
            </h4>
            <p className="text-xs text-zinc-400 truncate hover:underline cursor-pointer hover:text-white transition-colors mt-0.5">
              {currentSong.artist}
            </p>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={handleLikeClick}
              className="p-1.5 text-zinc-400 hover:text-white transition-all cursor-pointer"
              title={isLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}
            >
              <Heart
                size={17}
                className={isLiked ? "fill-violet-400 text-violet-400" : "text-zinc-400 hover:text-white"}
              />
            </button>

            <button
              onClick={handlePlaylistClick}
              className="p-1.5 text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="Add to playlist"
            >
              <ListPlus size={17} />
            </button>
          </div>
        </div>

        {/* Center: Playback Controls & Seekbar */}
        <div className="flex flex-col items-center justify-center w-2/4 max-w-[620px]">
          <div className="flex items-center gap-5 mb-1.5">
            <button
              onClick={toggleShuffle}
              className={`transition-colors p-1 ${
                isShuffle ? "text-violet-400" : "text-zinc-400 hover:text-white"
              }`}
              title="Enable Shuffle"
            >
              <Shuffle size={16} />
            </button>

            <button
              onClick={playPrevious}
              className="text-zinc-400 hover:text-white transition-colors p-1 cursor-pointer"
              title="Previous"
            >
              <SkipBack size={18} fill="currentColor" />
            </button>

            <button
              onClick={handleTogglePlay}
              className="w-9 h-9 rounded-full bg-violet-600 hover:bg-violet-500 hover:scale-105 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shadow-[0_2px_14px_rgba(124,58,237,0.4)]"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause size={17} fill="currentColor" />
              ) : (
                <Play size={17} fill="currentColor" className="ml-0.5" />
              )}
            </button>

            <button
              onClick={playNext}
              className="text-zinc-400 hover:text-white transition-colors p-1 cursor-pointer"
              title="Next"
            >
              <SkipForward size={18} fill="currentColor" />
            </button>

            <button
              onClick={toggleRepeatMode}
              className={`transition-colors relative p-1 cursor-pointer ${
                repeatMode !== "off"
                  ? "text-violet-400"
                  : "text-zinc-400 hover:text-white"
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              <Repeat size={16} />
              {repeatMode === "one" && (
                <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-violet-600 text-white rounded-full w-3 h-3 flex items-center justify-center">
                  1
                </span>
              )}
            </button>
          </div>

          {/* Seekbar */}
          <div className="w-full flex items-center gap-2.5 text-[11px] font-mono text-zinc-400">
            <span className="w-9 text-right">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="h-1 flex-1 bg-zinc-700 hover:bg-zinc-600 rounded-full appearance-none cursor-pointer accent-violet-500 transition-all"
            />
            <span className="w-9">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Download, Lyrics, Queue, Device, Volume, Right Panel */}
        <div className="flex items-center justify-end gap-2.5 sm:gap-3 w-1/4 min-w-[210px]">
          {/* Download Song Button */}
          <button
            onClick={handleDownload}
            disabled={currentSong?.download_enabled === false}
            className={`transition-all p-1.5 rounded-full hover:bg-zinc-800 ${
              currentSong?.download_enabled === false
                ? "opacity-30 cursor-not-allowed text-zinc-600"
                : "text-zinc-400 hover:text-white cursor-pointer"
            }`}
            title={
              currentSong?.download_enabled === false
                ? "Downloads disabled by creator"
                : "Download song"
            }
          >
            <Download size={17} />
          </button>

          {/* Lyrics Button */}
          <button
            onClick={() => setShowLyricsModal(true)}
            className={`transition-colors p-1.5 rounded-full hover:bg-zinc-800 cursor-pointer ${
              showLyricsModal ? "text-violet-400 bg-zinc-800" : "text-zinc-400 hover:text-white"
            }`}
            title="Lyrics"
          >
            <Mic2 size={16} />
          </button>

          {/* Queue Button */}
          <button
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            className={`transition-colors p-1.5 rounded-full hover:bg-zinc-800 cursor-pointer ${
              isQueueOpen ? "text-violet-400 bg-zinc-800" : "text-zinc-400 hover:text-white"
            }`}
            title="Queue"
          >
            <ListMusic size={17} />
          </button>

          {/* Volume Slider */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1 bg-zinc-700 hover:bg-zinc-600 rounded-full appearance-none cursor-pointer accent-violet-500 transition-all hidden md:block"
            />
          </div>

          {/* Now Playing Panel Toggle */}
          <button
            onClick={toggleRightPanel}
            className={`transition-colors p-1.5 rounded-full hover:bg-zinc-800 cursor-pointer hidden xl:block ${
              isRightPanelOpen ? "text-violet-400" : "text-zinc-400 hover:text-white"
            }`}
            title="Now playing view"
          >
            {isRightPanelOpen ? <PanelRightClose size={17} /> : <PanelRightOpen size={17} />}
          </button>
        </div>
      </div>

      {/* Lyrics Modal */}
      <LyricsModal
        isOpen={showLyricsModal}
        onClose={() => setShowLyricsModal(false)}
        song={currentSong}
      />

      {/* Add To Playlist Modal */}
      <AddToPlaylistModal
        song={currentSong}
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
      />

      {/* In-App Native Download Modal */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        song={currentSong}
      />

      {/* Hidden HTML5 Audio Engine for Campus Tracks & Direct Streams */}
      <audio
        ref={audioRef}
        src={!isYouTube && directAudioUrl ? directAudioUrl : undefined}
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={playNext}
        onLoadedMetadata={(e) => {
          if (e.currentTarget.duration) {
            setPlaybackTime(e.currentTarget.currentTime || 0, e.currentTarget.duration);
          }
        }}
        preload="auto"
      />

      {/* Headless YouTube Engine for YouTube Tracks */}
      <div
        className="fixed bottom-0 right-0 w-1 h-1 opacity-[0.01] pointer-events-none overflow-hidden z-[-1]"
        aria-hidden="true"
      >
        {isYouTube && currentSong?.youtubeId && (
          <YouTube
            key={currentSong.youtubeId}
            videoId={currentSong.youtubeId}
            opts={{
              height: "10",
              width: "10",
              playerVars: {
                autoplay: isPlaying ? 1 : 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                playsinline: 1,
                origin: typeof window !== "undefined" ? window.location.origin : undefined,
              },
            }}
            onReady={onYtReady}
            onStateChange={onYtStateChange}
          />
        )}
      </div>
    </>
  );
}