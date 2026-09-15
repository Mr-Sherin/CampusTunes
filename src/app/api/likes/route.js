import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ likes: [], authenticated: false });
    }

    const { data, error } = await supabase.
    from("likes").
    select("song_id, song_data, created_at").
    eq("user_id", user.id).
    order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching likes:", error);
      return NextResponse.json({ likes: [], error: error.message });
    }

    const likedTracks = (data || []).map((row) => {
      if (row.song_data && typeof row.song_data === "object") {
        return {
          ...row.song_data,
          id: row.song_id
        };
      }
      return { id: row.song_id };
    });

    return NextResponse.json({ likes: likedTracks, authenticated: true });
  } catch (err) {
    console.error("Likes GET route error:", err);
    return NextResponse.json({ likes: [], error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to save liked songs." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const song = body.song;

    if (!song || !song.id) {
      return NextResponse.json({ error: "Missing song data" }, { status: 400 });
    }

    // Check if song is already liked
    const { data: existingLike, error: fetchErr } = await supabase.
    from("likes").
    select("song_id").
    eq("user_id", user.id).
    eq("song_id", song.id).
    maybeSingle();

    if (fetchErr) {
      console.warn("Fetch like check warning:", fetchErr.message);
    }

    if (existingLike) {
      // Remove like
      const { error: deleteErr } = await supabase.
      from("likes").
      delete().
      eq("user_id", user.id).
      eq("song_id", song.id);

      if (deleteErr) {
        throw new Error(deleteErr.message);
      }

      return NextResponse.json({
        liked: false,
        songId: song.id,
        message: "Removed from liked songs"
      });
    } else {
      // Add like
      const { error: insertErr } = await supabase.from("likes").upsert({
        user_id: user.id,
        song_id: song.id,
        song_data: song
      });

      if (insertErr) {
        throw new Error(insertErr.message);
      }

      return NextResponse.json({
        liked: true,
        songId: song.id,
        message: "Added to liked songs"
      });
    }
  } catch (err) {
    console.error("Likes POST route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}