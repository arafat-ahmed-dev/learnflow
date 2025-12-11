import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { TodayTasks } from "@/components/today-tasks"
import { RoutineCard } from "@/components/routine-card"
import { StatsCards } from "@/components/stats-cards"
import { EmptyState } from "@/components/empty-state"
import { NotificationPermission } from "@/components/notification-permission"
import { ReminderScheduler } from "@/components/reminder-scheduler"
import { MotivationalBanner } from "@/components/motivational-banner"
import { ConnectionStatus } from "@/components/connection-status"
import { SocketInitializer } from "@/components/socket-initializer"
import { RealtimeDashboard } from "@/components/realtime-dashboard"
import { RealtimeNotifications } from "@/components/realtime-notifications"
import type { Playlist, Routine, Task, Video } from "@/lib/types"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch all routines with playlists and tasks
  const { data: routines } = await supabase
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
    .eq("user_id", data.user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  const typedRoutines = (routines || []) as (Routine & {
    playlist: Playlist
    tasks: (Task & { video: Video })[]
  })[]

  // Get today's date
  const today = new Date().toISOString().split("T")[0]

  // Get today's tasks from all routines
  const todayTasks: (Task & { video: { title: string; video_id: string; duration_seconds: number } })[] = []
  let todayPlaylistTitle = ""

  for (const routine of typedRoutines) {
    const routineTodayTasks = routine.tasks.filter((t) => t.scheduled_date === today)
    if (routineTodayTasks.length > 0) {
      todayPlaylistTitle = routine.playlist.title
      todayTasks.push(
        ...routineTodayTasks.map((t) => ({
          ...t,
          video: {
            title: t.video.title,
            video_id: t.video.video_id,
            duration_seconds: t.video.duration_seconds,
          },
        })),
      )
    }
  }

  // Calculate stats
  const allTasks = typedRoutines.flatMap((r) => r.tasks)
  const completedTasks = allTasks.filter((t) => t.is_completed)
  const totalMinutesWatched = Math.round(
    completedTasks.reduce((acc, t) => acc + (t.video?.duration_seconds || 0), 0) / 60,
  )

  // Calculate streak (simplified)
  const sortedCompletedDates = [...new Set(completedTasks.map((t) => t.completed_at?.split("T")[0]).filter(Boolean))]
    .sort()
    .reverse()

  let streak = 0
  const checkDate = new Date()
  for (const date of sortedCompletedDates) {
    const dateStr = checkDate.toISOString().split("T")[0]
    if (date === dateStr) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  const hasRoutines = typedRoutines.length > 0

  const todayCompletedCount = todayTasks.filter((t) => t.is_completed).length
  const todayTotalCount = todayTasks.length

  return (
    <div className="min-h-screen bg-gradient-card">
      <SocketInitializer />
      <RealtimeNotifications userId={data.user.id} />
      <DashboardHeader email={data.user.email || ""}>
        <ConnectionStatus />
      </DashboardHeader>

      <ReminderScheduler tasksForToday={todayTotalCount - todayCompletedCount} playlistTitle={todayPlaylistTitle} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <RealtimeDashboard
          userId={data.user.id}
          initialRoutines={typedRoutines}
          initialTodayTasks={todayTasks}
          initialStats={{
            totalCompleted: completedTasks.length,
            totalVideos: allTasks.length,
            currentStreak: streak,
            totalMinutesWatched
          }}
          todayCompletedCount={todayCompletedCount}
          todayTotalCount={todayTotalCount}
          playlistTitle={todayPlaylistTitle}
          hasRoutines={hasRoutines}
        />
      </main>
    </div>
  )
}
