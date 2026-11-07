import { useState } from 'react';
import {
  X,
  FolderKanban,
  Play,
  Pencil,
  Trash2,
  Check,
  PlusCircle,
  Clock,
  Layers,
  RotateCcw,
} from 'lucide-react';
import type { SavedGraph } from '../types/graph';

interface MyGraphsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedGraphs: SavedGraph[];
  activeGraphId: string;
  currentTitle: string;
  onLoadGraph: (graph: SavedGraph) => void;
  onRenameGraph: (id: string, newTitle: string) => void;
  onDeleteGraph: (id: string) => void;
  onSaveCurrentAsNew: () => void;
  onRestorePresets: () => void;
}

export function MyGraphsModal({
  isOpen,
  onClose,
  savedGraphs,
  activeGraphId,
  currentTitle,
  onLoadGraph,
  onRenameGraph,
  onDeleteGraph,
  onSaveCurrentAsNew,
  onRestorePresets,
}: MyGraphsModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  if (!isOpen) return null;

  const startEditing = (graph: SavedGraph) => {
    setEditingId(graph.id);
    setEditingTitle(graph.title);
  };

  const commitRename = (id: string) => {
    const trimmed = editingTitle.trim();
    if (trimmed) {
      onRenameGraph(id, trimmed);
    }
    setEditingId(null);
  };

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(iso));
    } catch {
      return 'Recente';
    }
  };

  return (
    <div
      id="my-graphs-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl max-h-[85vh] bg-[#121216] border border-[#26262E] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#17171D] border-b border-[#26262E] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center">
              <FolderKanban className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="font-display font-bold text-[15px] text-[#F5F2EB]">
                Meus Grafos Salvos
              </h2>
              <p className="text-[12px] text-[#8E8E99]">
                Gerencie seus fluxos salvos no navegador (`localStorage`).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#0E0E12] hover:bg-[#22222B] text-[#8E8E99] hover:text-[#F5F2EB] border border-[#26262E] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Bar: Save Current Snapshot */}
        <div className="px-6 py-3 bg-[#0E0E12] border-b border-[#26262E] flex flex-wrap items-center justify-between gap-3">
          <div className="text-[12px] text-[#8E8E99]">
            Projeto ativo: <strong className="text-[#F5F2EB]">{currentTitle}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRestorePresets}
              className="h-8 px-2.5 rounded-md bg-[#17171D] hover:bg-[#22222B] text-[#8E8E99] hover:text-[#F5F2EB] border border-[#26262E] text-[11.5px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Restaurar grafos de demonstração padrão"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Exemplos</span>
            </button>
            <button
              id="btn-save-new-graph-snapshot"
              type="button"
              onClick={onSaveCurrentAsNew}
              className="h-8 px-3 rounded-md bg-[#D4AF37] hover:bg-[#E2BE46] text-[#0B0B0E] font-display font-semibold text-[11.5px] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Salvar Grafo Atual na Lista</span>
            </button>
          </div>
        </div>

        {/* Saved Graphs List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-2.5">
          {savedGraphs.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-xl bg-[#0E0E12] border border-[#26262E]">
              <FolderKanban className="w-8 h-8 text-[#5C5C66] mx-auto mb-2" />
              <p className="text-[13px] font-medium text-[#F5F2EB] mb-1">
                Nenhum grafo salvo ainda
              </p>
              <p className="text-[12px] text-[#8E8E99]">
                Clique em &ldquo;Salvar Grafo Atual na Lista&rdquo; acima para guardar seu fluxo no
                navegador.
              </p>
            </div>
          ) : (
            savedGraphs.map((graph) => {
              const isCurrent = graph.id === activeGraphId;
              const isEditing = editingId === graph.id;

              return (
                <div
                  key={graph.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-[#17171D] border-[#D4AF37]/60 shadow-[0_0_16px_rgba(212,175,55,0.1)]'
                      : 'bg-[#17171D]/70 hover:bg-[#17171D] border-[#26262E] hover:border-[#383844]'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitRename(graph.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                          className="flex-1 bg-[#0E0E12] text-[#F5F2EB] text-[13px] px-2.5 py-1 rounded border border-[#D4AF37] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => commitRename(graph.id)}
                          className="h-7 px-2.5 rounded bg-[#D4AF37] text-[#0B0B0E] text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Salvar</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-semibold text-[13.5px] text-[#F5F2EB] truncate">
                          {graph.title}
                        </h3>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-code bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 shrink-0">
                            Ativo
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-1 text-[11px] text-[#8E8E99] font-mono-code">
                      <span className="inline-flex items-center gap-1">
                        <Layers className="w-3 h-3 text-[#D4AF37]" />
                        {graph.nodes.length} peças • {graph.edges.length} conexões
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(graph.updatedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Carregar, Renomear, Excluir */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onLoadGraph(graph);
                        onClose();
                      }}
                      className="h-8 px-3 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0B0B0E] border border-[#D4AF37]/35 font-display font-semibold text-[11.5px] inline-flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Carregar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => startEditing(graph)}
                      title="Renomear grafo"
                      className="w-8 h-8 rounded-lg bg-[#0E0E12] hover:bg-[#22222B] text-[#8E8E99] hover:text-[#F5F2EB] border border-[#26262E] flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteGraph(graph.id)}
                      title="Excluir grafo salvo"
                      className="w-8 h-8 rounded-lg bg-[#0E0E12] hover:bg-[#2E1616] text-[#8E8E99] hover:text-[#E07A5F] border border-[#26262E] hover:border-[#E07A5F]/40 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#17171D] border-t border-[#26262E] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-4 rounded-lg bg-[#0E0E12] hover:bg-[#22222B] text-[#F5F2EB] border border-[#26262E] text-[12px] font-medium transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
