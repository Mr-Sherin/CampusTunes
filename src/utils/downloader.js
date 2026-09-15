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
  const safeFilename = `${cleanArtist} - ${cleanTitle}.mp3`.replace(/[/\\?%*:|"<>]/g, "");

  const ytId =
    song.youtubeId ||
    (typeof song.id === "string" && song.id.startsWith("yt_")
      ? song.id.replace("yt_", "")
      : null);

  const targetAudioUrl = song.audioUrl || song.audio_url || null;

  try {
    onProgress({
      status: "downloading",
      message: `Preparing download for "${cleanTitle}"...`,
    });

    // Build the attachment download stream URL
    const params = new URLSearchParams({
      title: cleanTitle,
      artist: cleanArtist,
    });

    if (targetAudioUrl) {
      params.set("audioUrl", targetAudioUrl);
    }
    if (ytId) {
      params.set("youtubeId", ytId);
    }

    const downloadEndpoint = `/api/download?${params.toString()}`;

    // 1. Primary: Trigger native OS browser Save As dialog via attachment download anchor
    const link = document.createElement("a");
    link.href = downloadEndpoint;
    link.download = safeFilename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onProgress({
      status: "success",
      message: `Downloaded to your device!`,
    });
  } catch (error) {
    console.error("Music download error:", error);
    onProgress({
      status: "error",
      message: `Failed to download "${cleanTitle}". Please try again.`,
    });
  }
}


