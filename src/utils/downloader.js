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

    // 1. Direct audio track (e.g. Supabase Campus upload)
    if (targetAudioUrl) {
      const params = new URLSearchParams({
        title: cleanTitle,
        artist: cleanArtist,
        audioUrl: targetAudioUrl,
      });

      const downloadEndpoint = `/api/download?${params.toString()}`;
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
      return;
    }

    // 2. YouTube audio track
    if (ytId) {
      let streamUrl = null;
      try {
        const checkRes = await fetch(
          `/api/download?title=${encodeURIComponent(cleanTitle)}&artist=${encodeURIComponent(cleanArtist)}&action=url&youtubeId=${encodeURIComponent(ytId)}`
        );
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          if (checkData?.url) {
            streamUrl = checkData.url;
          }
        }
      } catch (checkErr) {
        console.warn("Direct stream extraction check:", checkErr);
      }

      if (streamUrl) {
        const params = new URLSearchParams({
          title: cleanTitle,
          artist: cleanArtist,
          audioUrl: streamUrl,
        });
        const downloadEndpoint = `/api/download?${params.toString()}`;
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
      } else {
        const converterUrl = `https://loader.to/api/button/?url=https://www.youtube.com/watch?v=${ytId}&f=mp3`;
        window.open(converterUrl, "_blank", "noopener,noreferrer");
        onProgress({
          status: "success",
          message: `Download stream opened!`,
        });
      }
      return;
    }

    throw new Error("No audio source found");
  } catch (error) {
    console.error("Music download error:", error);
    onProgress({
      status: "error",
      message: `Failed to download "${cleanTitle}". Please try again.`,
    });
  }
}


