"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Bell,
  BellOff,
  Loader2,
  Music2,
  User,
  LogOut,
  Sliders,
  Settings,
  Upload,
  CheckCheck } from


"lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { usePlayerStore } from "@/store/usePlayerStore";
import { CampusLogo } from "@/components/brand/CampusLogo";
import { createClient } from "@/utils/supabase/client";










export function Navbar() {
  const router = useRouter();
  const { setCurrentSong, syncLikesFromStorage } = usePlayerStore();
  const supabase = createClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const searchRef = useRef(null);
  const profileMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Sync liked songs on initial hydration
  useEffect(() => {
    syncLikesFromStorage();
  }, [syncLikesFromStorage]);

  // Query real uploaded track activity from Supabase (Zero dummy notifications)
  useEffect(() => {
    async function loadRealActivity() {
      try {
        const { data } = await supabase.
        from("songs").
        select("id, title, artist, created_at").
        order("created_at", { ascending: false }).
        limit(3);

        if (data && data.length > 0) {
          const liveItems = data.map((track) => ({
            id: track.id,
            title: `New Track: ${track.title}`,
            desc: `Uploaded by ${track.artist || "Student Musician"} on Campus Showcase`,
            time: "Recent",
            unread: true,
            link: "/campus"
          }));
          setNotifications(liveItems);
        } else {
          setNotifications([]);
        }
      } catch {
        setNotifications([]);
      }
    }
    loadRealActivity();
  }, [supabase]);

  // Live Supabase Auth Listener
  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Click outside to dismiss menus
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut (Ctrl+K or Cmd+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const input = searchRef.current?.querySelector("input");
        input?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounced search
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/yt/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error(`Search request failed with status ${res.status}`);
        const data = await res.json();
        setSearchResults(data.songs || []);
      } catch (err) {
        console.error("Search fetch error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setShowProfileMenu(false);
    router.refresh();
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const displayName =
  user?.user_metadata?.full_name ||
  user?.user_metadata?.first_name ||
  user?.email?.split("@")[0] ||
  "Student";

  return (
    <header className="h-16 shrink-0 bg-[#0a0914]/90 backdrop-blur-2xl border-b border-white/[0.08] px-4 md:px-6 z-40 sticky top-0 select-none flex items-center justify-between gap-4">
      {/* 1. Left Section: Brand Logo & Navigation Controls */}
      <div className="flex items-center gap-3 shrink-0">
        <CampusLogo size={32} showText={true} />

        <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-white/10">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
            title="Go back">
            
            <ChevronLeft size={17} />
          </button>
          <button
            onClick={() => router.forward()}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
            title="Go forward">
            
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      {/* 2. Center Section: Search Bar */}
      <div className="flex-1 max-w-xl mx-auto" ref={searchRef}>
        <div className="relative">
          <div
            className={`flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all duration-300 ${
            isSearchFocused ?
            "bg-[#141226] border-violet-500/60 shadow-[0_0_20px_rgba(168,85,247,0.35)] ring-1 ring-violet-500/30" :
            "bg-[#111022]/90 hover:bg-[#16152b] border-white/10"}`
            }>
            
            {isSearching ?
            <Loader2 size={16} className="text-primary animate-spin shrink-0" /> :

            <Search size={16} className="text-on-surface-variant shrink-0" />
            }
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search artists, tracks, Malayalam anthems..."
              className="w-full bg-transparent text-xs md:text-sm text-white placeholder:text-on-surface-variant/60 focus:outline-none" />
            
            {searchQuery &&
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-on-surface-variant hover:text-white px-2 cursor-pointer shrink-0"
              title="Clear search">
              
                ✕
              </button>
            }
          </div>

          {/* Instant Dropdown Search Results - 100% Solid Dark Surface */}
          {isSearchFocused && searchQuery.trim().length > 0 &&
          <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-[#0c0b17] border border-white/20 p-2.5 shadow-[0_25px_60px_rgba(0,0,0,0.98)] z-[70] max-h-[380px] overflow-y-auto [scrollbar-width:none]">
              {searchResults.length > 0 ?
            <div className="space-y-1.5">
                  {searchResults.slice(0, 6).map((song) =>
              <div
                key={song.id}
                onClick={() => {
                  setCurrentSong(song);
                  setIsSearchFocused(false);
                  setSearchQuery("");
                }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-[#131124] hover:bg-[#1f1a3a] border border-white/5 hover:border-violet-500/30 cursor-pointer transition-all group">
                
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-[#1a1830]">
                        <Image src={song.coverUrl} alt={song.title} fill className="object-cover" sizes="40px" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate group-hover:text-primary transition-colors">
                          {song.title}
                        </p>
                        <p className="text-[11px] text-on-surface-variant truncate">{song.artist}</p>
                      </div>
                      <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                        Play
                      </span>
                    </div>
              )}
                </div> :
            !isSearching ?
            <div className="p-4 text-center text-xs text-on-surface-variant flex flex-col items-center gap-1">
                  <Music2 size={20} className="text-white/30" />
                  <span>No musical tracks found for &quot;{searchQuery}&quot;</span>
                </div> :
            null}
            </div>
          }
        </div>
      </div>

      {/* 3. Right Section: Icon Action Controls & Profile / Auth */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Upload Track Icon Button (Opens Studio directly with upload dialog) */}
        <Link
          href="/dashboard?upload=true"
          className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
          title="Upload Original Track">
          
          <Upload size={16} className="text-secondary" />
        </Link>

        {/* Notifications Popover Menu */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm relative"
            title="Notifications">
            
            <Bell size={16} />
            {unreadCount > 0 &&
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#0a0914] animate-pulse" />
            }
          </button>

          {/* Notifications Dropdown Modal - 100% Solid Opaque */}
          {showNotifications &&
          <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-[#121124] border border-white/20 p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.95)] z-[60] space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white tracking-tight">Campus Notifications</span>
                  {unreadCount > 0 &&
                <span className="px-2 py-0.5 bg-primary/30 text-primary text-[10px] font-bold rounded-full border border-primary/30">
                      {unreadCount} new
                    </span>
                }
                </div>
                {unreadCount > 0 &&
              <button
                onClick={markAllRead}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer font-medium">
                
                    <CheckCheck size={13} /> Mark read
                  </button>
              }
              </div>

              {notifications.length > 0 ?
            <div className="space-y-2 max-h-[320px] overflow-y-auto [scrollbar-width:none]">
                  {notifications.map((item) =>
              <Link
                key={item.id}
                href={item.link}
                onClick={() => setShowNotifications(false)}
                className={`block p-3 rounded-xl border transition-all cursor-pointer ${
                item.unread ?
                "bg-[#1f1a3a] border-violet-500/40 hover:bg-[#27214a] shadow-md" :
                "bg-[#161528] border-white/[0.08] hover:bg-[#1d1c33]"}`
                }>
                
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-white truncate">{item.title}</p>
                        <span className="text-[10px] text-on-surface-variant shrink-0">{item.time}</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">{item.desc}</p>
                    </Link>
              )}
                </div> :

            <div className="p-6 text-center text-on-surface-variant flex flex-col items-center justify-center gap-2">
                  <BellOff size={28} className="text-white/20" />
                  <p className="text-xs font-bold text-white">All caught up!</p>
                  <p className="text-[11px] text-on-surface-variant max-w-[200px]">
                    No new notifications. Alerts and student uploads will appear here.
                  </p>
                </div>
            }
            </div>
          }
        </div>

        {/* User Account / Profile Icon */}
        <div className="relative" ref={profileMenuRef}>
          {user ?
          <div>
              <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center p-0.5 rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title={displayName}>
              
                <div className="relative w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-cyan-400 shrink-0 shadow-[0_0_12px_rgba(168,85,247,0.5)]">
                  <div className="relative w-full h-full rounded-full bg-[#121124] flex items-center justify-center text-white font-bold text-xs uppercase overflow-hidden">
                    {displayName.charAt(0)}
                  </div>
                </div>
              </button>

              {/* Profile Menu Dropdown - 100% Solid Opaque */}
              {showProfileMenu &&
            <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-[#121124] border border-white/20 p-2 shadow-[0_25px_60px_rgba(0,0,0,0.95)] z-[60] space-y-1">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-xs font-bold text-white truncate">{displayName}</p>
                    <p className="text-[11px] text-on-surface-variant truncate">{user.email}</p>
                  </div>

                  <Link
                href="/dashboard"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                
                    <Sliders size={14} className="text-primary" />
                    <span>Artist Studio</span>
                  </Link>

                  <Link
                href="/settings"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                
                    <Settings size={14} className="text-cyan-400" />
                    <span>Account Settings</span>
                  </Link>

                  <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer text-left">
                
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
            }
            </div> :

          <Link
            href="/login"
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-500 hover:opacity-95 text-white flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Sign In / Account">
            
              <User size={16} />
            </Link>
          }
        </div>
      </div>
    </header>);

}