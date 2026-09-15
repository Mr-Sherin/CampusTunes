"use client";

import { useEffect, useState } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Heart, X, Users, Sparkles, ListPlus, Download, Mic2, Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { AddToPlaylistModal } from "@/components/modals/AddToPlaylistModal";
import { LyricsModal } from "@/components/modals/LyricsModal";
import { DownloadModal } from "@/components/modals/DownloadModal";
import { useAuthModalStore } from "@/store/useAuthModalStore";
import { createClient } from "@/utils/supabase/client";

export function RightPanel() {
  const supabase = createClient();
  const { currentSong, isRightPanelOpen, toggleRightPanel, likedSongIds, toggleLikeSong, queue, setIsQueueOpen } =
    usePlayerStore();
  const { openAuthModal } = useAuthModalStore();

  const [artistData, setArtistData] = useState(null);
  const [coverImgSrc, setCoverImgSrc] = useState("");
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const handleLikeClick = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      openAuthModal("save tracks to your Liked Songs collection");
      return;
    }
    if (currentSong) toggleLikeSong(currentSong);
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
    setShowDownloadModal(true);
  };

  useEffect(() => {
    if (currentSong?.coverUrl) {
      setCoverImgSrc(currentSong.coverUrl);
    }
  }, [currentSong?.coverUrl]);

  useEffect(() => {
    if (!currentSong?.artist) return;

    let isMounted = true;
    fetch(`/api/artist/info?name=${encodeURIComponent(currentSong.artist)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data) {
          setArtistData(data);
        }
      })
      .catch((err) => {
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
    <aside className="hidden xl:flex flex-col w-[340px] shrink-0 h-full bg-[#09090b] border-l border-zinc-800/80 p-4 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden select-none z-30">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 pt-1 border-b border-zinc-800 mb-4">
        <h3 className="text-sm font-semibold text-white truncate pr-2">
          {currentSong.title}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleRightPanel}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Close Panel"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {/* Large Hero Artwork */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-xl border border-zinc-800 mb-4 group bg-zinc-900">
        <Image
          src={coverImgSrc || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80"}
          alt={currentSong.title}
          fill
          className="object-cover group-hover:scale-102 transition-transform duration-300"
          sizes="340px"
          onError={() => {
            if (currentSong.youtubeId) {
              setCoverImgSrc(`https://i.ytimg.com/vi/${currentSong.youtubeId}/hqdefault.jpg`);
            } else {
              setCoverImgSrc("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80");
            }
          }}
        />
      </div>

      {/* Track Title & Artist */}
      <div className="flex items-center justify-between mb-3">
        <div className="min-w-0 pr-2">
          <h2 className="text-xl font-bold text-white truncate hover:underline cursor-pointer">
            {currentSong.title}
          </h2>
          <p className="text-sm text-zinc-400 hover:text-white truncate cursor-pointer transition-colors mt-0.5">
            {currentSong.artist}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handlePlaylistClick}
            className="p-1.5 text-zinc-400 hover:text-white transition-all cursor-pointer"
            title="Add to playlist"
          >
            <ListPlus size={18} />
          </button>

          <button
            onClick={handleLikeClick}
            className="p-1.5 text-zinc-400 hover:text-white transition-all cursor-pointer"
            title={isLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}
          >
            <Heart
              size={19}
              className={isLiked ? "fill-violet-400 text-violet-400" : "text-zinc-400 hover:text-white"}
            />
          </button>
        </div>
      </div>

      {/* Action Buttons: Download & Live Lyrics */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer"
        >
          <Download size={14} />
          <span>Download</span>
        </button>

        <button
          onClick={() => setShowLyricsModal(true)}
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer"
        >
          <Mic2 size={14} />
          <span>Lyrics</span>
        </button>
      </div>

      {/* Spotify-style About the Artist Card */}
      <div className="rounded-xl overflow-hidden border border-zinc-800 mb-4 bg-zinc-900/60 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            About the artist
          </span>
        </div>

        {/* Artist Avatar & Identity Header */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border border-zinc-700 bg-zinc-800">
            <Image
              src={artistImage}
              alt={currentSong.artist}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-base text-white truncate">{currentSong.artist}</h4>
            <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
              <Users size={12} className="text-zinc-500 shrink-0" />
              <span>{currentSong.artistBio?.monthlyListeners || currentSong.plays || "4.2M"} monthly listeners</span>
            </p>
          </div>
        </div>

        {/* Biography Paragraph */}
        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 pt-2 border-t border-zinc-800/80">
          {artistBio}
        </p>
      </div>

      {/* Next in Queue Snippet */}
      {nextSong && (
        <div className="rounded-xl p-3.5 border border-zinc-800 bg-zinc-900/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Next in queue
            </span>
            <span
              onClick={() => setIsQueueOpen(true)}
              className="text-xs text-zinc-400 hover:text-white hover:underline cursor-pointer"
            >
              Open queue
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-zinc-800 bg-zinc-800">
              <Image src={nextSong.coverUrl} alt={nextSong.title} fill className="object-cover" sizes="44px" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{nextSong.title}</p>
              <p className="text-xs text-zinc-400 truncate">{nextSong.artist}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add To Playlist Modal */}
      <AddToPlaylistModal
        song={currentSong}
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
      />

      {/* Lyrics Modal */}
      <LyricsModal
        isOpen={showLyricsModal}
        onClose={() => setShowLyricsModal(false)}
        song={currentSong}
      />

      {/* In-App Native Download Modal */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        song={currentSong}
      />
    </aside>
  );
}