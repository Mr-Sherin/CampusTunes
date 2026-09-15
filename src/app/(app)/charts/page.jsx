"use client";

import { useState, useEffect } from "react";
import { usePlayerStore, MOCK_SONGS } from "@/store/usePlayerStore";
import { useAuthModalStore } from "@/store/useAuthModalStore";
import { createClient } from "@/utils/supabase/client";
import {
  Play,
  Pause,
  Shuffle,
  TrendingUp,
  Award,
  Crown,
  Flame,
  Radio,
  Building2,
  Heart,
  Music2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

const CAMPUS_CHARTS_DATA = [
  {
    id: "chart-1",
    rank: 1,
    title: "Illuminati",
    artist: "Sushin Shyam, Dabzee",
    department: "Campus Cultural Festival",
    plays: "142.8K",
    movement: "same",
    weeksOnChart: 4,
    duration: 194,
    coverUrl: "https://i.ytimg.com/vi/tOM-nWPcR4U/hqdefault.jpg",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    youtubeId: "tOM-nWPcR4U",
    source: "campus_hit",
  },
  {
    id: "chart-2",
    rank: 2,
    title: "Jaada",
    artist: "Sushin Shyam",
    department: "Computer Science & Engg",
    plays: "116.4K",
    movement: "up",
    movementAmount: 2,
    weeksOnChart: 3,
    duration: 212,
    coverUrl: "https://i.ytimg.com/vi/tOM-nWPcR4U/hqdefault.jpg",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    youtubeId: "tOM-nWPcR4U",
    source: "campus_hit",
  },
  {
    id: "chart-3",
    rank: 3,
    title: "Kuthanthram",
    artist: "Sushin Shyam, Vedan",
    department: "Hostel 4 Jam Session",
    plays: "98.2K",
    movement: "new",
    weeksOnChart: 1,
    duration: 178,
    coverUrl: "https://i.ytimg.com/vi/tOM-nWPcR4U/hqdefault.jpg",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    youtubeId: "tOM-nWPcR4U",
    source: "campus_hit",
  },
  {
    id: "chart-4",
    rank: 4,
    title: "Starboy",
    artist: "The Weeknd, Daft Punk",
    department: "Electronics & Communication",
    plays: "89.5K",
    movement: "down",
    movementAmount: 1,
    weeksOnChart: 6,
    duration: 230,
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    source: "youtube",
  },
  {
    id: "chart-5",
    rank: 5,
    title: "Midnight City",
    artist: "M83",
    department: "Campus Music Club",
    plays: "76.1K",
    movement: "up",
    movementAmount: 3,
    weeksOnChart: 2,
    duration: 243,
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    source: "youtube",
  },
  {
    id: "chart-6",
    rank: 6,
    title: "Dorm Jam Acoustic Session #14",
    artist: "Campus Acoustic Guild",
    department: "Dorm & Hostel Collective",
    plays: "64.8K",
    movement: "up",
    movementAmount: 1,
    weeksOnChart: 5,
    duration: 185,
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    source: "campus",
  },
  {
    id: "chart-7",
    rank: 7,
    title: "Blinding Lights",
    artist: "The Weeknd",
    department: "Mechanical Engineering",
    plays: "58.3K",
    movement: "down",
    movementAmount: 2,
    weeksOnChart: 8,
    duration: 200,
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    source: "youtube",
  },
  {
    id: "chart-8",
    rank: 8,
    title: "Lo-Fi Study Beats (Library Hours)",
    artist: "Night Coder",
    department: "Information Technology",
    plays: "52.7K",
    movement: "same",
    weeksOnChart: 4,
    duration: 165,
    coverUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    source: "campus",
  },
  {
    id: "chart-9",
    rank: 9,
    title: "Kerala Rock Fusion",
    artist: "College Rock Band",
    department: "Cultural Committee",
    plays: "49.1K",
    movement: "new",
    weeksOnChart: 1,
    duration: 220,
    coverUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    source: "campus",
  },
  {
    id: "chart-10",
    rank: 10,
    title: "Faded",
    artist: "Alan Walker",
    department: "Civil Engineering",
    plays: "44.9K",
    movement: "down",
    movementAmount: 1,
    weeksOnChart: 9,
    duration: 212,
    coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    source: "youtube",
  },
];

const DEPARTMENT_LEADERBOARD = [
  { rank: 1, name: "Campus Music & Cultural Society", streams: "248.5K", topTrack: "Illuminati", artists: 12 },
  { rank: 2, name: "Computer Science & Engg (CSE)", streams: "192.1K", topTrack: "Jaada", artists: 8 },
  { rank: 3, name: "Hostel & Dorm Jam Collective", streams: "165.4K", topTrack: "Kuthanthram", artists: 15 },
  { rank: 4, name: "Electronics & Communication (ECE)", streams: "124.9K", topTrack: "Starboy", artists: 6 },
];

export default function CampusChartsPage() {
  const { currentSong, isPlaying, setCurrentSong, setIsPlaying, likedSongIds, toggleLikeSong } =
    usePlayerStore();
  const { openAuthModal } = useAuthModalStore();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState("top_tracks");
  const [chartSongs, setChartSongs] = useState(CAMPUS_CHARTS_DATA);

  useEffect(() => {
    async function loadCharts() {
      try {
        const { data: realSongs } = await supabase
          .from("songs")
          .select("*, profiles:artist_id(department)")
          .eq("status", "published")
          .order("play_count", { ascending: false })
          .limit(10);

        if (realSongs && realSongs.length > 0) {
          const mapped = realSongs.map((s, idx) => ({
            id: s.id,
            rank: idx + 1,
            title: s.title,
            artist: s.artist_name,
            department: s.profiles?.department || s.description || "Campus Production",
            plays: `${Number(s.play_count || 0).toLocaleString()}`,
            movement: idx === 0 ? "same" : "up",
            weeksOnChart: 2,
            duration: s.duration || 180,
            coverUrl: s.cover_url,
            audioUrl: s.audio_url,
            source: "campus",
            download_enabled: s.download_enabled,
          }));

          const combined = [...mapped, ...CAMPUS_CHARTS_DATA.slice(mapped.length)].map((s, i) => ({
            ...s,
            rank: i + 1,
          }));
          setChartSongs(combined);
        }
      } catch (e) {
        console.error("Failed to load real charts:", e);
      }
    }
    loadCharts();
  }, [supabase]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handlePlayAll = (shuffle = false) => {
    if (chartSongs.length === 0) return;
    const list = shuffle ? [...chartSongs].sort(() => 0.5 - Math.random()) : chartSongs;
    setCurrentSong(list[0]);
    setIsPlaying(true);
  };

  const handleLikeClick = async (song) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      openAuthModal("save chart tracks to your collection");
      return;
    }
    toggleLikeSong(song);
  };

  const top1 = chartSongs[0];
  const top2 = chartSongs[1];
  const top3 = chartSongs[2];

  return (
    <div className="space-y-10 pb-16 select-none max-w-7xl mx-auto">
      {/* 1. Official Billboard Hero Banner */}
      <section className="relative w-full rounded-3xl overflow-hidden border border-zinc-800 bg-gradient-to-b from-violet-950/40 via-zinc-900/90 to-[#09090b] p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold text-violet-300 uppercase tracking-widest">
                <Crown size={12} className="text-violet-400" />
                Official Campus Billboard
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                Week 37 • Updated Daily
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Campus Top 20
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl">
              The definitive campus listening index compiled from student streams, dorm session broadcasts, and campus radio rotations.
            </p>
          </div>

          {/* Quick Play Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handlePlayAll(false)}
              className="px-6 py-3 rounded-full bg-gradient-to-b from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white text-xs font-bold flex items-center gap-2 shadow-sm border-t border-violet-400/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play size={16} fill="white" />
              <span>Play All</span>
            </button>
            <button
              onClick={() => handlePlayAll(true)}
              className="px-5 py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              title="Shuffle Chart"
            >
              <Shuffle size={15} />
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Top 3 Podium Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Award size={20} className="text-violet-400" />
            Podium Leaders
          </h2>
          <span className="text-xs text-zinc-500">Highest streaming campus releases</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card #2 */}
          {top2 && (
            <div
              onClick={() => setCurrentSong(top2)}
              className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-black text-sm text-zinc-300">
                  #2
                </div>
                <span className="text-[10px] font-mono text-violet-400 flex items-center gap-0.5">
                  <ArrowUpRight size={13} /> +2 this week
                </span>
              </div>

              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-3 bg-zinc-800">
                <Image src={top2.coverUrl} alt={top2.title} fill className="object-cover group-hover:scale-104 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                  <div>
                    <h3 className="text-white font-bold text-sm truncate">{top2.title}</h3>
                    <p className="text-zinc-400 text-xs truncate">{top2.artist}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
                <span className="truncate">{top2.department}</span>
                <span className="font-mono text-zinc-300">{top2.plays} streams</span>
              </div>
            </div>
          )}

          {/* Card #1 (Center Gold) */}
          {top1 && (
            <div
              onClick={() => setCurrentSong(top1)}
              className="p-4 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-900/95 border border-violet-500/30 hover:border-violet-500/60 shadow-lg shadow-violet-950/30 transition-all duration-200 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-600 border border-violet-400/40 flex items-center justify-center font-black text-sm text-white shadow-sm">
                  #1
                </div>
                <span className="text-[10px] font-bold text-violet-300 bg-violet-500/15 border border-violet-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Campus Champion
                </span>
              </div>

              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-3 bg-zinc-800">
                <Image src={top1.coverUrl} alt={top1.title} fill className="object-cover group-hover:scale-104 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                  <div>
                    <h3 className="text-white font-bold text-base truncate">{top1.title}</h3>
                    <p className="text-violet-300 text-xs truncate font-medium">{top1.artist}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
                <span className="truncate text-violet-300">{top1.department}</span>
                <span className="font-mono text-white font-bold">{top1.plays} streams</span>
              </div>
            </div>
          )}

          {/* Card #3 */}
          {top3 && (
            <div
              onClick={() => setCurrentSong(top3)}
              className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-black text-sm text-zinc-300">
                  #3
                </div>
                <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-0.5">
                  ★ New Release
                </span>
              </div>

              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-3 bg-zinc-800">
                <Image src={top3.coverUrl} alt={top3.title} fill className="object-cover group-hover:scale-104 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                  <div>
                    <h3 className="text-white font-bold text-sm truncate">{top3.title}</h3>
                    <p className="text-zinc-400 text-xs truncate">{top3.artist}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
                <span className="truncate">{top3.department}</span>
                <span className="font-mono text-zinc-300">{top3.plays} streams</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. Tab Switcher: Full Top 10 vs Department Leaderboard */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
          <button
            onClick={() => setActiveTab("top_tracks")}
            className={`text-sm font-bold pb-1 transition-colors relative cursor-pointer ${
              activeTab === "top_tracks" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Weekly Top 10 Tracks
            {activeTab === "top_tracks" && (
              <span className="absolute bottom-[-13px] inset-x-0 h-0.5 bg-violet-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("departments")}
            className={`text-sm font-bold pb-1 transition-colors relative cursor-pointer ${
              activeTab === "departments" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Department & Club Rankings
            {activeTab === "departments" && (
              <span className="absolute bottom-[-13px] inset-x-0 h-0.5 bg-violet-500" />
            )}
          </button>
        </div>

        {/* Tab 1: Full Top 10 Tracks */}
        {activeTab === "top_tracks" && (
          <div className="space-y-1.5">
            {chartSongs.map((song) => {
              const isCurrent = currentSong?.id === song.id;
              const isTrackPlaying = isCurrent && isPlaying;
              const isLiked = likedSongIds.has(song.id);

              return (
                <div
                  key={song.id}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all group ${
                    isCurrent
                      ? "bg-zinc-800 border border-zinc-700 shadow-sm"
                      : "hover:bg-zinc-800/50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    {/* Rank Number & Hover Play */}
                    <span className="w-6 text-center text-xs font-mono font-bold text-zinc-400 group-hover:hidden">
                      {song.rank}
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

                    {/* Artwork */}
                    <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-zinc-700 bg-zinc-800 shadow-sm">
                      <Image src={song.coverUrl} alt={song.title} fill className="object-cover" />
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0 flex-1">
                      <h4
                        onClick={() => setCurrentSong(song)}
                        className={`text-sm font-semibold truncate cursor-pointer hover:underline ${
                          isCurrent ? "text-violet-400 font-bold" : "text-white"
                        }`}
                      >
                        {song.title}
                      </h4>
                      <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
                    </div>

                    {/* Department Tag */}
                    <div className="hidden md:block max-w-[200px] truncate">
                      <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-full border border-zinc-700/60 font-medium truncate">
                        <Building2 size={11} className="text-violet-400 shrink-0" />
                        {song.department}
                      </span>
                    </div>
                  </div>

                  {/* Right Details: Movement, Streams, Like */}
                  <div className="flex items-center gap-3 sm:gap-5 shrink-0 pl-3">
                    {/* Movement Indicator */}
                    <div className="w-12 text-center text-xs font-mono hidden sm:block">
                      {song.movement === "up" && (
                        <span className="text-emerald-400 flex items-center justify-center gap-0.5">
                          <ArrowUpRight size={14} /> +{song.movementAmount}
                        </span>
                      )}
                      {song.movement === "down" && (
                        <span className="text-rose-400 flex items-center justify-center gap-0.5">
                          <ArrowDownRight size={14} /> -{song.movementAmount}
                        </span>
                      )}
                      {song.movement === "same" && (
                        <span className="text-zinc-500 flex items-center justify-center">
                          <Minus size={14} />
                        </span>
                      )}
                      {song.movement === "new" && (
                        <span className="text-violet-400 text-[10px] font-bold uppercase tracking-wider">
                          NEW
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-mono text-zinc-400 w-16 text-right">
                      {song.plays}
                    </span>

                    <button
                      onClick={() => handleLikeClick(song)}
                      className="p-1.5 text-zinc-400 hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      title={isLiked ? "Remove from Library" : "Save to Library"}
                    >
                      <Heart
                        size={16}
                        className={isLiked ? "fill-violet-500 text-violet-500" : "text-zinc-500 hover:text-white"}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Department & Club Leaderboard */}
        {activeTab === "departments" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEPARTMENT_LEADERBOARD.map((dept) => (
              <div
                key={dept.name}
                className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 rounded-full">
                    Rank #{dept.rank}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">{dept.artists} Campus Artists</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{dept.name}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Lead Track: <span className="text-white font-medium">{dept.topTrack}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Total Campus Rotation</span>
                  <span className="font-mono text-white font-bold">{dept.streams}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
