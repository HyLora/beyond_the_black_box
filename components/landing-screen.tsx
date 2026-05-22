"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Group } from "@/lib/study-data"

interface LandingScreenProps {
  onSelectGroup: (group: Group) => void
}

export function LandingScreen({ onSelectGroup }: LandingScreenProps) {
  // Aggiunto stato per tracciare il consenso
  const [hasConsented, setHasConsented] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <div className="max-w-xl w-full bg-card rounded-lg border border-border p-8 shadow-sm">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-card-foreground tracking-tight">
              Welcome to the ORKG AI Assistant Study
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Thank you for participating in this research study. You will interact with a Scientific AI Assistant and complete a short questionnaire about your experience.
            </p>
          </div>

          {/* === INIZIO: SEZIONE PRIVACY E CONSENSO === */}
          <div className="bg-muted/50 p-4 rounded-md text-left text-sm text-muted-foreground border border-border">
            <h2 className="font-semibold text-foreground mb-2">Privacy & Consent Statement</h2>
            <p className="mb-2">
              Your participation in this study is completely voluntary. All data collected during this session (including interaction clicks, completion times, and survey responses) is entirely anonymous and will be used solely for the purpose of academic research.
            </p>
            <p>
              No personal or identifying information will be collected. By checking the box below, you consent to the use of your anonymous data for this study.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-left bg-background p-4 rounded-md border border-border">
            <input
              type="checkbox"
              id="consent"
              className="w-4 h-4 accent-primary cursor-pointer shrink-0"
              checked={hasConsented}
              onChange={(e) => setHasConsented(e.target.checked)}
            />
            <label
              htmlFor="consent"
              className="text-sm font-medium leading-tight cursor-pointer"
            >
              I have read the privacy statement and consent to participate.
            </label>
          </div>
          {/* === FINE: SEZIONE PRIVACY E CONSENSO === */}

          <div className="border-t border-border pt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Click below to begin the study.
            </p>
            <Button
              onClick={() => {
                const randomGroup: Group = Math.random() < 0.5 ? "A" : "B"
                onSelectGroup(randomGroup)
              }}
              // Il bottone si attiva solo se la checkbox è spuntata
              disabled={!hasConsented}
              className="w-full sm:w-auto px-8 py-5 text-base transition-all"
            >
              Start Study
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}