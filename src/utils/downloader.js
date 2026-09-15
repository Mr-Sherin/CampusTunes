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

    // If it's a YouTube track without direct audioUrl, attempt server stream extraction
    if (!targetUrl && ytId) {
      try {
        const params = new URLSearchParams({
          title: cleanTitle,
          artist: cleanArtist,
          action: "url",
          youtubeId: ytId,
        });
        const response = await fetch(`/api/download?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          if (data?.url) {
            targetUrl = data.url;
          }
        }
      } catch (apiErr) {
        console.warn("Server stream extraction warning:", apiErr);
      }

      // High-speed converter portal fallback if serverless environment cannot extract directly
      if (!targetUrl) {
        const converterUrl = `https://loader.to/api/button/?url=https://www.youtube.com/watch?v=${ytId}&f=mp3`;
        window.open(converterUrl, "_blank", "noopener,noreferrer");
        onProgress({
          status: "success",
          message: `Download portal opened for "${cleanTitle}"!`,
        });
        return;
      }
    }

    if (targetUrl) {
      // 1. Try Blob fetch for instant download with custom filename
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
            message: `"${cleanTitle}" downloaded successfully!`,
          });
          return;
        }
      } catch (fetchErr) {
        console.warn("Direct blob download failed, falling back to direct anchor:", fetchErr);
      }

      // 2. Direct Anchor fallback
      const link = document.createElement("a");
      link.href = targetUrl;
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

