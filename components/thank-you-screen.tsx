"use client"

import { CheckCircle2 } from "lucide-react"

export function ThankYouScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-card rounded-lg border border-border p-8 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-semibold text-card-foreground mb-3">
          Thank You for Participating
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Your responses have been recorded. Thank you for contributing to this research study on Scientific AI Assistants.
        </p>
      </div>
    </div>
  )
}
