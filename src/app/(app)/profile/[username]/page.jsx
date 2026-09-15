"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  GraduationCap,
  Music,
  Headphones,
  Heart,
  Play,
  Pause,
  Upload,
  Sparkles,
  Share2,
  Sliders,
  Check,
  Building,
  Calendar,
  ShieldCheck,
  Disc3,
  Loader2,
  Lock,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useAuth } from "@/context/AuthContext";

export default function StudentProfilePage({ params }) {
  // Unwrap params using React.use for Next.js 15+ dynamic route compatibility
  const resolvedParams = use(params);
  const username = resolvedParams?.username?.toLowerCase();

  const router = useRouter();
  const supabase = createClient();
  const { user: authUser, profile: authProfile } = useAuth();
  const { currentSong, isPlaying, setCurrentSong, setIsPlaying, likedSongIds, toggleLikeSong } =
    usePlayerStore();

  const [studentProfile, setStudentProfile] = useState(null);
  const [studentSongs, setStudentSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadProfileAndTracks() {
      if (!username) return;
      setIsLoading(true);

      try {
        // 1. Fetch Student Profile by username
        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .maybeSingle();

        if (profileErr) throw profileErr;

        if (!profile) {
          setStudentProfile(null);
          setIsLoading(false);
          return;
        }

        setStudentProfile(profile);

        // 2. Fetch Student's Published Songs
        const { data: tracks, error: tracksErr } = await supabase
          .from("songs")
          .select("*")
          .eq("artist_id", profile.id)
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (!tracksErr && tracks) {
          setStudentSongs(tracks);
        }
      } catch (err) {
        console.error("Error loading student profile:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfileAndTracks();
  }, [username, supabase]);

  const isOwnProfile = authProfile?.username === username || authUser?.id === studentProfile?.id;

  const totalPlays = studentSongs.reduce((acc, curr) => acc + (Number(curr.play_count) || 0), 0);
  const totalLikes = studentSongs.reduce((acc, curr) => acc + (Number(curr.like_count) || 0), 0);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "3:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 size={36} className="text-violet-500 animate-spin" />
        <p className="text-xs text-zinc-400 font-medium">Loading student music profile...</p>
      </div>
    );
  }

  if (!studentProfile) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-zinc-800 bg-zinc-900/40">
        <Disc3 size={48} className="text-zinc-600 mb-3" />
        <h2 className="text-2xl font-bold text-white">Student Profile Not Found</h2>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm">
          No campus profile exists for @{username}. They may not have created an account yet.
        </p>
        <Link
          href="/"
          className="mt-6 px-6 py-2.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all"
        >
          Return to Discover
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 select-none">
      {/* 1. Header Banner & Identity Card */}
      <section className="relative rounded-3xl overflow-hidden border border-zinc-800/80 bg-gradient-to-b from-zinc-900 via-[#0e0c18] to-zinc-950 p-6 sm:p-8 md:p-10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-950/20 via-transparent to-zinc-950 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Student Avatar */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-violet-500/30 shadow-2xl shrink-0 bg-zinc-800">
              <Image
                src={
                  studentProfile.avatar_url ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"
                }
                alt={studentProfile.full_name}
                fill
                sizes="120px"
                className="object-cover"
                priority
              />
            </div>

            {/* Profile Information */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-[11px] font-bold uppercase tracking-wider">
                  <GraduationCap size={13} />
                  <span>Campus Creator</span>
                </span>

                {studentProfile.role === "admin" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                    <ShieldCheck size={12} />
                    <span>Administrator</span>
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {studentProfile.full_name}
              </h1>

              <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono">
                <span>@{studentProfile.username}</span>
                <span>•</span>
                <span className="text-zinc-300">{studentProfile.department}</span>
                <span>•</span>
                <span className="text-violet-400">{studentProfile.semester}</span>
              </div>

              {studentProfile.bio && (
                <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed pt-1">
                  {studentProfile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
            <button
              onClick={handleShare}
              className="px-4 py-2.5 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border border-zinc-700/60"
            >
              {copiedLink ? <Check size={15} className="text-emerald-400" /> : <Share2 size={15} />}
              <span>{copiedLink ? "Link Copied!" : "Share Profile"}</span>
            </button>

            {isOwnProfile && (
              <>
                <Link
                  href="/dashboard?upload=true"
                  className="px-5 py-2.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-[0_4px_15px_rgba(124,58,237,0.35)] hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Upload size={15} />
                  <span>Upload Track</span>
                </Link>

                <Link
                  href="/settings"
                  className="p-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-zinc-700/60"
                  title="Edit Profile Settings"
                >
                  <Sliders size={16} />
                </Link>
              </>
            )}
          </div>
        </div>

        {/* 2. Quick Metrics Row */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-8 pt-6 border-t border-zinc-800/80">
          <div className="bg-zinc-900/60 rounded-xl p-3.5 border border-zinc-800/60 text-center">
            <p className="text-xl sm:text-2xl font-black text-white">{studentSongs.length}</p>
            <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider mt-0.5">
              Original Tracks
            </p>
          </div>

          <div className="bg-zinc-900/60 rounded-xl p-3.5 border border-zinc-800/60 text-center">
            <p className="text-xl sm:text-2xl font-black text-violet-400">{totalPlays.toLocaleString()}</p>
            <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider mt-0.5">
              Total Streams
            </p>
          </div>

          <div className="bg-zinc-900/60 rounded-xl p-3.5 border border-zinc-800/60 text-center">
            <p className="text-xl sm:text-2xl font-black text-white">{totalLikes.toLocaleString()}</p>
            <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider mt-0.5">
              Campus Likes
            </p>
          </div>
        </div>
      </section>

      {/* 3. Published Student Tracks Showcase */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Music size={20} className="text-violet-400" />
              <span>Published Releases</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Original studio master tracks by {studentProfile.full_name}
            </p>
          </div>
        </div>

        {studentSongs.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Headphones size={24} />
            </div>
            <h3 className="text-base font-bold text-white">No tracks released yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm">
              {isOwnProfile
                ? "You haven't uploaded any songs yet. Head over to the Creator Studio to drop your first campus track!"
                : `${studentProfile.full_name} hasn't published any songs yet. Check back soon for upcoming campus releases.`}
            </p>
            {isOwnProfile && (
              <Link
                href="/dashboard?upload=true"
                className="mt-2 px-5 py-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all hover:scale-105"
              >
                Upload First Song
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {studentSongs.map((song, index) => {
              const isCurrent = currentSong?.id === song.id;
              const isTrackPlaying = isCurrent && isPlaying;
              const isLiked = likedSongIds.has(song.id);

              const trackForPlayer = {
                id: song.id,
                title: song.title,
                artist: song.artist_name || studentProfile.full_name,
                album: `${studentProfile.department} • Studio Release`,
                duration: song.duration || 180,
                coverUrl: song.cover_url,
                audioUrl: song.audio_url,
                source: "campus",
                genre: song.genre,
                plays: `${song.play_count || 0} plays`,
                download_enabled: song.download_enabled,
              };

              return (
                <div
                  key={song.id}
                  className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all duration-200 group ${
                    isCurrent
                      ? "bg-violet-950/20 border-violet-500/40 shadow-md"
                      : "bg-zinc-900/40 hover:bg-zinc-800/60 border-zinc-800/60 hover:border-zinc-700/60"
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <span className="w-5 text-center text-xs font-bold text-zinc-500 group-hover:hidden">
                      {index + 1}
                    </span>

                    {/* Play/Pause Button on Hover/Active */}
                    <button
                      onClick={() => {
                        if (isCurrent) {
                          setIsPlaying(!isPlaying);
                        } else {
                          setCurrentSong(trackForPlayer);
                        }
                      }}
                      className="w-5 hidden group-hover:flex items-center justify-center text-violet-400 cursor-pointer"
                    >
                      {isTrackPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
                    </button>

                    {/* Cover Art */}
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-zinc-800 shadow-sm">
                      <Image
                        src={song.cover_url}
                        alt={song.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>

                    {/* Song Details */}
                    <div className="min-w-0">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          isCurrent ? "text-violet-400 font-bold" : "text-white"
                        }`}
                      >
                        {song.title}
                      </h4>
                      <p className="text-xs text-zinc-400 truncate">
                        {song.genre} • {formatDuration(song.duration)}
                      </p>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                    <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
                      {Number(song.play_count || 0).toLocaleString()} plays
                    </span>

                    <button
                      onClick={() => toggleLikeSong(trackForPlayer)}
                      className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title={isLiked ? "Unlike song" : "Like song"}
                    >
                      <Heart
                        size={17}
                        className={isLiked ? "fill-violet-400 text-violet-400" : ""}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
