"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ExternalLink, Clock, CheckCircle2 } from "lucide-react"
import type { Task } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

interface TodayTasksProps {
  tasks: (Task & { video: { title: string; video_id: string; duration_seconds: number } })[]
  playlistTitle: string
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function TodayTasks({ tasks: initialTasks, playlistTitle }: TodayTasksProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const completedCount = tasks.filter((t) => t.is_completed).length
  const totalCount = tasks.length

  const handleToggle = async (taskId: string, currentStatus: boolean) => {
    setLoadingId(taskId)

    try {
      const response = await fetch("/api/tasks/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, isCompleted: !currentStatus }),
      })

      if (!response.ok) throw new Error("Failed to update task")

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, is_completed: !currentStatus, completed_at: !currentStatus ? new Date().toISOString() : null }
            : t,
        ),
      )

      if (!currentStatus) {
        toast({ title: "Great job! Task completed!" })
      }
    } catch {
      toast({ title: "Failed to update task", variant: "destructive" })
    } finally {
      setLoadingId(null)
    }
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto text-accent mb-4" />
          <h3 className="font-semibold text-lg mb-2">No tasks for today!</h3>
          <p className="text-muted-foreground">You&apos;re all caught up. Enjoy your day!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Today&apos;s Learning</CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              {completedCount}/{totalCount} completed
            </span>
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{playlistTitle}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                task.is_completed ? "bg-accent/30 border-accent" : "bg-card border-border hover:border-primary/50"
              }`}
            >
              <Checkbox
                checked={task.is_completed}
                onCheckedChange={() => handleToggle(task.id, task.is_completed)}
                disabled={loadingId === task.id}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${task.is_completed ? "line-through text-muted-foreground" : ""}`}>
                  {task.video.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(task.video.duration_seconds)}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon" asChild className="shrink-0">
                <a
                  href={`https://youtube.com/watch?v=${task.video.video_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
