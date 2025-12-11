import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NewPlaylistWizard } from "@/components/new-playlist-wizard"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function NewPlaylistPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Add New Playlist</h1>
          <p className="text-muted-foreground mt-2">Paste a YouTube playlist URL to create your learning routine</p>
        </div>

        <NewPlaylistWizard />
      </div>
    </div>
  )
}
