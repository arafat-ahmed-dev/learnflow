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
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader email={data.user.email || ""} />

      <ReminderScheduler tasksForToday={todayTotalCount - todayCompletedCount} playlistTitle={todayPlaylistTitle} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {hasRoutines ? (
          <div className="space-y-6">
            <NotificationPermission />

            <MotivationalBanner completedToday={todayCompletedCount} totalToday={todayTotalCount} />

            {/* Stats */}
            <StatsCards
              totalCompleted={completedTasks.length}
              totalVideos={allTasks.length}
              currentStreak={streak}
              totalMinutesWatched={totalMinutesWatched}
            />

            {/* Today's Tasks */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Today&apos;s Tasks</h2>
              <TodayTasks tasks={todayTasks} playlistTitle={todayPlaylistTitle} />
            </section>

            {/* Active Routines */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Your Learning Routines</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {typedRoutines.map((routine) => (
                  <RoutineCard key={routine.id} routine={routine} />
                ))}
              </div>
            </section>
          </div>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  )
}
