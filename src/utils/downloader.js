"use client";

/**
 * Downloads the music track file directly and instantly to the user's computer.
 * @param {Object} song - The song object containing title, artist, audioUrl, youtubeId
 * @param {Function} onProgress - Optional callback for download progress/status
 */
export async function downloadTrack(song, onProgress = () => {}) {
  if (!song) return;

  const cleanTitle = (song.title || "Track").trim();
  const cleanArtist = (song.artist || "CampusTunes").trim();
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

    const params = new URLSearchParams({
      title: cleanTitle,
      artist: cleanArtist,
      action: "url",
      ...(song.audioUrl ? { audioUrl: song.audioUrl } : {}),
      ...(ytId ? { youtubeId: ytId } : {}),
    });

    const response = await fetch(`/api/download?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Download server returned ${response.status}`);
    }

    const data = await response.json();
    if (data.url) {
      // Trigger native instant browser download
      const link = document.createElement("a");
      link.href = data.url;
      link.download = filename;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onProgress({
        status: "success",
        message: `Download started for "${cleanTitle}"!`,
      });
    } else {
      throw new Error("No download stream URL received");
    }
  } catch (error) {
    console.error("Music download error:", error);
    onProgress({
      status: "error",
      message: `Failed to download "${cleanTitle}". Please try again.`,
    });
  }
}
