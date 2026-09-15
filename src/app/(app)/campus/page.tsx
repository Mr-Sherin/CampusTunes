"use client";

import { useState, useEffect } from "react";
import { usePlayerStore, Song } from "@/store/usePlayerStore";
import {
  GraduationCap,
  Play,
  Pause,
  Upload,
  Plus,
  Check,
  Music2,
  Sparkles,
  Loader2,
  Lock,
  LogIn,
  ArrowRight,
  ShieldCheck,
  Radio,
  Download,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { DownloadModal } from "@/components/modals/DownloadModal";
import { createClient } from "@/utils/supabase/client";

export default function CampusShowcasePage() {
  const { currentSong, isPlaying, setCurrentSong, setIsPlaying, likedSongIds, toggleLikeSong } =
    usePlayerStore();

  const [studentTracks, setStudentTracks] = useState<Song[]>([]);
  const [downloadTargetSong, setDownloadTargetSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setIsAuthLoading(false);
    }
    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
      setIsAuthLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!user) return;

    async function loadStudentTracks() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("songs")
          .select("*, artists(display_name, avatar_url)")
          .order("created_at", { ascending: false });

        if (!error && data) {
          const formatted: Song[] = data.map((d: any) => ({
            id: d.id,
            title: d.title,
            artist: d.artists?.display_name || "Campus Creator",
            album: d.album_id || "Campus Studio Release",
            duration: d.duration_seconds || 180,
            coverUrl: d.cover_url || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
            audioUrl: d.audio_url,
            source: "campus",
            genre: "Original Campus Production",
            plays: `${d.play_count || 1} plays`,
          }));
          setStudentTracks(formatted);
        }
      } catch (err) {
        console.error("Failed to load student tracks:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStudentTracks();
  }, [user, supabase]);

  const featuredSong = studentTracks[0] || null;
  const isHeroPlaying = isPlaying && currentSong?.id === featuredSong?.id;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Unauthenticated Student Showcase Barrier View
  if (!isAuthLoading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-4 pb-28 px-4 select-none max-w-lg mx-auto">
        <div className="bg-[#0b0a16] border border-white/15 rounded-3xl w-full p-6 sm:p-7 text-center space-y-4 sm:space-y-5 shadow-[0_25px_70px_rgba(0,0,0,0.95)] relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Brand Icon Badge */}
          <div className="relative pt-1">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-primary to-cyan-500 p-0.5 mx-auto shadow-[0_0_30px_rgba(168,85,247,0.35)]">
              <div className="w-full h-full bg-[#0c0a18] rounded-[14px] flex items-center justify-center text-white">
                <GraduationCap size={24} className="text-violet-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              </div>
            </div>
          </div>

          {/* Header Texts */}
          <div className="space-y-1.5 relative">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold tracking-widest text-violet-300 uppercase">
              <ShieldCheck size={12} className="text-cyan-400" />
              <span>Campus Showcase Access</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
              Student Showcase
            </h2>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
              Sign in with your student credentials to discover original campus music, listen to dorm jam sessions, and support fellow college artists.
            </p>
          </div>

          {/* Feature Highlights Card */}
          <div className="p-3.5 rounded-2xl bg-[#121024] border border-white/[0.08] text-left space-y-2.5 text-xs text-white/85 max-w-sm mx-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
                <Radio size={13} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-xs">Original College Music</p>
                <p className="text-[10px] text-on-surface-variant">Stream live dorm recordings, instrumentals, and campus singles.</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <Sparkles size={13} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-xs">Department & Band Spotlights</p>
                <p className="text-[10px] text-on-surface-variant">Discover talented producers and bands across all engineering branches.</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1 max-w-sm mx-auto">
            <Link
              href="/login"
              className="flex-1 py-2.5 px-5 rounded-full bg-gradient-to-r from-violet-600 via-primary to-cyan-500 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-transform active:scale-98 cursor-pointer"
            >
              <LogIn size={14} /> Sign In
            </Link>
            <Link
              href="/signup"
              className="flex-1 py-2.5 px-5 rounded-full bg-white/[0.06] hover:bg-white/10 text-white font-semibold text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
            >
              Create Account <ArrowRight size={13} className="text-white/60" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16 select-none">
      {/* 1. Hero Spotlight */}
      <section className="relative w-full rounded-3xl overflow-hidden glass-panel border border-violet-500/30 p-6 md:p-10 flex flex-col justify-end min-h-[280px] shadow-[0_15px_50px_rgba(0,0,0,0.7)] group">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0c1c] via-[#0d0c1c]/90 to-transparent z-10" />
        {featuredSong && (
          <Image
            src={featuredSong.coverUrl}
            alt={featuredSong.title}
            fill
            className="object-cover object-right group-hover:scale-102 transition-transform duration-700 opacity-50"
            priority
          />
        )}

        <div className="relative z-20 max-w-2xl space-y-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-600/30 border border-violet-500/40 text-xs font-bold text-violet-200 shadow-sm">
              <GraduationCap size={15} className="text-cyan-400" /> Student Showcase
            </span>
          </div>

          <div>
            <h1 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {featuredSong ? featuredSong.title : "Campus Student Creations"}
            </h1>
            <p className="text-sm md:text-base text-violet-200/80 mt-1 font-medium">
              {featuredSong
                ? `By ${featuredSong.artist}`
                : "Original beats, live college jam sessions, and independent student productions."}
            </p>
          </div>

          <div className="flex items-center gap-4 pt-2 flex-wrap">
            {featuredSong && (
              <button
                onClick={() => {
                  if (isHeroPlaying) {
                    setIsPlaying(false);
                  } else {
                    setCurrentSong(featuredSong);
                  }
                }}
                className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold rounded-full px-7 py-3 text-sm flex items-center gap-2.5 shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                {isHeroPlaying ? (
                  <>
                    <Pause size={18} fill="currentColor" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play size={18} fill="currentColor" className="ml-0.5" />
                    <span>Listen Now</span>
                  </>
                )}
              </button>
            )}

            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white text-xs font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
            >
              <Upload size={15} />
              <span>Upload Your Work</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Real Uploaded Student Tracks */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-black text-white tracking-tight">
              Student Catalog
            </h2>
            <p className="text-xs text-on-surface-variant">Live audio tracks published by students</p>
          </div>
          <Link
            href="/dashboard"
            className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
          >
            <Plus size={14} /> Upload Track
          </Link>
        </div>

        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-sm">Loading student audio catalog...</p>
          </div>
        ) : studentTracks.length > 0 ? (
          <div className="space-y-2">
            {studentTracks.map((song, idx) => {
              const isCurrent = currentSong?.id === song.id;
              const isTrackPlaying = isCurrent && isPlaying;
              const isLiked = likedSongIds.has(song.id);

              return (
                <div
                  key={song.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl transition-all group ${
                    isCurrent
                      ? "bg-primary/20 border border-primary/40 shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                      : "hover:bg-white/[0.06] border border-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <span className="w-6 text-center text-xs font-mono text-on-surface-variant group-hover:hidden">
                      {idx + 1}
                    </span>
                    <button
                      onClick={() => {
                        if (isTrackPlaying) {
                          setIsPlaying(false);
                        } else {
                          setCurrentSong(song);
                        }
                      }}
                      className="w-6 hidden group-hover:flex items-center justify-center text-primary cursor-pointer"
                    >
                      {isTrackPlaying ? (
                        <Pause size={16} fill="currentColor" />
                      ) : (
                        <Play size={16} fill="currentColor" />
                      )}
                    </button>

                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-md">
                      <Image src={song.coverUrl} alt={song.title} fill className="object-cover" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4
                        onClick={() => setCurrentSong(song)}
                        className={`text-sm font-semibold truncate cursor-pointer hover:underline ${
                          isCurrent ? "text-primary font-bold" : "text-white"
                        }`}
                      >
                        {song.title}
                      </h4>
                      <p className="text-xs text-on-surface-variant truncate">{song.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 pl-4">
                    <span className="text-xs font-mono text-on-surface-variant">
                      {formatDuration(song.duration)}
                    </span>
                    <button
                      onClick={() => setDownloadTargetSong(song)}
                      className="p-2 rounded-full border border-white/10 text-on-surface-variant hover:text-primary hover:border-primary/40 transition-all cursor-pointer"
                      title="Download Track (MP3)"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={() => toggleLikeSong(song.id)}
                      className={`p-2 rounded-full border transition-all cursor-pointer ${
                        isLiked
                          ? "bg-primary text-white border-primary shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                          : "border-white/10 text-on-surface-variant hover:text-white"
                      }`}
                      title="Save to Library"
                    >
                      {isLiked ? <Check size={14} /> : <Plus size={14} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Clean Empty State when no student has uploaded yet */
          <div className="glass-panel rounded-3xl p-12 text-center border border-white/10 space-y-4 max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-3xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary mx-auto shadow-[0_0_25px_rgba(168,85,247,0.35)]">
              <Sparkles size={32} />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-display font-bold text-xl text-white">
                Be the First Student Creator
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                No student productions have been published to the campus airwaves yet. Drop your first track, acoustic demo, or beat to get featured!
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 text-white font-bold text-xs px-6 py-3 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Upload size={15} />
                <span>Upload to Artist Studio</span>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* High-Res Audio Download Modal */}
      <DownloadModal
        song={downloadTargetSong}
        isOpen={Boolean(downloadTargetSong)}
        onClose={() => setDownloadTargetSong(null)}
      />
    </div>
  );
}
