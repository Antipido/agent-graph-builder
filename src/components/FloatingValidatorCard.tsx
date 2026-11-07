import { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import type { ValidationReport } from '../types/graph';

interface FloatingValidatorCardProps {
  report: ValidationReport;
  onSelectNode: (nodeId: string) => void;
  onOpenExportModal: () => void;
}

export function FloatingValidatorCard({
  report,
  onSelectNode,
  onOpenExportModal,
}: FloatingValidatorCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      id="floating-validator-card"
      className="absolute bottom-4 right-4 z-10 w-[336px] rounded-xl bg-[#121216]/95 backdrop-blur-md border border-[#26262E] shadow-[0_14px_38px_rgba(0,0,0,0.75)] overflow-hidden select-none transition-all duration-200"
    >
      {/* Header */}
      <div
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="px-3.5 py-2.5 bg-[#17171D] border-b border-[#26262E] flex items-center justify-between gap-2 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          {report.isValid ? (
            <span className="w-2 h-2 rounded-full bg-[#4E9F6E] shadow-[0_0_8px_#4E9F6E]" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-[#E07A5F] shadow-[0_0_8px_#E07A5F]" />
          )}
          <span className="font-mono-code text-[11px] font-semibold tracking-[0.08em] uppercase text-[#F5F2EB]">
            ANTES DE EXPORTAR
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!report.isValid && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-code font-semibold bg-[#E07A5F]/15 text-[#E07A5F] border border-[#E07A5F]/30">
              {report.issues.length}{' '}
              {report.issues.length === 1 ? 'pendência' : 'pendências'}
            </span>
          )}
          <button
            type="button"
            aria-label={isCollapsed ? 'Expandir checklist' : 'Recolher checklist'}
            className="text-[#8E8E99] hover:text-[#F5F2EB] transition-colors"
          >
            {isCollapsed ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      {!isCollapsed && (
        <div className="p-3.5">
          {report.isValid ? (
            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#4E9F6E]/12 border border-[#4E9F6E]/35">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#4E9F6E] shrink-0" />
                <div>
                  <div className="font-display font-semibold text-[12.5px] text-[#4E9F6E]">
                    Grafo pronto para exportação
                  </div>
                  <div className="text-[11px] text-[#8E8E99]">
                    Todas as peças estão conectadas e instruídas.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenExportModal}
                className="px-2.5 py-1.5 rounded-md bg-[#4E9F6E] hover:bg-[#5BB37D] text-[#0B0B0E] font-display font-semibold text-[11px] inline-flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Exportar</span>
              </button>
            </div>
          ) : (
            <ul className="space-y-1.5 max-h-[195px] overflow-y-auto pr-1">
              {report.issues.map((issue) => (
                <li key={issue.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (issue.nodeId) {
                        onSelectNode(issue.nodeId);
                      }
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md bg-[#0E0E12] border border-[#26262E] flex items-start justify-between gap-2 text-[11.5px] text-[#8E8E99] leading-snug transition-colors ${
                      issue.nodeId
                        ? 'hover:border-[#E07A5F]/50 hover:text-[#F5F2EB] cursor-pointer group'
                        : 'cursor-default'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#E07A5F] shrink-0 mt-0.5" />
                      <span>{issue.message}</span>
                    </div>
                    {issue.nodeId && (
                      <ArrowRight className="w-3 h-3 text-[#5C5C66] group-hover:text-[#D4AF37] shrink-0 mt-0.5 transition-colors" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
