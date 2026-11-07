import { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  FileDown,
  FileText,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import type { CompilationResult } from '../utils/compiler';
import type { ValidationReport } from '../types/graph';

interface ExportPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  compilation: CompilationResult;
  validationReport: ValidationReport;
}

function slugifyTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'meta-prompt-orquestracao'
  );
}

export function ExportPromptModal({
  isOpen,
  onClose,
  projectTitle,
  compilation,
  validationReport,
}: ExportPromptModalProps) {
  const [editablePrompt, setEditablePrompt] = useState(compilation.markdown);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEditablePrompt(compilation.markdown);
      setCopied(false);
    }
  }, [isOpen, compilation.markdown]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editablePrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // Fallback copy via textarea
      const textarea = document.createElement('textarea');
      textarea.value = editablePrompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }
  };

  const handleDownload = (ext: 'md' | 'txt') => {
    const mime = ext === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8';
    const blob = new Blob([editablePrompt], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slugifyTitle(projectTitle)}-orquestracao.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const charCount = editablePrompt.length;
  const approxTokens = Math.max(1, Math.round(charCount / 4));
  const isModified = editablePrompt !== compilation.markdown;

  return (
    <div
      id="export-prompt-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#121216] border border-[#26262E] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden">
        {/* Top Modal Header */}
        <div className="px-6 py-4 bg-[#17171D] border-b border-[#26262E] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-[15px] text-[#F5F2EB]">
                  Meta-Prompt de Orquestração Compilado
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                  Gauntlet Loop Engine
                </span>
              </div>
              <p className="text-[12px] text-[#8E8E99]">
                Revise ou edite livremente o Meta-Prompt antes de copiar ou baixar para sua IA
                orquestradora.
              </p>
            </div>
          </div>

          <button
            id="export-modal-close"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#0E0E12] hover:bg-[#22222B] text-[#8E8E99] hover:text-[#F5F2EB] border border-[#26262E] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Telemetry & Validation Strip */}
        <div className="px-6 py-2.5 bg-[#0E0E12] border-b border-[#26262E] flex flex-wrap items-center justify-between gap-3 shrink-0 text-[11.5px]">
          <div className="flex flex-wrap items-center gap-3 text-[#8E8E99] font-mono-code">
            <span className="inline-flex items-center gap-1.5 text-[#F5F2EB]">
              <Cpu className="w-3.5 h-3.5 text-[#D4AF37]" />
              {compilation.stats.phasesCount} fases
            </span>
            <span>•</span>
            <span>{compilation.stats.workersCount} Trabalhador(es)</span>
            <span>•</span>
            <span>{compilation.stats.supervisorsCount} Supervisor(es)</span>
            <span>•</span>
            <span>{compilation.stats.deliveriesCount} Entrega(s)</span>
            <span>•</span>
            <span className="text-[#D4AF37]">~{approxTokens} tokens</span>
          </div>

          <div className="flex items-center gap-2">
            {validationReport.isValid ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#4E9F6E]/15 text-[#4E9F6E] border border-[#4E9F6E]/30 font-mono-code text-[11px]">
                <CheckCircle2 className="w-3 h-3" />
                Topologia 100% validada
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#E07A5F]/15 text-[#E07A5F] border border-[#E07A5F]/30 font-mono-code text-[11px]">
                <AlertTriangle className="w-3 h-3" />
                {validationReport.issues.length} aviso(s) no grafo
              </span>
            )}

            {isModified && (
              <button
                type="button"
                onClick={() => setEditablePrompt(compilation.markdown)}
                className="px-2 py-0.5 rounded bg-[#17171D] hover:bg-[#22222B] text-[#8E8E99] hover:text-[#F5F2EB] border border-[#26262E] text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                title="Reverter edições manuais para o prompt compilado original"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar</span>
              </button>
            )}
          </div>
        </div>

        {/* Editable Meta-Prompt Textarea */}
        <div className="p-5 flex-1 overflow-hidden flex flex-col bg-[#121216]">
          <textarea
            id="compiled-metaprompt-textarea"
            value={editablePrompt}
            onChange={(e) => setEditablePrompt(e.target.value)}
            spellCheck={false}
            className="w-full flex-1 min-h-[360px] bg-[#0B0B0E] text-[#F5F2EB] font-mono-code text-[12.5px] leading-[1.65] p-4 rounded-xl border border-[#26262E] focus:border-[#D4AF37] focus:outline-none resize-none selection:bg-[#D4AF37]/30"
          />
        </div>

        {/* Modal Footer with Actions */}
        <div className="px-6 py-4 bg-[#17171D] border-t border-[#26262E] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {/* Baixar .MD */}
            <button
              id="btn-download-md"
              type="button"
              onClick={() => handleDownload('md')}
              className="h-9 px-3.5 rounded-lg bg-[#0E0E12] hover:bg-[#1F1F27] text-[#F5F2EB] border border-[#26262E] hover:border-[#383844] text-[12.5px] font-medium inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-[#D4AF37]" />
              <span>Baixar .MD</span>
            </button>

            {/* Baixar .TXT */}
            <button
              id="btn-download-txt"
              type="button"
              onClick={() => handleDownload('txt')}
              className="h-9 px-3.5 rounded-lg bg-[#0E0E12] hover:bg-[#1F1F27] text-[#F5F2EB] border border-[#26262E] hover:border-[#383844] text-[12.5px] font-medium inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#8E8E99]" />
              <span>Baixar .TXT</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-lg bg-transparent hover:bg-[#22222B] text-[#8E8E99] hover:text-[#F5F2EB] text-[12.5px] font-medium transition-colors cursor-pointer"
            >
              Fechar
            </button>

            {/* Copiar Prompt (Primary Gold Button with visual feedback) */}
            <button
              id="btn-copy-metaprompt"
              type="button"
              onClick={handleCopy}
              className={`h-9 px-5 rounded-lg font-display font-semibold text-[12.5px] inline-flex items-center gap-2 transition-all cursor-pointer ${
                copied
                  ? 'bg-[#4E9F6E] text-[#0B0B0E] shadow-[0_0_20px_rgba(78,159,110,0.4)]'
                  : 'bg-[#D4AF37] hover:bg-[#E2BE46] text-[#0B0B0E] shadow-[0_0_20px_rgba(212,175,55,0.28)]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Prompt Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Prompt</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
