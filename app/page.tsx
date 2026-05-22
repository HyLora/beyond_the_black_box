"use client"

import { useState } from "react"
import { LandingScreen } from "@/components/landing-screen"
import { TutorialScreen } from "@/components/tutorial-screen" // <-- IMPORT THE TUTORIAL
import { ChatInterface, type InteractionMetrics } from "@/components/chat-interface" // <-- IMPORT METRICS
import { Questionnaire } from "@/components/questionnaire"
import { ThankYouScreen } from "@/components/thank-you-screen"
import type { Group } from "@/lib/study-data"

// 1. ADD "tutorial" TO THE APP STATE
type AppState = "landing" | "tutorial" | "chat" | "questionnaire" | "complete"

export default function Home() {
  const [appState, setAppState] = useState<AppState>("landing")
  const [group, setGroup] = useState<Group | null>(null)

  // 2. STATE TO HOLD THE BACKGROUND METRICS
  const [metrics, setMetrics] = useState<InteractionMetrics | null>(null)

  const handleSelectGroup = (selectedGroup: Group) => {
    setGroup("B")
    // 3. GO TO TUTORIAL FIRST, NOT CHAT!
    setAppState("tutorial")
  }

  // 4. NEW FUNCTION TO MOVE FROM TUTORIAL TO CHAT
  const handleTutorialComplete = () => {
    setAppState("chat")
  }

  // 5. CATCH THE METRICS WHEN CHAT IS DONE
  const handleChatComplete = (collectedMetrics: InteractionMetrics) => {
    setMetrics(collectedMetrics)
    setAppState("questionnaire")
  }

  const handleQuestionnaireComplete = () => {
    setAppState("complete")
  }

  return (
    <main className="min-h-screen bg-background">
      {appState === "landing" && (
        <LandingScreen onSelectGroup={handleSelectGroup} />
      )}

      {/* 6. RENDER THE TUTORIAL SCREEN */}
      {appState === "tutorial" && group && (
        <TutorialScreen group={group} onComplete={handleTutorialComplete} />
      )}

      {appState === "chat" && group && (
        <ChatInterface group={group} onComplete={handleChatComplete} />
      )}

      {/* 7. PASS METRICS TO QUESTIONNAIRE */}
      {appState === "questionnaire" && group && (
        <Questionnaire
          group={group}
          interactionMetrics={metrics || undefined}
          onComplete={handleQuestionnaireComplete}
        />
      )}

      {appState === "complete" && <ThankYouScreen />}
    </main>
  )
}