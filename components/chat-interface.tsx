"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Send, Bot, User, CheckCircle2, Circle, Sparkles } from "lucide-react"
import type { Group, Task, KnowledgeGraph as KGType } from "@/lib/study-data"
import { tasks } from "@/lib/study-data"
import { KnowledgeGraph } from "@/components/knowledge-graph"
import { FormattedMessage } from "@/components/formatted-message"

export interface InteractionMetrics {
  totalTimeSeconds: number;
  exploreButtonClicks: number;
}

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
  knowledgeGraph?: KGType | null
  taskId?: number
  isIntro?: boolean
}

interface ChatInterfaceProps {
  group: Group
  onComplete: (metrics: InteractionMetrics) => void
}

export function ChatInterface({ group, onComplete }: ChatInterfaceProps) {
  group = "B";
  // FIX 1: Load Task 1's intro instantly when the app starts, so it never gets lost!
  const [messages, setMessages] = useState<Message[]>(() => {
    return [{
      id: Date.now(),
      role: "assistant",
      content: `Hello! I am your Scientific Ideation Assistant.\n\nTo start building a foundation for your research, let's look at the current state of the art. Should we first explore this broad query:\n**"${tasks[0].userMessage}"**?\n\nWhenever you are ready, click **Send** to search the database.`,
      isIntro: true
    }]
  })

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // --- TELEMETRY TRACKING ---
  const [totalTimeMs, setTotalTimeMs] = useState(0)
  const [exploreClicks, setExploreClicks] = useState(0)
  const taskStartTime = useRef<number>(Date.now())

  const currentTask: Task | undefined = tasks[currentTaskIndex]

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // ==========================================
  // SCIENTIFIC ASSISTANT INTRO & TIMER LOGIC
  // ==========================================
  useEffect(() => {
    // FIX 2: Skip index 0 because we already loaded it in useState above!
    if (!currentTask || currentTaskIndex === 0) return;

    // Log time from the previous task
    const timeSpent = Date.now() - taskStartTime.current;
    setTotalTimeMs((prev) => prev + timeSpent);
    taskStartTime.current = Date.now();

    // Tailored Conversational Assistant Intro for Tasks 2, 3, and 4
    let introContent = "";
    switch (currentTaskIndex) {
      case 1:
        introContent = `Excellent. Now that we have a general overview, we should narrow our focus to specific architectures and methodologies to see how they perform. Would you like to dive deeper?\nClick **Send** when you are ready.`;
        break;
      case 2:
        introContent = `Fascinating results. To formulate a truly novel idea, we need to identify current limitations or open challenges in these models. Should we investigate the research gaps next?\nClick **Send** to analyze the literature.`;
        break;
      case 3:
        introContent = `Excellent progress. We have built a solid foundation for our research. Here is what we have achieved so far:
        
      • **Step 1:** Explored the broad state-of-the-art for on-device language models.
      • **Step 2:** Analyzed specific architectures like MobileLLM and their zero-shot performance.
      • **Step 3:** Identified critical research gaps and open challenges for sub-billion parameter models.

      Now, let's pull everything together to finalize a specific, actionable research question. Do you want to know more about a specific paper?
      \nClick **Send** to conclude our ideation phase.`;
  break;
      default:
        introContent = `Moving on to the next step of our research, should we investigate:\n**"${currentTask.userMessage}"**?\n\nClick **Send** when you are ready.`;
    }

    setMessages((prev) => {
      const lastMsg = prev[prev.length - 1];
      if (lastMsg && lastMsg.role === "assistant" && lastMsg.content === introContent) {
        return prev;
      }

      const introMessage: Message = {
        id: Date.now(),
        role: "assistant",
        content: introContent,
        isIntro: true
      };
      return [...prev, introMessage];
    });
  }, [currentTaskIndex, currentTask]);

  const handleSend = async () => {
    if (!currentTask || isTyping) return

    // 1. Add user prompt to chat
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: currentTask.userMessage,
    }
    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    try {
      // 2. CALL TO NEBULA 
      const formattedTaskId = `TASK_0${currentTask.id}`

      const response = await fetch("https://closable-ebook-harmonics.ngrok-free.dev/ask", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({
          task_id: formattedTaskId,
          question: currentTask.userMessage,
          group: group
        })
      })

      const data = await response.json()
      const finalContent = data.aiResponse;

      // 3. Create AI message
      const aiMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: finalContent,
        knowledgeGraph: group === "B" ? currentTask.knowledgeGraph : undefined,
        taskId: currentTask.id,
      }

      setMessages((prev) => [...prev, aiMessage])

    } catch (error) {
      console.error("Connection error:", error)
      alert("Make sure the Python server is running!")
    } finally {
      setIsTyping(false)

      // Move to next task or finish
      if (currentTaskIndex < tasks.length - 1) {
        setCurrentTaskIndex((prev) => prev + 1)
      } else {
        setIsComplete(true)
        // Add the final task's time
        setTotalTimeMs((prev) => prev + (Date.now() - taskStartTime.current));
      }
    }
  }

  const handleFinish = () => {
    // Pass the collected metrics to the Questionnaire
    onComplete({
      totalTimeSeconds: Math.round(totalTimeMs / 1000),
      exploreButtonClicks: exploreClicks
    });
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* ========================================== */}
      {/* SIDEBAR: TASK PROGRESSION                  */}
      {/* ========================================== */}
      <aside className="w-64 border-r border-border bg-muted/10 flex-col hidden md:flex">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-card-foreground text-sm">ORKG Assistant</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Scientific Assistant
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 ml-2">Study Progress</h3>
          {tasks.map((task, index) => {
            const isActive = index === currentTaskIndex;
            const isDone = index < currentTaskIndex || isComplete;

            return (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
                  }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : isActive ? (
                  <Circle className="w-5 h-5 text-primary shrink-0 fill-primary/20" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 truncate">
                  <p className={`text-sm font-medium ${isActive ? "text-primary" : isDone ? "text-foreground" : "text-muted-foreground"}`}>
                    Task {index + 1}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {task.userMessage.substring(0, 25)}...
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </aside>

      {/* ========================================== */}
      {/* MAIN CHAT AREA                             */}
      {/* ========================================== */}
      <main className="flex-1 flex flex-col relative min-w-0">
        <header className="bg-card/80 backdrop-blur-sm border-b border-border px-6 py-4 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <h1 className="font-semibold text-card-foreground">Scientific Ideation Session</h1>
            <span className="text-sm font-medium px-3 py-1 bg-muted rounded-full text-muted-foreground">
              Task {Math.min(currentTaskIndex + 1, tasks.length)} / {tasks.length}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">

                {/* Knowledge Graph Card for Group B */}
                {message.role === "assistant" && message.knowledgeGraph && (
                  <div className="bg-evidence-bg text-evidence-text rounded-lg p-4 border border-border/50 shadow-sm mb-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide flex items-center gap-2">
                      <Sparkles className="w-3 h-3" /> System Evidence Graph

                    </p>
                    <KnowledgeGraph
                      data={message.knowledgeGraph}
                      taskId={message.taskId}
                      onExploreClick={() => {
                        console.log("Graph Explore button clicked!");
                        setExploreClicks(prev => prev + 1);
                      }}
                    />
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`flex items-start gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm ${message.role === "user" ? "bg-muted" : "bg-primary"}`}>
                    {message.role === "user" ? <User className="w-4 h-4 text-muted-foreground" /> : <Bot className="w-4 h-4 text-primary-foreground" />}
                  </div>

                  <div className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm ${message.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card border border-border text-card-foreground rounded-tl-sm"
                    }`}>

                    {message.role === "assistant" ? (
                      <FormattedMessage
                        content={message.content}
                        group={group}
                        isIntro={message.isIntro}
                        kgNodes={message.knowledgeGraph?.nodes} // FIX 3: Pass down the graph nodes!
                        onKeywordClick={(keyword) => {
                          console.log("Clicked keyword:", keyword);
                          setExploreClicks(prev => prev + 1);
                        }}
                        onExploreClick={() => setExploreClicks(prev => prev + 1)}
                      />
                    ) : (
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    )}

                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-5 py-4">
                  <div className="flex gap-1.5 items-center h-5">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Area */}
        <footer className="bg-card/80 backdrop-blur-sm border-t border-border px-4 py-4 shrink-0">
          <div className="max-w-4xl mx-auto">
            {isComplete ? (
              <Button onClick={handleFinish} className="w-full py-6 text-base font-medium shadow-md transition-transform hover:scale-[1.01]" size="lg">
                Proceed to Questionnaire
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-background rounded-xl border border-border px-4 py-3.5 shadow-sm">
                  <p className="text-sm text-foreground/80">
                    {currentTask?.userMessage || ""}
                  </p>
                </div>
                <Button onClick={handleSend} disabled={isTyping || !currentTask} size="lg" className="shrink-0 px-8 py-6 rounded-xl shadow-md">
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            )}
          </div>
        </footer>
      </main>
    </div>
  )
}
