"use client"

import { Button } from "@/components/ui/button"
import { Bot, User, Info, Sparkles, ArrowRight } from "lucide-react"
import type { Group, KnowledgeGraph as KGType } from "@/lib/study-data"
import { KnowledgeGraph } from "@/components/knowledge-graph"
import { FormattedMessage } from "@/components/formatted-message"
import { useState } from "react"

interface TutorialScreenProps {
  group: Group
  onComplete: () => void
}

// --- MOCKED TUTORIAL DATA ---
const example1_Graph: KGType = {
  nodes: [
    { id: "GNN", label: "Graph Neural Networks", type: "entity", group: 1 },
    { id: "Molecule", label: "Molecular Structure", type: "entity", group: 2 },
    { id: "Discovery", label: "Drug Discovery", type: "entity", group: 3 }
  ],
  edges: [
    { from: "GNN", to: "Molecule", label: "models" },
    { from: "Molecule", to: "Discovery", label: "accelerates" }
  ]
};

// A disconnected graph showing two distinct clusters with no edges between them (Glass Box Only)
const example2_Graph_Disconnected: KGType = {
  nodes: [
    { id: "BERT", label: "BERT Architecture", type: "entity", group: 1 },
    { id: "NLP", label: "Natural Language Processing", type: "entity", group: 1 },
    { id: "Aspirin", label: "Aspirin", type: "entity", group: 4 },
    { id: "Synthesis", label: "Chemical Synthesis", type: "entity", group: 4 }
  ],
  edges: [
    { from: "BERT", to: "NLP", label: "used for" },
    { from: "Aspirin", to: "Synthesis", label: "produced via" }
  ]
};

export function TutorialScreen({ group, onComplete }: TutorialScreenProps) {
  const isGlassBox = group === "B";

  // 1. Rendiamo il grafico dell'Esempio 1 interattivo con useState!
  const [tutorialGraph, setTutorialGraph] = useState(example1_Graph)

  // 2. Creiamo una funzione che simula l'aggiunta di nodi quando cliccano
  const handleKeywordClick = (keyword: string) => {
    const cleanKeyword = keyword.replace(/\[|\]/g, '') // rimuove le parentesi se ci sono

    // Controlla se abbiamo già aggiunto il nodo finto per non duplicarlo
    if (!tutorialGraph.nodes.find(n => n.id === "NewContext")) {
      setTutorialGraph(prev => ({
        nodes: [...prev.nodes, { id: "NewContext", label: "Related Research", type: "entity", group: 5 }],
        edges: [...prev.edges, { from: cleanKeyword, to: "NewContext", label: "expands to" }]
      }))
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <Info className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-card-foreground">How to use the Assistant</h1>
              <p className="text-xs text-muted-foreground">Please review these examples before starting</p>
            </div>
          </div>
          <Button onClick={onComplete} className="gap-2">
            Start Experiment <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-12">

          {/* ==================================================== */}
          {/* EXAMPLE 1: STANDARD INTERACTION                      */}
          {/* ==================================================== */}
          <section className="space-y-4 relative">
            <div className="bg-blue-50 text-blue-800 border border-blue-200 rounded-lg p-4 mb-6 shadow-sm">
              <h3 className="font-bold flex items-center gap-2 mb-1">
                <Info className="w-5 h-5" /> Example 1: A Standard Query
              </h3>
              <p className="text-sm">
                In this example, the user asks a standard research question.
                {isGlassBox
                  ? " Notice how the assistant provides a Knowledge Graph. Below the initial summary, you can click on the 'Want to know more?' keywords to expand the reasoning, reveal the context, and see related topics!"
                  : " Notice how the assistant provides a quick summary. You can click 'Detailed Explanation' below the text to expand the full, detailed explanation and explore the related topics."}
              </p>
            </div>

            {/* User Message */}
            <div className="flex items-start gap-3 flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="max-w-[85%] rounded-2xl px-5 py-4 shadow-sm bg-primary text-primary-foreground rounded-tr-sm">
                <p className="text-sm leading-relaxed">How are GNNs used in chemistry?</p>
              </div>
            </div>

            {/* Assistant Message */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1 space-y-4">

                {isGlassBox && (
                  <div className="bg-evidence-bg text-evidence-text rounded-lg p-4 border border-border/50 shadow-sm">
                    <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide flex items-center gap-2">
                      <Sparkles className="w-3 h-3" /> System Evidence Graph
                    </p>
                    <KnowledgeGraph
                      key={`graph-991-${tutorialGraph.nodes.length}`}
                      data={tutorialGraph}
                      taskId={991}
                    />
                  </div>
                )}

                <div className="max-w-[85%] rounded-2xl px-5 py-4 shadow-sm bg-card border border-border text-card-foreground rounded-tl-sm">
                  <FormattedMessage
                    group={group}
                    content={`[[GNN]]s (Graph Neural Networks) are primarily used to map out [[Molecule]]s to accelerate [[Discovery]].\n\nBy treating atoms as nodes and chemical bonds as edges, GNNs can predict molecular properties and behaviors without needing expensive, time-consuming physical lab tests. This has fundamentally revolutionized early-stage pharmaceutical research. Recent studies have demonstrated that employing GNN-based architectures can reduce the initial screening phase of potential drug candidates by up to 40%, significantly cutting down both computational overhead and laboratory costs. Furthermore, they allow researchers to model complex protein-ligand interactions with a degree of fidelity previously thought impossible using traditional computational methods.`}
                    kgNodes={tutorialGraph.nodes}
                    onKeywordClick={handleKeywordClick}
                  />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-border/50" />

          {/* ==================================================== */}
          {/* EXAMPLE 2: CONDITIONAL CONTENT                       */}
          {/* ==================================================== */}
          <section className="space-y-4 relative">
            <div className={`border rounded-lg p-4 mb-6 shadow-sm ${isGlassBox
                ? "bg-purple-50 text-purple-800 border-purple-200"
                : "bg-green-50 text-green-800 border-green-200"
              }`}>
              <h3 className="font-bold flex items-center gap-2 mb-1">
                <Info className="w-5 h-5" /> Example 2: {isGlassBox ? "Querying Unrelated Concepts" : "A Complex Factual Query"}
              </h3>
              <p className="text-sm">
                {isGlassBox
                  ? "When querying concepts that do not share an established link in the database, the assistant retrieves information for both independently. Notice how the graph reflects this lack of connection visually through separated clusters, preventing hallucinated links."
                  : "In this example, the user asks a detailed scientific question from a different domain. Notice how the assistant accurately synthesizes factual information to provide a clear, comprehensive answer."}
              </p>
            </div>

            {/* User Message */}
            <div className="flex items-start gap-3 flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="max-w-[85%] rounded-2xl px-5 py-4 shadow-sm bg-primary text-primary-foreground rounded-tr-sm">
                <p className="text-sm leading-relaxed">
                  {isGlassBox
                    ? "How does the BERT architecture improve the chemical synthesis of Aspirin?"
                    : "How does CRISPR-Cas9 work in genetic engineering?"}
                </p>
              </div>
            </div>

            {/* Assistant Message */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1 space-y-4">

                {isGlassBox && (
                  <div className="bg-evidence-bg text-evidence-text rounded-lg p-4 border border-border/50 shadow-sm">
                    <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide flex items-center gap-2">
                      <Sparkles className="w-3 h-3" /> System Evidence Graph
                    </p>
                    <KnowledgeGraph data={example2_Graph_Disconnected} taskId={992} />
                  </div>
                )}

                <div className="max-w-[85%] rounded-2xl px-5 py-4 shadow-sm bg-card border border-border text-card-foreground rounded-tl-sm">
                  <FormattedMessage
                    group={group}
                    content={isGlassBox
                      ? `While [[BERT]] is a fundamental model for [[NLP]], and [[Aspirin]] is produced via [[Synthesis]], there is no documented relationship between them.\n\nThe database confirms the distinct properties of both entities, but contains no literature suggesting that Transformer-based language models are currently utilized in the physical synthesis of this compound. BERT (Bidirectional Encoder Representations from Transformers) is optimized for processing sequential text data, such as scientific literature mining or named entity recognition. Conversely, the chemical synthesis of Aspirin relies on the standard esterification of salicylic acid. Unless the query specifically refers to NLP-driven literature searches regarding Aspirin, these domains remain completely separate in the current research landscape.`
                      : `CRISPR-Cas9 is a revolutionary gene-editing technology adapted from the natural defense mechanisms of bacteria.\n\nIt consists of two key components: the Cas9 enzyme, which acts as "molecular scissors" to cut DNA, and a guide RNA (gRNA) sequence, which directs the Cas9 to the precise target location in the genome. Once the DNA is cut, researchers use the cell's own DNA repair machinery to add, delete, or alter genetic material. This process is highly specific and has transformed biological research, offering potential treatments for genetic disorders, improved agricultural crops, and new approaches to combating infectious diseases.`
                    }
                    kgNodes={isGlassBox ? example2_Graph_Disconnected.nodes : []}
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="pt-8 pb-12 flex justify-center border-t border-border/50">
            <Button onClick={onComplete} size="lg" className="px-12 py-6 text-lg shadow-md transition-transform hover:scale-105">
              I understand, let&apos;s start!
            </Button>
          </div>

        </div>
      </main>
    </div>
  )
}