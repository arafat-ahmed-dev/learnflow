import { Button } from "@/components/ui/button"
import { PlayCircle, Plus } from "lucide-react"
import Link from "next/link"

export function EmptyState() {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <PlayCircle className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Start Your Learning Journey</h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        Add a YouTube playlist to create your first learning routine. We&apos;ll help you stay on track with daily tasks
        and progress tracking.
      </p>
      <Link href="/dashboard/new">
        <Button size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Add Your First Playlist
        </Button>
      </Link>
    </div>
  )
}
