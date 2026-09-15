"use client";

/**
 * Downloads the music track file directly and instantly to the user's computer.
 * @param {Object} song - The song object containing title, artist, audioUrl, audio_url, youtubeId
 * @param {Function} onProgress - Optional callback for download progress/status
 */
export async function downloadTrack(song, onProgress = () => {}) {
  if (!song) return;

  const cleanTitle = (song.title || "Track").trim();
  const cleanArtist = (song.artist || song.artist_name || "CampusTunes").trim();
  const filename = `${cleanArtist} - ${cleanTitle}.mp3`.replace(/[/\\?%*:|"<>]/g, "");

  const ytId =
    song.youtubeId ||
    (typeof song.id === "string" && song.id.startsWith("yt_")
      ? song.id.replace("yt_", "")
      : null);

  try {
    onProgress({
      status: "downloading",
      message: `Preparing download for "${cleanTitle}"...`,
    });

    let targetUrl = song.audioUrl || song.audio_url;

    // 1. If it's a YouTube track without direct audioUrl, open the high-speed MP3 download converter
    if (!targetUrl && ytId) {
      const converterUrl = `https://loader.to/api/button/?url=https://www.youtube.com/watch?v=${ytId}&f=mp3`;
      window.open(converterUrl, "_blank", "noopener,noreferrer");
      onProgress({
        status: "success",
        message: `Download portal opened for "${cleanTitle}"!`,
      });
      return;
    }

    // 2. Direct audio track (e.g. Supabase / Campus Uploads)
    if (targetUrl) {
      // Try Blob fetch for instant download with custom filename
      try {
        const res = await fetch(targetUrl, { mode: "cors" });
        if (res.ok) {
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);

          onProgress({
            status: "success",
            message: `"${cleanTitle}" downloaded to Downloads!`,
          });
          return;
        }
      } catch (fetchErr) {
        console.warn("Direct blob download failed, falling back to proxy stream:", fetchErr);
      }

      // Proxy fallback with attachment headers
      const proxyUrl = `/api/download?title=${encodeURIComponent(cleanTitle)}&artist=${encodeURIComponent(cleanArtist)}&audioUrl=${encodeURIComponent(targetUrl)}&mode=attachment`;
      const link = document.createElement("a");
      link.href = proxyUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onProgress({
        status: "success",
        message: `Download started for "${cleanTitle}"!`,
      });
    } else {
      throw new Error("No audio stream available");
    }
  } catch (error) {
    console.error("Music download error:", error);
    onProgress({
      status: "error",
      message: `Failed to download "${cleanTitle}". Please try again.`,
    });
  }
}


