import type { AgentNode, AgentEdge, SavedGraph } from '../types/graph';
import { PRESET_TEMPLATES } from './presets';

const SAVED_GRAPHS_KEY = 'agent_graph_builder_saved_graphs_v1';
const ACTIVE_GRAPH_KEY = 'agent_graph_builder_active_workspace_v1';

export function loadSavedGraphsFromStorage(): SavedGraph[] {
  try {
    const raw = localStorage.getItem(SAVED_GRAPHS_KEY);
    if (!raw) {
      localStorage.setItem(SAVED_GRAPHS_KEY, JSON.stringify(PRESET_TEMPLATES));
      return PRESET_TEMPLATES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return PRESET_TEMPLATES;
  } catch {
    return PRESET_TEMPLATES;
  }
}

export function saveGraphsToStorage(graphs: SavedGraph[]): void {
  try {
    localStorage.setItem(SAVED_GRAPHS_KEY, JSON.stringify(graphs));
  } catch (err) {
    console.error('Failed to save graphs to localStorage:', err);
  }
}

export function loadActiveWorkspace(): {
  id: string;
  title: string;
  nodes: AgentNode[];
  edges: AgentEdge[];
} | null {
  try {
    const raw = localStorage.getItem(ACTIVE_GRAPH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
      return {
        id: typeof parsed.id === 'string' ? parsed.id : 'workspace-default',
        title: typeof parsed.title === 'string' ? parsed.title : 'Meu Grafo',
        nodes: parsed.nodes,
        edges: parsed.edges,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveActiveWorkspace(workspace: {
  id: string;
  title: string;
  nodes: AgentNode[];
  edges: AgentEdge[];
}): void {
  try {
    localStorage.setItem(ACTIVE_GRAPH_KEY, JSON.stringify(workspace));
  } catch (err) {
    console.error('Failed to persist active workspace:', err);
  }
}

export function parseImportedGraphJson(jsonString: string): {
  title?: string;
  nodes: AgentNode[];
  edges: AgentEdge[];
} {
  const data = JSON.parse(jsonString);
  if (!data || typeof data !== 'object') {
    throw new Error('Formato JSON inválido: o arquivo deve conter um objeto.');
  }
  if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
    throw new Error('O arquivo JSON deve conter os arrays "nodes" e "edges".');
  }

  // Ensure nodes have valid structure
  const sanitizedNodes: AgentNode[] = data.nodes.map((n: Record<string, unknown>, idx: number) => {
    const rawData = (n.data && typeof n.data === 'object' ? n.data : {}) as Record<string, unknown>;
    const rawCategory = String(rawData.category || 'trabalhador');
    const validCategory = ['entrada', 'trabalhador', 'supervisor', 'entrega'].includes(rawCategory)
      ? (rawCategory as 'entrada' | 'trabalhador' | 'supervisor' | 'entrega')
      : 'trabalhador';

    const pos =
      n.position && typeof n.position === 'object'
        ? (n.position as { x?: number; y?: number })
        : { x: 100 + idx * 250, y: 180 };

    return {
      id: typeof n.id === 'string' && n.id ? n.id : `node-imported-${idx}-${Date.now()}`,
      type: 'agentNode',
      position: {
        x: typeof pos.x === 'number' ? pos.x : 100 + idx * 250,
        y: typeof pos.y === 'number' ? pos.y : 180,
      },
      data: {
        ...rawData,
        category: validCategory,
        label: typeof rawData.label === 'string' && rawData.label ? rawData.label : `Peça ${idx + 1}`,
      },
    };
  });

  const sanitizedEdges: AgentEdge[] = data.edges
    .filter(
      (e: Record<string, unknown>) =>
        typeof e.source === 'string' && typeof e.target === 'string'
    )
    .map((e: Record<string, unknown>, idx: number) => ({
      id: typeof e.id === 'string' && e.id ? e.id : `edge-imported-${idx}-${Date.now()}`,
      source: String(e.source),
      target: String(e.target),
      type: 'smoothstep',
    }));

  return {
    title: typeof data.title === 'string' && data.title.trim() ? data.title.trim() : undefined,
    nodes: sanitizedNodes,
    edges: sanitizedEdges,
  };
}
