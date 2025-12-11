import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlayCircle, Mail } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-muted/30">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <PlayCircle className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">LearnFlow</span>
          </div>
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-accent-foreground" />
              </div>
              <CardTitle className="text-2xl">Check your email</CardTitle>
              <CardDescription>We&apos;ve sent you a confirmation link</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Please check your email inbox and click the confirmation link to activate your account. Once confirmed,
                you can start creating your learning routines.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
