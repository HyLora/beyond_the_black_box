"use client"

import { useState, ReactNode } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Sparkles, BookOpen } from "lucide-react"

interface FormattedMessageProps {
  content: string
  group: "A" | "B"
  onKeywordClick?: (keyword: string) => void
  onExploreClick?: () => void // <-- AGGIUNTO: Per tracciare l'apertura della spiegazione
  kgNodes?: any[]
  isIntro?: boolean
}

const parseText = (
  text: string,
  group: "A" | "B",
  kgNodes?: any[],
  isInteractive: boolean = false,
  onKeywordClick?: (k: string) => void,
  setIsOpen?: any
): ReactNode[] => {
  const bracketParts = text.split(/\[\[(.*?)\]\]/g);

  return bracketParts.map((part, index) => {
    if (index % 2 === 1) {
      if (group === "A") {
        return <strong key={index} className="font-bold text-foreground">{part}</strong>;
      }

      let colorClass = "bg-primary/10 text-primary border-primary/20"; 

      if (kgNodes) {
        const node = kgNodes.find(n => {
          if (!n) return false;
          const clean = (str: string) => (str || "").toLowerCase().replace(/[^\w\s-]/g, '').trim();
          const partClean = clean(part);
          const idClean = clean(n.id);
          const labelClean = clean(n.label);
          if (!partClean) return false;
          return (
            partClean === idClean ||
            partClean === labelClean ||
            (idClean !== "" && partClean.includes(idClean)) ||
            (labelClean !== "" && partClean.includes(labelClean)) ||
            (idClean !== "" && idClean.includes(partClean)) ||
            (labelClean !== "" && labelClean.includes(partClean))
          );
        });

        if (node) {
          const exactGraphColors: Record<string | number, string> = {
            1: "bg-blue-100 text-blue-700 border-blue-300",
            2: "bg-orange-100 text-orange-700 border-orange-300",
            3: "bg-green-100 text-green-700 border-green-300",
            4: "bg-red-100 text-red-700 border-red-300",
            5: "bg-purple-100 text-purple-700 border-purple-300",
            6: "bg-amber-100 text-amber-700 border-amber-300",
            7: "bg-pink-100 text-pink-700 border-pink-300",
            "entity": "bg-blue-100 text-blue-700 border-blue-300",
            "value": "bg-green-100 text-green-700 border-green-300",
            "metric": "bg-orange-100 text-orange-700 border-orange-300",
          };
          if (node.group !== undefined && exactGraphColors[node.group]) {
            colorClass = exactGraphColors[node.group];
          } else if (node.type && exactGraphColors[node.type]) {
            colorClass = exactGraphColors[node.type];
          }
        }
      }

      return (
        <span
          key={index}
          onClick={() => {
            if (isInteractive) {
              if (setIsOpen) setIsOpen(true)
              if (onKeywordClick) onKeywordClick(part)
            }
          }}
          className={`inline-flex items-center mx-1 px-1.5 py-0.5 rounded-md text-[13px] font-semibold border shadow-sm ${colorClass} ${isInteractive ? 'cursor-pointer hover:brightness-95 transition-all' : ''}`}
          title={isInteractive ? "Click to explore more details" : ""}
        >
          {part}
        </span>
      );
    }

    const boldParts = part.split(/\*\*(.*?)\*\*/g);
    return (
      <span key={index}>
        {boldParts.map((bPart, bIndex) => {
          if (bIndex % 2 === 1) {
            return <strong key={bIndex} className="font-bold text-foreground">{bPart}</strong>
          }
          return (
            <span key={bIndex}>
              {bPart.split('\n').map((line, lIndex, arr) => (
                <span key={lIndex}>
                  {line}
                  {lIndex !== arr.length - 1 && <br />}
                </span>
              ))}
            </span>
          )
        })}
      </span>
    );
  });
}

export function FormattedMessage({ content, group, onKeywordClick, onExploreClick, kgNodes, isIntro }: FormattedMessageProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (isIntro) {
    return (
      <div className="text-sm leading-relaxed text-foreground space-y-4">
        {content.split('\n\n').map((p, i) => <div key={i}>{parseText(p, group, kgNodes, false)}</div>)}
      </div>
    )
  }

  const paragraphs = content.split('\n\n').filter(p => p.trim() !== '')
  const summary = paragraphs[0] || ""
  const reasoning = paragraphs.length > 1 ? paragraphs.slice(1).join('\n\n') : ""

  if (group === "A") {
    return (
      <div className="space-y-4">
        <div className="text-sm leading-relaxed text-foreground">{parseText(summary, group, kgNodes, false)}</div>
        {reasoning && (
          <Collapsible 
            open={isOpen} 
            onOpenChange={(open) => {
              setIsOpen(open);
              // SE l'utente apre la sezione, inviamo il segnale di click al contatore
              if (open && onExploreClick) onExploreClick();
            }} 
            className="border border-border rounded-md bg-muted/30"
          >
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><BookOpen className="w-4 h-4" />Detailed Explanation</div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="px-4 pb-4 pt-2 border-t border-border text-sm text-muted-foreground space-y-3">
              {reasoning.split('\n\n').map((p, i) => <div key={i} className="leading-relaxed">{parseText(p, group, kgNodes, false)}</div>)}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    )
  }
  
  if (group === "B") {
    const allMatches = Array.from(content.matchAll(/\[\[(.*?)\]\]/g)).map(m => m[1])
    const uniqueKeywords = [...new Set(allMatches)]

    let autoHighlightedReasoning = reasoning;
    if (uniqueKeywords.length > 0 && autoHighlightedReasoning) {
      const sortedKeywords = [...uniqueKeywords].sort((a, b) => b.length - a.length);
      sortedKeywords.forEach(kw => {
        const cleanKw = kw.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        const bracketRegex = new RegExp(`\\[\\[(${cleanKw})\\]\\]`, 'gi');
        autoHighlightedReasoning = autoHighlightedReasoning.replace(bracketRegex, '$1');
        const wordRegex = new RegExp(`\\b(${cleanKw})`, 'gi');
        autoHighlightedReasoning = autoHighlightedReasoning.replace(wordRegex, '[[$1]]');
      });
    }

    return (
      <div className="space-y-4">
        <div className="text-sm leading-relaxed text-foreground">
          {parseText(summary, group, kgNodes, true, onKeywordClick, undefined)}
        </div>
        {uniqueKeywords.length > 0 && !isOpen && (
          <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border shadow-sm">
            <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />Want to know more? Explore concepts:
            </p>
            <div className="flex flex-wrap gap-2">
              {uniqueKeywords.map((kw, i) => (
                <div key={i}>
                  {parseText(`[[${kw}]]`, group, kgNodes, true, onKeywordClick, setIsOpen)}
                </div>
              ))}
            </div>
          </div>
        )}

        {isOpen && autoHighlightedReasoning && (
          <div className="pt-4 mt-2 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-500">
            <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">Extended Context & Reasoning:</p>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              {autoHighlightedReasoning.split('\n\n').map((p, i) => (
                <div key={i}>{parseText(p, group, kgNodes, true, onKeywordClick, undefined)}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}