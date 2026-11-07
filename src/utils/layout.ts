import type { AgentNode, AgentEdge } from '../types/graph';

const COLUMN_WIDTH = 365;
const ROW_HEIGHT = 230;
const START_X = 60;
const CENTER_Y = 250;

export function computeHorizontalAutoLayout(
  nodes: AgentNode[],
  edges: AgentEdge[]
): AgentNode[] {
  if (nodes.length === 0) return nodes;

  const incoming = new Map<string, string[]>();
  const outgoing = new Map<string, string[]>();

  for (const n of nodes) {
    incoming.set(n.id, []);
    outgoing.set(n.id, []);
  }

  for (const e of edges) {
    if (e.source !== e.target && outgoing.has(e.source) && incoming.has(e.target)) {
      outgoing.get(e.source)!.push(e.target);
      incoming.get(e.target)!.push(e.source);
    }
  }

  // Compute depth (column) using longest-path BFS / Kahn relaxation with cycle guard
  const depth = new Map<string, number>();
  for (const n of nodes) {
    if (n.data.category === 'entrada') {
      depth.set(n.id, 0);
    } else {
      depth.set(n.id, 0);
    }
  }

  // Iterative relaxation up to N times (handles DAGs and guards against cycles)
  const maxIterations = nodes.length + 2;
  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;
    for (const e of edges) {
      if (e.source === e.target) continue;
      const srcDepth = depth.get(e.source) ?? 0;
      const tgtDepth = depth.get(e.target) ?? 0;
      if (srcDepth + 1 > tgtDepth && srcDepth + 1 <= nodes.length) {
        depth.set(e.target, srcDepth + 1);
        changed = true;
      }
    }
    if (!changed) break;
  }

  // For completely disconnected nodes, assign a sensible column based on category
  for (const n of nodes) {
    const inDeg = (incoming.get(n.id) ?? []).length;
    const outDeg = (outgoing.get(n.id) ?? []).length;
    if (inDeg === 0 && outDeg === 0) {
      if (n.data.category === 'entrada') depth.set(n.id, 0);
      else if (n.data.category === 'trabalhador') depth.set(n.id, 1);
      else if (n.data.category === 'supervisor') depth.set(n.id, 2);
      else if (n.data.category === 'entrega') depth.set(n.id, 3);
    }
  }

  // Group nodes by column depth
  const columns = new Map<number, AgentNode[]>();
  for (const n of nodes) {
    const col = depth.get(n.id) ?? 0;
    if (!columns.has(col)) {
      columns.set(col, []);
    }
    columns.get(col)!.push(n);
  }

  const sortedColIndices = Array.from(columns.keys()).sort((a, b) => a - b);
  const newPositions = new Map<string, { x: number; y: number }>();

  sortedColIndices.forEach((colIdx, normalizedColIndex) => {
    const colNodes = columns.get(colIdx)!;

    // Sort nodes in column by average Y of predecessors (if any), else current Y
    colNodes.sort((a, b) => {
      const predsA = incoming.get(a.id) ?? [];
      const predsB = incoming.get(b.id) ?? [];
      const avgYA =
        predsA.length > 0
          ? predsA.reduce((acc, pid) => acc + (newPositions.get(pid)?.y ?? a.position.y), 0) /
            predsA.length
          : a.position.y;
      const avgYB =
        predsB.length > 0
          ? predsB.reduce((acc, pid) => acc + (newPositions.get(pid)?.y ?? b.position.y), 0) /
            predsB.length
          : b.position.y;
      return avgYA - avgYB;
    });

    const totalHeight = (colNodes.length - 1) * ROW_HEIGHT;
    const startY = CENTER_Y - totalHeight / 2;

    colNodes.forEach((node, rowIdx) => {
      newPositions.set(node.id, {
        x: START_X + normalizedColIndex * COLUMN_WIDTH,
        y: Math.max(50, Math.round(startY + rowIdx * ROW_HEIGHT)),
      });
    });
  });

  return nodes.map((node) => ({
    ...node,
    position: newPositions.get(node.id) ?? node.position,
  }));
}
