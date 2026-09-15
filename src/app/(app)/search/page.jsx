"use client";

import { useState, useEffect } from "react";
import { MOCK_SONGS, usePlayerStore } from "@/store/usePlayerStore";
import { Search, Play, Pause, Compass, Loader2, Music2, Heart, Download } from "lucide-react";
import Image from "next/image";
import { DownloadModal } from "@/components/modals/DownloadModal";

const GENRE_CARDS = [
{ name: "Malayalam Indie", query: "Malayalam Indie Songs", color: "from-purple-600 to-indigo-900", image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80" },
{ name: "Lo-Fi & Study", query: "Lo-Fi Study Beats Instrumental", color: "from-cyan-600 to-teal-900", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80" },
{ name: "Hip-Hop / Rap", query: "South Indian Hip Hop Rap", color: "from-amber-500 to-red-900", image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&q=80" },
{ name: "Pop & Top Hits", query: "Global Top Hits 2026", color: "from-pink-600 to-rose-900", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80" },
{ name: "Rock & Band", query: "College Band Rock Kerala", color: "from-emerald-500 to-cyan-900", image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f529a8?w=500&q=80" },
{ name: "Late Night Beats", query: "Midnight Drive Synthwave Chill", color: "from-blue-600 to-slate-900", image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500&q=80" }];


export default function SearchPage() {
  const { currentSong, isPlaying, setCurrentSong, setIsPlaying, likedSongIds, toggleLikeSong } = usePlayerStore();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(MOCK_SONGS);
  const [downloadTargetSong, setDownloadTargetSong] = useState(null);

  useEffect(() => {
    const activeQuery = query.trim() || selectedCategory || "";

    if (!activeQuery) {
      setResults(MOCK_SONGS);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const localMatches = MOCK_SONGS.filter(
          (s) =>
          s.title.toLowerCase().includes(activeQuery.toLowerCase()) ||
          s.artist.toLowerCase().includes(activeQuery.toLowerCase())
        );

        const res = await fetch(`/api/yt/search?q=${encodeURIComponent(activeQuery)}`);
        if (res.ok) {
          const data = await res.json();
          const ytSongs = data.songs || [];
          setResults([...localMatches, ...ytSongs]);
        } else {
          setResults(localMatches);
        }
      } catch (err) {
        console.error("Search page error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedCategory]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="space-y-10 pb-16 select-none">
      {/* Search Header */}
      <div className="relative max-w-2xl">
        <div className="relative">
          <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedCategory(null);
            }}
            placeholder="Search songs, campus creators, playlists..."
            className="w-full bg-[#121124] border border-white/15 rounded-full py-4 pl-12 pr-12 text-base text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all shadow-xl placeholder:text-white/40" />
          
          {isSearching &&
          <Loader2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary animate-spin" />
          }
        </div>
      </div>

      {/* Category Tile Grid */}
      {!query && !selectedCategory &&
      <section className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Compass size={24} className="text-secondary" /> Browse Campus Genres & Vibes
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {GENRE_CARDS.map((cat) =>
          <div
            key={cat.name}
            onClick={() => setSelectedCategory(cat.query)}
            className={`relative h-36 rounded-2xl overflow-hidden cursor-pointer bg-gradient-to-br ${cat.color} p-4 flex flex-col justify-between group shadow-lg hover:scale-105 transition-all duration-300 border border-white/10`}>
            
                <h3 className="font-display font-bold text-sm text-white z-10">{cat.name}</h3>
                <div className="absolute right-0 bottom-0 w-20 h-20 transform translate-x-3 translate-y-3 rotate-12 group-hover:scale-110 transition-transform">
                  <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover rounded-xl opacity-80" />
              
                </div>
              </div>
          )}
          </div>
        </section>
      }

      {/* Active Category Filter Clear Badge */}
      {selectedCategory &&
      <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-on-surface-variant">Filtering category:</span>
          <span className="inline-flex items-center gap-2 bg-primary/20 border border-primary/40 text-primary font-bold px-4 py-1.5 rounded-full text-xs">
            {selectedCategory}
            <button
            onClick={() => setSelectedCategory(null)}
            className="hover:text-white transition-colors cursor-pointer">
            
              ✕
            </button>
          </span>
        </div>
      }

      {/* Search Results List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-white">
            {query || selectedCategory ? `Results (${results.length} tracks)` : "Popular Campus Hits"}
          </h2>
          <span className="text-xs text-on-surface-variant">Explore full audio catalog & student releases</span>
        </div>

        {isSearching ?
        <div className="p-12 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-sm">Fetching tracks and audio artwork...</p>
          </div> :
        results.length > 0 ?
        <div className="space-y-2">
            {results.map((song, idx) => {
            const isCurrent = currentSong?.id === song.id;
            const isCurrentPlaying = isCurrent && isPlaying;
            const isLiked = likedSongIds.has(song.id);

            return (
              <div
                key={song.id}
                className={`flex items-center justify-between p-3 rounded-2xl transition-all group ${
                isCurrent ?
                "bg-primary/20 border border-primary/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]" :
                "hover:bg-white/[0.06] border border-transparent"}`
                }>
                
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <span className="w-6 text-center text-xs font-mono text-on-surface-variant group-hover:hidden">
                      {idx + 1}
                    </span>
                    <button
                    onClick={() => {
                      if (isCurrentPlaying) {
                        setIsPlaying(false);
                      } else {
                        setCurrentSong(song);
                      }
                    }}
                    className="w-6 hidden group-hover:flex items-center justify-center text-primary cursor-pointer">
                    
                      {isCurrentPlaying ?
                    <Pause size={16} fill="currentColor" /> :

                    <Play size={16} fill="currentColor" />
                    }
                    </button>

                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-md">
                      <Image src={song.coverUrl} alt={song.title} fill className="object-cover" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4
                      onClick={() => setCurrentSong(song)}
                      className={`text-sm font-semibold truncate cursor-pointer hover:underline ${
                      isCurrent ? "text-primary font-bold" : "text-white"}`
                      }>
                      
                        {song.title}
                      </h4>
                      <p className="text-xs text-on-surface-variant truncate">{song.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 pl-4">
                    {song.plays &&
                  <span className="text-xs text-on-surface-variant hidden md:block">
                        {song.plays} views
                      </span>
                  }
                    <span className="text-xs font-mono text-on-surface-variant">
                      {formatDuration(song.duration)}
                    </span>
                    <button
                      onClick={() => setDownloadTargetSong(song)}
                      className="p-2 text-on-surface-variant hover:text-primary hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      title="Download Track (MP3)">
                      <Download size={16} className="text-white/50 hover:text-primary transition-colors" />
                    </button>

                    <button
                      onClick={() => toggleLikeSong(song)}
                      className="p-2 text-on-surface-variant hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      title={isLiked ? "Remove from Library" : "Save to Library"}>
                      <Heart
                        size={17}
                        className={isLiked ? "fill-primary text-primary drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]" : "text-white/50 hover:text-white"} />
                    </button>
                  </div>
                </div>);

          })}
          </div> :

        <div className="p-12 text-center text-on-surface-variant space-y-2">
            <Music2 size={36} className="mx-auto text-white/20" />
            <p className="text-base font-semibold text-white">No tracks found</p>
            <p className="text-xs">Try searching for an artist name, song title, or genre.</p>
          </div>
        }
      </section>

      {/* High-Res Audio Download Modal */}
      <DownloadModal
        song={downloadTargetSong}
        isOpen={Boolean(downloadTargetSong)}
        onClose={() => setDownloadTargetSong(null)}
      />
    </div>);

}