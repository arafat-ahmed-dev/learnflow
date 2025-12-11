"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlaylistUrlInput } from "./playlist-url-input"
import { PlaylistPreview } from "./playlist-preview"
import { PreferenceForm } from "./preference-form"
import type { YouTubePlaylistInfo, PlaylistPreferences } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

export function NewPlaylistWizard() {
  const router = useRouter()
  const [playlist, setPlaylist] = useState<YouTubePlaylistInfo | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const handlePlaylistFetched = (fetchedPlaylist: YouTubePlaylistInfo) => {
    setPlaylist(fetchedPlaylist)
  }

  const handleCreateRoutine = async (preferences: PlaylistPreferences) => {
    if (!playlist) return

    setIsCreating(true)

    try {
      const response = await fetch("/api/routines/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playlist,
          preferences,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create routine")
      }

      toast({ title: "Routine created successfully!" })
      router.push(`/dashboard`)
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed to create routine", variant: "destructive" })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <PlaylistUrlInput onPlaylistFetched={handlePlaylistFetched} />

      {playlist && (
        <div className="grid md:grid-cols-2 gap-6">
          <PlaylistPreview playlist={playlist} />
          <PreferenceForm playlist={playlist} onSubmit={handleCreateRoutine} isLoading={isCreating} />
        </div>
      )}
    </div>
  )
}
