import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId, isCompleted } = await req.json();

    const { data, error } = await supabase
      .from("tasks")
      .update({
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .eq("id", taskId)
      .eq("user_id", user.id)
      .select(
        `
        *,
        video:videos(title, video_id, duration_seconds)
      `
      )
      .single();

    if (error) throw error;

    // Note: In a real implementation, you would emit Socket.io events here
    // For now, the client-side handles the real-time updates
    console.log(
      `[Task Update] User ${user.id} ${
        isCompleted ? "completed" : "uncompleted"
      } task: ${data.video?.title}`
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error toggling task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
