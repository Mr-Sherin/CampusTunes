"use client";

import { useEffect, useState } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Heart, X, Users, Sparkles, ListPlus, Download } from "lucide-react";
import Image from "next/image";
import { AddToPlaylistModal } from "@/components/modals/AddToPlaylistModal";
import { DownloadModal } from "@/components/modals/DownloadModal";
import { AuthModal } from "@/components/modals/AuthModal";
import { createClient } from "@/utils/supabase/client";








export function RightPanel() {
  const supabase = createClient();
  const { currentSong, isRightPanelOpen, toggleRightPanel, likedSongIds, toggleLikeSong, queue, setIsQueueOpen } =
  usePlayerStore();

  const [artistData, setArtistData] = useState(null);
  const [coverImgSrc, setCoverImgSrc] = useState("");
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authActionText, setAuthActionText] = useState("access playlists & saved songs");

  const handleLikeClick = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setAuthActionText("save tracks to Liked Songs");
      setShowAuthModal(true);
      return;
    }
    if (currentSong) toggleLikeSong(currentSong);
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

  useEffect(() => {
    if (currentSong?.coverUrl) {
      setCoverImgSrc(currentSong.coverUrl);
    }
  }, [currentSong?.coverUrl]);

  useEffect(() => {
    if (!currentSong?.artist) return;

    let isMounted = true;
    fetch(`/api/artist/info?name=${encodeURIComponent(currentSong.artist)}`).
    then((res) => res.json()).
    then((data) => {
      if (isMounted && data) {
        setArtistData(data);
      }
    }).
    catch((err) => {
      console.error("Artist info fetch error:", err);
    });

    return () => {
      isMounted = false;
    };
  }, [currentSong?.artist]);

  if (!isRightPanelOpen || !currentSong) return null;

  const isLiked = likedSongIds.has(currentSong.id);
  const nextSong = queue.find((s) => s.id !== currentSong.id) || queue[0];

  const artistImage =
  artistData?.image ||
  currentSong.artistBio?.bannerUrl ||
  currentSong.coverUrl;

  const artistBio =
  artistData?.bio ||
  currentSong.artistBio?.description ||
  `${currentSong.artist} is an active recording artist streaming on CampusTunes with high-fidelity sound and campus community playlists.`;

  return (
    <aside className="hidden xl:flex flex-col w-[340px] shrink-0 h-full bg-[#0a0914]/90 backdrop-blur-2xl border-l border-white/[0.08] p-4 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden select-none z-30">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 pt-1 border-b border-white/[0.06] mb-4">
        <h3 className="font-display text-sm font-bold text-white truncate pr-2">
          {currentSong.title}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleRightPanel}
            className="p-1.5 text-on-surface-variant hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            title="Close Panel">
            
            <X size={17} />
          </button>
        </div>
      </div>

      {/* Large Hero Artwork with Fallback */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10 mb-4 group bg-[#161528]">
        <Image
          src={coverImgSrc || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80"}
          alt={currentSong.title}
          fill
          className="object-cover group-hover:scale-103 transition-transform duration-500"
          sizes="340px"
          onError={() => {
            if (currentSong.youtubeId) {
              setCoverImgSrc(`https://i.ytimg.com/vi/${currentSong.youtubeId}/hqdefault.jpg`);
            } else {
              setCoverImgSrc("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80");
            }
          }} />
        
      </div>

      {/* Track Title & Artist */}
      <div className="flex items-center justify-between mb-5">
        <div className="min-w-0 pr-2">
          <h2 className="font-display text-xl font-bold text-white truncate hover:underline cursor-pointer">
            {currentSong.title}
          </h2>
          <p className="text-sm text-on-surface-variant hover:text-white truncate cursor-pointer transition-colors">
            {currentSong.artist}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handlePlaylistClick}
            className="p-1.5 text-on-surface-variant hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
            title="Add to playlist">
            <ListPlus size={18} className="text-white/60 hover:text-cyan-400" />
          </button>

          <button
            onClick={() => setShowDownloadModal(true)}
            className="p-1.5 text-on-surface-variant hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
            title="Download Track (High-Res MP3)">
            <Download size={18} className="text-white/60 hover:text-primary transition-colors" />
          </button>

          <button
            onClick={handleLikeClick}
            className="p-1.5 text-on-surface-variant hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
            title={isLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}>
            <Heart
              size={19}
              className={isLiked ? "fill-primary text-primary drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" : "text-white/60 hover:text-white"} />
          </button>
        </div>
      </div>

      {/* Quick Download Banner */}
      <div 
        onClick={() => setShowDownloadModal(true)}
        className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-primary/15 via-secondary/15 to-primary/10 border border-primary/25 flex items-center justify-between cursor-pointer hover:border-primary/50 transition-all group shadow-md"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <Download size={15} />
          </div>
          <div>
            <p className="text-xs font-bold text-white group-hover:text-primary transition-colors">Download Audio</p>
            <p className="text-[10px] text-white/60">320kbps MP3 / Master WAV</p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary/20 text-secondary border border-secondary/30">
          Studio HQ
        </span>
      </div>

      {/* Redesigned Spotify-style About the Artist Card with Full Profile Frame */}
      <div className="rounded-2xl overflow-hidden glass-panel border border-white/10 mb-4 relative group bg-gradient-to-b from-white/[0.04] to-transparent p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-1.5">
            <Sparkles size={12} className="text-secondary" /> About the artist
          </span>
        </div>

        {/* Artist Avatar & Identity Header */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border-2 border-primary/40 shadow-[0_0_15px_rgba(168,85,247,0.3)] bg-[#121124]">
            <Image
              src={artistImage}
              alt={currentSong.artist}
              fill
              className="object-cover"
              sizes="64px" />
            
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-display font-bold text-base text-white truncate">{currentSong.artist}</h4>
            <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
              <Users size={12} className="text-primary shrink-0" />
              <span>{currentSong.artistBio?.monthlyListeners || currentSong.plays || "4.2M"} monthly listeners</span>
            </p>
          </div>
        </div>

        {/* Biography Paragraph */}
        <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-4 pt-1 border-t border-white/[0.06]">
          {artistBio}
        </p>
      </div>

      {/* Next in Queue Snippet */}
      {nextSong &&
      <div className="rounded-2xl glass-panel p-4 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Next in queue
            </span>
            <span
            onClick={() => setIsQueueOpen(true)}
            className="text-xs text-secondary hover:underline cursor-pointer">
            
              Open queue
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-[#161528]">
              <Image src={nextSong.coverUrl} alt={nextSong.title} fill className="object-cover" sizes="48px" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{nextSong.title}</p>
              <p className="text-xs text-on-surface-variant truncate">{nextSong.artist}</p>
            </div>
          </div>
        </div>
      }

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
      
    </aside>);

}