"use client"

import { useEffect, useState } from "react"
import { useSocket } from "@/lib/socket-context"
import { toast } from "@/hooks/use-toast"
import { CheckCircle2, Trophy, Zap } from "lucide-react"

interface RealtimeNotificationsProps {
    userId: string
}

export function RealtimeNotifications({ userId }: RealtimeNotificationsProps) {
    const { socket } = useSocket()
    const [taskStreak, setTaskStreak] = useState(0)

    useEffect(() => {
        if (!socket) return

        // Listen for task completion updates
        socket.on("task-status-change", (data: { taskId: string; completed: boolean; timestamp: string }) => {
            if (data.completed) {
                setTaskStreak(prev => prev + 1)

                // Show encouraging toast
                const encouragements = [
                    "🎉 Fantastic work! Keep it up!",
                    "✨ You're on fire! Another task done!",
                    "🚀 Amazing progress! You're unstoppable!",
                    "⭐ Excellent! You're building great habits!",
                    "🎯 Perfect! Stay focused, you've got this!"
                ]

                const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)]

                toast({
                    title: "Task Completed! 🎉",
                    description: randomEncouragement,
                    duration: 4000,
                })

                // Special milestone notifications
                if (taskStreak > 0 && taskStreak % 5 === 0) {
                    setTimeout(() => {
                        toast({
                            title: `🔥 ${taskStreak} Task Streak! 🔥`,
                            description: "You're on an incredible learning streak! Keep going!",
                            duration: 6000,
                        })
                    }, 1500)
                }

                if (taskStreak > 0 && taskStreak % 10 === 0) {
                    setTimeout(() => {
                        toast({
                            title: "🏆 MILESTONE ACHIEVED! 🏆",
                            description: `${taskStreak} tasks completed! You're absolutely crushing it!`,
                            duration: 8000,
                        })
                    }, 2000)
                }
            } else {
                // Reset streak if task is uncompleted
                setTaskStreak(0)
            }
        })

        // Listen for new routine creation
        socket.on("new-routine", (data: any) => {
            toast({
                title: "🎯 New Learning Routine Created!",
                description: `Ready to start your journey with "${data.playlist?.title}"`,
                duration: 5000,
            })
        })

        // Listen for daily completion
        socket.on("daily-completion", (data: { completedToday: number; totalToday: number }) => {
            if (data.completedToday === data.totalToday && data.totalToday > 0) {
                toast({
                    title: "🏆 Daily Goal Achieved! 🏆",
                    description: "You've completed all your tasks for today. Celebrate this achievement!",
                    duration: 10000,
                })
            }
        })

        return () => {
            socket.off("task-status-change")
            socket.off("new-routine")
            socket.off("daily-completion")
        }
    }, [socket, taskStreak])

    // This component doesn't render anything visible
    return null
}

export default RealtimeNotifications