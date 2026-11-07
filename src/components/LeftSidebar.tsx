import {
  Compass,
  Hammer,
  ShieldAlert,
  PackageCheck,
  Plus,
  GripVertical,
  HelpCircle,
} from 'lucide-react';
import type { AgentNodeCategory } from '../types/graph';

interface LeftSidebarProps {
  onAddNodeByCategory: (category: AgentNodeCategory) => void;
  hasEntradaNode: boolean;
}

const PIECES: Array<{
  category: AgentNodeCategory;
  title: string;
  description: string;
  accentColor: string;
  icon: typeof Compass;
}> = [
  {
    category: 'entrada',
    title: 'Entrada',
    description: 'Opcional: o objetivo global e insumo inicial do fluxo. Uma por grafo.',
    accentColor: '#D4AF37',
    icon: Compass,
  },
  {
    category: 'trabalhador',
    title: 'Trabalhador',
    description: 'Executa uma etapa do trabalho. É quem constrói.',
    accentColor: '#E2D9C5',
    icon: Hammer,
  },
  {
    category: 'supervisor',
    title: 'Supervisor',
    description:
      'Crítico cego: julga a entrega do trabalhador e devolve para refazer se reprovado.',
    accentColor: '#E07A5F',
    icon: ShieldAlert,
  },
  {
    category: 'entrega',
    title: 'Entrega',
    description:
      'Consolida vários laços em um artefato único — ou alimenta a fase seguinte.',
    accentColor: '#4E9F6E',
    icon: PackageCheck,
  },
];

export function LeftSidebar({ onAddNodeByCategory, hasEntradaNode }: LeftSidebarProps) {
  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    category: AgentNodeCategory
  ) => {
    event.dataTransfer.setData('application/reactflow-node-category', category);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside
      id="sidebar-left"
      className="w-[276px] h-full bg-[#121216] border-r border-[#26262E] flex flex-col justify-between shrink-0 z-10 select-none overflow-hidden"
    >
      {/* Top Section: PEÇAS */}
      <div className="p-4 overflow-y-auto flex-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-mono-code text-[11px] font-semibold tracking-[0.08em] uppercase text-[#8E8E99]">
            PEÇAS
          </h2>
          <span className="text-[11px] text-[#5C5C66]">Clique ou arraste</span>
        </div>

        <div className="space-y-2.5">
          {PIECES.map((piece) => {
            const Icon = piece.icon;
            const isEntradaDisabledBadge = piece.category === 'entrada' && hasEntradaNode;

            return (
              <div
                key={piece.category}
                id={`palette-piece-${piece.category}`}
                draggable
                onDragStart={(e) => handleDragStart(e, piece.category)}
                onClick={() => onAddNodeByCategory(piece.category)}
                style={{
                  borderTopWidth: '3px',
                  borderTopColor: piece.accentColor,
                }}
                className="group relative rounded-lg bg-[#17171D] hover:bg-[#1C1C24] border border-[#26262E] hover:border-[#383844] p-3 transition-all duration-150 cursor-grab active:cursor-grabbing shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        color: piece.accentColor,
                        backgroundColor: `${piece.accentColor}1A`,
                      }}
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-display font-semibold text-[13px] text-[#F5F2EB] group-hover:text-white transition-colors">
                      {piece.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {isEntradaDisabledBadge ? (
                      <span className="text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                        1/1 no grafo
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded bg-[#0E0E12] border border-[#26262E] group-hover:border-[#D4AF37]/50 flex items-center justify-center text-[#8E8E99] group-hover:text-[#D4AF37] transition-colors">
                        <Plus className="w-3 h-3" />
                      </span>
                    )}
                    <GripVertical className="w-3.5 h-3.5 text-[#5C5C66] group-hover:text-[#8E8E99] transition-colors" />
                  </div>
                </div>

                <p className="text-[11.5px] text-[#8E8E99] leading-[1.45]">
                  {piece.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Fixed Section: COMO USAR */}
      <div className="p-4 bg-[#0E0E12]/90 border-t border-[#26262E] shrink-0">
        <div className="flex items-center gap-1.5 mb-2.5">
          <HelpCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
          <h3 className="font-mono-code text-[11px] font-semibold tracking-[0.08em] uppercase text-[#F5F2EB]">
            COMO USAR
          </h3>
        </div>

        <ul className="space-y-2 text-[11.5px] text-[#8E8E99] leading-[1.4]">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 shrink-0" />
            <span>
              Arraste da <strong className="text-[#F5F2EB] font-medium">porta direita</strong> de
              uma peça até a <strong className="text-[#F5F2EB] font-medium">porta esquerda</strong>{' '}
              de outra.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E2D9C5] mt-1.5 shrink-0" />
            <span>
              Clique em uma peça para editar as instruções no painel direito.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F] mt-1.5 shrink-0" />
            <span>
              Clique em um fio/conexão ou selecione uma peça e aperte{' '}
              <kbd className="px-1 py-0.5 text-[10px] font-mono-code bg-[#17171D] text-[#F5F2EB] rounded border border-[#26262E]">
                Del
              </kbd>{' '}
              /{' '}
              <kbd className="px-1 py-0.5 text-[10px] font-mono-code bg-[#17171D] text-[#F5F2EB] rounded border border-[#26262E]">
                Backspace
              </kbd>{' '}
              para apagar.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4E9F6E] mt-1.5 shrink-0" />
            <span>
              <kbd className="px-1 py-0.5 text-[10px] font-mono-code bg-[#17171D] text-[#F5F2EB] rounded border border-[#26262E]">
                Ctrl + D
              </kbd>{' '}
              duplica a peça selecionada com suas instruções.
            </span>
          </li>
        </ul>
      </div>
    </aside>
  );
}
