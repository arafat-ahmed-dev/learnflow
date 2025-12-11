"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

const motivationalMessages = [
  "Every expert was once a beginner. Keep going!",
  "Small progress is still progress. You've got this!",
  "Consistency beats intensity. One video at a time.",
  "The best time to learn was yesterday. The second best is now.",
  "You're investing in yourself. That's the best investment.",
  "Learning is a journey, not a destination. Enjoy the ride!",
  "Today's learning is tomorrow's expertise.",
  "Show up, press play, and let the magic happen.",
]

interface MotivationalBannerProps {
  completedToday: number
  totalToday: number
}

export function MotivationalBanner({ completedToday, totalToday }: MotivationalBannerProps) {
  const [message, setMessage] = useState("")

  useEffect(() => {
    // Pick a random message on mount
    const randomIndex = Math.floor(Math.random() * motivationalMessages.length)
    setMessage(motivationalMessages[randomIndex])
  }, [])

  // Show different messages based on progress
  const getMessage = () => {
    if (totalToday === 0) {
      return "No tasks for today! Take a well-deserved break."
    }
    if (completedToday === totalToday) {
      return "Amazing work! You've completed all your tasks for today!"
    }
    if (completedToday > 0) {
      return `Great progress! ${totalToday - completedToday} more to go. ${message}`
    }
    return message
  }

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-none">
      <CardContent className="py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm font-medium text-pretty">{getMessage()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
