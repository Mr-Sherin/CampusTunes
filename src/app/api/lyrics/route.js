import { NextResponse } from "next/server";
import { VERIFIED_LYRICS } from "@/data/verifiedLyrics";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

function parseLrc(lrcText) {
  if (!lrcText) return [];
  const lines = lrcText.split("\n");
  const result = [];
  const regex = /\[(\d{1,2}):(\d{2}(?:\.\d+)?)\](.*)/;

  for (const rawLine of lines) {
    const match = rawLine.match(regex);
    if (match) {
      const min = parseInt(match[1], 10);
      const sec = parseFloat(match[2]);
      const text = match[3].trim();
      if (text.length > 0) {
        result.push({
          time: min * 60 + sec,
          text: text,
        });
      }
    }
  }
  return result;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let title = searchParams.get("title") || "";
  let artist = searchParams.get("artist") || "";
  let youtubeId = searchParams.get("youtubeId") || "";
  let videoDuration = parseFloat(searchParams.get("duration") || "0");

  // 1. Check verified studio-synchronized database first
  if (youtubeId && VERIFIED_LYRICS[youtubeId]) {
    const verified = VERIFIED_LYRICS[youtubeId];
    return NextResponse.json({
      found: true,
      title: verified.trackName,
      artist: verified.artistName,
      isSynced: true,
      syncedLines: verified.syncedLines,
      lines: verified.syncedLines.map((l) => l.text),
      fullText: verified.syncedLines.map((l) => l.text).join("\n"),
    });
  }

  // Clean title & artist of extraneous video tags
  const cleanTitle = title
    .replace(/\s*[\(\[](official\s*video|official\s*audio|lyrics|music\s*video|hd|4k|audio|feat\.?.*)[\)\]]/gi, "")
    .trim();
  const primaryArtist = artist.split(/[,&/]|ft\.?|feat\.?/i)[0].trim();

  // 2. Try Synced LRCLIB Engine for Time-accurate Synced Lyrics
  try {
    let res = await fetch(
      `https://lrclib.net/api/get?artist_name=${encodeURIComponent(primaryArtist)}&track_name=${encodeURIComponent(cleanTitle)}`,
      { headers: { "User-Agent": "CampusTunes/1.0" } }
    );

    let data = null;
    if (res.ok) {
      data = await res.json();
    }

    if (!data || (!data.plainLyrics && !data.syncedLyrics)) {
      const searchRes = await fetch(
        `https://lrclib.net/api/search?q=${encodeURIComponent(`${cleanTitle} ${primaryArtist}`)}`,
        { headers: { "User-Agent": "CampusTunes/1.0" } }
      );
      if (searchRes.ok) {
        const searchList = await searchRes.json();
        if (Array.isArray(searchList) && searchList.length > 0) {
          data = searchList.find((item) => item.syncedLyrics || item.plainLyrics) || searchList[0];
        }
      }
    }

    if (data && (data.syncedLyrics || data.plainLyrics)) {
      let parsedSynced = data.syncedLyrics ? parseLrc(data.syncedLyrics) : [];

      if (parsedSynced.length > 0 && data.duration && videoDuration > data.duration + 2) {
        const offset = videoDuration - data.duration;
        parsedSynced = parsedSynced.map((line) => ({
          ...line,
          time: Number((line.time + offset).toFixed(2)),
        }));
      }

      const isSynced = parsedSynced.length > 0;
      const rawText = isSynced
        ? parsedSynced.map((l) => l.text).join("\n")
        : (data.plainLyrics || "").trim();

      const lines = isSynced
        ? parsedSynced.map((l) => l.text)
        : rawText
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

      return NextResponse.json({
        found: true,
        title: data.trackName || title,
        artist: data.artistName || artist,
        isSynced,
        syncedLines: parsedSynced,
        lines,
        fullText: rawText,
      });
    }
  } catch (err) {
    console.warn("Synced lyrics fetch warning:", err);
  }

  // 3. Fallback extraction (ytmusicapi helper)
  try {
    const scriptPath = path.join(process.cwd(), "src/app/api/lyrics/ytmusic_helper.py");
    const { stdout } = await execFileAsync("python", [
      scriptPath,
      `${cleanTitle} ${primaryArtist}`,
      youtubeId || "null",
    ]);

    const ytmData = JSON.parse(stdout.trim());
    if (ytmData.found && ytmData.lyrics) {
      const rawLines = ytmData.lyrics
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      return NextResponse.json({
        found: true,
        title: ytmData.title || title,
        artist: ytmData.artist || artist,
        isSynced: false,
        lines: rawLines,
        fullText: ytmData.lyrics,
      });
    }
  } catch (err) {
    console.error("Lyrics extraction error:", err);
  }

  return NextResponse.json({
    found: false,
    message: "No lyrics found for this track.",
  });
}
