"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Play,
  Pause,
  Library as LibraryIcon,
  Music,
  List,
  Grid,
  Sparkles,
  Plus,
  Trash2,
  Shuffle,
  Music2,
  Clock,
  Edit2,
  Check,
  X,
  ListPlus,
  Lock,
  LogIn,
  ArrowRight,
  ShieldCheck,
  Search,
  Volume2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePlayerStore } from "@/store/usePlayerStore";
import { AddToPlaylistModal } from "@/components/modals/AddToPlaylistModal";
import { createClient } from "@/utils/supabase/client";

export default function LibraryPage() {
  const router = useRouter();
  const supabase = createClient();

  const {
    currentSong,
    isPlaying,
    setCurrentSong,
    setIsPlaying,
    setQueue,
    likedSongs,
    likedSongIds,
    toggleLikeSong,
    playlists,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    removeSongFromPlaylist,
    syncPlaylistsFromStorage,
    syncLikesFromStorage,
  } = usePlayerStore();

  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("liked");
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [renameInput, setRenameInput] = useState("");
  const [modalSong, setModalSong] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");

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
    if (user) {
      syncLikesFromStorage();
      syncPlaylistsFromStorage();
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const plId = params.get("playlist");
      if (plId) {
        setSelectedPlaylistId(plId);
        setActiveTab("playlists");
      }
    }
  }, [user, syncLikesFromStorage, syncPlaylistsFromStorage]);

  const activePlaylist = playlists.find((p) => p.id === selectedPlaylistId) || null;

  const handlePlaySong = (song, songList) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setQueue(songList);
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const handlePlayAll = (songList, shuffle = false) => {
    if (songList.length === 0) return;
    const list = shuffle ? [...songList].sort(() => Math.random() - 0.5) : songList;
    setQueue(list);
    setCurrentSong(list[0]);
    setIsPlaying(true);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const created = createPlaylist(newPlaylistName.trim());
    setSelectedPlaylistId(created.id);
    setActiveTab("playlists");
    setNewPlaylistName("");
    setShowCreateModal(false);
  };

  const handleSaveRename = () => {
    if (activePlaylist && renameInput.trim()) {
      renamePlaylist(activePlaylist.id, renameInput.trim());
    }
    setEditingName(false);
  };

  const handleDelete = (plId) => {
    if (confirm("Are you sure you want to delete this playlist?")) {
      deletePlaylist(plId);
      setSelectedPlaylistId(null);
      router.push("/library");
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // 1. Unauthenticated Student Barrier View
  if (!isAuthLoading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-4 pb-28 px-4 select-none max-w-lg mx-auto">
        <div className="bg-[#0b0a16] border border-white/15 rounded-3xl w-full p-6 sm:p-7 text-center space-y-4 sm:space-y-5 shadow-[0_25px_70px_rgba(0,0,0,0.95)] relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Brand Icon Badge */}
          <div className="relative pt-1">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-primary to-cyan-500 p-0.5 mx-auto shadow-[0_0_30px_rgba(168,85,247,0.35)]">
              <div className="w-full h-full bg-[#0c0a18] rounded-[14px] flex items-center justify-center text-white">
                <Lock size={24} className="text-violet-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              </div>
            </div>
          </div>

          {/* Header Texts */}
          <div className="space-y-1.5 relative">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold tracking-widest text-violet-300 uppercase">
              <ShieldCheck size={12} className="text-cyan-400" />
              <span>Campus ID Required</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
              Unlock Your Collection
            </h2>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
              Sign in with your student credentials to access your permanent Liked Songs, create custom study mixes, and manage playlists.
            </p>
          </div>

          {/* Feature Highlights Card */}
          <div className="p-3.5 rounded-2xl bg-[#121024] border border-white/[0.08] text-left space-y-2.5 text-xs text-white/85 max-w-sm mx-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
                <Heart size={13} className="fill-pink-400/20" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-xs">Saved Liked Songs</p>
                <p className="text-[10px] text-on-surface-variant">Access your saved tracks across campus devices.</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <ListPlus size={13} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-xs">Custom Student Playlists</p>
                <p className="text-[10px] text-on-surface-variant">Curate study jams, gym mixes, and favorite student tracks.</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1 max-w-sm mx-auto">
            <Link
              href="/login"
              className="flex-1 py-2.5 px-5 rounded-full bg-gradient-to-r from-violet-600 via-primary to-cyan-500 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-transform active:scale-98 cursor-pointer"
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

  // Filtered tracks list based on searchFilter
  const displayLikedSongs = likedSongs.filter(
    (s) =>
      s.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const displayPlaylistSongs = (activePlaylist?.songs || []).filter(
    (s) =>
      s.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16 select-none max-w-7xl mx-auto">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold shadow-sm">
            <LibraryIcon size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Your Collection</h1>
            <p className="text-xs text-zinc-400">Liked songs, custom playlists, and saved student tracks</p>
          </div>
        </div>

        {/* View Mode & New Playlist Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
          >
            <Plus size={15} /> New Playlist
          </button>

          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-full border border-zinc-800">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                viewMode === "list" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
              }`}
              title="List view"
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                viewMode === "grid" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
              }`}
              title="Grid view"
            >
              <Grid size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab("liked");
              setSelectedPlaylistId(null);
              setSearchFilter("");
            }}
            className={`flex items-center gap-2 text-xs md:text-sm font-semibold px-4 py-2 rounded-full transition-all cursor-pointer ${
              activeTab === "liked" && !selectedPlaylistId
                ? "bg-white text-black shadow-sm"
                : "bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300"
            }`}
          >
            <Heart size={14} className={activeTab === "liked" && !selectedPlaylistId ? "fill-black text-black" : ""} />
            Liked Songs ({likedSongs.length})
          </button>

          <button
            onClick={() => {
              setActiveTab("playlists");
              if (playlists.length > 0 && !selectedPlaylistId) {
                setSelectedPlaylistId(playlists[0].id);
              }
              setSearchFilter("");
            }}
            className={`flex items-center gap-2 text-xs md:text-sm font-semibold px-4 py-2 rounded-full transition-all cursor-pointer ${
              activeTab === "playlists" || selectedPlaylistId
                ? "bg-white text-black shadow-sm"
                : "bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300"
            }`}
          >
            <Music size={14} />
            Playlists ({playlists.length})
          </button>
        </div>

        {/* Quick Filter Search in Collection */}
        <div className="relative hidden md:block w-56">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search collection..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* 3. Tab Content: LIKED SONGS */}
      {activeTab === "liked" && !selectedPlaylistId && (
        <div className="space-y-6">
          {/* Liked Songs Hero Banner */}
          <div className="relative rounded-2xl overflow-hidden p-8 bg-zinc-900 border border-zinc-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                <Heart size={12} className="fill-violet-500 text-violet-500" /> Saved Tracks
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Liked Songs</h2>
              <p className="text-xs text-on-surface-variant font-medium">
                {likedSongs.length} tracks • {Math.floor(likedSongs.reduce((acc, s) => acc + s.duration, 0) / 60)} mins of music
              </p>
            </div>

            {likedSongs.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePlayAll(likedSongs, false)}
                  className="px-6 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer transition-transform active:scale-95"
                >
                  <Play size={16} className="fill-white" /> Play All
                </button>
                <button
                  onClick={() => handlePlayAll(likedSongs, true)}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 cursor-pointer transition-colors"
                  title="Shuffle play"
                >
                  <Shuffle size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Tracks Table */}
          {displayLikedSongs.length > 0 ? (
            viewMode === "list" ? (
              <div className="rounded-2xl bg-[#0c0a18] border border-white/[0.08] p-2 space-y-1 shadow-md">
                <div className="grid grid-cols-12 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/70 border-b border-white/[0.06]">
                  <span className="col-span-1 text-center">#</span>
                  <span className="col-span-6">Title</span>
                  <span className="col-span-3 hidden sm:block">Album / Source</span>
                  <span className="col-span-2 text-right flex items-center justify-end gap-1">
                    <Clock size={12} /> Time
                  </span>
                </div>

                {displayLikedSongs.map((song, idx) => {
                  const isCurrent = currentSong?.id === song.id;
                  return (
                    <div
                      key={song.id}
                      onClick={() => handlePlaySong(song, likedSongs)}
                      className={`grid grid-cols-12 items-center p-2.5 rounded-xl transition-all cursor-pointer group ${
                        isCurrent
                          ? "bg-violet-950/50 border border-violet-500/30 text-white"
                          : "hover:bg-white/[0.05] text-white/80 hover:text-white"
                      }`}
                    >
                      <div className="col-span-1 text-center text-xs font-mono text-on-surface-variant">
                        {isCurrent && isPlaying ? (
                          <Volume2 size={14} className="text-primary mx-auto animate-pulse" />
                        ) : (
                          <span className="group-hover:hidden">{idx + 1}</span>
                        )}
                        <Play size={14} className="text-white hidden group-hover:inline-block mx-auto fill-white" />
                      </div>

                      <div className="col-span-6 flex items-center gap-3 min-w-0 pr-2">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-[#161528]">
                          <Image src={song.coverUrl} alt={song.title} fill className="object-cover" sizes="40px" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isCurrent ? "text-primary" : "text-white"}`}>
                            {song.title}
                          </p>
                          <p className="text-[11px] text-on-surface-variant truncate">{song.artist}</p>
                        </div>
                      </div>

                      <div className="col-span-3 hidden sm:block min-w-0">
                        <span className="text-xs text-on-surface-variant truncate block">
                          {song.album || song.genre || "Campus Single"}
                        </span>
                      </div>

                      <div className="col-span-5 sm:col-span-2 flex items-center justify-end gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalSong(song);
                          }}
                          className="text-on-surface-variant hover:text-cyan-400 p-1.5 transition-colors cursor-pointer"
                          title="Add to playlist"
                        >
                          <ListPlus size={15} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLikeSong(song);
                          }}
                          className="text-pink-500 hover:scale-110 p-1.5 transition-transform cursor-pointer"
                          title="Liked"
                        >
                          <Heart size={15} className="fill-pink-500" />
                        </button>
                        <span className="text-xs font-mono text-on-surface-variant w-10 text-right">
                          {formatDuration(song.duration)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {displayLikedSongs.map((song) => {
                  const isCurrent = currentSong?.id === song.id;
                  return (
                    <div
                      key={song.id}
                      onClick={() => handlePlaySong(song, likedSongs)}
                      className="p-3 rounded-2xl bg-[#0c0a18] border border-white/[0.08] hover:border-violet-500/40 hover:-translate-y-1 transition-all cursor-pointer group shadow-md"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5 border border-white/10 bg-[#161528]">
                        <Image src={song.coverUrl} alt={song.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
                            {isCurrent && isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5 fill-white" />}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-white truncate">{song.title}</p>
                      <p className="text-[11px] text-on-surface-variant truncate">{song.artist}</p>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="p-12 text-center rounded-3xl bg-[#0c0a18] border border-white/10 space-y-3">
              <Heart size={36} className="text-white/20 mx-auto" />
              <h3 className="font-display font-bold text-base text-white">No Liked Tracks Found</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                {searchFilter ? "No tracks match your search." : "Tap the heart (❤️) icon on any track to save it permanently to your collection."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 4. Tab Content: PLAYLISTS VIEW */}
      {(activeTab === "playlists" || selectedPlaylistId) && (
        <div className="space-y-6">
          {/* Playlist Selector Pill Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
            {playlists.map((pl) => {
              const isSelected = activePlaylist?.id === pl.id;
              return (
                <button
                  key={pl.id}
                  onClick={() => {
                    setSelectedPlaylistId(pl.id);
                    setSearchFilter("");
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md shadow-violet-950/50"
                      : "bg-[#121024] text-on-surface-variant hover:text-white border border-white/10"
                  }`}
                >
                  <Music2 size={13} />
                  <span>{pl.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">({pl.songs.length})</span>
                </button>
              );
            })}
          </div>

          {/* Active Playlist Detail View */}
          {activePlaylist ? (
            <div className="space-y-6">
              {/* Playlist Banner */}
              <div className="relative rounded-3xl overflow-hidden p-6 md:p-8 bg-gradient-to-r from-violet-950/60 via-[#15122e] to-[#0c0a18] border border-white/15 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5 min-w-0">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden shrink-0 border border-white/15 shadow-xl bg-[#181630]">
                    <Image
                      src={activePlaylist.coverUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80"}
                      alt={activePlaylist.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                      Campus Playlist
                    </span>

                    {editingName ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={renameInput}
                          onChange={(e) => setRenameInput(e.target.value)}
                          className="bg-[#0c0a18] border border-violet-500 rounded-xl px-3 py-1 text-lg font-bold text-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveRename}
                          className="p-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-500 cursor-pointer"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => setEditingName(false)}
                          className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-2xl md:text-3xl font-black text-white truncate">
                          {activePlaylist.name}
                        </h2>
                        <button
                          onClick={() => {
                            setRenameInput(activePlaylist.name);
                            setEditingName(true);
                          }}
                          className="text-on-surface-variant hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                          title="Rename playlist"
                        >
                          <Edit2 size={15} />
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-on-surface-variant">
                      {activePlaylist.description || "Custom student playlist"}
                    </p>
                    <p className="text-[11px] text-cyan-400 font-mono">
                      {activePlaylist.songs.length} tracks • {Math.floor(activePlaylist.songs.reduce((acc, s) => acc + s.duration, 0) / 60)} mins
                    </p>
                  </div>
                </div>

                {/* Playlist Actions */}
                <div className="flex items-center gap-2.5 self-end md:self-center">
                  {activePlaylist.songs.length > 0 && (
                    <>
                      <button
                        onClick={() => handlePlayAll(activePlaylist.songs, false)}
                        className="px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer transition-transform active:scale-95"
                      >
                        <Play size={15} className="fill-white" /> Play All
                      </button>
                      <button
                        onClick={() => handlePlayAll(activePlaylist.songs, true)}
                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 cursor-pointer transition-colors"
                        title="Shuffle playlist"
                      >
                        <Shuffle size={15} />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleDelete(activePlaylist.id)}
                    className="p-3 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 cursor-pointer transition-colors"
                    title="Delete playlist"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Playlist Tracks Table */}
              {displayPlaylistSongs.length > 0 ? (
                <div className="rounded-2xl bg-[#0c0a18] border border-white/[0.08] p-2 space-y-1 shadow-md">
                  <div className="grid grid-cols-12 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/70 border-b border-white/[0.06]">
                    <span className="col-span-1 text-center">#</span>
                    <span className="col-span-6">Title</span>
                    <span className="col-span-3 hidden sm:block">Album / Source</span>
                    <span className="col-span-2 text-right flex items-center justify-end gap-1">
                      <Clock size={12} /> Time
                    </span>
                  </div>

                  {displayPlaylistSongs.map((song, idx) => {
                    const isCurrent = currentSong?.id === song.id;
                    return (
                      <div
                        key={`${activePlaylist.id}_${song.id}_${idx}`}
                        onClick={() => handlePlaySong(song, activePlaylist.songs)}
                        className={`grid grid-cols-12 items-center p-2.5 rounded-xl transition-all cursor-pointer group ${
                          isCurrent
                            ? "bg-violet-950/50 border border-violet-500/30 text-white"
                            : "hover:bg-white/[0.05] text-white/80 hover:text-white"
                        }`}
                      >
                        <div className="col-span-1 text-center text-xs font-mono text-on-surface-variant">
                          {isCurrent && isPlaying ? (
                            <Volume2 size={14} className="text-primary mx-auto animate-pulse" />
                          ) : (
                            <span className="group-hover:hidden">{idx + 1}</span>
                          )}
                          <Play size={14} className="text-white hidden group-hover:inline-block mx-auto fill-white" />
                        </div>

                        <div className="col-span-6 flex items-center gap-3 min-w-0 pr-2">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-[#161528]">
                            <Image src={song.coverUrl} alt={song.title} fill className="object-cover" sizes="40px" />
                          </div>
                          <div className="min-w-0">
                            <p className={`text-xs font-bold truncate ${isCurrent ? "text-primary" : "text-white"}`}>
                              {song.title}
                            </p>
                            <p className="text-[11px] text-on-surface-variant truncate">{song.artist}</p>
                          </div>
                        </div>

                        <div className="col-span-3 hidden sm:block min-w-0">
                          <span className="text-xs text-on-surface-variant truncate block">
                            {song.album || song.genre || "Campus Mix"}
                          </span>
                        </div>

                        <div className="col-span-5 sm:col-span-2 flex items-center justify-end gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSongFromPlaylist(activePlaylist.id, song.id);
                            }}
                            className="text-on-surface-variant hover:text-red-400 p-1.5 transition-colors cursor-pointer"
                            title="Remove from playlist"
                          >
                            <Trash2 size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLikeSong(song);
                            }}
                            className="p-1.5 transition-transform cursor-pointer"
                            title="Like"
                          >
                            <Heart
                              size={15}
                              className={
                                likedSongIds.has(song.id)
                                  ? "fill-pink-500 text-pink-500"
                                  : "text-on-surface-variant hover:text-white"
                              }
                            />
                          </button>
                          <span className="text-xs font-mono text-on-surface-variant w-10 text-right">
                            {formatDuration(song.duration)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center rounded-3xl bg-[#0c0a18] border border-white/10 space-y-3">
                  <Music2 size={36} className="text-white/20 mx-auto" />
                  <h3 className="font-display font-bold text-base text-white">This Playlist is Empty</h3>
                  <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                    Browse tracks from Discover or Campus Showcase and tap &quot;Add to Playlist&quot; to build this mix.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-[#0c0a18] border border-white/10 space-y-3">
              <Music size={36} className="text-white/20 mx-auto" />
              <h3 className="font-display font-bold text-base text-white">No Playlist Selected</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                Create a playlist or pick one above to start listening.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick Create Playlist Dialog Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
          <div className="bg-[#0b0a16] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-[0_25px_70px_rgba(0,0,0,0.98)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-white">Create New Playlist</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-on-surface-variant hover:text-white p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-violet-200 uppercase mb-1.5">
                  Playlist Title *
                </label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Enter playlist title"
                  autoFocus
                  required
                  className="w-full bg-[#121024] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-full text-xs text-on-surface-variant hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-md cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add To Playlist Modal */}
      <AddToPlaylistModal
        song={modalSong}
        isOpen={!!modalSong}
        onClose={() => setModalSong(null)}
      />
    </div>
  );
}
