"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AudioLines,
  Disc3,
  ListMusic,
  GraduationCap,
  Plus,
  Pin,
  Sliders,
  Music2,
  X } from

"lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { AuthModal } from "@/components/modals/AuthModal";
import { createClient } from "@/utils/supabase/client";

export function Sidebar() {
  const pathname = usePathname();
  const supabase = createClient();
  const [activePlaylistId, setActivePlaylistId] = useState(null);
  const [mounted, setMounted] = useState(false);

  const { likedSongIds, playlists, createPlaylist, syncPlaylistsFromStorage, syncLikesFromStorage } = usePlayerStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const handleOpenCreate = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setShowAuthModal(true);
      return;
    }
    setShowCreateModal(true);
  };

  useEffect(() => {
    setMounted(true);
    syncLikesFromStorage();
    syncPlaylistsFromStorage();
  }, [syncLikesFromStorage, syncPlaylistsFromStorage]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setActivePlaylistId(params.get("playlist"));
    }
  }, [pathname]);

  const navItems = [
  { name: "Discover", href: "/", icon: AudioLines },
  { name: "Student Showcase", href: "/campus", icon: GraduationCap },
  { name: "Campus Charts", href: "/search", icon: Disc3 },
  { name: "Your Collection", href: "/library", icon: ListMusic }];


  const handleCreate = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    createPlaylist(newPlaylistName.trim());
    setNewPlaylistName("");
    setShowCreateModal(false);
  };

  return (
    <aside className="hidden md:flex flex-col w-[240px] shrink-0 h-full bg-[#0a0914]/85 backdrop-blur-2xl border-r border-white/[0.08] p-3 select-none overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shadow-2xl z-30">
      {/* Primary Navigation Pill Buttons */}
      <nav className="space-y-1 pb-4 border-b border-white/[0.08]">
        {navItems.map((item) => {
          const isActive = pathname === item.href && (!activePlaylistId || item.href !== "/library");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive ?
              "bg-primary/20 text-white font-semibold border border-primary/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]" :
              "text-on-surface-variant hover:text-white hover:bg-white/[0.05]"}`
              }>
              
              {isActive &&
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-primary to-secondary rounded-r-full shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              }
              <item.icon
                size={19}
                className={isActive ? "text-primary drop-shadow-[0_0_6px_rgba(168,85,247,0.6)]" : "text-on-surface-variant"} />
              
              <span>{item.name}</span>
            </Link>);

        })}
      </nav>

      {/* + New Playlist Button */}
      <div className="py-3.5 border-b border-white/[0.08]">
        <button
          onClick={handleOpenCreate}
          className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-violet-600/20 to-cyan-500/20 hover:from-violet-600/30 hover:to-cyan-500/30 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98 border border-violet-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)] cursor-pointer">
          
          <Plus size={16} className="text-primary" />
          Create Playlist
        </button>
      </div>

      {/* Inline Quick Modal for New Playlist */}
      {showCreateModal &&
      <form onSubmit={handleCreate} className="p-3 my-2 rounded-2xl bg-[#141226] border border-violet-500/40 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white">New Playlist</span>
            <button
            type="button"
            onClick={() => setShowCreateModal(false)}
            className="text-on-surface-variant hover:text-white p-0.5">
            
              <X size={14} />
            </button>
          </div>
          <input
          type="text"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          placeholder="Enter title"
          autoFocus
          className="w-full bg-[#0d0c18] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-primary" />
        
          <button
          type="submit"
          className="w-full py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-colors cursor-pointer">
          
            Create
          </button>
        </form>
      }

      {/* Custom & Auto Playlists List */}
      <div className="pt-2 space-y-1 flex-1 overflow-y-auto [scrollbar-width:none]">
        {/* Pinned Liked Songs */}
        <Link
          href="/library"
          className={`flex flex-col px-4 py-2 rounded-xl text-sm transition-all group ${
          pathname === "/library" && !activePlaylistId ?
          "bg-white/10 text-white border border-white/10" :
          "text-on-surface-variant hover:text-white hover:bg-white/[0.05]"}`
          }>
          
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-white truncate">Liked Songs</span>
            <Pin size={12} className="text-white/40 group-hover:text-primary rotate-45 transition-colors" />
          </div>
          <span className="text-[10px] text-cyan-400 mt-0.5 font-medium" suppressHydrationWarning>
            📌 {mounted ? likedSongIds.size : 0} tracks saved
          </span>
        </Link>

        {/* User Playlists */}
        <div className="pt-2 pb-1 px-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60" suppressHydrationWarning>
            Your Playlists ({mounted ? playlists.length : 1})
          </span>
        </div>

        {playlists.map((pl) => {
          const isSelected = activePlaylistId === pl.id;
          return (
            <Link
              key={pl.id}
              href={`/library?playlist=${pl.id}`}
              className={`flex flex-col px-4 py-2 rounded-xl text-sm transition-all group ${
              isSelected ?
              "bg-violet-950/50 text-white border border-violet-500/40 shadow-sm" :
              "text-on-surface-variant hover:text-white hover:bg-white/[0.05]"}`
              }>
              
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-white truncate">{pl.name}</span>
                <Music2 size={12} className="text-white/30 group-hover:text-secondary transition-colors shrink-0 ml-1" />
              </div>
              <span className="text-[10px] text-on-surface-variant/70 mt-0.5" suppressHydrationWarning>
                {pl.songs.length} {pl.songs.length === 1 ? "track" : "tracks"}
              </span>
            </Link>);

        })}
      </div>

      {/* Footer Navigation: Studio */}
      <div className="mt-auto pt-3 border-t border-white/[0.08] space-y-1 shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-white hover:bg-white/[0.05] transition-all">
          
          <Sliders size={16} className="text-primary" />
          <span>Artist Studio</span>
        </Link>
      </div>

      {/* Auth Barrier Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        actionText="create and manage playlists" />
      
    </aside>);

}