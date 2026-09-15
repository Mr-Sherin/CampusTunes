import { NextResponse } from "next/server";
import ytSearch from "yt-search";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q");

  if (!rawQuery || rawQuery.trim().length === 0) {
    return NextResponse.json({ songs: [] });
  }

  const query = rawQuery.trim();

  try {
    // 1. First search direct query
    let results = await ytSearch(query);

    // 2. If direct search returned very few results, fallback to music query
    if (!results?.videos || results.videos.length < 3) {
      results = await ytSearch(`${query} song`);
    }

    // Non-music filter keywords to reject unboxings, reviews, gameplay
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

    const validVideos = (results?.videos || []).filter((v) => {
      const lowerTitle = v.title.toLowerCase();
      const isTooLong = v.seconds > 720; // over 12 minutes
      const isCompilation =
        lowerTitle.includes("compilation") ||
        lowerTitle.includes("full album jukebox") ||
        lowerTitle.includes("10 hours") ||
        lowerTitle.includes("non stop dj mix");

      const isNonMusic = nonMusicKeywords.some((k) => lowerTitle.includes(k));

      return !isTooLong && !isCompilation && !isNonMusic;
    });

    const targetList =
      validVideos.length > 0 ? validVideos.slice(0, 20) : (results?.videos || []).slice(0, 20);

    const songs = targetList.map((v) => {
      let cleanTitle = v.title
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

      // If title contains pipe like "Song | Movie | Artist", parse title cleanly
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
    console.error("YouTube search error:", error);
    return NextResponse.json({ songs: [] });
  }
}