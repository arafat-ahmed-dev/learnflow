"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { PlayCircle, Clock, Video, Calendar, Trash2, ExternalLink } from "lucide-react"
import type { Playlist, Routine, Task } from "@/lib/types"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface RoutineCardProps {
  routine: Routine & {
    playlist: Playlist
    tasks: Task[]
  }
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function RoutineCard({ routine }: RoutineCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const completedTasks = routine.tasks.filter((t) => t.is_completed).length
  const totalTasks = routine.tasks.length
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/routines/${routine.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete routine")

      toast({ title: "Routine deleted" })
      router.refresh()
    } catch {
      toast({ title: "Failed to delete routine", variant: "destructive" })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <PlayCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base truncate">{routine.playlist.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {routine.videos_per_day} video{routine.videos_per_day > 1 ? "s" : ""}/day
              </p>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this routine?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this routine and all associated progress. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {completedTasks}/{totalTasks} videos
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-muted/50">
            <Video className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">Videos</p>
            <p className="font-medium text-sm">{routine.playlist.total_videos}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <Clock className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="font-medium text-sm">{formatDuration(routine.playlist.total_duration_seconds)}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <Calendar className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">Started</p>
            <p className="font-medium text-sm">
              {new Date(routine.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>
        </div>

        <Button variant="outline" className="w-full gap-2 bg-transparent" asChild>
          <a href={routine.playlist.playlist_url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" />
            Open Playlist
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
