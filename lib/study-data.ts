export type Group = "A" | "B"

export interface KnowledgeGraphNode {
  id: string
  label: string
  type: "entity" | "value" | "metric"
  group?: number
}

export interface KnowledgeGraphEdge {
  from: string
  to: string
  label: string
}

export interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[]
  edges: KnowledgeGraphEdge[]
}

export interface Task {
  id: number
  userMessage: string
  knowledgeGraph: KnowledgeGraph | null
}

export const tasks: Task[] = [
  {
    id: 1,
    userMessage: "Find the venue and publication year of the original paper introducing the BERT architecture.",
    knowledgeGraph: {
      nodes: [
        { id: "bert", label: "BERT Paper", type: "entity" },
        { id: "year", label: "2019", type: "value" },
        { id: "venue", label: "NAACL", type: "value" },
      ],
      edges: [
        { from: "bert", to: "year", label: "publication year" },
        { from: "bert", to: "venue", label: "has venue" },
      ],
    },
  },
  {
    id: 2,
    userMessage: "What is the exact F1-score achieved by the original BERT-Large model on the SQuAD 2.0 benchmark dataset?",
    knowledgeGraph: {
      nodes: [
        { id: "bert-large", label: "BERT-Large", type: "entity" },
        { id: "squad", label: "SQuAD 2.0", type: "entity" },
        { id: "score", label: "83.1", type: "metric" },
      ],
      edges: [
        { from: "bert-large", to: "squad", label: "has dataset" },
        { from: "bert-large", to: "score", label: "has value" },
      ],
    },
  },
  {
    id: 3,
    userMessage: "Analyze the provided literature on LLM hallucination mitigation from 2023 to 2024. Identify a gap in the current approaches and propose a novel research question.",
    knowledgeGraph: {
      nodes: [
        { id: "paper1", label: "Self-Reflection Prompting (2023)", type: "entity" },
        { id: "paper2", label: "Fine-tuning for Factuality (2024)", type: "entity" },
        { id: "gap", label: "Lack of Real-time Grounding", type: "value" },
        { id: "rq", label: "RQ: Real-time KG Integration?", type: "metric" },
      ],
      edges: [
        { from: "paper1", to: "gap", label: "has limitation" },
        { from: "paper2", to: "gap", label: "has limitation" },
        { from: "gap", to: "rq", label: "yields" },
      ],
    },
  },
  {
    id: 4,
    userMessage: "Verify the zero-shot accuracy of the 2024 paper by Song Han titled 'MobileLLM: Optimizing Sub-billion Parameter Language Models for On-Device Use Cases'.",
    knowledgeGraph: {
      nodes: [
        { id: "han", label: "Song Han", type: "entity", group: 1 },
        { id: "mit", label: "MIT", type: "value", group: 1 },
        { id: "mobilellm", label: "MobileLLM", type: "entity", group: 2 },
        { id: "meta", label: "Meta AI", type: "value", group: 2 }
      ],
      edges: [
        { from: "han", to: "mit", label: "affiliation" },
        { from: "mobilellm", to: "meta", label: "organization" }
      ]
    }
  }
]

export const questionnaireItems = [
  "I feel like all of the answers were accurate and complete.",
  "The system demonstrated a clear understanding of the scientific domain.",
  "I feel like the system helped me handle the complexity of the task by providing background to the answer.",
  "The information presented on the screen was tailored well to help me understand the answers.",
  "I feel like I could verify the facts that led to every answer.",
  "I could understand the system's capabilities and limitations.",
  "I could see the reasoning behind the system's answers.",
  "Seeing the underlying process increased my confidence in using this information for research.",
]