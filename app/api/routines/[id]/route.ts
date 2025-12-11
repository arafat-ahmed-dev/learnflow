import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: routine, error: routineError } = await supabase
      .from("routines")
      .select(
        `
        *,
        playlist:playlists(*),
        tasks(
          *,
          video:videos(*)
        )
      `,
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (routineError) throw routineError

    return NextResponse.json(routine)
  } catch (error) {
    console.error("Error fetching routine:", error)
    return NextResponse.json({ error: "Failed to fetch routine" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase.from("routines").delete().eq("id", id).eq("user_id", user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting routine:", error)
    return NextResponse.json({ error: "Failed to delete routine" }, { status: 500 })
  }
}
