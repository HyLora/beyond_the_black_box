"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Group } from "@/lib/study-data"
import { questionnaireItems } from "@/lib/study-data"
import type { InteractionMetrics } from "@/components/chat-interface"

interface QuestionnaireProps {
  group: Group
  onComplete: () => void
  interactionMetrics?: InteractionMetrics
}

type AnswerData = {
  rating: number;
  motivation: string;
}

export function Questionnaire({ group, onComplete, interactionMetrics }: QuestionnaireProps) {
  // State to hold both the 1-5 rating and the free-text motivation
  const [answers, setAnswers] = useState<Record<number, AnswerData>>({})

  // State for NASA-TLX style Cognitive Load metrics (1-10 scale)
  const [cognitiveLoad, setCognitiveLoad] = useState({
    mentalDemand: 5,
    effort: 5,
    frustration: 5
  })

  const handleRatingChange = (questionIndex: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: {
        ...prev[questionIndex],
        rating: parseInt(value),
        motivation: prev[questionIndex]?.motivation || ""
      }
    }))
  }

  const handleMotivationChange = (questionIndex: number, text: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: {
        ...prev[questionIndex],
        rating: prev[questionIndex]?.rating || 0, // 0 means not yet rated
        motivation: text
      }
    }))
  }

  // Ensure all questions have a rating (motivation can be optional or required based on your preference, here we just require the rating)
  const isComplete = questionnaireItems.every((_, index) => 
    answers[index]?.rating !== undefined && 
    answers[index]?.rating > 0 && 
    answers[index]?.motivation?.trim().length > 5 // Almeno 5 caratteri per la spiegazione
  )

  const handleSubmit = async () => {
    const finalStudyData = {
      timestamp: new Date().toISOString(),
      groupAssigned: group,
      metrics: {
        totalTimeSeconds: interactionMetrics?.totalTimeSeconds || 0,
        exploreButtonClicks: interactionMetrics?.exploreButtonClicks || 0,
      },
      cognitiveLoad: cognitiveLoad,
      surveyResponses: answers
    }

    try {
      const response = await fetch("https://closable-ebook-harmonics.ngrok-free.dev/save_results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true", // Salta il popup di ngrok
        },
        body: JSON.stringify(finalStudyData), // finalStudyData o i tuoi dati dei risultati
      });

      if (response.ok) {
        console.log("✅ Data successfully sent to Python and saved to your Mac!");
      } else {
        console.error("❌ Python server received the request but returned an error.");
      }
    } catch (error) {
      console.error("❌ Failed to connect to Python server. Is uvicorn running?", error);
    } finally {
      // Proceed to the Thank You screen regardless
      onComplete()
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-8">

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Post-Task Questionnaire</h1>
          <p className="text-muted-foreground">
            Please evaluate your experience with the Scientific Ideation Assistant.
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="border-b border-border bg-card/50">
            <CardTitle className="text-lg">System Evaluation</CardTitle>
            <CardDescription>
              Rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree), and briefly explain your reasoning.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {questionnaireItems.map((item, index) => (
                <div key={index} className="p-6 space-y-4 hover:bg-muted/30 transition-colors">
                  <p className="font-medium text-foreground text-sm leading-relaxed">
                    {index + 1}. {item}
                  </p>

                  {/* Rating 1-5 */}
                  <RadioGroup
                    onValueChange={(value) => handleRatingChange(index, value)}
                    className="flex justify-between max-w-md pt-2"
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <div key={value} className="flex flex-col items-center gap-2">
                        <RadioGroupItem
                          value={value.toString()}
                          id={`q${index}-${value}`}
                          className="w-5 h-5"
                        />
                        <Label
                          htmlFor={`q${index}-${value}`}
                          className="text-xs text-muted-foreground font-normal"
                        >
                          {value}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  {/* Motivation Free Text Box */}
                  <div className="pt-2">
                    <textarea
                      placeholder="Please explain the reasoning for this rating." // Rimosso "(Optional)"
                      value={answers[index]?.motivation || ""}
                      onChange={(e) => handleMotivationChange(index, e.target.value)}
                      className="w-full min-h-[80px] p-3 text-sm rounded-md border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* --- COGNITIVE LOAD SECTION (NASA-TLX style) --- */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-border bg-card/50">
            <CardTitle className="text-lg">Cognitive Load & Effort</CardTitle>
            <CardDescription>
              Please rate the mental demand of the tasks using the sliders below (1 = Very Low, 10 = Very High).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-8">

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Mental Demand</Label>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">{cognitiveLoad.mentalDemand}/10</span>
              </div>
              <p className="text-xs text-muted-foreground">How mentally demanding were the tasks? (e.g., thinking, deciding, remembering)</p>
              <input
                type="range" min="1" max="10"
                value={cognitiveLoad.mentalDemand}
                onChange={(e) => setCognitiveLoad({ ...cognitiveLoad, mentalDemand: parseInt(e.target.value) })}
                className="w-full accent-primary"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Effort</Label>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">{cognitiveLoad.effort}/10</span>
              </div>
              <p className="text-xs text-muted-foreground">How hard did you have to work to understand the system's answers?</p>
              <input
                type="range" min="1" max="10"
                value={cognitiveLoad.effort}
                onChange={(e) => setCognitiveLoad({ ...cognitiveLoad, effort: parseInt(e.target.value) })}
                className="w-full accent-primary"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Frustration</Label>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">{cognitiveLoad.frustration}/10</span>
              </div>
              <p className="text-xs text-muted-foreground">How insecure, discouraged, irritated, or stressed were you during the task?</p>
              <input
                type="range" min="1" max="10"
                value={cognitiveLoad.frustration}
                onChange={(e) => setCognitiveLoad({ ...cognitiveLoad, frustration: parseInt(e.target.value) })}
                className="w-full accent-primary"
              />
            </div>

          </CardContent>
        </Card>

        {/* --- METRICS DEBUG (Optional: You can remove this visual box later, but it's great to prove to your professors it works!) --- */}
        {/* <Card className="bg-blue-50/50 border-blue-200 shadow-sm">
          <CardContent className="p-4 flex justify-between items-center text-sm text-blue-800">
            <div>
              <span className="font-semibold">Background Metrics Captured: </span>
              Time: {interactionMetrics?.totalTimeSeconds || 0}s | Clicks: {interactionMetrics?.exploreButtonClicks || 0}
            </div>
          </CardContent>
        </Card> */}

        <div className="flex justify-end pb-12">
          <Button
            onClick={handleSubmit}
            disabled={!isComplete}
            size="lg"
            className="px-8"
          >
            Submit Feedback
          </Button>
        </div>

      </div>
    </div>
  )
}