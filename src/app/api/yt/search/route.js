import { NextResponse } from "next/server";
import ytSearch from "yt-search";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q");

  if (!rawQuery || rawQuery.trim().length === 0) {
    return NextResponse.json({ songs: [] });
  }

  const query = rawQuery.trim();

  // If query does not contain musical keywords, append "song" for higher music precision
  const isMusicQuery =
  /song|music|track|audio|band|remix|acoustic|theme|ost|lyrics|singer|album|cover/i.test(query);
  const searchQuery = isMusicQuery ? query : `${query} song`;

  try {
    const results = await ytSearch(searchQuery);

    // Non-music filter keywords to reject phone unboxings, gadget reviews, gameplay, tutorials
    const nonMusicKeywords = [
    "unboxing",
    "review",
    "hands on",
    "unlock without data loss",
    "gameplay",
    "walkthrough",
    "tutorial",
    "specifications",
    "camera test",
    "battery drain",
    "price in",
    "speed test",
    "pubg",
    "free fire",
    "gta"];


    // Filter to real songs
    const validVideos = results.videos.filter((v) => {
      const lowerTitle = v.title.toLowerCase();
      const isTooLong = v.seconds > 600; // over 10 minutes
      const isCompilation =
      lowerTitle.includes("compilation") ||
      lowerTitle.includes("full album") ||
      lowerTitle.includes("playlist") ||
      lowerTitle.includes("1 hour") ||
      lowerTitle.includes("10 hours");

      const isNonMusic = nonMusicKeywords.some((k) => lowerTitle.includes(k));

      return !isTooLong && !isCompilation && !isNonMusic;
    });

    const targetList =
    validVideos.length > 0 ? validVideos.slice(0, 15) : results.videos.slice(0, 15);

    const songs = targetList.map((v) => {
      // Clean up common video title artifacts for music UI
      let cleanTitle = v.title.
      replace(/\s*\(Official (Music )?Video\)/gi, "").
      replace(/\s*\[Official (Music )?Video\]/gi, "").
      replace(/\s*\(Official Audio\)/gi, "").
      replace(/\s*\[Official Audio\]/gi, "").
      replace(/\s*\(Lyric Video\)/gi, "").
      replace(/\s*\[Lyric Video\]/gi, "").
      replace(/\s*\(Audio\)/gi, "").
      replace(/\s*\[Audio\]/gi, "").
      replace(/\s*\|.*$/g, "").
      trim();

      let artistName = v.author?.name || "Campus Artist";

      // If title is "Artist - Song Name", parse them cleanly
      if (cleanTitle.includes(" - ")) {
        const parts = cleanTitle.split(" - ");
        if (parts.length === 2) {
          artistName = parts[0].trim();
          cleanTitle = parts[1].trim();
        }
      }

      // Remove " - Topic" or "VEVO" from channel name if present
      artistName = artistName.
      replace(/\s*-\s*Topic$/i, "").
      replace(/VEVO$/i, "").
      trim();

      const coverUrl =
      v.thumbnail ||
      `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;

      return {
        id: `yt_${v.videoId}`,
        youtubeId: v.videoId,
        title: cleanTitle,
        artist: artistName,
        album: "Campus Stream",
        duration: v.seconds,
        coverUrl,
        audioUrl: "",
        source: "youtube",
        plays: v.views ? `${(v.views / 1000000).toFixed(1)}M` : "1.2M"
      };
    });

    return NextResponse.json({ songs });
  } catch (error) {
    console.error("YouTube search error:", error);
    return NextResponse.json({ songs: [] });
  }
}