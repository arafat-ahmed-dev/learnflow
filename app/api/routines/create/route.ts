import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import type { YouTubePlaylistInfo, PlaylistPreferences } from "@/lib/types";

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

    // Use AI to create an optimized learning schedule
    let aiSchedule;
    try {
      const result = await generateObject({
        model: google("gemini-1.5-flash-latest"), // Using correct Gemini model name
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
      aiSchedule = result.object;
    } catch (aiError) {
      console.error("AI Gateway error:", aiError);
      // Fallback: create a basic schedule without AI
      aiSchedule = createFallbackSchedule(
        totalVideos,
        videosPerDay,
        daysNeeded
      );
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
    return NextResponse.json(
      { error: "Failed to create routine" },
      { status: 500 }
    );
  }
}

// Fallback function to create a basic schedule without AI
function createFallbackSchedule(
  totalVideos: number,
  videosPerDay: number,
  daysNeeded: number
) {
  const schedule = [];
  const tips = [
    "Take breaks between videos to process the information",
    "Take notes on key concepts as you watch",
    "Try to apply what you learn immediately",
    "Review previous videos if concepts build on each other",
    "Set a consistent time each day for your learning routine",
  ];

  const today = new Date();
  let videoIndex = 0;

  for (let day = 0; day < daysNeeded; day++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + day);
    const dateStr = currentDate.toISOString().split("T")[0];

    const videoIndices = [];
    for (let i = 0; i < videosPerDay && videoIndex < totalVideos; i++) {
      videoIndices.push(videoIndex++);
    }

    const dayNumber = day + 1;
    const motivationalMessages = [
      "Great start! Every expert was once a beginner.",
      "Keep up the momentum! Consistency is key to mastery.",
      "You're making real progress! Knowledge compounds daily.",
      "Halfway there! Your dedication is paying off.",
      "Final stretch! You're so close to completing this journey!",
    ];

    const messageIndex = Math.floor(
      (day / daysNeeded) * motivationalMessages.length
    );
    const motivationalMessage =
      motivationalMessages[
        Math.min(messageIndex, motivationalMessages.length - 1)
      ];

    schedule.push({
      date: dateStr,
      videoIndices,
      motivationalMessage,
    });
  }

  return { schedule, tips };
}
