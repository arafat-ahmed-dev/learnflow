"use client"

import { useState, useEffect, useCallback } from "react"
import { useSocket } from "@/lib/socket-context"
import { TodayTasks } from "@/components/today-tasks"
import { RoutineCard } from "@/components/routine-card"
import { StatsCards } from "@/components/stats-cards"
import { EmptyState } from "@/components/empty-state"
import { NotificationPermission } from "@/components/notification-permission"
import { MotivationalBanner } from "@/components/motivational-banner"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, BookOpen, Timer } from "lucide-react"
import type { Playlist, Routine, Task, Video } from "@/lib/types"

interface RealtimeDashboardProps {
    userId: string
    initialRoutines: (Routine & { playlist: Playlist; tasks: (Task & { video: Video })[] })[]
    initialTodayTasks: (Task & { video: { title: string; video_id: string; duration_seconds: number } })[]
    initialStats: {
        totalCompleted: number
        totalVideos: number
        currentStreak: number
        totalMinutesWatched: number
    }
    todayCompletedCount: number
    todayTotalCount: number
    playlistTitle: string
    hasRoutines: boolean
}

export function RealtimeDashboard({
    userId,
    initialRoutines,
    initialTodayTasks,
    initialStats,
    todayCompletedCount: initialCompletedCount,
    todayTotalCount,
    playlistTitle,
    hasRoutines: initialHasRoutines
}: RealtimeDashboardProps) {
    const { socket } = useSocket()
    const [routines, setRoutines] = useState(initialRoutines)
    const [todayTasks, setTodayTasks] = useState(initialTodayTasks)
    const [stats, setStats] = useState(initialStats)
    const [todayCompletedCount, setTodayCompletedCount] = useState(initialCompletedCount)
    const [hasRoutines, setHasRoutines] = useState(initialHasRoutines)
    const [recentActivity, setRecentActivity] = useState<string[]>([])

    // Update stats when tasks change
    const updateStats = useCallback(() => {
        const allTasks = routines.flatMap(r => r.tasks)
        const completedTasks = allTasks.filter(t => t.is_completed)
        const newCompletedCount = todayTasks.filter(t => t.is_completed).length

        setStats({
            totalCompleted: completedTasks.length,
            totalVideos: allTasks.length,
            currentStreak: stats.currentStreak, // Would need more complex calculation for streak
            totalMinutesWatched: completedTasks.reduce((sum, task) => sum + Math.floor(task.video.duration_seconds / 60), 0)
        })

        setTodayCompletedCount(newCompletedCount)
    }, [routines, todayTasks, stats.currentStreak])

    useEffect(() => {
        if (!socket) return

        // Listen for task completion updates
        socket.on("task-status-change", (data: { taskId: string; completed: boolean; timestamp: string }) => {
            setTodayTasks(prev => prev.map(task =>
                task.id === data.taskId
                    ? { ...task, is_completed: data.completed, completed_at: data.completed ? data.timestamp : null }
                    : task
            ))

            setRoutines(prev => prev.map(routine => ({
                ...routine,
                tasks: routine.tasks.map(task =>
                    task.id === data.taskId
                        ? { ...task, is_completed: data.completed, completed_at: data.completed ? data.timestamp : null }
                        : task
                )
            })))

            // Add to activity feed
            const action = data.completed ? "completed" : "uncompleted"
            const taskName = todayTasks.find(t => t.id === data.taskId)?.video?.title || "a task"
            setRecentActivity(prev => [`${action} "${taskName}"`, ...prev.slice(0, 4)])
        })

        // Listen for new routine creation
        socket.on("new-routine", (data: any) => {
            setHasRoutines(true)
            setRecentActivity(prev => [`created new routine "${data.playlist?.title}"`, ...prev.slice(0, 4)])
        })

        // Listen for routine progress updates
        socket.on("routine-progress-update", (data: any) => {
            setRecentActivity(prev => [`updated progress on "${data.routineName}"`, ...prev.slice(0, 4)])
        })

        return () => {
            socket.off("task-status-change")
            socket.off("new-routine")
            socket.off("routine-progress-update")
        }
    }, [socket, todayTasks])

    useEffect(() => {
        updateStats()
    }, [updateStats])

    if (!hasRoutines) {
        return (
            <div className="space-y-8">
                <div className="text-center py-12">
                    <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-primary" />
                    </div>
                    <EmptyState />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <NotificationPermission />

            {/* Enhanced Motivational Section */}
            <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-primary/10 via-accent/10 to-primary/5 border border-primary/20">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="relative p-6">
                    <MotivationalBanner completedToday={todayCompletedCount} totalToday={todayTotalCount} />
                </div>
            </div>

            {/* Enhanced Stats with Real-time Updates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="relative overflow-hidden border-l-4 border-l-primary">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-bold">{stats.totalCompleted}</p>
                                    <span className="text-sm text-muted-foreground">/ {stats.totalVideos}</span>
                                </div>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-full">
                                <TrendingUp className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                        <div className="mt-4 w-full bg-muted rounded-full h-2">
                            <div
                                className="bg-primary rounded-full h-2 transition-all duration-500 ease-out"
                                style={{ width: `${(stats.totalCompleted / stats.totalVideos) * 100}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-l-4 border-l-accent">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Today's Progress</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-bold">{todayCompletedCount}</p>
                                    <span className="text-sm text-muted-foreground">/ {todayTotalCount}</span>
                                </div>
                            </div>
                            <div className="p-3 bg-accent/10 rounded-full">
                                <Timer className="w-6 h-6 text-accent" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <Badge variant={todayCompletedCount === todayTotalCount ? "default" : "secondary"}>
                                {todayCompletedCount === todayTotalCount ? "Complete!" : "In Progress"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Streak</p>
                                <p className="text-3xl font-bold">{stats.currentStreak}</p>
                                <p className="text-sm text-muted-foreground">days</p>
                            </div>
                            <div className="p-3 bg-blue-500/10 rounded-full">
                                <Users className="w-6 h-6 text-blue-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Time Watched</p>
                                <p className="text-3xl font-bold">{stats.totalMinutesWatched}</p>
                                <p className="text-sm text-muted-foreground">minutes</p>
                            </div>
                            <div className="p-3 bg-green-500/10 rounded-full">
                                <BookOpen className="w-6 h-6 text-green-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Feed */}
            {recentActivity.length > 0 && (
                <Card className="border-accent/20">
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Recent Activity
                        </h3>
                        <div className="space-y-3">
                            {recentActivity.map((activity, index) => (
                                <div key={index} className="flex items-center gap-3 text-sm">
                                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                                    <span className="text-muted-foreground">You {activity}</span>
                                    <Badge variant="outline" className="text-xs">Just now</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Enhanced Today's Tasks */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Today's Learning</h2>
                    <Badge variant="outline" className="text-sm">
                        {todayTasks.length} tasks
                    </Badge>
                </div>
                <TodayTasks tasks={todayTasks} playlistTitle={playlistTitle} />
            </section>

            {/* Enhanced Active Routines */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Your Learning Routines</h2>
                    <Badge variant="outline" className="text-sm">
                        {routines.length} active
                    </Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    {routines.map((routine) => (
                        <RoutineCard key={routine.id} routine={routine} />
                    ))}
                </div>
            </section>
        </div>
    )
}