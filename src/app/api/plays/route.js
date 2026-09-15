import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { songId } = body;

    if (!songId) {
      return NextResponse.json({ error: "Missing songId" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 1. Insert into song_plays table
    await supabase.from("song_plays").insert({
      song_id: songId,
      user_id: user?.id || null,
    });

    // 2. Fetch current play count and increment
    const { data: currentSong } = await supabase
      .from("songs")
      .select("play_count")
      .eq("id", songId)
      .maybeSingle();

    if (currentSong) {
      const newPlayCount = (Number(currentSong.play_count) || 0) + 1;
      await supabase
        .from("songs")
        .update({ play_count: newPlayCount })
        .eq("id", songId);
    }

    return NextResponse.json({ success: true, recorded: true });
  } catch (err) {
    console.error("Play increment error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
