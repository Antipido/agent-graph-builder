import {
  Trash2,
  Copy,
  ArrowDownLeft,
  ArrowUpRight,
  Compass,
  Hammer,
  ShieldAlert,
  PackageCheck,
  CheckCircle2,
  Sparkles,
  SlidersHorizontal,
  Layers,
} from 'lucide-react';
import type {
  AgentNode,
  AgentEdge,
  AgentNodeData,
  DeliveryFormat,
  SupervisorEvaluationMode,
} from '../types/graph';
import { NODE_CATEGORY_META } from '../utils/presets';

interface RightInspectorProps {
  selectedNode: AgentNode | null;
  nodes: AgentNode[];
  edges: AgentEdge[];
  onUpdateNodeData: (nodeId: string, partialData: Partial<AgentNodeData>) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
  onSelectNode: (nodeId: string) => void;
}

const DELIVERY_FORMATS: DeliveryFormat[] = [
  'Markdown (.md)',
  'HTML Interativo',
  'JSON',
  'Código / Repositório',
  'Texto Livre',
];

export function RightInspector({
  selectedNode,
  nodes,
  edges,
  onUpdateNodeData,
  onDeleteNode,
  onDuplicateNode,
  onSelectNode,
}: RightInspectorProps) {
  if (!selectedNode) {
    const counts = {
      entrada: nodes.filter((n) => n.data.category === 'entrada').length,
      trabalhador: nodes.filter((n) => n.data.category === 'trabalhador').length,
      supervisor: nodes.filter((n) => n.data.category === 'supervisor').length,
      entrega: nodes.filter((n) => n.data.category === 'entrega').length,
    };

    return (
      <aside
        id="sidebar-right-empty"
        className="w-[340px] h-full bg-[#121216] border-l border-[#26262E] flex flex-col justify-between shrink-0 z-10 select-none overflow-y-auto"
      >
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
            <h2 className="font-mono-code text-[11px] font-semibold tracking-[0.08em] uppercase text-[#8E8E99]">
              INSPETOR DE PROPRIEDADES
            </h2>
          </div>

          <div className="rounded-xl bg-[#17171D] border border-[#26262E] p-4 text-center mb-5">
            <div className="w-10 h-10 rounded-lg bg-[#0E0E12] border border-[#26262E] flex items-center justify-center mx-auto mb-3">
              <Layers className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <p className="font-display font-semibold text-[13px] text-[#F5F2EB] mb-1">
              Nenhuma peça selecionada
            </p>
            <p className="text-[12px] text-[#8E8E99] leading-relaxed">
              Clique em qualquer peça no canvas (ou escolha na lista abaixo) para configurar seu
              System Prompt, critérios de supervisão e formato de entrega.
            </p>
          </div>

          {/* Quick Overview of Current Graph Pieces */}
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono-code text-[10px] font-semibold uppercase tracking-wider text-[#8E8E99]">
              PEÇAS NO GRAFO ({nodes.length})
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="rounded-lg bg-[#0E0E12] border border-[#26262E] px-3 py-2 flex items-center justify-between">
              <span className="text-[11px] text-[#8E8E99]">Entrada</span>
              <span className="font-mono-code text-[12px] font-semibold text-[#D4AF37]">
                {counts.entrada}
              </span>
            </div>
            <div className="rounded-lg bg-[#0E0E12] border border-[#26262E] px-3 py-2 flex items-center justify-between">
              <span className="text-[11px] text-[#8E8E99]">Trabalhadores</span>
              <span className="font-mono-code text-[12px] font-semibold text-[#E2D9C5]">
                {counts.trabalhador}
              </span>
            </div>
            <div className="rounded-lg bg-[#0E0E12] border border-[#26262E] px-3 py-2 flex items-center justify-between">
              <span className="text-[11px] text-[#8E8E99]">Supervisores</span>
              <span className="font-mono-code text-[12px] font-semibold text-[#E07A5F]">
                {counts.supervisor}
              </span>
            </div>
            <div className="rounded-lg bg-[#0E0E12] border border-[#26262E] px-3 py-2 flex items-center justify-between">
              <span className="text-[11px] text-[#8E8E99]">Entregas</span>
              <span className="font-mono-code text-[12px] font-semibold text-[#4E9F6E]">
                {counts.entrega}
              </span>
            </div>
          </div>

          {nodes.length > 0 && (
            <div className="space-y-1.5">
              {nodes.map((node) => {
                const meta = NODE_CATEGORY_META[node.data.category];
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => onSelectNode(node.id)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-[#17171D] hover:bg-[#1E1E26] border border-[#26262E] hover:border-[#383844] flex items-center justify-between gap-2 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        style={{ backgroundColor: meta.accentColor }}
                        className="w-2 h-2 rounded-full shrink-0"
                      />
                      <span className="text-[12px] font-medium text-[#F5F2EB] truncate group-hover:text-[#D4AF37] transition-colors">
                        {node.data.label}
                      </span>
                    </div>
                    <span className="font-mono-code text-[9.5px] uppercase text-[#5C5C66] shrink-0">
                      {meta.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#26262E] bg-[#0E0E12]/60 text-[11px] text-[#5C5C66]">
          Dica: Use <span className="text-[#8E8E99] font-mono-code">Arrumar</span> na barra
          inferior do canvas para alinhar automaticamente as colunas do fluxo.
        </div>
      </aside>
    );
  }

  const { data } = selectedNode;
  const meta = NODE_CATEGORY_META[data.category];

  // Compute dynamic incoming ("Recebe de") and outgoing ("Entrega para") connected nodes
  const incomingNodes = edges
    .filter((e) => e.target === selectedNode.id)
    .map((e) => nodes.find((n) => n.id === e.source))
    .filter((n): n is AgentNode => Boolean(n));

  const outgoingNodes = edges
    .filter((e) => e.source === selectedNode.id)
    .map((e) => nodes.find((n) => n.id === e.target))
    .filter((n): n is AgentNode => Boolean(n));

  const CategoryIcon =
    data.category === 'entrada'
      ? Compass
      : data.category === 'trabalhador'
      ? Hammer
      : data.category === 'supervisor'
      ? ShieldAlert
      : PackageCheck;

  return (
    <aside
      id="sidebar-right-inspector"
      className="w-[340px] h-full bg-[#121216] border-l border-[#26262E] flex flex-col justify-between shrink-0 z-10 overflow-hidden"
    >
      {/* Top Header with Category Badge, Duplicate & Apagar Button */}
      <div
        style={{
          borderTopWidth: '3px',
          borderTopColor: meta.accentColor,
        }}
        className="px-4 py-3.5 bg-[#17171D] border-b border-[#26262E] flex items-center justify-between gap-2 shrink-0"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            style={{
              backgroundColor: `${meta.accentColor}20`,
              color: meta.accentColor,
            }}
            className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
          >
            <CategoryIcon className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <span
              style={{ color: meta.accentColor }}
              className="block font-mono-code text-[10px] font-semibold tracking-[0.08em] uppercase"
            >
              {meta.badge}
            </span>
            <h2 className="font-display font-semibold text-[13px] text-[#F5F2EB] truncate">
              {data.label || 'Sem nome'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="inspector-btn-duplicate"
            type="button"
            onClick={() => onDuplicateNode(selectedNode.id)}
            title="Duplicar peça (Ctrl + D)"
            className="h-7 px-2 rounded bg-[#0E0E12] hover:bg-[#22222B] text-[#8E8E99] hover:text-[#F5F2EB] border border-[#26262E] text-[11px] font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            id="inspector-btn-delete"
            type="button"
            onClick={() => onDeleteNode(selectedNode.id)}
            title="Apagar peça selecionada (Del)"
            className="h-7 px-2.5 rounded bg-[#241414] hover:bg-[#361A1A] text-[#E07A5F] border border-[#E07A5F]/30 hover:border-[#E07A5F]/60 text-[11.5px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Apagar</span>
          </button>
        </div>
      </div>

      {/* Dynamic Form Body by Category */}
      <div className="p-4 overflow-y-auto flex-1 space-y-4">
        {/* ================= SE ENTRADA ================= */}
        {data.category === 'entrada' && (
          <>
            <div>
              <label
                htmlFor="inspector-entrada-name"
                className="block text-[12px] font-medium text-[#F5F2EB] mb-1.5"
              >
                Nome da Peça
              </label>
              <input
                id="inspector-entrada-name"
                type="text"
                value={data.label}
                onChange={(e) => onUpdateNodeData(selectedNode.id, { label: e.target.value })}
                placeholder="Ex: Briefing & Objetivo Global"
                className="w-full bg-[#0E0E12] text-[#F5F2EB] text-[13px] px-3 py-2 rounded-lg border border-[#26262E] focus:border-[#D4AF37] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="inspector-entrada-objective"
                className="block text-[12px] font-medium text-[#F5F2EB] mb-1.5"
              >
                Objetivo Principal do Projeto / Contexto Inicial
              </label>
              <textarea
                id="inspector-entrada-objective"
                rows={9}
                value={data.objective ?? ''}
                onChange={(e) =>
                  onUpdateNodeData(selectedNode.id, { objective: e.target.value })
                }
                placeholder="Descreva o objetivo global do sistema, o contexto de negócio, restrições inegociáveis e os insumos iniciais que alimentarão os Trabalhadores..."
                className="w-full bg-[#0E0E12] text-[#F5F2EB] text-[12.5px] leading-relaxed px-3 py-2.5 rounded-lg border border-[#26262E] focus:border-[#D4AF37] focus:outline-none transition-colors resize-y"
              />
              <p className="mt-1.5 text-[11px] text-[#8E8E99]">
                Este contexto será injetado no cabeçalho do Meta-Prompt como a bússola global de
                todos os agentes.
              </p>
            </div>
          </>
        )}

        {/* ================= SE TRABALHADOR ================= */}
        {data.category === 'trabalhador' && (
          <>
            <div>
              <label
                htmlFor="inspector-trabalhador-name"
                className="block text-[12px] font-medium text-[#F5F2EB] mb-1.5"
              >
                Nome da Peça
              </label>
              <input
                id="inspector-trabalhador-name"
                type="text"
                value={data.label}
                onChange={(e) => onUpdateNodeData(selectedNode.id, { label: e.target.value })}
                placeholder="Ex: Trabalhador 1 - Scraper"
                className="w-full bg-[#0E0E12] text-[#F5F2EB] text-[13px] px-3 py-2 rounded-lg border border-[#26262E] focus:border-[#D4AF37] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="inspector-trabalhador-role"
                className="block text-[12px] font-medium text-[#F5F2EB] mb-1.5"
              >
                Especialidade / Papel
              </label>
              <input
                id="inspector-trabalhador-role"
                type="text"
                value={data.role ?? ''}
                onChange={(e) => onUpdateNodeData(selectedNode.id, { role: e.target.value })}
                placeholder="Ex: Engenheiro de Dados / UI Designer"
                className="w-full bg-[#0E0E12] text-[#F5F2EB] text-[13px] px-3 py-2 rounded-lg border border-[#26262E] focus:border-[#D4AF37] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="inspector-trabalhador-instructions"
                className="block text-[12px] font-medium text-[#F5F2EB] mb-1.5"
              >
                Instruções de Execução
              </label>
              <textarea
                id="inspector-trabalhador-instructions"
                rows={9}
                value={data.instructions ?? ''}
                onChange={(e) =>
                  onUpdateNodeData(selectedNode.id, { instructions: e.target.value })
                }
                placeholder="Descreva exatamente o que este agente deve construir, passo a passo, quais ferramentas/MCPs utilizar (ex: Playwright, Busca Web, Bash, GitHub) e o formato técnico esperado na saída..."
                className="w-full bg-[#0E0E12] text-[#F5F2EB] text-[12.5px] leading-relaxed px-3 py-2.5 rounded-lg border border-[#26262E] focus:border-[#D4AF37] focus:outline-none transition-colors resize-y"
              />
            </div>
          </>
        )}

        {/* ================= SE SUPERVISOR ================= */}
        {data.category === 'supervisor' && (
          <>
            <div>
              <label
                htmlFor="inspector-supervisor-name"
                className="block text-[12px] font-medium text-[#F5F2EB] mb-1.5"
              >
                Nome do Supervisor
              </label>
              <input
                id="inspector-supervisor-name"
                type="text"
                value={data.label}
                onChange={(e) => onUpdateNodeData(selectedNode.id, { label: e.target.value })}
                placeholder="Ex: Supervisor 1 - Auditor QA"
                className="w-full bg-[#0E0E12] text-[#F5F2EB] text-[13px] px-3 py-2 rounded-lg border border-[#26262E] focus:border-[#D4AF37] focus:outline-none transition-colors"
              />
            </div>

            {/* Modo de Avaliação (Botões de seleção rápida) */}
            <div>
              <label className="block text-[12px] font-medium text-[#F5F2EB] mb-1.5">
                Modo de Avaliação
              </label>
              <div className="grid grid-cols-1 gap-2">
                {(
                  [
                    {
                      mode: 'funcional' as SupervisorEvaluationMode,
                      title: 'Funcional / Objetivo',
                      desc: 'Foco em passar nos testes, zero erros, custo/velocidade.',
                      icon: CheckCircle2,
                    },
                    {
                      mode: 'uau' as SupervisorEvaluationMode,
                      title: 'Resultado UAU',
                      desc: 'Exige ser surpreendido esteticamente/criativamente; rejeita entregas genéricas.',
                      icon: Sparkles,
                    },
                  ] as const
                ).map((option) => {
                  const isSelected = (data.evaluationMode ?? 'funcional') === option.mode;
                  const OptionIcon = option.icon;
                  return (
                    <button
                      key={option.mode}
                      id={`supervisor-mode-${option.mode}`}
                      type="button"
                      onClick={() =>
                        onUpdateNodeData(selectedNode.id, { evaluationMode: option.mode })
                      }
                      className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#D4AF37]/12 border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.12)]'
                          : 'bg-[#0E0E12] border-[#26262E] hover:border-[#383844]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className={`font-display font-semibold text-[12.5px] inline-flex items-center gap-1.5 ${
                            isSelected ? 'text-[#D4AF37]' : 'text-[#F5F2EB]'
                          }`}
                        >
                          <OptionIcon className="w-3.5 h-3.5" />
                          {option.title}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSelected ? 'bg-[#D4AF37]' : 'bg-[#26262E]'
                          }`}
                        />
                      </div>
                      <p className="text-[11px] text-[#8E8E99] leading-snug">{option.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Metodologia de Verificação */}
            <div>
              <label
                htmlFor="inspector-supervisor-methodology"
                className="block text-[12px] font-medium text-[#F5F2EB] mb-1.5"
              >
                Metodologia de Verificação
              </label>
              <textarea
                id="inspector-supervisor-methodology"
                rows={4}
                value={data.verificationMethodology ?? ''}
                onChange={(e) =>
                  onUpdateNodeData(selectedNode.id, {
                    verificationMethodology: e.target.value,
                  })
                }
                placeholder="Ex: Inspecionar via Playwright, validar OCR, rodar suíte de testes automatizados, checar requisitos ponto a ponto..."
                className="w-full bg-[#0E0E12] text-[#F5F2EB] text-[12.5px] leading-relaxed px-3 py-2 rounded-lg border border-[#26262E] focus:border-[#D4AF37] focus:outline-none transition-colors resize-y"
              />
            </div>

            {/* Critérios de Aprovação / Rejeição */}
            <div>
              <label
                htmlFor="inspector-supervisor-criteria"
                className="block text-[12px] font-medium text-[#F5F2EB] mb-1.5"
              >
                Critérios de Aprovação / Rejeição
              </label>
              <textarea
                id="inspector-supervisor-criteria"
                rows={4}
                value={data.approvalCriteria ?? ''}
                onChange={(e) =>
                  onUpdateNodeData(selectedNode.id, { approvalCriteria: e.target.value })
                }
                placeholder="Ex: Rejeitar imediatamente se houver código incompleto, falta de tratamento de erro ou estética genérica..."
                className="w-full bg-[#0E0E12] text-[#F5F2EB] text-[12.5px] leading-relaxed px-3 py-2 rounded-lg border border-[#26262E] focus:border-[#D4AF37] focus:outline-none transition-colors resize-y"
              />
            </div>

            {/* Teto Máximo de Rodadas (Loop Limit: 1 a 20, padrão: 3) */}
            <div className="p-3 rounded-lg bg-[#0E0E12] border border-[#26262E]">
              <div className="flex items-center justify-between gap-2 mb-2">
                <label
                  htmlFor="inspector-supervisor-rounds"
                  className="text-[12px] font-medium text-[#F5F2EB]"
                >
                  Teto Máximo de Rodadas (Loop Limit)
                </label>
                <input
                  id="inspector-supervisor-rounds-number"
                  type="number"
                  min={1}
                  max={20}
                  value={data.maxRounds ?? 3}
                  onChange={(e) => {
                    const val = Math.min(20, Math.max(1, Number(e.target.value) || 1));
                    onUpdateNodeData(selectedNode.id, { maxRounds: val });
                  }}
                  className="w-14 bg-[#17171D] text-[#D4AF37] font-mono-code font-semibold text-[12px] text-center py-1 rounded border border-[#26262E] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
              <input
                id="inspector-supervisor-rounds"
                type="range"
                min={1}
                max={20}
                value={data.maxRounds ?? 3}
                onChange={(e) =>
                  onUpdateNodeData(selectedNode.id, { maxRounds: Number(e.target.value) })
                }
                className="w-full gold-slider"
              />
              <div className="flex justify-between text-[10px] font-mono-code text-[#5C5C66] mt-1">
                <span>1 rodada</span>
                <span>Padrão: 3</span>
                <span>20 rodadas</span>
              </div>
            </div>
          </>
        )}

        {/* ================= SE ENTREGA ================= */}
        {data.category === 'entrega' && (
          <>
            <div>
              <label
                htmlFor="inspector-entrega-name"
                className="block text-[12px] font-medium text-[#F5F2EB] mb-1.5"
              >
                Nome da Entrega
              </label>
              <input
                id="inspector-entrega-name"
                type="text"
                value={data.label}
                onChange={(e) => onUpdateNodeData(selectedNode.id, { label: e.target.value })}
                placeholder="Ex: Entrega Final - Blueprint"
                className="w-full bg-[#0E0E12] text-[#F5F2EB] text-[13px] px-3 py-2 rounded-lg border border-[#26262E] focus:border-[#D4AF37] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="inspector-entrega-format"
                className="block text-[12px] font-medium text-[#F5F2EB] mb-1.5"
              >
                Formato Esperado
              </label>
              <select
                id="inspector-entrega-format"
                value={data.expectedFormat ?? 'Markdown (.md)'}
                onChange={(e) =>
                  onUpdateNodeData(selectedNode.id, {
                    expectedFormat: e.target.value as DeliveryFormat,
                  })
                }
                className="w-full bg-[#0E0E12] text-[#F5F2EB] text-[13px] px-3 py-2 rounded-lg border border-[#26262E] focus:border-[#D4AF37] focus:outline-none transition-colors cursor-pointer"
              >
                {DELIVERY_FORMATS.map((fmt) => (
                  <option key={fmt} value={fmt} className="bg-[#121216] text-[#F5F2EB]">
                    {fmt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="inspector-entrega-instructions"
                className="block text-[12px] font-medium text-[#F5F2EB] mb-1.5"
              >
                Instruções de Consolidação
              </label>
              <textarea
                id="inspector-entrega-instructions"
                rows={8}
                value={data.consolidationInstructions ?? ''}
                onChange={(e) =>
                  onUpdateNodeData(selectedNode.id, {
                    consolidationInstructions: e.target.value,
                  })
                }
                placeholder="Explique como juntar e sintetizar os outputs aprovados dos laços anteriores no artefato final (ou como preparar o insumo para a fase seguinte)..."
                className="w-full bg-[#0E0E12] text-[#F5F2EB] text-[12.5px] leading-relaxed px-3 py-2.5 rounded-lg border border-[#26262E] focus:border-[#D4AF37] focus:outline-none transition-colors resize-y"
              />
            </div>
          </>
        )}
      </div>

      {/* Footer: Dynamic Topology Mapping ("Recebe de" & "Entrega para") */}
      <div className="p-3.5 bg-[#0E0E12] border-t border-[#26262E] space-y-2.5 shrink-0">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono-code text-[#8E8E99] mb-1">
            <ArrowDownLeft className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Recebe de:</span>
          </div>
          {incomingNodes.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {incomingNodes.map((inNode) => (
                <button
                  key={inNode.id}
                  type="button"
                  onClick={() => onSelectNode(inNode.id)}
                  className="px-2 py-0.5 rounded bg-[#17171D] hover:bg-[#22222B] text-[#F5F2EB] border border-[#26262E] hover:border-[#D4AF37]/50 text-[11px] font-medium transition-colors cursor-pointer truncate max-w-full"
                >
                  {inNode.data.label}
                </button>
              ))}
            </div>
          ) : (
            <span className="text-[11px] italic text-[#5C5C66]">
              Nenhuma peça conectada na entrada
            </span>
          )}
        </div>

        <div className="pt-2 border-t border-[#26262E]/60">
          <div className="flex items-center gap-1.5 text-[11px] font-mono-code text-[#8E8E99] mb-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-[#4E9F6E]" />
            <span>Entrega para:</span>
          </div>
          {outgoingNodes.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {outgoingNodes.map((outNode) => (
                <button
                  key={outNode.id}
                  type="button"
                  onClick={() => onSelectNode(outNode.id)}
                  className="px-2 py-0.5 rounded bg-[#17171D] hover:bg-[#22222B] text-[#F5F2EB] border border-[#26262E] hover:border-[#D4AF37]/50 text-[11px] font-medium transition-colors cursor-pointer truncate max-w-full"
                >
                  {outNode.data.label}
                </button>
              ))}
            </div>
          ) : (
            <span className="text-[11px] italic text-[#5C5C66]">
              Nenhuma peça conectada na saída
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
