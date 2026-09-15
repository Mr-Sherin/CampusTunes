const JAVA_API_BASE = process.env.NEXT_PUBLIC_JAVA_API_URL || "/api/v1";

/**
 * Robust fetch wrapper connecting to Java Spring Boot REST API
 * with automatic timeout and fallback handling.
 */
async function fetchFromJavaApi(endpoint, options) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s fast timeout

    const res = await fetch(`${JAVA_API_BASE}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    // Java backend offline, fallback gracefully
    return null;
  }
}

export const JavaMusicApi = {
  // 1. Catalog & Songs
  async getTrendingSongs() {
    return fetchFromJavaApi("/songs/trending");
  },

  async getSongsByGenre(genre) {
    return fetchFromJavaApi(`/songs/genre/${encodeURIComponent(genre)}`);
  },

  async searchSongs(query) {
    return fetchFromJavaApi(`/songs/search?q=${encodeURIComponent(query)}`);
  },

  async getCampusShowcase() {
    return fetchFromJavaApi("/songs/campus-showcase");
  },

  async recordPlay(songId) {
    return fetchFromJavaApi(`/songs/${encodeURIComponent(songId)}/play`, {
      method: "POST",
    });
  },

  // 2. Playlists
  async getAllPlaylists(userId) {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
    return fetchFromJavaApi(`/playlists${query}`);
  },

  async createPlaylist(name, description, userId) {
    return fetchFromJavaApi("/playlists", {
      method: "POST",
      body: JSON.stringify({ name, description, userId }),
    });
  },

  async addSongToPlaylist(playlistId, songId) {
    return fetchFromJavaApi(`/playlists/${encodeURIComponent(playlistId)}/songs`, {
      method: "POST",
      body: JSON.stringify({ songId }),
    });
  },

  async removeSongFromPlaylist(playlistId, songId) {
    return fetchFromJavaApi(
      `/playlists/${encodeURIComponent(playlistId)}/songs/${encodeURIComponent(songId)}`,
      {
        method: "DELETE",
      }
    );
  },

  // 3. Creator Studio
  async publishStudentTrack(trackData) {
    return fetchFromJavaApi("/creator/publish", {
      method: "POST",
      body: JSON.stringify(trackData),
    });
  },
};
