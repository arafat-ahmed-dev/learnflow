"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, BellOff, X } from "lucide-react"

export function NotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default")
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!("Notification" in window)) {
      setPermission("unsupported")
      return
    }
    setPermission(Notification.permission)

    // Check if user has dismissed this before
    const dismissedBefore = localStorage.getItem("notification-prompt-dismissed")
    if (dismissedBefore) {
      setDismissed(true)
    }
  }, [])

  const requestPermission = async () => {
    if (!("Notification" in window)) return

    const result = await Notification.requestPermission()
    setPermission(result)

    if (result === "granted") {
      // Show a test notification
      new Notification("LearnFlow Reminders Enabled", {
        body: "You'll receive daily reminders to complete your learning tasks!",
        icon: "/icon.svg",
      })
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem("notification-prompt-dismissed", "true")
  }

  // Don't show if unsupported, already granted, or dismissed
  if (permission === "unsupported" || permission === "granted" || dismissed) {
    return null
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Enable Daily Reminders</CardTitle>
              <CardDescription>Get notified about your daily learning tasks</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleDismiss} className="shrink-0 -mt-1 -mr-1">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button onClick={requestPermission} size="sm" className="gap-2">
            <Bell className="w-4 h-4" />
            Enable Notifications
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDismiss} className="gap-2">
            <BellOff className="w-4 h-4" />
            Not Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
