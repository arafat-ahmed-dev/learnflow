"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Video, Sparkles, Loader2 } from "lucide-react"
import type { YouTubePlaylistInfo, PlaylistPreferences } from "@/lib/types"

interface PreferenceFormProps {
  playlist: YouTubePlaylistInfo
  onSubmit: (preferences: PlaylistPreferences) => Promise<void>
  isLoading: boolean
}

export function PreferenceForm({ playlist, onSubmit, isLoading }: PreferenceFormProps) {
  const [mode, setMode] = useState<"videos" | "date" | "default">("videos")
  const [videosPerDay, setVideosPerDay] = useState(2)
  const [targetDate, setTargetDate] = useState("")

  const totalVideos = playlist.videos.length
  const estimatedDays = Math.ceil(totalVideos / videosPerDay)

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  const calculateVideosPerDayFromDate = (date: string): number => {
    const target = new Date(date)
    const today = new Date()
    const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(1, Math.ceil(totalVideos / diffDays))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const preferences: PlaylistPreferences = {}

    if (mode === "videos") {
      preferences.videosPerDay = videosPerDay
    } else if (mode === "date") {
      preferences.targetCompletionDate = targetDate
      preferences.videosPerDay = calculateVideosPerDayFromDate(targetDate)
    } else {
      preferences.videosPerDay = 1
    }

    await onSubmit(preferences)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Set Your Learning Pace
        </CardTitle>
        <CardDescription>Choose how you want to complete this {totalVideos}-video playlist</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <RadioGroup
            value={mode}
            onValueChange={(v) => setMode(v as "videos" | "date" | "default")}
            className="space-y-3"
          >
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="videos" id="videos" className="mt-1" />
              <div className="flex-1 space-y-3">
                <Label htmlFor="videos" className="font-medium cursor-pointer">
                  <span className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Set videos per day
                  </span>
                </Label>
                {mode === "videos" && (
                  <div className="space-y-2">
                    <Input
                      type="number"
                      min={1}
                      max={totalVideos}
                      value={videosPerDay}
                      onChange={(e) => setVideosPerDay(Number(e.target.value))}
                      className="w-32"
                    />
                    <p className="text-sm text-muted-foreground">Complete in approximately {estimatedDays} days</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <RadioGroupItem value="date" id="date" className="mt-1" />
              <div className="flex-1 space-y-3">
                <Label htmlFor="date" className="font-medium cursor-pointer">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Set target completion date
                  </span>
                </Label>
                {mode === "date" && (
                  <div className="space-y-2">
                    <Input
                      type="date"
                      min={getMinDate()}
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-48"
                    />
                    {targetDate && (
                      <p className="text-sm text-muted-foreground">
                        ~{calculateVideosPerDayFromDate(targetDate)} videos per day
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <RadioGroupItem value="default" id="default" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="default" className="font-medium cursor-pointer">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Let AI decide (1 video/day, relaxed pace)
                  </span>
                </Label>
                <p className="text-sm text-muted-foreground mt-1">Complete in {totalVideos} days</p>
              </div>
            </div>
          </RadioGroup>

          <Button type="submit" className="w-full" disabled={isLoading || (mode === "date" && !targetDate)}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Your Routine...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Learning Routine
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
