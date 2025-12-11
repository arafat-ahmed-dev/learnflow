import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateObject } from "ai";
import { z } from "zod";
import type { YouTubePlaylistInfo, PlaylistPreferences } from "@/lib/types";

// Fallback schedule creator for when AI is not available
function createSimpleSchedule(
  playlist: YouTubePlaylistInfo,
  videosPerDay: number
) {
  const schedule = [];
  const startDate = new Date();
  let videoIndex = 0;

  while (videoIndex < playlist.videos.length) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + schedule.length);

    const dayVideoIndices = [];
    for (
      let i = 0;
      i < videosPerDay && videoIndex < playlist.videos.length;
      i++
    ) {
      dayVideoIndices.push(videoIndex);
      videoIndex++;
    }

    schedule.push({
      date: date.toISOString().split("T")[0],
      videoIndices: dayVideoIndices,
      motivationalMessage:
        "Keep learning and stay consistent! Every video brings you closer to your goal.",
    });
  }

  return {
    schedule,
    tips: [
      "Take notes while watching to improve retention",
      "Practice what you learn by building small projects",
      "Don't hesitate to pause and rewind if needed",
      "Set up a distraction-free learning environment",
      "Review previous lessons before starting new ones",
    ],
  };
}

const scheduleSchema = z.object({
  schedule: z.array(
    z.object({
      date: z.string(),
      videoIndices: z.array(z.number()),
      motivationalMessage: z.string(),
    })
  ),
  tips: z.array(z.string()),
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      playlist,
      preferences,
    }: { playlist: YouTubePlaylistInfo; preferences: PlaylistPreferences } =
      await req.json();

    const videosPerDay = preferences.videosPerDay || 1;
    const totalVideos = playlist.videos.length;
    const daysNeeded = Math.ceil(totalVideos / videosPerDay);

    // Try to use AI to create an optimized learning schedule, fallback to simple schedule
    let aiSchedule;
    try {
      if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        const { object } = await generateObject({
          model: "google/gemini-1.5-flash",
          schema: scheduleSchema,
          prompt: `Create an optimized learning schedule for a course with ${totalVideos} videos.
          
          Videos per day target: ${videosPerDay}
          Total days needed: ${daysNeeded}
          ${
            preferences.targetCompletionDate
              ? `Target completion: ${preferences.targetCompletionDate}`
              : ""
          }
          
          Video details (index, title, duration in seconds):
          ${playlist.videos
            .map((v, i) => `${i}: "${v.title}" (${v.durationSeconds}s)`)
            .join("\n")}
          
          Create a day-by-day schedule starting from today. For each day, specify which video indices to watch.
          Try to balance daily workload by grouping shorter videos together.
          Include a short motivational message for each day.
          Also provide 3-5 learning tips specific to this type of content.
          
          Return dates in YYYY-MM-DD format starting from today.`,
        });
        aiSchedule = object;
        console.log("[Routine] Using AI-generated schedule");
      } else {
        throw new Error("No Google Gemini API key configured");
      }
    } catch (error) {
      console.log(
        "[Routine] AI scheduling failed, using simple schedule:",
        error.message
      );
      aiSchedule = createSimpleSchedule(playlist, videosPerDay);
    }

    // Save playlist to database
    const { data: savedPlaylist, error: playlistError } = await supabase
      .from("playlists")
      .insert({
        user_id: user.id,
        playlist_url: `https://youtube.com/playlist?list=${playlist.playlistId}`,
        playlist_id: playlist.playlistId,
        title: playlist.title,
        total_videos: totalVideos,
        total_duration_seconds: playlist.totalDurationSeconds,
        thumbnail_url: playlist.videos[0]?.thumbnailUrl || null,
      })
      .select()
      .single();

    if (playlistError) throw playlistError;

    // Save videos
    const videoInserts = playlist.videos.map((video) => ({
      playlist_id: savedPlaylist.id,
      video_id: video.videoId,
      title: video.title,
      duration_seconds: video.durationSeconds,
      thumbnail_url: video.thumbnailUrl,
      position: video.position,
    }));

    const { data: savedVideos, error: videosError } = await supabase
      .from("videos")
      .insert(videoInserts)
      .select();

    if (videosError) throw videosError;

    // Create routine
    const startDate = new Date().toISOString().split("T")[0];
    const targetDate = preferences.targetCompletionDate || null;

    const { data: routine, error: routineError } = await supabase
      .from("routines")
      .insert({
        user_id: user.id,
        playlist_id: savedPlaylist.id,
        videos_per_day: videosPerDay,
        target_completion_date: targetDate,
        start_date: startDate,
        is_active: true,
      })
      .select()
      .single();

    if (routineError) throw routineError;

    // Create tasks based on AI schedule
    const taskInserts: {
      user_id: string;
      routine_id: string;
      video_id: string;
      scheduled_date: string;
    }[] = [];

    for (const day of aiSchedule.schedule) {
      for (const videoIndex of day.videoIndices) {
        if (videoIndex < savedVideos.length) {
          taskInserts.push({
            user_id: user.id,
            routine_id: routine.id,
            video_id: savedVideos[videoIndex].id,
            scheduled_date: day.date,
          });
        }
      }
    }

    const { error: tasksError } = await supabase
      .from("tasks")
      .insert(taskInserts);

    if (tasksError) throw tasksError;

    return NextResponse.json({
      routine,
      playlist: savedPlaylist,
      tips: aiSchedule.tips,
    });
  } catch (error) {
    console.error("Error creating routine:", error);

    // Provide more specific error messages
    let errorMessage = "Failed to create routine";
    if (error.message?.includes("duplicate key value")) {
      errorMessage = "A routine for this playlist already exists";
    } else if (error.message?.includes("violates foreign key")) {
      errorMessage = "Database relationship error - please try again";
    } else if (error.message?.includes("not authenticated")) {
      errorMessage = "Authentication required";
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
