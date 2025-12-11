import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Clock, Flame, Target } from "lucide-react"

interface StatsCardsProps {
  totalCompleted: number
  totalVideos: number
  currentStreak: number
  totalMinutesWatched: number
}

export function StatsCards({ totalCompleted, totalVideos, currentStreak, totalMinutesWatched }: StatsCardsProps) {
  const hours = Math.floor(totalMinutesWatched / 60)
  const minutes = totalMinutesWatched % 60

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCompleted}</p>
              <p className="text-xs text-muted-foreground">Videos Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/50 flex items-center justify-center">
              <Target className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalVideos}</p>
              <p className="text-xs text-muted-foreground">Total Videos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-3/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-bold">{currentStreak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-1/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-chart-1" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {hours > 0 ? `${hours}h` : ""} {minutes}m
              </p>
              <p className="text-xs text-muted-foreground">Time Learned</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
