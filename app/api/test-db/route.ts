import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Test authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError) {
      return NextResponse.json(
        {
          error: "Authentication failed",
          details: authError.message,
        },
        { status: 401 }
      );
    }

    // Test database connectivity by checking if tables exist
    const { data: playlists, error: playlistError } = await supabase
      .from("playlists")
      .select("id")
      .limit(1);

    const { data: routines, error: routineError } = await supabase
      .from("routines")
      .select("id")
      .limit(1);

    const { data: videos, error: videoError } = await supabase
      .from("videos")
      .select("id")
      .limit(1);

    const { data: tasks, error: taskError } = await supabase
      .from("tasks")
      .select("id")
      .limit(1);

    return NextResponse.json({
      user: user ? { id: user.id, email: user.email } : null,
      tables: {
        playlists: playlistError ? `Error: ${playlistError.message}` : "OK",
        routines: routineError ? `Error: ${routineError.message}` : "OK",
        videos: videoError ? `Error: ${videoError.message}` : "OK",
        tasks: taskError ? `Error: ${taskError.message}` : "OK",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Database test failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
