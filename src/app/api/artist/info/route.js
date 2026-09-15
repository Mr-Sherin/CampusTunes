import { NextResponse } from "next/server";

const KNOWN_ARTIST_WIKI_MAP = {
  avial: "Avial_(band)",
  queen: "Queen_(band)",
  kiss: "Kiss_(band)",
  oasis: "Oasis_(band)",
  nirvana: "Nirvana_(band)",
  eagles: "Eagles_(band)",
  "thaikkudam bridge": "Thaikkudam_Bridge",
  "sushin shyam": "Sushin_Shyam",
  "dabzee": "Dabzee",
  "stephen sanchez": "Stephen_Sanchez",
  "diljit dosanjh": "Diljit_Dosanjh",
  "hanumankind": "Hanumankind",
  "alan walker": "Alan_Walker",
  "the weeknd": "The_Weeknd",
  "billie eilish": "Billie_Eilish",
  "coldplay": "Coldplay",
  "post malone": "Post_Malone",
  "dua lipa": "Dua_Lipa",
  "arijit singh": "Arijit_Singh",
  "ap dhillon": "AP_Dhillon",
  "hozier": "Hozier",
  "benson boone": "Benson_Boone",
  "sabrina carpenter": "Sabrina_Carpenter",
  "taylor swift": "Taylor_Swift",
  "kendrick lamar": "Kendrick_Lamar"
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawName = searchParams.get("name");

  if (!rawName || rawName.trim().length === 0) {
    return NextResponse.json({ error: "Missing artist name" }, { status: 400 });
  }

  // Clean artist name
  let artistName = rawName.split(/[,&/]|(\s+ft\.?\s+)|(\s+feat\.?\s+)/i)[0].trim();
  artistName = artistName.replace(/\s*-\s*Topic$/i, "").replace(/VEVO$/i, "").trim();

  const lowerKey = artistName.toLowerCase();

  // Try known music wiki alias first, followed by music entity variants
  const queryVariants = [
  KNOWN_ARTIST_WIKI_MAP[lowerKey] || null,
  `${artistName}_(band)`,
  `${artistName}_(musician)`,
  `${artistName}_(singer)`,
  `${artistName}_(music_group)`,
  `${artistName}_(producer)`,
  artistName].
  filter(Boolean);

  for (const variant of queryVariants) {
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        variant.replace(/\s+/g, "_")
      )}`;

      const res = await fetch(url, {
        headers: {
          "User-Agent": "CampusTunes/1.0 (https://campustunes.app; contact@campustunes.app)"
        },
        next: { revalidate: 86400 }
      });

      if (res.ok) {
        const data = await res.json();
        const desc = (data.description || "").toLowerCase();
        const bioText = (data.extract || "").toLowerCase();

        // Reject non-music entries like vegetable curries, dishes, plants, or cities
        const isNonMusic =
        desc.includes("dish") ||
        desc.includes("food") ||
        desc.includes("cuisine") ||
        desc.includes("recipe") ||
        desc.includes("species") ||
        desc.includes("village") ||
        bioText.includes("vegetable") && !bioText.includes("band") && !bioText.includes("music");

        if (!isNonMusic && data.type === "standard" && data.extract) {
          const imageUrl =
          data.thumbnail?.source ||
          data.originalimage?.source ||
          null;

          const cleanTitle = (data.title || artistName).replace(/\s*\([^)]*\)$/, "");

          return NextResponse.json({
            name: cleanTitle,
            bio: data.extract,
            image: imageUrl,
            description: data.description || "Music Artist"
          });
        }
      }
    } catch {

      // Continue to next variant
    }}

  // Fallback if not found on Wikipedia
  return NextResponse.json({
    name: artistName,
    bio: `${artistName} is an active recording artist streaming on CampusTunes with high-fidelity sound and campus community playlists.`,
    image: null,
    description: "Recording Artist"
  });
}