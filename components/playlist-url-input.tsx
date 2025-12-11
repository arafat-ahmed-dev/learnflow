"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link2, Loader2, AlertCircle } from "lucide-react"
import type { YouTubePlaylistInfo } from "@/lib/types"

interface PlaylistUrlInputProps {
  onPlaylistFetched: (playlist: YouTubePlaylistInfo) => void
}

export function PlaylistUrlInput({ onPlaylistFetched }: PlaylistUrlInputProps) {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const extractPlaylistId = (url: string): string | null => {
    const patterns = [/[?&]list=([a-zA-Z0-9_-]+)/, /youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const playlistId = extractPlaylistId(url)
    if (!playlistId) {
      setError("Please enter a valid YouTube playlist URL")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/youtube/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistId, url }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to fetch playlist")
      }

      const playlist = await response.json()
      onPlaylistFetched(playlist)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch playlist")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="playlist-url">YouTube Playlist URL</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="playlist-url"
              type="url"
              placeholder="https://youtube.com/playlist?list=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading || !url}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Fetching...
              </>
            ) : (
              "Fetch Playlist"
            )}
          </Button>
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </form>
  )
}
