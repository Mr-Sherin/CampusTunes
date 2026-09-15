"use client";

import { useState, useEffect } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";
import {
  Play,
  Pause,
  Sparkles,
  Heart,
  TrendingUp,
  GraduationCap,
  Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { DownloadModal } from "@/components/modals/DownloadModal";
import { createClient } from "@/utils/supabase/client";
import { GENRE_DATABASE } from "@/app/api/genre/route";

const DYNAMIC_GENRES = Object.keys(GENRE_DATABASE);

export default function Home() {
  const { currentSong, isPlaying, setCurrentSong, setIsPlaying, likedSongIds, toggleLikeSong } =
  usePlayerStore();

  const [activeCategory, setActiveCategory] = useState("Trending Hits");
  const [categoryTracks, setCategoryTracks] = useState(GENRE_DATABASE["Trending Hits"]);
  const [greeting, setGreeting] = useState("Welcome to CampusTunes");
  const [downloadTargetSong, setDownloadTargetSong] = useState(null);

  const supabase = createClient();

  // Dynamic greeting based on current local hour
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning, ready for some tunes?");else
    if (hour < 17) setGreeting("Good afternoon, pump up the campus energy!");else
    if (hour < 21) setGreeting("Good evening, unwind with campus sounds");else
    setGreeting("Late night beats for the night owls");
  }, []);

  // Fetch trending dynamic shuffle on load
  useEffect(() => {
    fetch("/api/yt/trending").
    then((res) => res.json()).
    then((data) => {
      if (data.songs && data.songs.length > 0) {
        setCategoryTracks(data.songs);
      }
    }).
    catch((err) => console.error("Trending fetch error:", err));
  }, []);

  // Instant 0ms Category Switching
  const handleCategoryChange = (genreName) => {
    setActiveCategory(genreName);
    const tracks = GENRE_DATABASE[genreName] || GENRE_DATABASE["Trending Hits"];
    const shuffled = [...tracks].sort(() => 0.5 - Math.random());
    setCategoryTracks(shuffled);
  };

  const heroSong = currentSong || categoryTracks[0] || null;
  const isHeroPlaying = isPlaying && currentSong?.id === heroSong?.id;

  return (
    <div className="space-y-10 pb-16 select-none">
      {/* 1. Dynamic Greeting & Featured Release Hero Banner */}
      {heroSong &&
      <section className="relative w-full rounded-3xl overflow-hidden glass-panel border border-violet-500/20 p-6 md:p-10 flex flex-col justify-end min-h-[300px] shadow-[0_10px_40px_rgba(0,0,0,0.6)] group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0c18] via-[#0d0c18]/85 to-transparent z-10" />
          <Image
          src={heroSong.coverUrl}
          alt={heroSong.title}
          fill
          className="object-cover object-right group-hover:scale-102 transition-transform duration-700 opacity-60"
          priority />
        

          <div className="relative z-20 max-w-2xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-xs font-bold text-violet-300">
                <Sparkles size={13} className="text-secondary" /> {greeting}
              </span>
            </div>

            <div>
              <h1 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {heroSong.title}
              </h1>
              <p className="text-sm md:text-base text-violet-200/80 mt-1 font-medium">
                By <span className="text-white font-semibold">{heroSong.artist}</span> • {heroSong.album || "Campus Track"}
              </p>
            </div>

            <div className="flex items-center gap-4 pt-2 flex-wrap">
              <button
              onClick={() => {
                if (isHeroPlaying) {
                  setIsPlaying(false);
                } else {
                  setCurrentSong(heroSong);
                }
              }}
              className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold rounded-full px-7 py-3 text-sm flex items-center gap-2.5 shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all hover:scale-105 active:scale-95 cursor-pointer">
              
                {isHeroPlaying ?
              <>
                    <Pause size={18} fill="currentColor" />
                    <span>Pause</span>
                  </> :

              <>
                    <Play size={18} fill="currentColor" className="ml-0.5" />
                    <span>Listen Now</span>
                  </>
              }
              </button>

              <button
                onClick={() => toggleLikeSong(heroSong.id)}
                className="px-5 py-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 text-xs font-semibold flex items-center gap-2 transition-all hover:scale-102 cursor-pointer">
                <Heart
                  size={16}
                  className={likedSongIds.has(heroSong.id) ? "fill-primary text-primary" : ""} />
                <span>{likedSongIds.has(heroSong.id) ? "Saved in Library" : "Add to Library"}</span>
              </button>

              <button
                onClick={() => setDownloadTargetSong(heroSong)}
                className="px-5 py-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 text-xs font-semibold flex items-center gap-2 transition-all hover:scale-102 hover:text-primary cursor-pointer"
                title="Download Studio Audio">
                <Download size={16} />
                <span>Download Audio</span>
              </button>
            </div>
          </div>
        </section>
      }

      {/* 2. Dynamic Live Category Selector */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <TrendingUp size={22} className="text-secondary" /> {activeCategory}
            </h2>
            <p className="text-xs text-on-surface-variant">Instant streaming catalog filtered for your vibe</p>
          </div>
        </div>

        {/* Dynamic Category Pill Tabs */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {DYNAMIC_GENRES.map((catName) => {
            const isSelected = activeCategory === catName;
            return (
              <button
                key={catName}
                onClick={() => handleCategoryChange(catName)}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
                isSelected ?
                "bg-gradient-to-r from-primary to-cyan-500 text-white border-transparent shadow-[0_0_20px_rgba(168,85,247,0.45)] font-bold scale-102" :
                "bg-[#111022]/80 hover:bg-[#181630] text-violet-200/80 hover:text-white border-white/[0.08]"}`
                }>
                
                <span>{catName}</span>
              </button>);

          })}
        </div>

        {/* Dynamic Grid - Always exactly 12 songs (2 full rows of 6) */}
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
                className="group p-3 rounded-2xl bg-[#0f0e20]/80 hover:bg-[#15132d] border border-white/[0.06] hover:border-primary/40 transition-all duration-300 cursor-pointer shadow-lg hover:-translate-y-1">
                
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 shadow-md border border-white/10 bg-[#161528]">
                  <Image
                    src={song.coverUrl}
                    alt={song.title}
                    fill
                    className="object-cover group-hover:scale-106 transition-transform duration-500"
                    sizes="200px" />
                  

                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-all ${
                    isTrackPlaying ? "opacity-100 bg-black/40" : "opacity-0 group-hover:opacity-100 bg-black/30"}`
                    }>
                    
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-primary to-cyan-400 text-white flex items-center justify-center shadow-[0_0_18px_rgba(168,85,247,0.7)] hover:scale-108 transition-transform">
                      {isTrackPlaying ?
                      <Pause size={19} fill="currentColor" /> :

                      <Play size={19} fill="currentColor" className="ml-0.5" />
                      }
                    </div>
                  </div>

                  {isTrackPlaying &&
                  <div className="absolute bottom-2 right-2 flex items-center gap-0.5 bg-black/80 px-2 py-1 rounded-full border border-primary/40">
                      <span className="w-0.5 h-3 bg-primary rounded-full animate-pulse" />
                      <span className="w-0.5 h-4 bg-cyan-400 rounded-full animate-pulse delay-75" />
                      <span className="w-0.5 h-2 bg-fuchsia-400 rounded-full animate-pulse delay-150" />
                    </div>
                  }
                </div>

                <div className="space-y-0.5">
                  <h3 className={`font-bold text-sm truncate ${isCurrent ? "text-primary" : "text-white"}`}>
                    {song.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant truncate">{song.artist}</p>
                  <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-cyan-400/80">
                    <span>Stream</span>
                    <span>{song.plays || "1.2M"}</span>
                  </div>
                </div>
              </div>);

          })}
        </div>
      </section>

      {/* 3. Student Creations Section */}
      <section className="rounded-3xl glass-panel p-6 md:p-8 border border-white/10 relative overflow-hidden bg-gradient-to-r from-violet-950/40 via-[#121124] to-cyan-950/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
              <GraduationCap size={15} /> Student Artist Network
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
              Publish your original productions on CampusTunes
            </h2>
            <p className="text-xs md:text-sm text-violet-200/70 leading-relaxed">
              Stream live campus jams, dorm productions, and connect with fellow student musicians across departments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/campus"
              className="px-5 py-3 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/15 text-xs font-bold transition-all hover:scale-102 cursor-pointer">
              
              Explore Showcase →
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 text-white text-xs font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-transform hover:scale-105 active:scale-95 cursor-pointer">
              
              Upload Track
            </Link>
          </div>
        </div>
      </section>

      {/* High-Res Audio Download Modal */}
      <DownloadModal
        song={downloadTargetSong}
        isOpen={Boolean(downloadTargetSong)}
        onClose={() => setDownloadTargetSong(null)}
      />
    </div>);

}