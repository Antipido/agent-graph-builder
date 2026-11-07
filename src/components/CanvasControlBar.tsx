import { Maximize2, LayoutGrid, Crosshair, ZoomIn, ZoomOut } from 'lucide-react';

interface CanvasControlBarProps {
  zoomPercent: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onAutoLayout: () => void;
  onFocusSelected: () => void;
  hasSelectedNode: boolean;
}

export function CanvasControlBar({
  zoomPercent,
  onZoomIn,
  onZoomOut,
  onFitView,
  onAutoLayout,
  onFocusSelected,
  hasSelectedNode,
}: CanvasControlBarProps) {
  return (
    <div
      id="canvas-control-bar"
      className="absolute bottom-4 left-4 z-10 flex items-center gap-1 p-1.5 rounded-lg bg-[#121216]/95 backdrop-blur-md border border-[#26262E] shadow-[0_12px_32px_rgba(0,0,0,0.65)] select-none"
    >
      {/* Zoom controls & percentage */}
      <div className="flex items-center bg-[#0E0E12] rounded-md border border-[#26262E] px-1 py-0.5">
        <button
          id="btn-zoom-out"
          type="button"
          onClick={onZoomOut}
          title="Diminuir zoom"
          className="w-6 h-6 rounded hover:bg-[#1C1C24] text-[#8E8E99] hover:text-[#F5F2EB] flex items-center justify-center transition-colors cursor-pointer"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span
          id="canvas-zoom-indicator"
          className="px-2 font-mono-code text-[11px] font-medium text-[#F5F2EB] min-w-[46px] text-center"
        >
          {zoomPercent}%
        </span>
        <button
          id="btn-zoom-in"
          type="button"
          onClick={onZoomIn}
          title="Aumentar zoom"
          className="w-6 h-6 rounded hover:bg-[#1C1C24] text-[#8E8E99] hover:text-[#F5F2EB] flex items-center justify-center transition-colors cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="h-4 w-[1px] bg-[#26262E] mx-0.5" />

      {/* Enquadrar (fitView) */}
      <button
        id="btn-fit-view"
        type="button"
        onClick={onFitView}
        title="Enquadrar todo o grafo na tela"
        className="h-7 px-2.5 rounded-md hover:bg-[#1C1C24] text-[#8E8E99] hover:text-[#F5F2EB] text-[11.5px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <Maximize2 className="w-3.5 h-3.5 text-[#D4AF37]" />
        <span>Enquadrar</span>
      </button>

      {/* Arrumar (Auto-layout horizontal) */}
      <button
        id="btn-auto-layout"
        type="button"
        onClick={onAutoLayout}
        title="Organizar colunas automaticamente por profundidade do grafo"
        className="h-7 px-2.5 rounded-md hover:bg-[#1C1C24] text-[#8E8E99] hover:text-[#F5F2EB] text-[11.5px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <LayoutGrid className="w-3.5 h-3.5 text-[#E2D9C5]" />
        <span>Arrumar</span>
      </button>

      {/* Foco */}
      <button
        id="btn-focus-node"
        type="button"
        onClick={onFocusSelected}
        title={
          hasSelectedNode
            ? 'Centralizar foco na peça selecionada'
            : 'Focar na peça inicial do grafo'
        }
        className={`h-7 px-2.5 rounded-md text-[11.5px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
          hasSelectedNode
            ? 'bg-[#D4AF37]/15 text-[#D4AF37] hover:bg-[#D4AF37]/25'
            : 'hover:bg-[#1C1C24] text-[#8E8E99] hover:text-[#F5F2EB]'
        }`}
      >
        <Crosshair className="w-3.5 h-3.5" />
        <span>Foco</span>
      </button>
    </div>
  );
}
