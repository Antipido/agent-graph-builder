import type { Node, Edge } from '@xyflow/react';

export type AgentNodeCategory = 'entrada' | 'trabalhador' | 'supervisor' | 'entrega';

export type SupervisorEvaluationMode = 'funcional' | 'uau';

export type DeliveryFormat =
  | 'Markdown (.md)'
  | 'HTML Interativo'
  | 'JSON'
  | 'Código / Repositório'
  | 'Texto Livre';

export interface AgentNodeData extends Record<string, unknown> {
  category: AgentNodeCategory;
  label: string;
  // Entrada specific
  objective?: string;
  // Trabalhador specific
  role?: string;
  instructions?: string;
  // Supervisor specific
  evaluationMode?: SupervisorEvaluationMode;
  verificationMethodology?: string;
  approvalCriteria?: string;
  maxRounds?: number;
  // Entrega specific
  expectedFormat?: DeliveryFormat;
  consolidationInstructions?: string;
}

export type AgentNode = Node<AgentNodeData, 'agentNode'>;
export type AgentEdge = Edge;

export interface SavedGraph {
  id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
  nodes: AgentNode[];
  edges: AgentEdge[];
}

export interface ValidationIssue {
  id: string;
  type: 'missing_entrada' | 'empty_objective' | 'missing_entrega' | 'orphan_node' | 'empty_instructions';
  severity: 'warning' | 'error';
  message: string;
  nodeId?: string;
  nodeName?: string;
}

export interface ValidationReport {
  isValid: boolean;
  issues: ValidationIssue[];
}
