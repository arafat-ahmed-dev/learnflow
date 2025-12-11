"use client"

import type { YouTubePlaylistInfo } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, PlayCircle, Video } from "lucide-react"
import Image from "next/image"

interface PlaylistPreviewProps {
  playlist: YouTubePlaylistInfo
}

function formatVideoDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

function formatDetailedDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (secs > 0 && days === 0 && hours === 0) parts.push(`${secs}s`)

  return parts.join(" ") || "0m"
}

export function PlaylistPreview({ playlist }: PlaylistPreviewProps) {
  const avgDuration =
    playlist.videos.length > 0 ? Math.floor(playlist.totalDurationSeconds / playlist.videos.length) : 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <PlayCircle className="w-5 h-5 text-primary" />
          {playlist.title}
        </CardTitle>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Video className="w-4 h-4" />
            {playlist.videos.length} videos
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Total: {formatDetailedDuration(playlist.totalDurationSeconds)}
          </span>
          <span className="text-xs">(Avg: {formatVideoDuration(avgDuration)} per video)</span>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-2">
            {playlist.videos.map((video, index) => (
              <div
                key={video.videoId}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className="w-8 h-6 rounded bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
                  {index + 1}
                </span>
                <div className="relative w-24 h-14 rounded overflow-hidden shrink-0 bg-muted">
                  <Image
                    src={video.thumbnailUrl || `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`}
                    alt={video.title}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`
                    }}
                  />
                  <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                    {formatVideoDuration(video.durationSeconds)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2">{video.title}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
