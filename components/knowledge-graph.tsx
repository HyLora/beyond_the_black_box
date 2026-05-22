"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import type { KnowledgeGraph as KGType } from "@/lib/study-data"

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => <div className="flex h-64 items-center justify-center text-muted-foreground">Loading Interactive Graph...</div>,
})

interface Props {
  data?: KGType
  taskId?: number
  onExploreClick?: () => void // <-- 1. ADDED THIS LINE
}

interface GraphNode {
  id: string;
  group?: number;
  color?: string;
  x?: number;
  y?: number;
  [key: string]: any;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  label?: string;
  [key: string]: any;
}

interface GraphDataState {
  nodes: GraphNode[];
  links: GraphLink[];
}

export function KnowledgeGraph({ data, taskId, onExploreClick }: Props) {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const buildSafeData = useCallback((incomingData?: KGType | any): GraphDataState => {
    if (!incomingData) return { nodes: [], links: [] };

    const rawNodes = (incomingData.nodes || []) as Array<Record<string, unknown>>;
    const safeNodes: GraphNode[] = rawNodes.map((n) => ({
      ...(n as any),
      id: String(n.id || "unknown"),
    }));

    const rawEdges = (incomingData.edges || incomingData.links || []) as Array<Record<string, unknown>>;
    const safeLinks: GraphLink[] = rawEdges.map((e) => ({
      ...(e as any),
      source: String(e.source || e.from || ""),
      target: String(e.target || e.to || ""),
    }));

    return { nodes: safeNodes, links: safeLinks };
  }, []);

  const [graphData, setGraphData] = useState<GraphDataState>(() => buildSafeData(data));
  const [isExpanded, setIsExpanded] = useState(false)

  const forceCenter = useCallback(() => {
    setTimeout(() => {
      if (fgRef.current) {
        fgRef.current.zoomToFit(400, 50); 
      }
    }, 150); // Aspetta che il div sia apparso
  }, []);

  useEffect(() => {
    setGraphData(buildSafeData(data));
    setIsExpanded(false);
    forceCenter(); // Centra all'avvio
  }, [data, buildSafeData, forceCenter]);

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-300);
      fgRef.current.d3Force('link').distance(80);
      fgRef.current.d3Force('center', null);

      // @ts-ignore
      import('d3-force').then(d3 => {
        fgRef.current.d3Force('x', d3.forceX(0).strength(0.15));
        fgRef.current.d3Force('y', d3.forceY(0).strength(0.15));
      });
    }
  }, [graphData]);
const handleExpand = () => {
    let newNodes: GraphNode[] = []
    let newLinks: GraphLink[] = []

    if (taskId === 1) {
      newNodes = [{ id: "Transformer", label: "Transformer Arch.", group: 4, color: "#8b5cf6" }, { id: "Google", label: "Google Research", group: 5, color: "#ef4444" }]
      newLinks = [{ source: "bert", target: "Transformer", label: "has method" }, { source: "bert", target: "Google", label: "affiliation" }]
    } else if (taskId === 2) {
      newNodes = [{ id: "Stanford", label: "Stanford University", group: 4, color: "#8b5cf6" }, { id: "Reading", label: "Reading Comp.", group: 5, color: "#ef4444" }]
      newLinks = [{ source: "squad", target: "Stanford", label: "author" }, { source: "squad", target: "Reading", label: "research_problem" }]
    } else if (taskId === 3) {
      newNodes = [
        { id: "kg_rag", label: "Graph RAG", group: 4, color: "#8b5cf6" },
        { id: "eval", label: "Faithfulness Metric", group: 5, color: "#ef4444" }
      ]
      newLinks = [
        { source: "rq", target: "kg_rag", label: "has method" },
        { source: "rq", target: "eval", label: "has evaluation" }
      ]
    } else if (taskId === 4) {
      newNodes = [
        { id: "quant", label: "Quantization", group: 5, color: "#ef4444" },
        { id: "edge", label: "Edge Devices", group: 5, color: "#ef4444" }
      ]
      newLinks = [
        { source: "han", target: "quant", label: "research_problem" },
        { source: "mobilellm", target: "edge", label: "optimize" }
      ]
    } else if (taskId === 991) {
      newNodes = [
        { id: "Related", label: "Related Research", group: 5, color: "#8b5cf6" }
      ]
      newLinks = [
        { source: "Discovery", target: "Related", label: "related work" }
      ]
    }

    setGraphData((prev) => ({
      nodes: [...prev.nodes, ...newNodes],
      links: [...prev.links, ...newLinks],
    }));
    setIsExpanded(true);
    forceCenter(); 
    
    if (onExploreClick) {
      onExploreClick();
    }
  }

  const paintNode = useCallback((node: unknown, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const n = node as GraphNode & { label?: string, name?: string, value?: string, type?: string }
    const label = n.label || n.name || n.value || n.id

    // Colori in base al tipo
    let nodeColor = "#3b82f6";
    if (n.type === "value") nodeColor = "#10b981";
    if (n.color) nodeColor = n.color;

    const fontSize = 12 / globalScale
    ctx.font = `${fontSize}px Sans-Serif`

    ctx.beginPath()
    ctx.arc(n.x || 0, n.y || 0, 7, 0, 2 * Math.PI, false)
    ctx.fillStyle = nodeColor
    ctx.fill()
    ctx.lineWidth = 1.5 / globalScale;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    const textWidth = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect((n.x || 0) - textWidth / 2 - 2, (n.y || 0) + 10, textWidth + 4, fontSize + 4);

    ctx.fillStyle = "#1e293b";
    ctx.fillText(label, n.x || 0, (n.y || 0) + 10 + fontSize)
  }, [])

  const paintLinkLabel = useCallback((link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const labelText = link.label || link.name || link.type || link.relation || link.value;

    if (!labelText || typeof link.source !== 'object' || typeof link.target !== 'object') return;

    const start = link.source;
    const end = link.target;

    const textPos = {
      x: start.x + (end.x - start.x) / 2,
      y: start.y + (end.y - start.y) / 2
    };

    const fontSize = 10 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;

    ctx.save();
    ctx.translate(textPos.x, textPos.y);

    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    ctx.rotate(angle > Math.PI / 2 || angle < -Math.PI / 2 ? angle + Math.PI : angle);

    const bckgDimensions = ctx.measureText(labelText);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(-bckgDimensions.width / 2 - 2, -fontSize / 2 - 2, bckgDimensions.width + 4, fontSize + 4);

    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelText, 0, 1);

    ctx.restore();
  }, [])

  return (
    <div ref={containerRef} className="relative border border-border rounded-lg bg-card overflow-hidden h-[300px] w-full">
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-background/80 p-2 rounded-md backdrop-blur-sm border border-border">
        <Button
          onClick={handleExpand}
          disabled={isExpanded || graphData.nodes.length === 0}
          variant={isExpanded ? "secondary" : "default"}
          size="sm"
          className="shadow-md"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isExpanded ? "Keywords Explored" : "Explore LLM Keywords"}
        </Button>
      </div>

      <ForceGraph2D
        ref={fgRef}
        graphData={graphData as any}
        width={containerRef.current?.clientWidth || 600}
        height={300}
        nodeLabel={(node: any) => node.label || node.id}
        linkLabel={(link: any) => link.label || link.name || ""}
        nodeRelSize={6}
        linkColor={() => "#cbd5e1"}
        linkWidth={1.5}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        nodeCanvasObject={paintNode}
        linkCanvasObjectMode={() => 'after'}
        linkCanvasObject={paintLinkLabel}
        cooldownTicks={100}
      />
    </div>
  )
}