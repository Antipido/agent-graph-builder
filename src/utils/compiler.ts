import type { AgentNode, AgentEdge } from '../types/graph';

export interface CompilationResult {
  markdown: string;
  stats: {
    totalNodes: number;
    workersCount: number;
    supervisorsCount: number;
    deliveriesCount: number;
    parallelBranchesCount: number;
    phasesCount: number;
  };
}

export function compileGraphToMetaPrompt(
  projectTitle: string,
  nodes: AgentNode[],
  edges: AgentEdge[]
): CompilationResult {
  const nodeMap = new Map<string, AgentNode>();
  const incoming = new Map<string, AgentNode[]>();
  const outgoing = new Map<string, AgentNode[]>();

  for (const n of nodes) {
    nodeMap.set(n.id, n);
    incoming.set(n.id, []);
    outgoing.set(n.id, []);
  }

  for (const e of edges) {
    const src = nodeMap.get(e.source);
    const tgt = nodeMap.get(e.target);
    if (src && tgt && src.id !== tgt.id) {
      outgoing.get(src.id)!.push(tgt);
      incoming.get(tgt.id)!.push(src);
    }
  }

  // Topological layering (longest-path depth with cycle protection)
  const depth = new Map<string, number>();
  for (const n of nodes) {
    depth.set(n.id, 0);
  }

  const maxIter = nodes.length + 2;
  for (let i = 0; i < maxIter; i++) {
    let updated = false;
    for (const e of edges) {
      if (e.source === e.target) continue;
      const dSrc = depth.get(e.source) ?? 0;
      const dTgt = depth.get(e.target) ?? 0;
      if (dSrc + 1 > dTgt && dSrc + 1 <= nodes.length) {
        depth.set(e.target, dSrc + 1);
        updated = true;
      }
    }
    if (!updated) break;
  }

  // Group nodes by depth layer
  const layersMap = new Map<number, AgentNode[]>();
  for (const n of nodes) {
    const d = depth.get(n.id) ?? 0;
    if (!layersMap.has(d)) layersMap.set(d, []);
    layersMap.get(d)!.push(n);
  }

  const sortedLayerKeys = Array.from(layersMap.keys()).sort((a, b) => a - b);
  sortedLayerKeys.forEach((k) => {
    layersMap.get(k)!.sort((a, b) => a.position.y - b.position.y);
  });

  const entradaNodes = nodes.filter((n) => n.data.category === 'entrada');
  const trabalhadorNodes = nodes
    .filter((n) => n.data.category === 'trabalhador')
    .sort((a, b) => (depth.get(a.id) ?? 0) - (depth.get(b.id) ?? 0) || a.position.y - b.position.y);
  const supervisorNodes = nodes
    .filter((n) => n.data.category === 'supervisor')
    .sort((a, b) => (depth.get(a.id) ?? 0) - (depth.get(b.id) ?? 0) || a.position.y - b.position.y);
  const entregaNodes = nodes
    .filter((n) => n.data.category === 'entrega')
    .sort((a, b) => (depth.get(a.id) ?? 0) - (depth.get(b.id) ?? 0) || a.position.y - b.position.y);

  // Count parallel branches (layers that have > 1 worker or > 1 node executing concurrently)
  let parallelBranchesCount = 0;
  sortedLayerKeys.forEach((k) => {
    const layerWorkers = (layersMap.get(k) ?? []).filter((n) => n.data.category === 'trabalhador');
    if (layerWorkers.length > 1) {
      parallelBranchesCount += layerWorkers.length;
    }
  });

  const lines: string[] = [];

  // =========================================================================
  // 1. HEADER DE ORQUESTRAÇÃO
  // =========================================================================
  lines.push(`# META-PROMPT DE ORQUESTRAÇÃO EM GRAFO: ${projectTitle.toUpperCase()}`);
  lines.push('');
  lines.push('## 1. HEADER DE ORQUESTRAÇÃO E DIRETRIZES DO MOTOR');
  lines.push(
    'Você deve atuar estritamente como um **Motor de Execução em Grafo (Gauntlet Loop Orchestrator)**.'
  );
  lines.push(
    'Sua missão é executar a topologia de agentes especificada abaixo respeitando a ordem exata das dependências, os ramos paralelos e os loops de validação Trabalhador → Supervisor.'
  );
  lines.push('');
  lines.push('### REGRAS INEGOCIÁVEIS DE EXECUÇÃO:');
  lines.push(
    '- **PROIBIDO ATALHOS OU RESPOSTAS PREGUIÇOSAS:** Nunca omita código, nunca use placeholders como `// resto do código aqui`, `TODO`, `TBD` ou resumos superficiais.'
  );
  lines.push(
    '- **ISOLAMENTO DE CONTEXTO POR NÓ:** Ao assumir o papel de cada Trabalhador, produza o artefato completo exigido pelas suas instruções. Ao assumir o papel de um Supervisor, atue como um **Crítico Cego Sem Viés de Confirmação**.'
  );
  lines.push(
    '- **GAUNTLET LOOP (TRABALHADOR ⇄ SUPERVISOR):** Nenhum output de Trabalhador pode avançar para a fase seguinte sem antes receber o veredito `[APROVADO]` do(s) Supervisor(es) conectado(s) a ele, respeitando o Teto Máximo de Rodadas configurado.'
  );
  lines.push('');

  // =========================================================================
  // 2. OBJETIVO GLOBAL
  // =========================================================================
  lines.push('---');
  lines.push('');
  lines.push('## 2. OBJETIVO GLOBAL E INSUMO INICIAL');
  if (entradaNodes.length > 0) {
    entradaNodes.forEach((ent) => {
      const obj = ent.data.objective?.trim() || '[Objetivo ainda não preenchido no nó de Entrada]';
      const outs = (outgoing.get(ent.id) ?? []).map((n) => `\`${n.data.label}\``).join(', ');
      lines.push(`### Nó de Entrada: **${ent.data.label}**`);
      lines.push(`- **Alimenta diretamente:** ${outs || 'Nenhuma conexão de saída'}`);
      lines.push('');
      lines.push('```text');
      lines.push(obj);
      lines.push('```');
      lines.push('');
    });
  } else {
    lines.push(
      '> ⚠️ *Nenhum nó de Entrada foi definido no grafo. Execute os Trabalhadores iniciais conforme suas instruções diretas.*'
    );
    lines.push('');
  }

  // =========================================================================
  // 3. TOPOLOGIA E FLUXO DE EXECUÇÃO
  // =========================================================================
  lines.push('---');
  lines.push('');
  lines.push('## 3. TOPOLOGIA E FLUXO DE EXECUÇÃO (ORDENAÇÃO TOPOLÓGICA)');
  lines.push(
    'O grafo foi compilado nas seguintes fases/camadas sequenciais e paralelas:'
  );
  lines.push('');

  if (sortedLayerKeys.length === 0) {
    lines.push('1. *(Grafo vazio)*');
  } else {
    sortedLayerKeys.forEach((layerIdx, phaseNumber) => {
      const layerNodes = layersMap.get(layerIdx) ?? [];
      const isParallel = layerNodes.length > 1;
      const modeTag = isParallel ? '⚡ EXECUÇÃO PARALELA' : '➡️ EXECUÇÃO SEQUENCIAL';

      lines.push(`### Fase ${phaseNumber + 1} — [${modeTag}]`);
      layerNodes.forEach((node, idx) => {
        const ins = (incoming.get(node.id) ?? []).map((n) => `**${n.data.label}**`);
        const outs = (outgoing.get(node.id) ?? []).map((n) => `**${n.data.label}**`);
        const categoryUpper = node.data.category.toUpperCase();
        const depStr =
          ins.length > 0 ? `Depende de: ${ins.join(', ')}` : 'Início de ramo (sem dependências anteriores)';
        const nextStr =
          outs.length > 0 ? `Entrega para: ${outs.join(', ')}` : 'Fim de fluxo (Terminal)';

        lines.push(
          `${phaseNumber + 1}.${idx + 1}. **[${categoryUpper}] ${node.data.label}** — *${depStr}* → *${nextStr}*`
        );
      });
      lines.push('');
    });
  }

  // =========================================================================
  // 4. ESPECIFICAÇÃO DETALHADA DOS NÓS E LOOPS (TRABALHADORES & SUPERVISORES)
  // =========================================================================
  lines.push('---');
  lines.push('');
  lines.push('## 4. ESPECIFICAÇÃO DETALHADA DOS NÓS E GAUNTLET LOOPS');
  lines.push('');

  if (trabalhadorNodes.length === 0 && supervisorNodes.length === 0) {
    lines.push('*(Nenhum Trabalhador ou Supervisor configurado no grafo)*');
    lines.push('');
  }

  // Track supervisors already detailed inside a Worker->Supervisor pair so we can also list any standalone supervisors
  const detailedSupervisors = new Set<string>();

  trabalhadorNodes.forEach((worker, wIdx) => {
    const ins = incoming.get(worker.id) ?? [];
    const outs = outgoing.get(worker.id) ?? [];
    const connectedSupervisors = outs.filter((n) => n.data.category === 'supervisor');
    const directDownstreamOthers = outs.filter((n) => n.data.category !== 'supervisor');

    lines.push(`### 4.${wIdx + 1}. TRABALHADOR: **${worker.data.label}**`);
    lines.push(`- **Papel / Especialidade:** ${worker.data.role?.trim() || 'Agente Executor Especialista'}`);
    lines.push(
      `- **Entradas Recebidas (Inputs):** ${
        ins.length > 0 ? ins.map((n) => `\`${n.data.label}\``).join(', ') : 'Nenhuma (Início direto)'
      }`
    );

    if (connectedSupervisors.length > 0) {
      lines.push(
        `- **Submissão Obrigatória ao(s) Supervisor(es):** ${connectedSupervisors
          .map((s) => `\`${s.data.label}\``)
          .join(', ')}`
      );
    }
    if (directDownstreamOthers.length > 0) {
      lines.push(
        `- **Saída Direta para:** ${directDownstreamOthers.map((d) => `\`${d.data.label}\``).join(', ')}`
      );
    }

    lines.push('');
    lines.push('#### System Prompt & Instruções de Execução do Trabalhador:');
    lines.push('```markdown');
    lines.push(`Você é: ${worker.data.role?.trim() || worker.data.label}.`);
    lines.push(
      worker.data.instructions?.trim() || '[Instruções de execução não preenchidas — complete no inspetor]'
    );
    lines.push('```');
    lines.push('');

    if (connectedSupervisors.length > 0) {
      lines.push(
        `> 🔄 **PROTOCOLO DE SUBMISSÃO IMEDIATA:** Assim que **${worker.data.label}** concluir sua geração, seu output bruto DEVE ser submetido imediatamente ao escrutínio do(s) Supervisor(es) abaixo antes de liberar o fluxo.`
      );
      lines.push('');

      connectedSupervisors.forEach((sup) => {
        detailedSupervisors.add(sup.id);
        const supOuts = outgoing.get(sup.id) ?? [];
        const maxRounds = sup.data.maxRounds ?? 3;
        const isUau = sup.data.evaluationMode === 'uau';
        const modeTitle = isUau
          ? 'RESULTADO UAU (Excelência Estética, Criativa e Arquitetural — Rejeita Entregas Genéricas)'
          : 'FUNCIONAL / OBJETIVO (Rigor Técnico, Zero Erros, Testes Verificáveis e Eficiência)';

        lines.push(`#### 🛡️ SUPERVISOR ACOPLADO: **${sup.data.label}**`);
        lines.push(
          '- **Diretriz Operacional:** **CRÍTICO CEGO SEM VIÉS DE CONFIRMAÇÃO**. Você NÃO ajudou a construir a entrega; avalie exclusivamente o artefato puro produzido pelo Trabalhador sem complacência.'
        );
        lines.push(`- **Modo de Avaliação:** \`${modeTitle}\``);
        lines.push(`- **Teto Máximo de Rodadas (Loop Limit):** \`${maxRounds} rodada(s)\``);
        lines.push(
          `- **Após Aprovação, Libera o Fluxo Para:** ${
            supOuts.length > 0
              ? supOuts.map((o) => `\`${o.data.label}\``).join(', ')
              : 'Fim do ramo'
          }`
        );
        lines.push('');
        lines.push('- **Metodologia de Verificação:**');
        lines.push(
          `  ${
            sup.data.verificationMethodology?.trim() ||
            '[Metodologia de verificação não especificada]'
          }`
        );
        lines.push('- **Critérios Estritos de Aprovação / Rejeição:**');
        lines.push(
          `  ${
            sup.data.approvalCriteria?.trim() || '[Critérios de aprovação não especificados]'
          }`
        );
        lines.push('');
        lines.push('- **Formato Obrigatório de Veredito por Rodada:**');
        lines.push(
          `  - Se atender 100% dos critérios: emita \`[APROVADO]\` e encaminhe o artefato validado para ${
            supOuts.length > 0 ? supOuts.map((o) => `**${o.data.label}**`).join(', ') : 'a etapa final'
          }.`
        );
        lines.push(
          `  - Se houver qualquer falha ou mediocridade: emita \`[REPROVADO + Lista Numerada e Acionável de Correções]\` e devolva para **${worker.data.label}** refazer imediatamente (máximo de **${maxRounds}** rodadas). Se atingir a rodada ${maxRounds}, consolide a melhor versão corrigindo diretamente os pontos residuais.`
        );
        lines.push('');
      });
    }
  });

  // Render any remaining supervisors that weren't directly attached after a worker
  const remainingSupervisors = supervisorNodes.filter((s) => !detailedSupervisors.has(s.id));
  remainingSupervisors.forEach((sup, idx) => {
    const ins = incoming.get(sup.id) ?? [];
    const outs = outgoing.get(sup.id) ?? [];
    const maxRounds = sup.data.maxRounds ?? 3;
    const isUau = sup.data.evaluationMode === 'uau';
    const modeTitle = isUau
      ? 'RESULTADO UAU (Exige ser surpreendido esteticamente/criativamente; rejeita entregas genéricas)'
      : 'FUNCIONAL / OBJETIVO (Foco em passar nos testes, zero erros, custo/velocidade)';

    lines.push(`### 4.${trabalhadorNodes.length + idx + 1}. SUPERVISOR INDEPENDENTE: **${sup.data.label}**`);
    lines.push(
      '- **Diretriz Operacional:** **CRÍTICO CEGO SEM VIÉS DE CONFIRMAÇÃO**.'
    );
    lines.push(
      `- **Recebe de:** ${ins.length > 0 ? ins.map((n) => `\`${n.data.label}\``).join(', ') : 'Nenhuma entrada'}`
    );
    lines.push(
      `- **Entrega para:** ${outs.length > 0 ? outs.map((n) => `\`${n.data.label}\``).join(', ') : 'Fim do fluxo'}`
    );
    lines.push(`- **Modo de Avaliação:** \`${modeTitle}\``);
    lines.push(`- **Teto Máximo de Rodadas (Loop Limit):** \`${maxRounds} rodada(s)\``);
    lines.push(
      `- **Metodologia de Verificação:** ${sup.data.verificationMethodology?.trim() || '[Não definida]'}`
    );
    lines.push(
      `- **Critérios de Aprovação / Rejeição:** ${sup.data.approvalCriteria?.trim() || '[Não definidos]'}`
    );
    lines.push(
      `- **Veredito:** Emita \`[APROVADO]\` ou \`[REPROVADO + Lista de Correções]\` por até \`${maxRounds}\` rodadas antes de liberar o fluxo.`
    );
    lines.push('');
  });

  // =========================================================================
  // 5. CONSOLIDAÇÃO FINAL (NÓS DE ENTREGA)
  // =========================================================================
  lines.push('---');
  lines.push('');
  lines.push('## 5. CONSOLIDAÇÃO FINAL E FORMATO DE ENTREGA');
  lines.push('');

  if (entregaNodes.length > 0) {
    entregaNodes.forEach((ent, eIdx) => {
      const ins = incoming.get(ent.id) ?? [];
      const outs = outgoing.get(ent.id) ?? [];
      lines.push(`### 5.${eIdx + 1}. Nó de Entrega: **${ent.data.label}**`);
      lines.push(`- **Formato Final Exigido:** \`${ent.data.expectedFormat || 'Markdown (.md)'}\``);
      lines.push(
        `- **Consolida as Entregas Aprovadas de:** ${
          ins.length > 0 ? ins.map((n) => `\`${n.data.label}\``).join(', ') : 'Nenhuma entrada conectada'
        }`
      );
      if (outs.length > 0) {
        lines.push(
          `- **Alimenta a Fase Seguinte:** ${outs.map((n) => `\`${n.data.label}\``).join(', ')}`
        );
      }
      lines.push('');
      lines.push('#### Instruções de Consolidação:');
      lines.push('```markdown');
      lines.push(
        ent.data.consolidationInstructions?.trim() ||
          '[Instruções de consolidação não preenchidas — unifique todos os artefatos aprovados anteriormente no formato exigido]'
      );
      lines.push('```');
      lines.push('');
    });
  } else {
    lines.push(
      '> ⚠️ *Nenhum nó de Entrega foi configurado no grafo. Consolide os outputs aprovados dos Supervisores em um artefato único estruturado.*'
    );
    lines.push('');
  }

  lines.push('---');
  lines.push(
    '*Inicie agora a execução estrita da **Fase 1**, exibindo o log estruturado de cada Trabalhador, a auditoria cega e o veredito `[APROVADO]` / `[REPROVADO]` de cada Supervisor, até gerar a **Entrega Final** completa.*'
  );

  return {
    markdown: lines.join('\n'),
    stats: {
      totalNodes: nodes.length,
      workersCount: trabalhadorNodes.length,
      supervisorsCount: supervisorNodes.length,
      deliveriesCount: entregaNodes.length,
      parallelBranchesCount,
      phasesCount: sortedLayerKeys.length,
    },
  };
}
