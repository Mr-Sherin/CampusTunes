import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function fetchDirectYouTube(query) {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];

    const html = await res.text();
    const match =
      html.match(/var ytInitialData = ({.*?});<\/script>/s) ||
      html.match(/ytInitialData\s*=\s*({.+?});/);

    if (!match) return [];

    const data = JSON.parse(match[1]);
    const contents =
      data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer
        ?.contents?.[0]?.itemSectionRenderer?.contents || [];

    const videos = contents
      .filter((c) => c.videoRenderer && c.videoRenderer.videoId)
      .map((c) => {
        const vr = c.videoRenderer;
        const rawTitle = vr.title?.runs?.map((r) => r.text).join("") || "";
        const author = vr.ownerText?.runs?.map((r) => r.text).join("") || "";
        const durText = vr.lengthText?.simpleText || "";
        let seconds = 180;
        if (durText) {
          const parts = durText.split(":").map(Number);
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            seconds = parts[0] * 60 + parts[1];
          } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
            seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
          }
        }
        return {
          videoId: vr.videoId,
          title: rawTitle,
          author: { name: author },
          seconds,
          views: 1200000,
          thumbnail:
            vr.thumbnail?.thumbnails?.[vr.thumbnail?.thumbnails?.length - 1]?.url ||
            `https://i.ytimg.com/vi/${vr.videoId}/hqdefault.jpg`,
        };
      });

    return videos;
  } catch (e) {
    console.warn("Direct scrape warning:", e);
    return [];
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q");

  if (!rawQuery || rawQuery.trim().length === 0) {
    return NextResponse.json({ songs: [] });
  }

  const query = rawQuery.trim();

  try {
    // 1. Direct Scraper (Fastest, zero-dependency, works everywhere)
    let rawVideos = await fetchDirectYouTube(query);

    // 2. Fallback search with "song" suffix if results are sparse
    if (!rawVideos || rawVideos.length === 0) {
      rawVideos = await fetchDirectYouTube(`${query} song`);
    }

    const nonMusicKeywords = [
      "unboxing",
      "hands on review",
      "camera test",
      "battery drain",
      "price in india",
      "speed test comparison",
      "pubg mobile gameplay",
      "free fire live stream",
      "gta 5 roleplay",
    ];

    const validVideos = rawVideos.filter((v) => {
      const lowerTitle = (v.title || "").toLowerCase();
      const isTooLong = (v.seconds || 0) > 720;
      const isCompilation =
        lowerTitle.includes("compilation") ||
        lowerTitle.includes("full album jukebox") ||
        lowerTitle.includes("10 hours") ||
        lowerTitle.includes("non stop dj mix");

      const isNonMusic = nonMusicKeywords.some((k) => lowerTitle.includes(k));

      return !isTooLong && !isCompilation && !isNonMusic;
    });

    const targetList = validVideos.length > 0 ? validVideos.slice(0, 20) : rawVideos.slice(0, 20);

    const songs = targetList.map((v) => {
      let cleanTitle = (v.title || "")
        .replace(/\s*\(Official (Music )?Video\)/gi, "")
        .replace(/\s*\[Official (Music )?Video\]/gi, "")
        .replace(/\s*\(Official Audio\)/gi, "")
        .replace(/\s*\[Official Audio\]/gi, "")
        .replace(/\s*\(Lyric Video\)/gi, "")
        .replace(/\s*\[Lyric Video\]/gi, "")
        .replace(/\s*\(Audio\)/gi, "")
        .replace(/\s*\[Audio\]/gi, "")
        .replace(/\s*\(Full Video\)/gi, "")
        .trim();

      let artistName = v.author?.name || "Campus Artist";

      if (cleanTitle.includes("|")) {
        const pipeParts = cleanTitle.split("|").map((p) => p.trim());
        cleanTitle = pipeParts[0];
        if (pipeParts.length > 1 && pipeParts[1]) {
          artistName = pipeParts.slice(1).join(" • ");
        }
      } else if (cleanTitle.includes(" - ")) {
        const parts = cleanTitle.split(" - ");
        if (parts.length === 2) {
          artistName = parts[0].trim();
          cleanTitle = parts[1].trim();
        }
      }

      artistName = artistName
        .replace(/\s*-\s*Topic$/i, "")
        .replace(/VEVO$/i, "")
        .trim();

      const coverUrl =
        v.thumbnail ||
        `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;

      return {
        id: `yt_${v.videoId}`,
        youtubeId: v.videoId,
        title: cleanTitle || v.title,
        artist: artistName || "Music Artist",
        album: "Campus Stream",
        duration: v.seconds || 180,
        coverUrl,
        audioUrl: "",
        source: "youtube",
        plays: v.views ? `${(v.views / 1000000).toFixed(1)}M` : "1.2M",
      };
    });

    return NextResponse.json({ songs });
  } catch (error) {
    console.error("YouTube search route error:", error);
    return NextResponse.json({ songs: [] });
  }
}