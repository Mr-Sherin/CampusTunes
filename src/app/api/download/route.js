import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export const dynamic = "force-dynamic";

// In-memory stream URL cache with 2-hour TTL for instant downloads
const streamCache = new Map();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Track";
  const artist = searchParams.get("artist") || "Artist";
  const audioUrl = searchParams.get("audioUrl");
  const youtubeId = searchParams.get("youtubeId");
  const action = searchParams.get("action");

  const cleanFilename = `${artist} - ${title}.mp3`.replace(/[/\\?%*:|"<>]/g, "");

  // 1. If direct audioUrl provided
  if (audioUrl && audioUrl.startsWith("http")) {
    if (action === "url") {
      return NextResponse.json({ success: true, url: audioUrl, filename: cleanFilename });
    }
    return NextResponse.redirect(audioUrl);
  }

  // 2. Extract YouTube stream URL
  if (youtubeId) {
    // Check cache first
    const cached = streamCache.get(youtubeId);
    if (cached && Date.now() - cached.timestamp < 2 * 60 * 60 * 1000) {
      if (action === "url") {
        return NextResponse.json({ success: true, url: cached.url, filename: cleanFilename });
      }
      return NextResponse.redirect(cached.url);
    }

    try {
      const videoUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
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

        return NextResponse.redirect(streamUrl);
      }
    } catch (err) {
      console.error("yt-dlp extraction error:", err);
    }
  }

  return NextResponse.json(
    { error: "Audio stream not found or could not be extracted" },
    { status: 404 }
  );
}
