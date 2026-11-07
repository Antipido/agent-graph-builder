import type { AgentNode, AgentEdge, ValidationIssue, ValidationReport } from '../types/graph';

export function validateAgentGraph(nodes: AgentNode[], edges: AgentEdge[]): ValidationReport {
  const issues: ValidationIssue[] = [];

  if (nodes.length === 0) {
    issues.push({
      id: 'empty-graph',
      type: 'missing_entrada',
      severity: 'warning',
      message: 'O canvas está vazio. Adicione peças na barra lateral esquerda.',
    });
    return { isValid: false, issues };
  }

  // 1. Check Entrada node and Objective
  const entradaNodes = nodes.filter((n) => n.data.category === 'entrada');
  if (entradaNodes.length === 0) {
    issues.push({
      id: 'missing-entrada',
      type: 'missing_entrada',
      severity: 'warning',
      message: 'O grafo não possui nó de Entrada ou objetivo global definido.',
    });
  } else {
    if (entradaNodes.length > 1) {
      issues.push({
        id: 'multiple-entradas',
        type: 'missing_entrada',
        severity: 'warning',
        message: `Existem ${entradaNodes.length} peças de Entrada (recomendado apenas uma por grafo).`,
        nodeId: entradaNodes[1].id,
        nodeName: entradaNodes[1].data.label,
      });
    }
    for (const entrada of entradaNodes) {
      if (!entrada.data.objective || entrada.data.objective.trim().length === 0) {
        issues.push({
          id: `empty-objective-${entrada.id}`,
          type: 'empty_objective',
          severity: 'warning',
          message: `Sem objetivo definido na Entrada: "${entrada.data.label}"`,
          nodeId: entrada.id,
          nodeName: entrada.data.label,
        });
      }
    }
  }

  // 2. Check Entrega node at the end of the flow
  const entregaNodes = nodes.filter((n) => n.data.category === 'entrega');
  if (entregaNodes.length === 0) {
    issues.push({
      id: 'missing-entrega',
      type: 'missing_entrega',
      severity: 'warning',
      message: 'Falta pelo menos um nó de Entrega no fim do fluxo.',
    });
  }

  // Build adjacency maps
  const incomingCount = new Map<string, number>();
  const outgoingCount = new Map<string, number>();
  for (const n of nodes) {
    incomingCount.set(n.id, 0);
    outgoingCount.set(n.id, 0);
  }
  for (const e of edges) {
    if (incomingCount.has(e.target)) {
      incomingCount.set(e.target, (incomingCount.get(e.target) ?? 0) + 1);
    }
    if (outgoingCount.has(e.source)) {
      outgoingCount.set(e.source, (outgoingCount.get(e.source) ?? 0) + 1);
    }
  }

  // Check if at least one Entrega is at the end of a connected flow
  if (entregaNodes.length > 0) {
    const hasConnectedTerminalEntrega = entregaNodes.some(
      (n) => (incomingCount.get(n.id) ?? 0) > 0
    );
    if (!hasConnectedTerminalEntrega && nodes.length > 1) {
      issues.push({
        id: 'unconnected-entrega-end',
        type: 'missing_entrega',
        severity: 'warning',
        message: `Nó de Entrega "${entregaNodes[0].data.label}" não está conectado ao fim do fluxo.`,
        nodeId: entregaNodes[0].id,
        nodeName: entregaNodes[0].data.label,
      });
    }
  }

  // 3. Check orphan / disconnected nodes and empty instructions
  for (const node of nodes) {
    const inDeg = incomingCount.get(node.id) ?? 0;
    const outDeg = outgoingCount.get(node.id) ?? 0;

    if (inDeg === 0 && outDeg === 0) {
      issues.push({
        id: `orphan-${node.id}`,
        type: 'orphan_node',
        severity: 'warning',
        message: `Peça desconectada (órfã): "${node.data.label}"`,
        nodeId: node.id,
        nodeName: node.data.label,
      });
    } else if (
      (node.data.category === 'trabalhador' || node.data.category === 'supervisor') &&
      outDeg === 0
    ) {
      issues.push({
        id: `deadend-${node.id}`,
        type: 'orphan_node',
        severity: 'warning',
        message: `Peça sem conexão de saída (fluxo aberto): "${node.data.label}"`,
        nodeId: node.id,
        nodeName: node.data.label,
      });
    }

    // Check empty instruction fields by category
    if (node.data.category === 'trabalhador') {
      if (!node.data.instructions || node.data.instructions.trim().length === 0) {
        issues.push({
          id: `empty-inst-${node.id}`,
          type: 'empty_instructions',
          severity: 'warning',
          message: `Instruções vazias em: "${node.data.label}"`,
          nodeId: node.id,
          nodeName: node.data.label,
        });
      }
    } else if (node.data.category === 'supervisor') {
      const hasMethodology =
        node.data.verificationMethodology && node.data.verificationMethodology.trim().length > 0;
      const hasCriteria =
        node.data.approvalCriteria && node.data.approvalCriteria.trim().length > 0;
      if (!hasMethodology || !hasCriteria) {
        issues.push({
          id: `empty-inst-${node.id}`,
          type: 'empty_instructions',
          severity: 'warning',
          message: `Metodologia ou critérios vazios em: "${node.data.label}"`,
          nodeId: node.id,
          nodeName: node.data.label,
        });
      }
    } else if (node.data.category === 'entrega') {
      if (
        !node.data.consolidationInstructions ||
        node.data.consolidationInstructions.trim().length === 0
      ) {
        issues.push({
          id: `empty-inst-${node.id}`,
          type: 'empty_instructions',
          severity: 'warning',
          message: `Instruções de consolidação vazias em: "${node.data.label}"`,
          nodeId: node.id,
          nodeName: node.data.label,
        });
      }
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}
