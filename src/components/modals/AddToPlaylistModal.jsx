"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ListPlus,
  Plus,
  Check,
  X,
  Music,

  FolderPlus } from
"lucide-react";
import Image from "next/image";
import { usePlayerStore } from "@/store/usePlayerStore";







export function AddToPlaylistModal({ song, isOpen, onClose }) {
  const [isMounted, setIsMounted] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const { playlists, addSongToPlaylist, removeSongFromPlaylist, createPlaylist } = usePlayerStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isOpen || !song || !isMounted) return null;

  const handleTogglePlaylist = (playlistId, isAlreadyIn) => {
    if (isAlreadyIn) {
      removeSongFromPlaylist(playlistId, song.id);
    } else {
      addSongToPlaylist(playlistId, song);
    }
  };

  const handleCreateNew = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const created = createPlaylist(newPlaylistName.trim());
    addSongToPlaylist(created.id, song);
    setNewPlaylistName("");
    setShowCreateInput(false);
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200 select-none">
      <div className="bg-[#0e0d1f] border border-white/20 rounded-3xl max-w-md w-full p-6 shadow-[0_25px_70px_rgba(0,0,0,0.98)] space-y-5 relative zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-[#161528]">
              <Image src={song.coverUrl} alt={song.title} fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-base text-white truncate max-w-[220px]">
                {song.title}
              </h3>
              <p className="text-xs text-on-surface-variant truncate max-w-[220px]">
                {song.artist}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
            
            <X size={18} />
          </button>
        </div>

        {/* Action Title */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-violet-200 uppercase tracking-wider flex items-center gap-1.5">
            <ListPlus size={14} className="text-primary" /> Add to Playlist
          </span>
          {!showCreateInput &&
          <button
            onClick={() => setShowCreateInput(true)}
            className="text-xs text-cyan-400 font-bold hover:underline flex items-center gap-1 cursor-pointer">
            
              <Plus size={13} /> New Playlist
            </button>
          }
        </div>

        {/* Quick Create Playlist Inline Form */}
        {showCreateInput &&
        <form onSubmit={handleCreateNew} className="p-3 rounded-2xl bg-[#15132a] border border-violet-500/40 space-y-2.5 animate-in fade-in">
            <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="Enter playlist title"
            autoFocus
            className="w-full bg-[#0d0c18] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-primary" />
          
            <div className="flex items-center justify-end gap-2">
              <button
              type="button"
              onClick={() => setShowCreateInput(false)}
              className="px-3 py-1 rounded-full text-xs text-on-surface-variant hover:text-white">
              
                Cancel
              </button>
              <button
              type="submit"
              className="px-4 py-1 rounded-full text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-md cursor-pointer">
              
                Create & Add
              </button>
            </div>
          </form>
        }

        {/* Playlists List */}
        <div className="space-y-1.5 max-h-[260px] overflow-y-auto [scrollbar-width:none]">
          {playlists.length > 0 ?
          playlists.map((pl) => {
            const isIn = pl.songs.some((s) => s.id === song.id);
            return (
              <div
                key={pl.id}
                onClick={() => handleTogglePlaylist(pl.id, isIn)}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                isIn ?
                "bg-violet-950/40 border-violet-500/50 text-white shadow-sm" :
                "bg-[#141226] border-white/5 hover:border-white/15 text-white/80 hover:text-white hover:bg-[#1a1830]"}`
                }>
                
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-secondary shrink-0">
                      <Music size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{pl.name}</p>
                      <p className="text-[10px] text-on-surface-variant">{pl.songs.length} tracks</p>
                    </div>
                  </div>

                  <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                  isIn ?
                  "bg-emerald-500 border-emerald-400 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)]" :
                  "border-white/20 text-transparent hover:border-white/50"}`
                  }>
                  
                    <Check size={14} className="stroke-[3]" />
                  </div>
                </div>);

          }) :

          <div className="text-center py-6 text-on-surface-variant space-y-1">
              <FolderPlus size={28} className="text-white/20 mx-auto" />
              <p className="text-xs font-bold text-white">No playlists yet</p>
              <p className="text-[11px]">Click &quot;New Playlist&quot; above to start your collection.</p>
            </div>
          }
        </div>

        {/* Footer Done button */}
        <div className="pt-2 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors cursor-pointer">
            
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}