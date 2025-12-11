"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ExternalLink, Clock, CheckCircle2, Play, Trophy, Star } from "lucide-react"
import { useSocket } from "@/lib/socket-context"
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
  const { socket, updateTaskStatus } = useSocket()

  const completedCount = tasks.filter((t) => t.is_completed).length
  const totalCount = tasks.length
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  useEffect(() => {
    if (!socket) return

    // Listen for real-time task updates
    socket.on("task-status-change", (data: { taskId: string; completed: boolean; timestamp: string }) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === data.taskId
            ? { ...task, is_completed: data.completed, completed_at: data.completed ? data.timestamp : null }
            : task
        )
      )
    })

    return () => {
      socket.off("task-status-change")
    }
  }, [socket])

  const handleToggle = async (taskId: string, currentStatus: boolean) => {
    setLoadingId(taskId)

    try {
      const response = await fetch("/api/tasks/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, isCompleted: !currentStatus }),
      })

      if (!response.ok) throw new Error("Failed to update task")

      const updatedTask = await response.json()

      // Update local state immediately
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, is_completed: !currentStatus, completed_at: !currentStatus ? new Date().toISOString() : null }
            : t,
        ),
      )

      // Emit socket event for real-time updates
      if (socket) {
        updateTaskStatus(taskId, !currentStatus, updatedTask.user_id)
      }

      if (!currentStatus) {
        toast({
          title: "🎉 Awesome! Task completed!",
          description: "Keep up the great work!"
        })
      }
    } catch {
      toast({ title: "Failed to update task", variant: "destructive" })
    } finally {
      setLoadingId(null)
    }
  }

  if (tasks.length === 0) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/25">
        <CardContent className="py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-linear-to-br from-accent/20 to-primary/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-accent" />
          </div>
          <h3 className="font-semibold text-xl mb-3">All caught up! 🎉</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">You've completed all your tasks for today. Take a moment to celebrate your progress!</p>
          <div className="mt-6">
            <Badge variant="outline" className="bg-accent/10">
              <Trophy className="w-3 h-3 mr-1" />
              Day Complete
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-enhanced overflow-hidden border-l-4 border-l-primary">
      <CardHeader className="pb-4 bg-gradient-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Play className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                Today's Learning
                {completedCount === totalCount && totalCount > 0 && (
                  <Badge className="bg-green-500 hover:bg-green-600">
                    <Star className="w-3 h-3 mr-1" />
                    Complete!
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{playlistTitle}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {completedCount}<span className="text-lg text-muted-foreground">/{totalCount}</span>
            </div>
            <p className="text-xs text-muted-foreground">tasks done</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className={`group relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] ${task.is_completed
                ? "task-completed"
                : "task-pending"
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
