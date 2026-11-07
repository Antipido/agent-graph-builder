import type { AgentNode, AgentEdge, AgentNodeCategory, SavedGraph } from '../types/graph';

export const NODE_CATEGORY_META: Record<
  AgentNodeCategory,
  {
    badge: string;
    title: string;
    description: string;
    accentColor: string;
    borderTopClass: string;
    badgeBgClass: string;
    badgeTextClass: string;
  }
> = {
  entrada: {
    badge: 'ENTRADA',
    title: 'Entrada',
    description: 'Opcional: o objetivo global e insumo inicial do fluxo. Uma por grafo.',
    accentColor: '#D4AF37',
    borderTopClass: 'border-t-[#D4AF37]',
    badgeBgClass: 'bg-[#D4AF37]/12 border-[#D4AF37]/30',
    badgeTextClass: 'text-[#D4AF37]',
  },
  trabalhador: {
    badge: 'TRABALHADOR',
    title: 'Trabalhador',
    description: 'Executa uma etapa do trabalho. É quem constrói.',
    accentColor: '#E2D9C5',
    borderTopClass: 'border-t-[#E2D9C5]',
    badgeBgClass: 'bg-[#E2D9C5]/10 border-[#E2D9C5]/25',
    badgeTextClass: 'text-[#E2D9C5]',
  },
  supervisor: {
    badge: 'SUPERVISOR',
    title: 'Supervisor',
    description: 'Crítico cego: julga a entrega do trabalhador e devolve para refazer se reprovado.',
    accentColor: '#E07A5F',
    borderTopClass: 'border-t-[#E07A5F]',
    badgeBgClass: 'bg-[#E07A5F]/12 border-[#E07A5F]/30',
    badgeTextClass: 'text-[#E07A5F]',
  },
  entrega: {
    badge: 'ENTREGA',
    title: 'Entrega',
    description: 'Consolida vários laços em um artefato único — ou alimenta a fase seguinte.',
    accentColor: '#4E9F6E',
    borderTopClass: 'border-t-[#4E9F6E]',
    badgeBgClass: 'bg-[#4E9F6E]/12 border-[#4E9F6E]/30',
    badgeTextClass: 'text-[#4E9F6E]',
  },
};

export function createNewAgentNode(
  category: AgentNodeCategory,
  position: { x: number; y: number },
  existingNodes: AgentNode[]
): AgentNode {
  const countOfType = existingNodes.filter((n) => n.data.category === category).length + 1;
  const id = `${category}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  switch (category) {
    case 'entrada':
      return {
        id,
        type: 'agentNode',
        position,
        data: {
          category: 'entrada',
          label: 'Entrada Global',
          objective: '',
        },
      };
    case 'trabalhador':
      return {
        id,
        type: 'agentNode',
        position,
        data: {
          category: 'trabalhador',
          label: `Trabalhador ${countOfType}`,
          role: 'Engenheiro Especialista',
          instructions: '',
        },
      };
    case 'supervisor':
      return {
        id,
        type: 'agentNode',
        position,
        data: {
          category: 'supervisor',
          label: `Supervisor ${countOfType}`,
          evaluationMode: 'funcional',
          verificationMethodology: '',
          approvalCriteria: '',
          maxRounds: 3,
        },
      };
    case 'entrega':
      return {
        id,
        type: 'agentNode',
        position,
        data: {
          category: 'entrega',
          label: countOfType === 1 ? 'Entrega Final' : `Entrega ${countOfType}`,
          expectedFormat: 'Markdown (.md)',
          consolidationInstructions: '',
        },
      };
  }
}

export const INITIAL_DEMO_NODES: AgentNode[] = [
  {
    id: 'node-entrada-1',
    type: 'agentNode',
    position: { x: 60, y: 210 },
    data: {
      category: 'entrada',
      label: 'Briefing & Contexto Global',
      objective:
        'Construir uma arquitetura completa de análise competitiva e prototipação interativa para um produto SaaS B2B FinTech, garantindo dados auditados em tempo real e uma especificação técnica livre de alucinações.',
    },
  },
  {
    id: 'node-trab-1',
    type: 'agentNode',
    position: { x: 430, y: 70 },
    data: {
      category: 'trabalhador',
      label: 'Trabalhador 1 - Scraper & Dados',
      role: 'Engenheiro de Dados & Pesquisador Web',
      instructions:
        'Extraia benchmarks de preços, features críticas e gargalos de UX dos 5 principais concorrentes usando ferramentas de busca e scraping. Estruture uma matriz comparativa densa com citações verificáveis e métricas reais.',
    },
  },
  {
    id: 'node-sup-1',
    type: 'agentNode',
    position: { x: 800, y: 70 },
    data: {
      category: 'supervisor',
      label: 'Supervisor 1 - Auditor de Dados',
      evaluationMode: 'funcional',
      verificationMethodology:
        'Conferir cada tabela gerada contra as fontes originais, validar se há números genéricos inventados e testar a consistência do schema de dados.',
      approvalCriteria:
        'Aprovar somente se 100% dos 5 concorrentes tiverem dados objetivos preenchidos, fontes explícitas e zero placeholders como "TBD" ou "Lorem Ipsum".',
      maxRounds: 3,
    },
  },
  {
    id: 'node-trab-2',
    type: 'agentNode',
    position: { x: 430, y: 350 },
    data: {
      category: 'trabalhador',
      label: 'Trabalhador 2 - Arquiteto de UI',
      role: 'Principal Product Designer & Front-end Architect',
      instructions:
        'Projete a árvore de componentes, tokens de Design System e fluxos interativos da aplicação com estética executiva minimalista, micro-interações precisas e acessibilidade WCAG AA.',
    },
  },
  {
    id: 'node-sup-2',
    type: 'agentNode',
    position: { x: 800, y: 350 },
    data: {
      category: 'supervisor',
      label: 'Supervisor 2 - Crítico Estético',
      evaluationMode: 'uau',
      verificationMethodology:
        'Inspecionar hierarquia tipográfica, contraste visual, estados vazios/erro e rigor estético via checklist de Design System.',
      approvalCriteria:
        'Rejeitar layouts genéricos ou clichês. Exigir precisão tipográfica, tokens semânticos completos e arquitetura de estado impecável.',
      maxRounds: 4,
    },
  },
  {
    id: 'node-entrega-1',
    type: 'agentNode',
    position: { x: 1170, y: 210 },
    data: {
      category: 'entrega',
      label: 'Entrega Final - Dossiê & Blueprint',
      expectedFormat: 'Markdown (.md)',
      consolidationInstructions:
        'Unifique a matriz competitiva auditada pelo Supervisor 1 com a especificação de Design System e arquitetura aprovada pelo Supervisor 2 em um Blueprint Técnico Mestre pronto para implementação.',
    },
  },
];

export const INITIAL_DEMO_EDGES: AgentEdge[] = [
  {
    id: 'edge-e1-t1',
    source: 'node-entrada-1',
    target: 'node-trab-1',
    type: 'smoothstep',
  },
  {
    id: 'edge-e1-t2',
    source: 'node-entrada-1',
    target: 'node-trab-2',
    type: 'smoothstep',
  },
  {
    id: 'edge-t1-s1',
    source: 'node-trab-1',
    target: 'node-sup-1',
    type: 'smoothstep',
  },
  {
    id: 'edge-t2-s2',
    source: 'node-trab-2',
    target: 'node-sup-2',
    type: 'smoothstep',
  },
  {
    id: 'edge-s1-out',
    source: 'node-sup-1',
    target: 'node-entrega-1',
    type: 'smoothstep',
  },
  {
    id: 'edge-s2-out',
    source: 'node-sup-2',
    target: 'node-entrega-1',
    type: 'smoothstep',
  },
];

export const PRESET_TEMPLATES: SavedGraph[] = [
  {
    id: 'preset-parallel-architecture',
    title: 'Arquitetura Paralela: Dados + UI Blueprint',
    createdAt: '2026-11-06T12:00:00.000Z',
    updatedAt: '2026-11-06T12:00:00.000Z',
    nodes: INITIAL_DEMO_NODES,
    edges: INITIAL_DEMO_EDGES,
  },
  {
    id: 'preset-sequential-gauntlet',
    title: 'Loop Gauntlet Sequencial: Código + Auditoria QA',
    createdAt: '2026-11-06T12:00:00.000Z',
    updatedAt: '2026-11-06T12:00:00.000Z',
    nodes: [
      {
        id: 'seq-entrada',
        type: 'agentNode',
        position: { x: 60, y: 190 },
        data: {
          category: 'entrada',
          label: 'Especificação do Sistema',
          objective:
            'Desenvolver e validar um motor de compilação e execução em grafo em TypeScript estrito, com cobertura de casos de borda e zero dependências desnecessárias.',
        },
      },
      {
        id: 'seq-trab-1',
        type: 'agentNode',
        position: { x: 420, y: 190 },
        data: {
          category: 'trabalhador',
          label: 'Trabalhador 1 - Core Dev',
          role: 'Engenheiro de Software Sênior (TypeScript)',
          instructions:
            'Implemente os módulos de ordenação topológica, detecção de ciclos e geração do Meta-Prompt seguindo Clean Architecture e tipagem estrita sem uso de `any`.',
        },
      },
      {
        id: 'seq-sup-1',
        type: 'agentNode',
        position: { x: 780, y: 190 },
        data: {
          category: 'supervisor',
          label: 'Supervisor 1 - QA & Security Gate',
          evaluationMode: 'funcional',
          verificationMethodology:
            'Executar verificação estática de tipos (`tsc -b`), testar grafos com múltiplos ramos paralelos e inspecionar complexidade algorítmica.',
          approvalCriteria:
            'Zero erros de compilação, tratamento explícito de grafos desconectados e código limpo documentado.',
          maxRounds: 3,
        },
      },
      {
        id: 'seq-entrega',
        type: 'agentNode',
        position: { x: 1140, y: 190 },
        data: {
          category: 'entrega',
          label: 'Entrega - Pacote de Produção',
          expectedFormat: 'Código / Repositório',
          consolidationInstructions:
            'Empacote o código final aprovado pelo Supervisor 1 junto com o relatório de verificação técnica e instruções de deploy.',
        },
      },
    ],
    edges: [
      { id: 'e-seq-1', source: 'seq-entrada', target: 'seq-trab-1', type: 'smoothstep' },
      { id: 'e-seq-2', source: 'seq-trab-1', target: 'seq-sup-1', type: 'smoothstep' },
      { id: 'e-seq-3', source: 'seq-sup-1', target: 'seq-entrega', type: 'smoothstep' },
    ],
  },
];
