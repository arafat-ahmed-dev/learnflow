"use client"

import { useEffect, useCallback } from "react"

interface ReminderSchedulerProps {
  tasksForToday: number
  playlistTitle?: string
}

export function ReminderScheduler({ tasksForToday, playlistTitle }: ReminderSchedulerProps) {
  const showReminder = useCallback(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return
    }

    if (tasksForToday === 0) return

    // Check if we already showed a reminder today
    const lastReminder = localStorage.getItem("last-reminder-date")
    const today = new Date().toISOString().split("T")[0]

    if (lastReminder === today) return

    // Show the notification
    new Notification("Time to Learn!", {
      body: `You have ${tasksForToday} video${tasksForToday > 1 ? "s" : ""} to watch today${playlistTitle ? ` from "${playlistTitle}"` : ""}`,
      icon: "/icon.svg",
      tag: "daily-reminder",
      requireInteraction: true,
    })

    localStorage.setItem("last-reminder-date", today)
  }, [tasksForToday, playlistTitle])

  useEffect(() => {
    // Show reminder after a short delay when component mounts
    const timer = setTimeout(() => {
      showReminder()
    }, 3000)

    // Also schedule a check every hour
    const interval = setInterval(
      () => {
        const hour = new Date().getHours()
        // Show reminders at 9 AM, 2 PM, or 7 PM if tasks remain
        if ([9, 14, 19].includes(hour)) {
          showReminder()
        }
      },
      60 * 60 * 1000,
    ) // Every hour

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [showReminder])

  return null
}
