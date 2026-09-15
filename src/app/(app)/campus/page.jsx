"use client";

import { useState, useEffect } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";
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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function CampusShowcasePage() {
  const { currentSong, isPlaying, setCurrentSong, setIsPlaying, likedSongIds, toggleLikeSong } =
    usePlayerStore();

  const [studentTracks, setStudentTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
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
          .select("*, profiles:artist_id(full_name, username, avatar_url, department)")
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (!error && data) {
          const formatted = data.map((d) => ({
            id: d.id,
            title: d.title,
            artist: d.artist_name || d.profiles?.full_name || "Campus Creator",
            username: d.profiles?.username,
            album: d.description || `${d.profiles?.department || "Campus"} • Studio Release`,
            duration: d.duration || 180,
            coverUrl: d.cover_url || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
            audioUrl: d.audio_url,
            source: "campus",
            genre: d.genre || "Original Campus Production",
            plays: `${Number(d.play_count || 0).toLocaleString()} plays`,
            download_enabled: d.download_enabled,
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

  const formatDuration = (seconds) => {
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
            <div className="w-14 h-14 rounded-2xl bg-violet-600 p-0.5 mx-auto shadow-sm">
              <div className="w-full h-full bg-[#09090b] rounded-[14px] flex items-center justify-center text-white">
                <GraduationCap size={24} className="text-violet-400" />
              </div>
            </div>
          </div>

          {/* Header Texts */}
          <div className="space-y-1.5 relative">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold tracking-widest text-violet-300 uppercase">
              <ShieldCheck size={12} className="text-violet-400" />
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
          <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-left space-y-2.5 text-xs text-white/85 max-w-sm mx-auto">
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
              <div className="w-6 h-6 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
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
              className="flex-1 py-2.5 px-5 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-98 cursor-pointer"
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
      <section className="relative w-full rounded-2xl overflow-hidden border border-zinc-800 p-6 md:p-10 flex flex-col justify-end min-h-[280px] shadow-2xl group bg-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent z-10" />
        {featuredSong && (
          <Image
            src={featuredSong.coverUrl}
            alt={featuredSong.title}
            fill
            className="object-cover object-center group-hover:scale-102 transition-transform duration-700 opacity-50"
            priority
          />
        )}

        <div className="relative z-20 max-w-2xl space-y-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold uppercase tracking-wider text-zinc-300 border border-white/10">
              <GraduationCap size={14} /> Student Showcase
            </span>
          </div>

          <div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {featuredSong ? featuredSong.title : "Campus Student Creations"}
            </h1>
            <p className="text-sm md:text-base text-zinc-300 mt-1 font-medium">
              {featuredSong
                ? `By ${featuredSong.artist}`
                : "Original beats, live college jam sessions, and independent student productions."}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2 flex-wrap">
            {featuredSong && (
              <button
                onClick={() => {
                  if (isHeroPlaying) {
                    setIsPlaying(false);
                  } else {
                    setCurrentSong(featuredSong);
                  }
                }}
                className="bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-full px-7 py-3 text-sm flex items-center gap-2 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
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
              className="px-6 py-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border border-zinc-700"
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
            className="text-xs font-semibold text-violet-400 hover:underline flex items-center gap-1"
          >
            <Plus size={14} /> Upload Track
          </Link>
        </div>

        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
            <Loader2 size={32} className="animate-spin text-violet-500" />
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
                  className={`flex items-center justify-between p-3 rounded-xl transition-all group ${
                    isCurrent
                      ? "bg-zinc-800 border border-zinc-700"
                      : "hover:bg-zinc-800/50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <span className="w-6 text-center text-xs font-mono text-zinc-500 group-hover:hidden">
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
                      className="w-6 hidden group-hover:flex items-center justify-center text-violet-400 cursor-pointer"
                    >
                      {isTrackPlaying ? (
                        <Pause size={16} fill="currentColor" />
                      ) : (
                        <Play size={16} fill="currentColor" />
                      )}
                    </button>

                    <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-zinc-700 bg-zinc-800 shadow-sm">
                      <Image src={song.coverUrl} alt={song.title} fill className="object-cover" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4
                        onClick={() => setCurrentSong(song)}
                        className={`text-sm font-medium truncate cursor-pointer hover:underline ${
                          isCurrent ? "text-violet-400 font-semibold" : "text-white"
                        }`}
                      >
                        {song.title}
                      </h4>
                      <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 pl-4">
                    <span className="text-xs font-mono text-zinc-500">
                      {formatDuration(song.duration)}
                    </span>
                    <button
                      onClick={() => toggleLikeSong(song.id)}
                      className={`p-2 rounded-full border transition-all cursor-pointer ${
                        isLiked
                          ? "bg-violet-600 text-white border-violet-600"
                          : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
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
          /* Clean Empty State */
          <div className="rounded-2xl p-12 text-center border border-zinc-800 bg-zinc-900/60 space-y-4 max-w-xl mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 mx-auto">
              <Music2 size={28} />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-xl text-white">
                Be the First Student Creator
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                No student productions have been published to the campus airwaves yet. Drop your first track, acoustic demo, or beat to get featured!
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs px-6 py-2.5 rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
              >
                <Upload size={15} />
                <span>Upload to Artist Studio</span>
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
