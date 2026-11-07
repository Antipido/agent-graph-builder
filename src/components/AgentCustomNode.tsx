import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  Compass,
  Hammer,
  ShieldAlert,
  PackageCheck,
  Sparkles,
  CheckCircle2,
  Repeat,
} from 'lucide-react';
import type { AgentNode, AgentNodeCategory } from '../types/graph';

const CATEGORY_STYLES: Record<
  AgentNodeCategory,
  {
    badge: string;
    borderTopColor: string;
    badgeBg: string;
    badgeText: string;
    icon: typeof Compass;
  }
> = {
  entrada: {
    badge: 'ENTRADA',
    borderTopColor: '#D4AF37',
    badgeBg: 'rgba(212, 175, 55, 0.12)',
    badgeText: '#D4AF37',
    icon: Compass,
  },
  trabalhador: {
    badge: 'TRABALHADOR',
    borderTopColor: '#E2D9C5',
    badgeBg: 'rgba(226, 217, 197, 0.10)',
    badgeText: '#E2D9C5',
    icon: Hammer,
  },
  supervisor: {
    badge: 'SUPERVISOR',
    borderTopColor: '#E07A5F',
    badgeBg: 'rgba(224, 122, 95, 0.14)',
    badgeText: '#E07A5F',
    icon: ShieldAlert,
  },
  entrega: {
    badge: 'ENTREGA',
    borderTopColor: '#4E9F6E',
    badgeBg: 'rgba(78, 159, 110, 0.14)',
    badgeText: '#4E9F6E',
    icon: PackageCheck,
  },
};

function getNodePreviewText(data: AgentNode['data']): string {
  switch (data.category) {
    case 'entrada':
      return data.objective?.trim() || '';
    case 'trabalhador':
      return data.instructions?.trim() || '';
    case 'supervisor': {
      const m = data.verificationMethodology?.trim() || '';
      const c = data.approvalCriteria?.trim() || '';
      if (m && c) return `${m} • ${c}`;
      return m || c;
    }
    case 'entrega':
      return data.consolidationInstructions?.trim() || '';
  }
}

function AgentCustomNodeComponent({ data, selected }: NodeProps<AgentNode>) {
  const style = CATEGORY_STYLES[data.category] ?? CATEGORY_STYLES.trabalhador;
  const Icon = style.icon;
  const preview = getNodePreviewText(data);

  return (
    <div
      style={{
        borderTopWidth: '3px',
        borderTopColor: style.borderTopColor,
      }}
      className={`group relative w-[276px] rounded-[10px] bg-[#17171D] transition-all duration-150 select-none ${
        selected
          ? 'border border-[#D4AF37] shadow-[0_0_0_2px_rgba(212,175,55,0.22),0_16px_36px_-8px_rgba(0,0,0,0.75)]'
          : 'border border-[#26262E] hover:border-[#383844] shadow-[0_10px_28px_-6px_rgba(0,0,0,0.6)]'
      }`}
    >
      {/* Left Port (Target / Entrada) */}
      <Handle
        type="target"
        position={Position.Left}
        className="agent-handle !-left-[7px]"
        title="Porta de Entrada (Recebe conexão)"
      />

      {/* Node Body */}
      <div className="p-3.5">
        {/* Header Row: Category Badge & Sub-meta */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span
            style={{
              backgroundColor: style.badgeBg,
              color: style.badgeText,
            }}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono-code font-semibold tracking-[0.08em] uppercase"
          >
            <Icon className="w-3 h-3 shrink-0" />
            {style.badge}
          </span>

          {/* Secondary contextual pill */}
          {data.category === 'supervisor' && (
            <div className="flex items-center gap-1">
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono-code border ${
                  data.evaluationMode === 'uau'
                    ? 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30'
                    : 'bg-[#26262E]/80 text-[#8E8E99] border-[#383844]'
                }`}
              >
                {data.evaluationMode === 'uau' ? (
                  <>
                    <Sparkles className="w-2.5 h-2.5" />
                    UAU
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    OBJ
                  </>
                )}
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono-code bg-[#0E0E12] text-[#8E8E99] border border-[#26262E]">
                <Repeat className="w-2.5 h-2.5 text-[#E07A5F]" />
                {data.maxRounds ?? 3}x
              </span>
            </div>
          )}

          {data.category === 'entrega' && data.expectedFormat && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-code bg-[#0E0E12] text-[#4E9F6E] border border-[#4E9F6E]/25 truncate max-w-[115px]">
              {data.expectedFormat}
            </span>
          )}
        </div>

        {/* Node Title */}
        <div className="font-display font-semibold text-[14px] text-[#F5F2EB] leading-snug truncate mb-1">
          {data.label || 'Peça sem nome'}
        </div>

        {/* Optional Role Subtitle for Trabalhador */}
        {data.category === 'trabalhador' && data.role && (
          <div className="text-[11px] font-medium text-[#D4AF37]/90 truncate mb-1.5">
            {data.role}
          </div>
        )}

        {/* 2-line instructions preview or italic warning */}
        <div className="mt-1.5 pt-2 border-t border-[#26262E]/80 min-h-[38px]">
          {preview ? (
            <p className="text-[12px] text-[#8E8E99] leading-[1.45] line-clamp-2 break-words">
              {preview}
            </p>
          ) : (
            <p className="text-[12px] italic text-[#5C5C66] leading-[1.45]">
              Sem instruções ainda — clique para escrever
            </p>
          )}
        </div>
      </div>

      {/* Right Port (Source / Saída) */}
      <Handle
        type="source"
        position={Position.Right}
        className="agent-handle !-right-[7px]"
        title="Porta de Saída (Arraste para conectar)"
      />
    </div>
  );
}

export const AgentCustomNode = memo(AgentCustomNodeComponent);
