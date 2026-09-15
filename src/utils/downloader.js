"use client";

/**
 * Downloads the music track file directly and instantly to the user's computer
 * triggering the native OS "Save As" file dialog.
 * @param {Object} song - The song object containing title, artist, audioUrl, audio_url, youtubeId
 * @param {Function} onProgress - Optional callback for download progress/status
 */
export async function downloadTrack(song, onProgress = () => {}) {
  if (!song) return;

  const cleanTitle = (song.title || "Track").trim();
  const cleanArtist = (song.artist || song.artist_name || "Campus Musician").trim();
  const coverUrl =
    song.coverUrl ||
    song.cover_url ||
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80";

  const ytId =
    song.youtubeId ||
    (typeof song.id === "string" && song.id.startsWith("yt_")
      ? song.id.replace("yt_", "")
      : null);

  const targetAudioUrl = song.audioUrl || song.audio_url || null;

  try {
    const params = new URLSearchParams({
      title: cleanTitle,
      artist: cleanArtist,
      cover: coverUrl,
    });

    if (targetAudioUrl) {
      params.set("audioUrl", targetAudioUrl);
    }
    if (ytId) {
      params.set("youtubeId", ytId);
    }

    const mediaTabUrl = `/media?${params.toString()}`;
    
    // Direct redirect in the current window (no popups)
    window.location.href = mediaTabUrl;
  } catch (error) {
    console.error("Music redirect error:", error);
  }
}


