import { NextResponse } from "next/server";
import { create } from "youtube-dl-exec";
import path from "path";
import fs from "fs";

export const maxDuration = 60;

function getYtDlp() {
  const binaryCandidates = [
    path.resolve(process.cwd(), "node_modules/youtube-dl-exec/bin/yt-dlp.exe"),
    path.resolve(process.cwd(), "node_modules/youtube-dl-exec/bin/yt-dlp"),
    path.resolve(process.cwd(), "bin/yt-dlp.exe"),
  ];

  for (const p of binaryCandidates) {
    if (fs.existsSync(p)) {
      return create(p);
    }
  }
  return create("yt-dlp");
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("id");
  const directUrl = searchParams.get("url");
  const rawTitle = searchParams.get("title") || "CampusTunes Audio";
  const rawArtist = searchParams.get("artist") || "Campus Artist";

  // Clean filename for safety across OS
  const cleanTitle = rawTitle.replace(/[\\/:*?"<>|]/g, "_").trim();
  const cleanArtist = rawArtist.replace(/[\\/:*?"<>|]/g, "_").trim();

  // 1. Direct Audio URL (Campus uploads / Supabase storage)
  if (directUrl && directUrl.startsWith("http")) {
    try {
      const response = await fetch(directUrl);
      if (response.ok && response.body) {
        const filename = `${cleanArtist} - ${cleanTitle}.mp3`;
        return new Response(response.body, {
          headers: {
            "Content-Type": response.headers.get("Content-Type") || "audio/mpeg",
            "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
            "Content-Length": response.headers.get("Content-Length") || "",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    } catch (e) {
      console.error("Direct audio download error:", e);
    }
  }

  // 2. Real YouTube High-Res Audio Extraction & Instant Streaming
  if (videoId) {
    try {
      const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const ytdl = getYtDlp();

      const info = await ytdl(targetUrl, {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
        addHeader: [
          "referer:youtube.com",
          "user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        ],
      });

      if (info && info.formats) {
        const audioFormats = info.formats.filter(
          (f) => f.vcodec === "none" && f.acodec && f.acodec !== "none" && f.url
        );

        if (audioFormats.length > 0) {
          // Prefer universal AAC (m4a) for 100% native Windows Media Player / Groove / iPhone / Android playback
          const preferredFormat =
            audioFormats.find((f) => f.ext === "m4a" || f.acodec?.includes("mp4a")) ||
            audioFormats[audioFormats.length - 1];

          const audioStreamUrl = preferredFormat.url;
          const ext = preferredFormat.ext === "m4a" ? "m4a" : "mp3";
          const contentType = preferredFormat.ext === "m4a" ? "audio/mp4" : "audio/mpeg";
          const filename = `${cleanArtist} - ${cleanTitle}.${ext}`;

          const audioRes = await fetch(audioStreamUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
          });

          if (audioRes.ok && audioRes.body) {
            const headers = new Headers();
            headers.set("Content-Type", contentType);
            headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
            if (audioRes.headers.get("content-length")) {
              headers.set("Content-Length", audioRes.headers.get("content-length"));
            }
            headers.set("Accept-Ranges", "bytes");
            headers.set("Cache-Control", "public, max-age=86400");

            return new Response(audioRes.body, { headers });
          }
        }
      }
    } catch (err) {
      console.error("YouTube full audio download error:", err);
    }
  }

  return NextResponse.json(
    { error: "Audio track could not be resolved. Please try again." },
    { status: 500 }
  );
}
