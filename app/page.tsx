import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlayCircle, Calendar, CheckCircle, Bell, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <PlayCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">LearnFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              AI-Powered Learning Scheduler
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance mb-6">
              Transform YouTube Playlists into
              <span className="text-primary"> Learning Journeys</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
              Paste any YouTube playlist URL and let AI create a personalized study schedule. Track your progress, get
              daily reminders, and complete courses on your terms.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/sign-up">
                <Button size="lg" className="gap-2">
                  Start Learning <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg">
                  I have an account
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <FeatureCard
                icon={<PlayCircle className="w-6 h-6" />}
                title="Paste Playlist URL"
                description="Simply paste any YouTube playlist link and we'll fetch all video details automatically"
              />
              <FeatureCard
                icon={<Calendar className="w-6 h-6" />}
                title="Set Your Preferences"
                description="Tell us how many videos per day or your target completion date"
              />
              <FeatureCard
                icon={<Bell className="w-6 h-6" />}
                title="Get Daily Reminders"
                description="Receive notifications for your daily learning tasks"
              />
              <FeatureCard
                icon={<CheckCircle className="w-6 h-6" />}
                title="Track Progress"
                description="Check off completed videos and watch your progress grow"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Your Learning Journey?</h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of learners who use LearnFlow to complete online courses consistently.
            </p>
            <Link href="/auth/sign-up">
              <Button size="lg" className="gap-2">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>Built with Next.js, Supabase, and AI</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
