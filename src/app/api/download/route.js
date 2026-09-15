import { NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export const dynamic = "force-dynamic";

// Stream cache to speed up repeat requests
const streamCache = new Map();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Track";
  const artist = searchParams.get("artist") || "Artist";
  const audioUrl = searchParams.get("audioUrl");
  const youtubeId = searchParams.get("youtubeId");
  const action = searchParams.get("action");

  // Clean filename for the native Save dialog
  const safeArtist = artist.replace(/[/\\?%*:|"<>]/g, "").trim() || "CampusTunes";
  const safeTitle = title.replace(/[/\\?%*:|"<>]/g, "").trim() || "Track";
  const cleanFilename = `${safeArtist} - ${safeTitle}.mp3`;

  const mode = searchParams.get("mode") || "inline"; // "inline" for player with 3-dot download, "attachment" for instant download
  const dispositionType = mode === "attachment" ? "attachment" : "inline";

  // 1. Direct Audio URL (e.g. Supabase Storage / MP3 link)
  if (audioUrl && audioUrl.startsWith("http")) {
    if (action === "url") {
      return NextResponse.json({ success: true, url: audioUrl, filename: cleanFilename });
    }

    try {
      const audioRes = await fetch(audioUrl);
      if (audioRes.ok) {
        return new Response(audioRes.body, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Content-Disposition": `${dispositionType}; filename="${cleanFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`,
            "Cache-Control": "public, max-age=86400",
            "Accept-Ranges": "bytes",
          },
        });
      }
    } catch (proxyErr) {
      console.warn("Direct audio proxy fetch error:", proxyErr);
      return NextResponse.redirect(audioUrl);
    }
  }

  // 2. YouTube Audio Extraction & Streaming
  if (youtubeId) {
    const videoUrl = `https://www.youtube.com/watch?v=${youtubeId}`;

    // A. Check in-memory cache first
    const cached = streamCache.get(youtubeId);
    if (cached && Date.now() - cached.timestamp < 2 * 60 * 60 * 1000) {
      if (action === "url") {
        return NextResponse.json({ success: true, url: cached.url, filename: cleanFilename });
      }
      try {
        const audioRes = await fetch(cached.url);
        if (audioRes.ok) {
          return new Response(audioRes.body, {
            headers: {
              "Content-Type": "audio/mpeg",
              "Content-Disposition": `${dispositionType}; filename="${cleanFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`,
              "Accept-Ranges": "bytes",
            },
          });
        }
      } catch (e) {
        // Cached stream expired, continue with fresh extraction
      }
    }

    // B. Attempt extraction with @distube/ytdl-core
    try {
      if (ytdl.validateID(youtubeId) || ytdl.validateURL(videoUrl)) {
        const info = await ytdl.getInfo(videoUrl);
        const format = ytdl.chooseFormat(info.formats, {
          quality: "highestaudio",
          filter: "audioonly",
        });

        if (format?.url) {
          streamCache.set(youtubeId, { url: format.url, timestamp: Date.now() });

          if (action === "url") {
            return NextResponse.json({ success: true, url: format.url, filename: cleanFilename });
          }

          const streamRes = await fetch(format.url);
          if (streamRes.ok) {
            return new Response(streamRes.body, {
              headers: {
                "Content-Type": "audio/mpeg",
                "Content-Disposition": `${dispositionType}; filename="${cleanFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`,
                "Accept-Ranges": "bytes",
              },
            });
          }
        }
      }
    } catch (ytdlErr) {
      console.warn("ytdl-core extraction attempt:", ytdlErr?.message || ytdlErr);
    }

    // C. Attempt extraction with yt-dlp (local development / environments with python)
    try {
      const { stdout } = await execFileAsync("python", [
        "-m",
        "yt_dlp",
        "-g",
        "-f",
        "bestaudio",
        videoUrl,
      ]);

      const streamUrl = stdout
        .trim()
        .split("\n")
        .filter((line) => line.startsWith("http"))
        .pop();

      if (streamUrl) {
        streamCache.set(youtubeId, { url: streamUrl, timestamp: Date.now() });

        if (action === "url") {
          return NextResponse.json({ success: true, url: streamUrl, filename: cleanFilename });
        }

        const streamRes = await fetch(streamUrl);
        if (streamRes.ok) {
          return new Response(streamRes.body, {
            headers: {
              "Content-Type": "audio/mpeg",
              "Content-Disposition": `${dispositionType}; filename="${cleanFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`,
              "Accept-Ranges": "bytes",
            },
          });
        }
        return NextResponse.redirect(streamUrl);
      }
    } catch (ytDlpErr) {
      // yt-dlp not available
    }

    // D. If action was just checking url, return error if none found
    if (action === "url") {
      return NextResponse.json({ error: "Stream unavailable" }, { status: 404 });
    }

    // E. Graceful fallback redirect so browser never gets 404 "File wasn't available on site"
    const converterUrl = `https://loader.to/api/button/?url=https://www.youtube.com/watch?v=${youtubeId}&f=mp3`;
    return NextResponse.redirect(converterUrl);
  }

  return NextResponse.json(
    { error: "Audio stream not found or could not be extracted" },
    { status: 404 }
  );
}
