"use client";

import { useState, useEffect } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";
import {
  Play,
  Pause,
  Sparkles,
  Heart,
  TrendingUp,
  GraduationCap } from
"lucide-react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { GENRE_DATABASE } from "@/app/api/genre/route";
import { useAuthModalStore } from "@/store/useAuthModalStore";

const CATEGORY_TABS = [
  "New on CampusTunes",
  "Trending Hits",
  ...Object.keys(GENRE_DATABASE).filter((k) => k !== "Trending Hits"),
];

export default function Home() {
  const { currentSong, isPlaying, setCurrentSong, setIsPlaying, likedSongIds, toggleLikeSong } =
    usePlayerStore();
  const { openAuthModal } = useAuthModalStore();

  const [activeCategory, setActiveCategory] = useState("New on CampusTunes");
  const [campusUploads, setCampusUploads] = useState([]);
  const [categoryTracks, setCategoryTracks] = useState([]);
  const [greeting, setGreeting] = useState("Welcome to CampusTunes");

  const supabase = createClient();

  // Dynamic greeting based on current local hour
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning, ready for some tunes?");
    else if (hour < 17) setGreeting("Good afternoon, pump up the campus energy!");
    else if (hour < 21) setGreeting("Good evening, unwind with campus sounds");
    else setGreeting("Late night beats for the night owls");
  }, []);

  // Fetch real songs from Supabase + trending hits
  useEffect(() => {
    async function loadFeed() {
      try {
        // 1. Fetch real student uploads from Supabase
        const { data: realSongs, error } = await supabase
          .from("songs")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(18);

        let realFormatted = [];
        if (!error && realSongs && realSongs.length > 0) {
          realFormatted = realSongs.map((s) => ({
            id: s.id,
            title: s.title,
            artist: s.artist_name || "Student Musician",
            album: s.description || "Campus Single",
            duration: s.duration || 180,
            coverUrl: s.cover_url,
            audioUrl: s.audio_url,
            source: "campus",
            genre: s.genre || "Campus Original",
            plays: `${Number(s.play_count || 0).toLocaleString()} plays`,
            download_enabled: s.download_enabled,
          }));
          setCampusUploads(realFormatted);
        }

        // 2. Fetch trending catalog
        const res = await fetch("/api/yt/trending");
        const data = await res.json();
        const ytHits = data.songs || GENRE_DATABASE["Trending Hits"] || [];

        if (realFormatted.length > 0) {
          setActiveCategory("New on CampusTunes");
          setCategoryTracks(realFormatted);
        } else {
          setActiveCategory("Trending Hits");
          setCategoryTracks(ytHits);
        }
      } catch (err) {
        console.error("Feed fetch error:", err);
        setCategoryTracks(GENRE_DATABASE["Trending Hits"] || []);
      }
    }

    loadFeed();
  }, [supabase]);

  // Instant Category Switching
  const handleCategoryChange = (tabName) => {
    setActiveCategory(tabName);
    if (tabName === "New on CampusTunes") {
      if (campusUploads.length > 0) {
        setCategoryTracks(campusUploads);
      } else {
        setCategoryTracks(GENRE_DATABASE["Trending Hits"] || []);
      }
    } else if (tabName === "Trending Hits") {
      setCategoryTracks(GENRE_DATABASE["Trending Hits"] || []);
    } else {
      const tracks = GENRE_DATABASE[tabName] || [];
      const shuffled = [...tracks].sort(() => 0.5 - Math.random());
      setCategoryTracks(shuffled);
    }
  };

  const handleLikeClick = async (song) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      openAuthModal("save tracks to your permanent library collection");
      return;
    }
    toggleLikeSong(song);
  };

  const handleUploadClick = async (e) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      e.preventDefault();
      openAuthModal("upload original tracks & access creator studio");
    }
  };

  const heroSong = currentSong || categoryTracks[0] || null;
  const isHeroPlaying = isPlaying && currentSong?.id === heroSong?.id;

  return (
    <div className="space-y-10 pb-16 select-none">
      {/* 1. Featured Release Hero Banner */}
      {heroSong && (
        <section className="relative w-full rounded-2xl overflow-hidden border border-zinc-800 p-6 md:p-10 flex flex-col justify-end min-h-[300px] shadow-2xl group bg-zinc-900">
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent z-10" />
          <Image
            src={heroSong.coverUrl}
            alt={heroSong.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            className="object-cover object-center opacity-60 group-hover:scale-102 transition-transform duration-700"
            priority
          />

          <div className="relative z-20 max-w-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-zinc-300 border border-white/10">
                Featured Release
              </span>
            </div>

            <div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {heroSong.title}
              </h1>
              <p className="text-sm md:text-base text-zinc-300 mt-1 font-medium">
                By <span className="text-white font-semibold">{heroSong.artist}</span> • {heroSong.album || "Campus Single"}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <button
                onClick={() => {
                  if (isHeroPlaying) {
                    setIsPlaying(false);
                  } else {
                    setCurrentSong(heroSong);
                  }
                }}
                className="bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-full px-7 py-3 text-sm flex items-center gap-2 shadow-[0_4px_20px_rgba(124,58,237,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
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

              <button
                onClick={() => handleLikeClick(heroSong)}
                className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Heart
                  size={16}
                  className={likedSongIds.has(heroSong.id) ? "fill-violet-400 text-violet-400" : ""}
                />
                <span>{likedSongIds.has(heroSong.id) ? "Saved in Library" : "Add to Library"}</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. Category Selector & Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {activeCategory}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">Top campus streams and trending hits</p>
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORY_TABS.map((catName) => {
            const isSelected = activeCategory === catName;
            return (
              <button
                key={catName}
                onClick={() => handleCategoryChange(catName)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-violet-600 text-white shadow-sm font-bold"
                    : "bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300"
                }`}
              >
                {catName}
              </button>
            );
          })}
        </div>

        {/* Dynamic Grid - 12 songs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoryTracks.slice(0, 12).map((song) => {
            const isCurrent = currentSong?.id === song.id;
            const isTrackPlaying = isCurrent && isPlaying;
            return (
              <div
                key={song.id}
                onClick={() => {
                  if (isCurrent) {
                    setIsPlaying(!isPlaying);
                  } else {
                    setCurrentSong(song);
                  }
                }}
                className="group p-3 rounded-xl bg-zinc-900/40 hover:bg-zinc-800/70 border border-transparent hover:border-zinc-700/40 transition-all duration-200 cursor-pointer"
              >
                <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3 bg-zinc-800 shadow-md">
                  <Image
                    src={song.coverUrl}
                    alt={song.title}
                    fill
                    className="object-cover group-hover:scale-104 transition-transform duration-300"
                    sizes="200px"
                  />

                  {/* Floating Violet Play Button on Hover */}
                  <div
                    className={`absolute bottom-2 right-2 w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 ${
                      isTrackPlaying
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                    }`}
                  >
                    {isTrackPlaying ? (
                      <Pause size={18} fill="currentColor" />
                    ) : (
                      <Play size={18} fill="currentColor" className="ml-0.5" />
                    )}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <h3 className={`font-semibold text-sm truncate ${isCurrent ? "text-violet-400 font-bold" : "text-white"}`}>
                    {song.title}
                  </h3>
                  <p className="text-xs text-zinc-400 truncate hover:underline">{song.artist}</p>
                  <p className="text-[11px] text-zinc-500 pt-0.5">{song.plays || "1.2M"} plays</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Student Creations Section */}
      <section className="rounded-2xl p-6 md:p-8 border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-900">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <GraduationCap size={15} /> Student Artist Network
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Publish your original tracks on CampusTunes
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
              Stream live campus jams, dorm productions, and connect with fellow student musicians across departments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/campus"
              onClick={async (e) => {
                const { data } = await supabase.auth.getUser();
                if (!data.user) {
                  e.preventDefault();
                  openAuthModal("explore Student Showcase & live campus music");
                }
              }}
              className="px-5 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Explore Showcase
            </Link>
            <Link
              href="/dashboard?upload=true"
              onClick={handleUploadClick}
              className="px-6 py-2.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-md"
            >
              Upload Track
            </Link>
          </div>
        </div>
      </section>
    </div>);

}