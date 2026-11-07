import { useRef } from 'react';
import {
  Workflow,
  FolderKanban,
  Upload,
  Download,
  Trash2,
  Sparkles,
  Save,
  PencilLine,
} from 'lucide-react';

interface TopbarProps {
  projectTitle: string;
  onChangeTitle: (newTitle: string) => void;
  onOpenMyGraphs: () => void;
  onSaveToMyGraphs: () => void;
  onImportJson: (file: File) => void;
  onExportJson: () => void;
  onRequestClear: () => void;
  onOpenExportModal: () => void;
  savedCount: number;
  isValidGraph: boolean;
}

export function Topbar({
  projectTitle,
  onChangeTitle,
  onOpenMyGraphs,
  onSaveToMyGraphs,
  onImportJson,
  onExportJson,
  onRequestClear,
  onOpenExportModal,
  savedCount,
  isValidGraph,
}: TopbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
      e.target.value = '';
    }
  };

  return (
    <header
      id="topbar-header"
      className="h-[58px] w-full bg-[#121216] border-b border-[#26262E] px-4 flex items-center justify-between gap-4 shrink-0 z-20 select-none"
    >
      {/* Left: Brand Logo & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-[#17171D] border border-[#D4AF37]/40 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.12)] shrink-0">
          <Workflow className="w-4 h-4 text-[#D4AF37]" />
        </div>
        <div className="flex items-center gap-2 truncate">
          <h1 className="font-display font-bold text-[14px] tracking-tight text-[#F5F2EB] whitespace-nowrap">
            Graph Builder
          </h1>
          <span className="text-[#383844] font-light">|</span>
          <span className="text-[12px] font-medium text-[#8E8E99] whitespace-nowrap hidden sm:inline">
            Orquestrador de Agentes
          </span>
        </div>
      </div>

      {/* Center: Editable Project Title Input */}
      <div className="flex items-center justify-center flex-1 max-w-[340px]">
        <div className="relative flex items-center w-full group">
          <PencilLine className="w-3.5 h-3.5 text-[#5C5C66] group-hover:text-[#8E8E99] group-focus-within:text-[#D4AF37] absolute left-3 pointer-events-none transition-colors" />
          <input
            id="project-title-input"
            type="text"
            value={projectTitle}
            onChange={(e) => onChangeTitle(e.target.value)}
            placeholder="Meu Grafo"
            aria-label="Título do projeto"
            className="w-full bg-[#0E0E12] hover:bg-[#15151B] focus:bg-[#0E0E12] text-[#F5F2EB] font-display font-medium text-[13px] pl-8 pr-3 py-1.5 rounded-md border border-[#26262E] hover:border-[#383844] focus:border-[#D4AF37] focus:outline-none transition-all text-center truncate"
          />
        </div>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Quick Save to localStorage + Meus Grafos Modal */}
        <button
          id="btn-quick-save"
          type="button"
          onClick={onSaveToMyGraphs}
          title="Salvar grafo atual em Meus Grafos"
          className="h-8 px-2.5 rounded-md bg-[#17171D] hover:bg-[#1F1F27] text-[#F5F2EB] border border-[#26262E] hover:border-[#383844] text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Save className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="hidden xl:inline">Salvar</span>
        </button>

        <button
          id="btn-my-graphs"
          type="button"
          onClick={onOpenMyGraphs}
          className="h-8 px-2.5 rounded-md bg-[#17171D] hover:bg-[#1F1F27] text-[#F5F2EB] border border-[#26262E] hover:border-[#383844] text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <FolderKanban className="w-3.5 h-3.5 text-[#8E8E99]" />
          <span>Meus Grafos</span>
          <span className="ml-0.5 px-1.5 py-0.2 rounded bg-[#0E0E12] text-[#8E8E99] font-mono-code text-[10px] border border-[#26262E]">
            {savedCount}
          </span>
        </button>

        <div className="h-4 w-[1px] bg-[#26262E] mx-0.5 hidden md:block" />

        {/* Abrir JSON */}
        <button
          id="btn-open-json"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="h-8 px-2.5 rounded-md bg-[#17171D] hover:bg-[#1F1F27] text-[#8E8E99] hover:text-[#F5F2EB] border border-[#26262E] hover:border-[#383844] text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Importar estrutura de grafo a partir de arquivo .json"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Abrir JSON</span>
        </button>

        {/* Salvar JSON */}
        <button
          id="btn-save-json"
          type="button"
          onClick={onExportJson}
          className="h-8 px-2.5 rounded-md bg-[#17171D] hover:bg-[#1F1F27] text-[#8E8E99] hover:text-[#F5F2EB] border border-[#26262E] hover:border-[#383844] text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Exportar estrutura bruta do grafo em arquivo .json"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Salvar JSON</span>
        </button>

        {/* Limpar */}
        <button
          id="btn-clear-canvas"
          type="button"
          onClick={onRequestClear}
          className="h-8 px-2.5 rounded-md bg-[#17171D] hover:bg-[#2A1616] text-[#8E8E99] hover:text-[#E07A5F] border border-[#26262E] hover:border-[#E07A5F]/40 text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Resetar todo o canvas"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Limpar</span>
        </button>

        <div className="h-4 w-[1px] bg-[#26262E] mx-0.5" />

        {/* Exportar para a IA (Primary Gold CTA) */}
        <button
          id="btn-export-ai"
          type="button"
          onClick={onOpenExportModal}
          className="h-8 px-3.5 rounded-md bg-[#D4AF37] hover:bg-[#E2BE46] active:bg-[#C29E2B] text-[#0B0B0E] font-display font-semibold text-[12px] inline-flex items-center gap-1.5 shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 fill-[#0B0B0E]/20" />
          <span>Exportar para a IA</span>
          {isValidGraph && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#0B0B0E]/70 ml-0.5"
              title="Grafo válido e pronto"
            />
          )}
        </button>
      </div>
    </header>
  );
}
