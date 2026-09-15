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
  Heart,
  User,
  ShieldCheck,
  X } from
"lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useAuthModalStore } from "@/store/useAuthModalStore";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/AuthContext";

export function Sidebar() {
  const pathname = usePathname();
  const { user, profile, isAdmin } = useAuth();
  const supabase = createClient();
  const [activePlaylistId, setActivePlaylistId] = useState(null);
  const [mounted, setMounted] = useState(false);

  const { likedSongIds, playlists, createPlaylist, syncPlaylistsFromStorage, syncLikesFromStorage } = usePlayerStore();
  const { openAuthModal } = useAuthModalStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const handleOpenCreate = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      openAuthModal("create and manage student playlists");
      return;
    }
    setShowCreateModal(true);
  };

  const handleStudioClick = async (e) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      e.preventDefault();
      openAuthModal("access artist studio and release analytics");
    }
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
    { name: "Campus Charts", href: "/charts", icon: Disc3 },
    { name: "Your Collection", href: "/library", icon: ListMusic },
    ...(isAdmin ? [{ name: "Admin Center", href: "/admin", icon: ShieldCheck }] : []),
  ];


  const handleCreate = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    createPlaylist(newPlaylistName.trim());
    setNewPlaylistName("");
    setShowCreateModal(false);
  };

  const handleNavClick = async (e, href, name) => {
    if (href === "/campus" || href === "/library") {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        e.preventDefault();
        openAuthModal(
          href === "/campus"
            ? "access Student Showcase and live campus productions"
            : "access your permanent collection & playlists"
        );
      }
    }
  };

  const handleLikedSongsClick = async (e) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      e.preventDefault();
      openAuthModal("access your Liked Songs collection");
    }
  };

  const handlePlaylistClick = async (e, playlistName) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      e.preventDefault();
      openAuthModal(`access "${playlistName}" and manage your library`);
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-[240px] shrink-0 h-full bg-[#09090b] border-r border-zinc-800/80 p-3 select-none overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden z-30">
      {/* Primary Navigation Buttons */}
      <nav className="space-y-1 pb-3 border-b border-zinc-800/80">
        {navItems.map((item) => {
          const isActive = pathname === item.href && (!activePlaylistId || item.href !== "/library");
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href, item.name)}
              className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive ?
              "bg-zinc-800 text-white font-semibold" :
              "text-zinc-400 hover:text-white hover:bg-zinc-800/50"}`
              }>
              <item.icon
                size={18}
                className={isActive ? "text-white" : "text-zinc-400"} />
              <span>{item.name}</span>
            </Link>);
        })}
      </nav>

      {/* + New Playlist Button */}
      <div className="py-3 border-b border-zinc-800/80">
        <button
          onClick={handleOpenCreate}
          className="w-full py-2 px-3.5 rounded-lg bg-zinc-800/70 hover:bg-zinc-700/80 text-zinc-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-zinc-700/50 cursor-pointer">
          <Plus size={15} />
          Create Playlist
        </button>
      </div>

      {/* Inline Quick Modal for New Playlist */}
      {showCreateModal &&
      <form onSubmit={handleCreate} className="p-3 my-2 rounded-xl bg-zinc-900 border border-zinc-700 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-white">New Playlist</span>
            <button
            type="button"
            onClick={() => setShowCreateModal(false)}
            className="text-zinc-400 hover:text-white p-0.5">
              <X size={14} />
            </button>
          </div>
          <input
          type="text"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          placeholder="Playlist title"
          autoFocus
          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500" />
        
          <button
          type="submit"
          className="w-full py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors cursor-pointer">
            Create
          </button>
        </form>
      }

      {/* Custom & Auto Playlists List */}
      <div className="pt-2 space-y-1 flex-1 overflow-y-auto [scrollbar-width:none]">
        {/* Pinned Liked Songs */}
        <Link
          href="/library"
          onClick={handleLikedSongsClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-colors group ${
          pathname === "/library" && !activePlaylistId ?
          "bg-zinc-800 text-white" :
          "text-zinc-400 hover:text-white hover:bg-zinc-800/50"}`
          }>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 shadow-[0_2px_8px_rgba(124,58,237,0.35)] flex items-center justify-center shrink-0">
            <Heart size={14} className="fill-white text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-xs text-white truncate">Liked Songs</span>
            </div>
            <span className="text-[11px] text-zinc-400" suppressHydrationWarning>
              {mounted ? likedSongIds.size : 0} {likedSongIds.size === 1 ? "track" : "tracks"}
            </span>
          </div>
        </Link>

        {/* User Playlists */}
        <div className="pt-3 pb-1 px-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500" suppressHydrationWarning>
            Your Playlists ({mounted ? playlists.length : 1})
          </span>
        </div>

        {playlists.map((pl) => {
          const isSelected = activePlaylistId === pl.id;
          return (
            <Link
              key={pl.id}
              href={`/library?playlist=${pl.id}`}
              onClick={(e) => handlePlaylistClick(e, pl.name)}
              className={`flex flex-col px-3.5 py-2 rounded-lg text-sm transition-colors group ${
              isSelected ?
              "bg-zinc-800 text-white" :
              "text-zinc-400 hover:text-white hover:bg-zinc-800/40"}`
              }>
              <div className="flex items-center justify-between">
                <span className="font-medium text-xs text-white truncate">{pl.name}</span>
                <Music2 size={12} className="text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0 ml-1" />
              </div>
              <span className="text-[11px] text-zinc-500 mt-0.5" suppressHydrationWarning>
                {pl.songs.length} {pl.songs.length === 1 ? "track" : "tracks"}
              </span>
            </Link>);
        })}
      </div>

      {/* Footer Navigation: Studio */}
      <div className="mt-auto pt-3 border-t border-zinc-800/80 space-y-1 shrink-0">
        <Link
          href="/dashboard"
          onClick={handleStudioClick}
          className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors cursor-pointer"
        >
          <Sliders size={16} />
          <span>Artist Studio</span>
        </Link>
      </div>
    </aside>
  );

}