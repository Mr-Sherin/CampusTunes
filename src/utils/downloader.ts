import { Song } from "@/store/usePlayerStore";

export interface DownloadOptions {
  quality?: "320kbps" | "256kbps" | "128kbps" | "wav";
  onProgress?: (progress: number) => void;
}

export async function downloadSong(song: Song, options: DownloadOptions = {}) {
  const { quality = "320kbps", onProgress } = options;

  const title = encodeURIComponent(song.title || "Track");
  const artist = encodeURIComponent(song.artist || "Campus Artist");
  const videoId = song.youtubeId || (song.id?.startsWith("yt_") ? song.id.replace("yt_", "") : "");
  const audioUrl = encodeURIComponent(song.audioUrl || "");

  const endpoint = `/api/download?id=${videoId}&title=${title}&artist=${artist}&url=${audioUrl}&quality=${quality}`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Download failed with status: ${response.status}`);
    }

    const contentLength = response.headers.get("Content-Length");
    const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
    const contentType = response.headers.get("Content-Type") || "audio/mpeg";

    let blob: Blob;

    if (response.body && totalBytes > 0 && onProgress) {
      const reader = response.body.getReader();
      let receivedBytes = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          receivedBytes += value.length;
          const progress = Math.min(Math.round((receivedBytes / totalBytes) * 100), 99);
          onProgress(progress);
        }
      }

      onProgress(100);
      blob = new Blob(chunks, { type: contentType });
    } else {
      blob = await response.blob();
      if (onProgress) onProgress(100);
    }

    // Determine extension from content-disposition header or content-type
    let extension = "m4a";
    const disposition = response.headers.get("Content-Disposition");
    if (disposition && disposition.includes("filename=")) {
      const match = disposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) {
        const parts = decodeURIComponent(match[1]).split(".");
        if (parts.length > 1) {
          extension = parts.pop() || "m4a";
        }
      }
    } else if (contentType.includes("mpeg")) {
      extension = "mp3";
    } else if (contentType.includes("wav")) {
      extension = "wav";
    }

    const cleanFilename = `${(song.artist || "CampusTunes").replace(/[\\/:*?"<>|]/g, "_")} - ${(
      song.title || "Track"
    ).replace(/[\\/:*?"<>|]/g, "_")}.${extension}`;

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = cleanFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 1000);

    return { success: true, filename: cleanFilename };
  } catch (error) {
    console.error("Track download error:", error);
    const fallbackLink = document.createElement("a");
    fallbackLink.href = endpoint;
    fallbackLink.download = `${song.artist} - ${song.title}.m4a`;
    document.body.appendChild(fallbackLink);
    fallbackLink.click();
    document.body.removeChild(fallbackLink);
    return { success: true, fallback: true };
  }
}

const CACHE_NAME = "campustunes-offline-audio-v1";

export async function saveSongOffline(song: Song): Promise<boolean> {
  if (typeof window === "undefined" || !("caches" in window)) return false;

  try {
    const cache = await caches.open(CACHE_NAME);
    const videoId = song.youtubeId || (song.id?.startsWith("yt_") ? song.id.replace("yt_", "") : "");
    const title = encodeURIComponent(song.title);
    const artist = encodeURIComponent(song.artist);
    const endpoint = `/api/download?id=${videoId}&title=${title}&artist=${artist}&url=${encodeURIComponent(
      song.audioUrl || ""
    )}`;

    const res = await fetch(endpoint);
    if (res.ok) {
      await cache.put(`/offline-track/${song.id}`, res);
      const savedListRaw = localStorage.getItem("campustunes_offline_songs");
      const list: Song[] = savedListRaw ? JSON.parse(savedListRaw) : [];
      if (!list.some((s) => s.id === song.id)) {
        list.push(song);
        localStorage.setItem("campustunes_offline_songs", JSON.stringify(list));
      }
      return true;
    }
    return false;
  } catch (e) {
    console.error("Save offline error:", e);
    return false;
  }
}

export function isSongOffline(songId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const savedListRaw = localStorage.getItem("campustunes_offline_songs");
    if (!savedListRaw) return false;
    const list: Song[] = JSON.parse(savedListRaw);
    return list.some((s) => s.id === songId);
  } catch {
    return false;
  }
}
