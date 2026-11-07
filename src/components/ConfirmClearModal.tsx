import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmClearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClear: () => void;
}

export function ConfirmClearModal({
  isOpen,
  onClose,
  onConfirmClear,
}: ConfirmClearModalProps) {
  if (!isOpen) return null;

  return (
    <div
      id="confirm-clear-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-[#121216] border border-[#26262E] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.85)] overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#E07A5F]/15 border border-[#E07A5F]/35 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-[#E07A5F]" />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-[#0E0E12] hover:bg-[#22222B] text-[#8E8E99] hover:text-[#F5F2EB] border border-[#26262E] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="font-display font-bold text-[16px] text-[#F5F2EB] mb-1.5">
            Limpar todo o canvas?
          </h3>
          <p className="text-[13px] text-[#8E8E99] leading-relaxed">
            Esta ação removerá todas as peças e conexões do canvas atual. Seus grafos já salvos em{' '}
            <strong className="text-[#F5F2EB]">Meus Grafos</strong> continuarão intactos.
          </p>
        </div>

        <div className="px-6 py-3.5 bg-[#17171D] border-t border-[#26262E] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-lg bg-[#0E0E12] hover:bg-[#22222B] text-[#F5F2EB] border border-[#26262E] text-[12.5px] font-medium transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            id="btn-confirm-clear-canvas"
            type="button"
            onClick={() => {
              onConfirmClear();
              onClose();
            }}
            className="h-9 px-4 rounded-lg bg-[#E07A5F] hover:bg-[#EA8A70] text-[#0B0B0E] font-display font-semibold text-[12.5px] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Sim, limpar canvas</span>
          </button>
        </div>
      </div>
    </div>
  );
}
