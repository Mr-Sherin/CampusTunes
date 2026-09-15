import { create } from "zustand";






























export const REAL_CATALOG_SONGS = [
{
  id: "yt_tOM-nWPcR4U",
  youtubeId: "tOM-nWPcR4U",
  title: "Illuminati",
  artist: "Sushin Shyam, Dabzee",
  album: "Aavesham OST",
  duration: 149,
  coverUrl: "https://i.ytimg.com/vi/tOM-nWPcR4U/hqdefault.jpg",
  audioUrl: "",
  source: "youtube",
  genre: "Campus Anthem & Rap",
  plays: "445M"
},
{
  id: "yt_60ItHLz5WEA",
  youtubeId: "60ItHLz5WEA",
  title: "Faded",
  artist: "Alan Walker",
  album: "Different World",
  duration: 213,
  coverUrl: "https://i.ytimg.com/vi/60ItHLz5WEA/hqdefault.jpg",
  audioUrl: "",
  source: "youtube",
  genre: "Electronic & Dance",
  plays: "4.0B"
},
{
  id: "yt_34Na4j8AVgA",
  youtubeId: "34Na4j8AVgA",
  title: "Starboy",
  artist: "The Weeknd ft. Daft Punk",
  album: "Starboy",
  duration: 230,
  coverUrl: "https://i.ytimg.com/vi/34Na4j8AVgA/hqdefault.jpg",
  audioUrl: "",
  source: "youtube",
  genre: "R&B / Pop",
  plays: "2.8B"
},
{
  id: "yt_V9PVRfjEBTI",
  youtubeId: "V9PVRfjEBTI",
  title: "BIRDS OF A FEATHER",
  artist: "Billie Eilish",
  album: "HIT ME HARD AND SOFT",
  duration: 195,
  coverUrl: "https://i.ytimg.com/vi/V9PVRfjEBTI/hqdefault.jpg",
  audioUrl: "",
  source: "youtube",
  genre: "Alternative Pop",
  plays: "1.2B"
},
{
  id: "yt_r6egHcGiUjs",
  youtubeId: "r6egHcGiUjs",
  title: "Sambar",
  artist: "Dabzee, ThirumaLi, Fejo",
  album: "Sambar Single",
  duration: 204,
  coverUrl: "https://i.ytimg.com/vi/r6egHcGiUjs/hqdefault.jpg",
  audioUrl: "",
  source: "youtube",
  genre: "Kerala Hip-Hop",
  plays: "89M"
},
{
  id: "yt_QUxetheUJVs",
  youtubeId: "QUxetheUJVs",
  title: "Fish Rock",
  artist: "Thaikkudam Bridge",
  album: "Navarasam Live",
  duration: 260,
  coverUrl: "https://i.ytimg.com/vi/QUxetheUJVs/hqdefault.jpg",
  audioUrl: "",
  source: "youtube",
  genre: "Kerala Rock Fusion",
  plays: "48M"
},
{
  id: "yt_1k8craCGpgs",
  youtubeId: "1k8craCGpgs",
  title: "Don't Look Back In Anger",
  artist: "Oasis",
  album: "(What's the Story) Morning Glory?",
  duration: 288,
  coverUrl: "https://i.ytimg.com/vi/1k8craCGpgs/hqdefault.jpg",
  audioUrl: "",
  source: "youtube",
  genre: "Britpop & Rock",
  plays: "670M"
},
{
  id: "yt_fKopy74weus",
  youtubeId: "fKopy74weus",
  title: "Thunderstruck",
  artist: "AC/DC",
  album: "The Razors Edge",
  duration: 292,
  coverUrl: "https://i.ytimg.com/vi/fKopy74weus/hqdefault.jpg",
  audioUrl: "",
  source: "youtube",
  genre: "Classic Rock",
  plays: "1.5B"
}];


export const MOCK_SONGS = REAL_CATALOG_SONGS;














































const DEFAULT_PLAYLISTS = [
{
  id: "pl_campus_vibes",
  name: "Campus Anthems & Vibes",
  description: "Handpicked student anthems and trending Kerala indie hits.",
  coverUrl: "https://i.ytimg.com/vi/tOM-nWPcR4U/hqdefault.jpg",
  createdAt: new Date().toISOString(),
  songs: REAL_CATALOG_SONGS.slice(0, 4)
}];


export const usePlayerStore = create((set, get) => {
  return {
    currentSong: REAL_CATALOG_SONGS[0],
    isPlaying: false,
    currentTime: 0,
    duration: REAL_CATALOG_SONGS[0].duration,
    volume: 0.75,
    isMuted: false,
    seekCommand: null,
    queue: REAL_CATALOG_SONGS,
    history: [],
    repeatMode: "off",
    isShuffle: false,
    likedSongIds: new Set(),
    likedSongs: [],
    playlists: DEFAULT_PLAYLISTS,
    isQueueOpen: false,
    isRightPanelOpen: true,

    syncLikesFromStorage: () => {
      if (typeof window === "undefined") return;
      try {
        const raw = localStorage.getItem("campustunes_liked_songs");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            set({
              likedSongIds: new Set(parsed.map((s) => s.id)),
              likedSongs: parsed
            });
          }
        }
      } catch (e) {
        console.error("Sync likes error:", e);
      }
    },

    syncPlaylistsFromStorage: () => {
      if (typeof window === "undefined") return;
      try {
        const raw = localStorage.getItem("campustunes_playlists");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            set({ playlists: parsed });
          }
        }
      } catch (e) {
        console.error("Sync playlists error:", e);
      }
    },

    createPlaylist: (name, description) => {
      const trimmedName = name.trim() || "My Campus Playlist";
      const newPlaylist = {
        id: `pl_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        name: trimmedName,
        description: description?.trim() || "Custom student mix",
        coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
        createdAt: new Date().toISOString(),
        songs: []
      };

      set((state) => {
        const updated = [newPlaylist, ...state.playlists];
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("campustunes_playlists", JSON.stringify(updated));
          } catch (e) {
            console.error("Save playlist error:", e);
          }
        }
        return { playlists: updated };
      });

      return newPlaylist;
    },

    deletePlaylist: (playlistId) => {
      set((state) => {
        const updated = state.playlists.filter((p) => p.id !== playlistId);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("campustunes_playlists", JSON.stringify(updated));
          } catch (e) {
            console.error("Delete playlist error:", e);
          }
        }
        return { playlists: updated };
      });
    },

    renamePlaylist: (playlistId, name) => {
      set((state) => {
        const updated = state.playlists.map((p) =>
        p.id === playlistId ? { ...p, name: name.trim() || p.name } : p
        );
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("campustunes_playlists", JSON.stringify(updated));
          } catch (e) {
            console.error("Rename playlist error:", e);
          }
        }
        return { playlists: updated };
      });
    },

    addSongToPlaylist: (playlistId, song) => {
      set((state) => {
        const updated = state.playlists.map((p) => {
          if (p.id === playlistId) {
            const alreadyExists = p.songs.some((s) => s.id === song.id);
            if (alreadyExists) return p;
            const updatedSongs = [song, ...p.songs];
            return {
              ...p,
              songs: updatedSongs,
              coverUrl: song.coverUrl || p.coverUrl
            };
          }
          return p;
        });

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("campustunes_playlists", JSON.stringify(updated));
          } catch (e) {
            console.error("Add to playlist error:", e);
          }
        }
        return { playlists: updated };
      });
    },

    removeSongFromPlaylist: (playlistId, songId) => {
      set((state) => {
        const updated = state.playlists.map((p) => {
          if (p.id === playlistId) {
            const updatedSongs = p.songs.filter((s) => s.id !== songId);
            return {
              ...p,
              songs: updatedSongs,
              coverUrl: updatedSongs[0]?.coverUrl || p.coverUrl
            };
          }
          return p;
        });

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("campustunes_playlists", JSON.stringify(updated));
          } catch (e) {
            console.error("Remove from playlist error:", e);
          }
        }
        return { playlists: updated };
      });
    },

    setCurrentSong: (song) => {
      const current = get().currentSong;
      if (current && current.id !== song.id) {
        set((state) => ({ history: [...state.history, current] }));
      }

      const currentQueue = get().queue;
      const exists = currentQueue.some((s) => s.id === song.id);
      const updatedQueue = exists ? currentQueue : [song, ...currentQueue];

      set({
        currentSong: song,
        queue: updatedQueue,
        isPlaying: true,
        currentTime: 0,
        duration: song.duration > 0 ? song.duration : 180,
        seekCommand: null
      });
    },

    setIsPlaying: (isPlaying) => set({ isPlaying }),

    setPlaybackTime: (currentTime, duration) =>
    set((state) => ({
      currentTime,
      duration: duration ?? state.duration
    })),

    setVolume: (volume) =>
    set({
      volume,
      isMuted: volume === 0
    }),

    toggleMute: () =>
    set((state) => ({
      isMuted: !state.isMuted
    })),

    setSeekCommand: (time) => set({ seekCommand: time }),

    setQueue: (queue) => set({ queue }),

    addToQueue: (song) =>
    set((state) => {
      const exists = state.queue.some((s) => s.id === song.id);
      if (exists) return state;
      return { queue: [...state.queue, song] };
    }),

    playNext: () => {
      const { queue, currentSong, repeatMode, isShuffle } = get();
      if (queue.length === 0) return;

      if (repeatMode === "one" && currentSong) {
        set({ currentTime: 0, isPlaying: true, seekCommand: 0 });
        return;
      }

      if (isShuffle) {
        const randomIndex = Math.floor(Math.random() * queue.length);
        set({ currentSong: queue[randomIndex], isPlaying: true, currentTime: 0, seekCommand: 0 });
        return;
      }

      const currentIndex = queue.findIndex((s) => s.id === currentSong?.id);
      if (currentIndex === -1 || currentIndex === queue.length - 1) {
        if (repeatMode === "all") {
          set({ currentSong: queue[0], isPlaying: true, currentTime: 0, seekCommand: 0 });
        } else {
          set({ isPlaying: false, currentTime: 0 });
        }
      } else {
        set({ currentSong: queue[currentIndex + 1], isPlaying: true, currentTime: 0, seekCommand: 0 });
      }
    },

    playPrevious: () => {
      const { queue, currentSong, currentTime } = get();
      if (queue.length === 0) return;

      if (currentTime > 3) {
        set({ currentTime: 0, seekCommand: 0 });
        return;
      }

      const currentIndex = queue.findIndex((s) => s.id === currentSong?.id);
      if (currentIndex === -1 || currentIndex === 0) {
        set({ currentSong: queue[queue.length - 1], isPlaying: true, currentTime: 0, seekCommand: 0 });
      } else {
        set({ currentSong: queue[currentIndex - 1], isPlaying: true, currentTime: 0, seekCommand: 0 });
      }
    },

    toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),

    toggleRepeatMode: () =>
    set((state) => {
      const modes = ["off", "all", "one"];
      const nextIndex = (modes.indexOf(state.repeatMode) + 1) % modes.length;
      return { repeatMode: modes[nextIndex] };
    }),

    toggleLikeSong: (songOrId) =>
    set((state) => {
      const songId = typeof songOrId === "string" ? songOrId : songOrId.id;
      const newLikedIds = new Set(state.likedSongIds);
      let newLikedList = [...state.likedSongs];

      if (newLikedIds.has(songId)) {
        newLikedIds.delete(songId);
        newLikedList = newLikedList.filter((s) => s.id !== songId);
      } else {
        newLikedIds.add(songId);
        // Find full song object
        const fullSong =
        typeof songOrId === "object" ?
        songOrId :
        state.currentSong?.id === songId ?
        state.currentSong :
        state.queue.find((s) => s.id === songId) ||
        REAL_CATALOG_SONGS.find((s) => s.id === songId);

        if (fullSong) {
          newLikedList = [fullSong, ...newLikedList.filter((s) => s.id !== songId)];
        }
      }

      // Persist to localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("campustunes_liked_songs", JSON.stringify(newLikedList));
        } catch (e) {
          console.error("Failed to save liked songs:", e);
        }
      }

      return { likedSongIds: newLikedIds, likedSongs: newLikedList };
    }),

    setIsQueueOpen: (isOpen) => set({ isQueueOpen: isOpen }),
    toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen }))
  };
});