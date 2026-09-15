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
  Download,
  Mic2,
  ListMusic,
  Laptop2,
  PanelRightOpen,
  PanelRightClose } from "lucide-react";
import Image from "next/image";
import { QueueDrawer } from "@/components/player/QueueDrawer";
import { AddToPlaylistModal } from "@/components/modals/AddToPlaylistModal";
import { DownloadModal } from "@/components/modals/DownloadModal";
import { AuthModal } from "@/components/modals/AuthModal";
import { createClient } from "@/utils/supabase/client";
import YouTube from "react-youtube";

// Type for YouTube player instance











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
    toggleRightPanel
  } = usePlayerStore();

  const supabase = createClient();
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authActionText, setAuthActionText] = useState("access playlists & saved songs");
  const isYouTube = Boolean(currentSong?.source === "youtube" || currentSong?.youtubeId);

  const handleLikeClick = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setAuthActionText("save tracks to Liked Songs");
      setShowAuthModal(true);
      return;
    }
    if (currentSong) {
      toggleLikeSong(currentSong);
    }
  };

  const handlePlaylistClick = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setAuthActionText("add tracks to playlists");
      setShowAuthModal(true);
      return;
    }
    setShowPlaylistModal(true);
  };

  // Synchronize HTML5 Audio
  useEffect(() => {
    if (!audioRef.current || isYouTube) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong, isYouTube, setIsPlaying]);

  useEffect(() => {
    if (!audioRef.current || isYouTube) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted, isYouTube]);

  // Handle Seek Command from Store
  useEffect(() => {
    if (seekCommand === null) return;

    if (isYouTube && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.seekTo(seekCommand, true);
        setPlaybackTime(seekCommand);
      } catch (e) {
        console.error("YouTube seek error:", e);
      }
    } else if (audioRef.current) {
      audioRef.current.currentTime = seekCommand;
      setPlaybackTime(seekCommand);
    }
    setSeekCommand(null);
  }, [seekCommand, isYouTube, setPlaybackTime, setSeekCommand]);

  // Synchronize YouTube Player Play / Pause
  useEffect(() => {
    if (!isYouTube || !ytPlayerRef.current || !isYtReady) return;

    try {
      if (isPlaying) {
        ytPlayerRef.current.playVideo();
      } else {
        ytPlayerRef.current.pauseVideo();
      }
    } catch (e) {
      console.error("YouTube play/pause error:", e);
    }
  }, [isPlaying, isYouTube, isYtReady, currentSong]);

  // Synchronize YouTube Player Volume
  useEffect(() => {
    if (!isYouTube || !ytPlayerRef.current || !isYtReady) return;

    try {
      if (isMuted) {
        ytPlayerRef.current.mute();
      } else {
        ytPlayerRef.current.unMute();
        ytPlayerRef.current.setVolume(Math.round(volume * 100));
      }
    } catch (e) {
      console.error("YouTube volume error:", e);
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
    }, 500);

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

  const onYtReady = (event) => {
    ytPlayerRef.current = event.target;
    setIsYtReady(true);
    if (event.target) {
      event.target.setVolume(Math.round(volume * 100));
      if (isPlaying) {
        event.target.playVideo();
      } else {
        event.target.pauseVideo();
      }
    }
  };

  const onYtStateChange = (event) => {
    // 0 = ENDED, 1 = PLAYING, 2 = PAUSED, 3 = BUFFERING
    if (event.data === 0) {
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
      {!isYouTube &&
      <audio
        ref={audioRef}
        src={currentSong.audioUrl}
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={playNext} />

      }

      {/* Headless YouTube IFrame Engine for YouTube Tracks */}
      {isYouTube && currentSong.youtubeId &&
      <div className="fixed -top-96 -left-96 w-1 h-1 opacity-0 pointer-events-none overflow-hidden z-[-1]">
          <YouTube
          videoId={currentSong.youtubeId}
          opts={{
            height: "10",
            width: "10",
            playerVars: {
              autoplay: 0,
              controls: 0,
              playsinline: 1,
              rel: 0
            }
          }}
          onReady={onYtReady}
          onStateChange={onYtStateChange} />
        
        </div>
      }

      <QueueDrawer />

      {/* Spotify Bottom Dock */}
      <div className="w-full h-[88px] bg-[#0a0914]/95 backdrop-blur-2xl border-t border-white/[0.08] px-4 md:px-6 flex items-center justify-between select-none shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        {/* Left: Track Info & Add Button */}
        <div className="flex items-center gap-3.5 w-1/4 min-w-[180px]">
          <div
            className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 shadow-lg cursor-pointer group border border-white/10"
            onClick={toggleRightPanel}>
            
            <Image
              src={currentSong.coverUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80"}
              alt={currentSong.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
              sizes="56px" />
            
          </div>

          <div className="truncate min-w-0 pr-2">
            <h4
              onClick={toggleRightPanel}
              className="text-sm font-semibold text-white truncate cursor-pointer hover:underline flex items-center gap-1.5">
              
              <span>{currentSong.title}</span>
            </h4>
            <p className="text-xs text-on-surface-variant truncate hover:underline cursor-pointer hover:text-white transition-colors">
              {currentSong.artist}
            </p>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={handleLikeClick}
              className="p-1.5 text-on-surface-variant hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title={isLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}>
              
              <Heart
                size={17}
                className={isLiked ? "fill-primary text-primary drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" : "text-white/60 hover:text-white"} />
              
            </button>

            <button
              onClick={handlePlaylistClick}
              className="p-1.5 text-on-surface-variant hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="Add to playlist">
              <ListPlus size={17} className="text-white/60 hover:text-cyan-400" />
            </button>

            <button
              onClick={() => setShowDownloadModal(true)}
              className="p-1.5 text-on-surface-variant hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="Download Track (High-Res MP3)">
              <Download size={16} className="text-white/60 hover:text-primary transition-colors" />
            </button>
          </div>
        </div>

        {/* Center: Playback Controls & Seekbar */}
        <div className="flex flex-col items-center justify-center w-2/4 max-w-[620px]">
          <div className="flex items-center gap-5 mb-1.5">
            <button
              onClick={toggleShuffle}
              className={`transition-colors p-1 ${
              isShuffle ? "text-primary drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]" : "text-on-surface-variant hover:text-white"}`
              }
              title="Enable Shuffle">
              
              <Shuffle size={16} />
            </button>

            <button
              onClick={playPrevious}
              className="text-on-surface-variant hover:text-white transition-colors p-1"
              title="Previous">
              
              <SkipBack size={19} fill="currentColor" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-secondary hover:scale-105 active:scale-95 text-white flex items-center justify-center transition-all shadow-[0_0_15px_rgba(168,85,247,0.5)] cursor-pointer"
              title={isPlaying ? "Pause" : "Play"}>
              
              {isPlaying ?
              <Pause size={18} fill="currentColor" /> :

              <Play size={18} fill="currentColor" className="ml-0.5" />
              }
            </button>

            <button
              onClick={playNext}
              className="text-on-surface-variant hover:text-white transition-colors p-1"
              title="Next">
              
              <SkipForward size={19} fill="currentColor" />
            </button>

            <button
              onClick={toggleRepeatMode}
              className={`transition-colors relative p-1 ${
              repeatMode !== "off" ?
              "text-primary drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]" :
              "text-on-surface-variant hover:text-white"}`
              }
              title={`Repeat: ${repeatMode}`}>
              
              <Repeat size={16} />
              {repeatMode === "one" &&
              <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-primary text-white rounded-full w-3 h-3 flex items-center justify-center">
                  1
                </span>
              }
            </button>
          </div>

          {/* Seekbar */}
          <div className="w-full flex items-center gap-2.5 text-[11px] font-mono text-on-surface-variant">
            <span className="w-9 text-right">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="h-1 flex-1 bg-white/20 hover:bg-white/30 rounded-full appearance-none cursor-pointer accent-primary hover:accent-primary transition-all" />
            
            <span className="w-9">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Lyrics, Queue, Device, Volume, Right Panel */}
        <div className="flex items-center justify-end gap-3.5 w-1/4 min-w-[180px]">
          <button
            onClick={() => setIsQueueOpen(true)}
            className="text-on-surface-variant hover:text-white transition-colors p-1"
            title="Lyrics">
            
            <Mic2 size={16} />
          </button>

          <button
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            className={`transition-colors p-1 ${
            isQueueOpen ? "text-primary" : "text-on-surface-variant hover:text-white"}`
            }
            title="Queue">
            
            <ListMusic size={17} />
          </button>

          <button
            className="text-on-surface-variant hover:text-white transition-colors p-1 hidden sm:block"
            title="Connect to a device">
            
            <Laptop2 size={16} />
          </button>

          {/* Volume Slider */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-on-surface-variant hover:text-white transition-colors">
              
              {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-18 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-primary transition-all hidden sm:block" />
            
          </div>

          <button
            onClick={toggleRightPanel}
            className={`transition-colors p-1 hidden xl:block ${
            isRightPanelOpen ? "text-primary" : "text-on-surface-variant hover:text-white"}`
            }
            title="Now playing view">
            
            {isRightPanelOpen ? <PanelRightClose size={17} /> : <PanelRightOpen size={17} />}
          </button>
        </div>
      </div>

      {/* Add To Playlist Modal */}
      <AddToPlaylistModal
        song={currentSong}
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)} />

      {/* High-Res Audio Download Modal */}
      <DownloadModal
        song={currentSong}
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)} />

      {/* Auth Barrier Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        actionText={authActionText} />
      
    </>);

}