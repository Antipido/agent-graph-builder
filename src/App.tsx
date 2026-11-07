import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  useViewport,
  type Connection,
  type OnMove,
} from '@xyflow/react';
import { CheckCircle2, Info } from 'lucide-react';

import type {
  AgentNode,
  AgentEdge,
  AgentNodeCategory,
  AgentNodeData,
  SavedGraph,
} from './types/graph';
import {
  INITIAL_DEMO_NODES,
  INITIAL_DEMO_EDGES,
  PRESET_TEMPLATES,
  createNewAgentNode,
} from './utils/presets';
import { validateAgentGraph } from './utils/validator';
import { computeHorizontalAutoLayout } from './utils/layout';
import { compileGraphToMetaPrompt } from './utils/compiler';
import {
  loadSavedGraphsFromStorage,
  saveGraphsToStorage,
  loadActiveWorkspace,
  saveActiveWorkspace,
  parseImportedGraphJson,
} from './utils/storage';

import { AgentCustomNode } from './components/AgentCustomNode';
import { Topbar } from './components/Topbar';
import { LeftSidebar } from './components/LeftSidebar';
import { RightInspector } from './components/RightInspector';
import { CanvasControlBar } from './components/CanvasControlBar';
import { FloatingValidatorCard } from './components/FloatingValidatorCard';
import { ExportPromptModal } from './components/ExportPromptModal';
import { MyGraphsModal } from './components/MyGraphsModal';
import { ConfirmClearModal } from './components/ConfirmClearModal';

const nodeTypes = {
  agentNode: AgentCustomNode,
};

interface ToastMessage {
  id: number;
  text: string;
  tone: 'gold' | 'emerald' | 'amber';
}

function GraphBuilderWorkspace() {
  // Load initial active workspace or default demo
  const initialWorkspace = useMemo(() => {
    const stored = loadActiveWorkspace();
    if (stored) return stored;
    return {
      id: PRESET_TEMPLATES[0].id,
      title: 'Arquitetura Paralela: Dados + UI Blueprint',
      nodes: INITIAL_DEMO_NODES,
      edges: INITIAL_DEMO_EDGES,
    };
  }, []);

  const [activeGraphId, setActiveGraphId] = useState<string>(initialWorkspace.id);
  const [projectTitle, setProjectTitle] = useState<string>(initialWorkspace.title);
  const [nodes, setNodes, onNodesChange] = useNodesState<AgentNode>(initialWorkspace.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AgentEdge>(initialWorkspace.edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    initialWorkspace.nodes[0]?.id ?? null
  );

  // Saved graphs in localStorage
  const [savedGraphs, setSavedGraphs] = useState<SavedGraph[]>(() =>
    loadSavedGraphsFromStorage()
  );

  // Modals state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isMyGraphsOpen, setIsMyGraphsOpen] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback(
    (text: string, tone: ToastMessage['tone'] = 'gold') => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
      setToast({ id: Date.now(), text, tone });
      toastTimerRef.current = window.setTimeout(() => {
        setToast(null);
      }, 2800);
    },
    []
  );

  const {
    fitView,
    zoomIn,
    zoomOut,
    setCenter,
    screenToFlowPosition,
  } = useReactFlow();
  const viewport = useViewport();
  const zoomPercent = Math.round((viewport.zoom || 1) * 100);

  // Persist active workspace to localStorage whenever title, nodes, or edges change
  useEffect(() => {
    saveActiveWorkspace({
      id: activeGraphId,
      title: projectTitle,
      nodes,
      edges,
    });
  }, [activeGraphId, projectTitle, nodes, edges]);

  // Keep selectedNode synced
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );

  // Select node helper that also updates React Flow's `selected` property
  const selectSingleNode = useCallback(
    (nodeId: string | null) => {
      setSelectedNodeId(nodeId);
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          selected: n.id === nodeId,
        }))
      );
    },
    [setNodes]
  );

  // Focus & center on a specific node
  const focusOnNode = useCallback(
    (nodeId: string) => {
      const target = nodes.find((n) => n.id === nodeId);
      if (!target) return;
      selectSingleNode(nodeId);
      setCenter(target.position.x + 138, target.position.y + 75, {
        zoom: Math.max(viewport.zoom, 1.05),
        duration: 380,
      });
    },
    [nodes, selectSingleNode, setCenter, viewport.zoom]
  );

  // Connect two nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      if (connection.source === connection.target) {
        showToast('Uma peça não pode se conectar a si mesma.', 'amber');
        return;
      }
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
            type: 'smoothstep',
          },
          eds
        )
      );
    },
    [setEdges, showToast]
  );

  // Update node data from RightInspector
  const handleUpdateNodeData = useCallback(
    (nodeId: string, partialData: Partial<AgentNodeData>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id !== nodeId) return node;
          return {
            ...node,
            data: {
              ...node.data,
              ...partialData,
            },
          };
        })
      );
    },
    [setNodes]
  );

  // Delete node and its connected edges
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      }
      showToast('Peça removida do grafo.', 'gold');
    },
    [selectedNodeId, setEdges, setNodes, showToast]
  );

  // Duplicate node with its instructions (Ctrl + D)
  const handleDuplicateNode = useCallback(
    (nodeId: string) => {
      const sourceNode = nodes.find((n) => n.id === nodeId);
      if (!sourceNode) return;

      if (sourceNode.data.category === 'entrada') {
        showToast('O grafo permite apenas uma peça de Entrada.', 'amber');
        return;
      }

      const newId = `${sourceNode.data.category}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 6)}`;
      const duplicatedNode: AgentNode = {
        id: newId,
        type: 'agentNode',
        position: {
          x: sourceNode.position.x + 48,
          y: sourceNode.position.y + 48,
        },
        selected: true,
        data: {
          ...sourceNode.data,
          label: `${sourceNode.data.label} (Cópia)`,
        },
      };

      setNodes((nds) => [
        ...nds.map((n) => ({ ...n, selected: false })),
        duplicatedNode,
      ]);
      setSelectedNodeId(newId);
      showToast(`Peça "${duplicatedNode.data.label}" duplicada.`, 'emerald');
    },
    [nodes, setNodes, showToast]
  );

  // Keyboard shortcut: Ctrl + D / Cmd + D to duplicate selected node
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditingInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        if (isEditingInput) return;
        e.preventDefault();
        if (selectedNodeId) {
          handleDuplicateNode(selectedNodeId);
        } else {
          showToast('Selecione uma peça no canvas para duplicar (Ctrl + D).', 'amber');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, handleDuplicateNode, showToast]);

  // Add node by clicking in LeftSidebar or Dropping onto Canvas
  const handleAddNodeAtPosition = useCallback(
    (category: AgentNodeCategory, customPos?: { x: number; y: number }) => {
      if (category === 'entrada') {
        const existingEntrada = nodes.find((n) => n.data.category === 'entrada');
        if (existingEntrada) {
          focusOnNode(existingEntrada.id);
          showToast(
            'Já existe uma peça de Entrada no grafo — selecionada para edição.',
            'gold'
          );
          return;
        }
      }

      const defaultPos = customPos ?? {
        x: Math.round((-viewport.x + 360) / (viewport.zoom || 1) + (nodes.length % 4) * 35),
        y: Math.round((-viewport.y + 220) / (viewport.zoom || 1) + (nodes.length % 3) * 35),
      };

      const newNode = createNewAgentNode(category, defaultPos, nodes);
      newNode.selected = true;

      setNodes((nds) => [...nds.map((n) => ({ ...n, selected: false })), newNode]);
      setSelectedNodeId(newNode.id);
      showToast(`Peça "${newNode.data.label}" adicionada ao canvas.`, 'emerald');
    },
    [focusOnNode, nodes, setNodes, showToast, viewport.x, viewport.y, viewport.zoom]
  );

  // Drag & Drop handlers on React Flow wrapper
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const category = event.dataTransfer.getData(
        'application/reactflow-node-category'
      ) as AgentNodeCategory;
      if (!category) return;

      const position = screenToFlowPosition({
        x: event.clientX - 135,
        y: event.clientY - 45,
      });

      handleAddNodeAtPosition(category, position);
    },
    [handleAddNodeAtPosition, screenToFlowPosition]
  );

  // Auto-layout horizontal ("Arrumar")
  const handleAutoLayout = useCallback(() => {
    if (nodes.length === 0) return;
    const arranged = computeHorizontalAutoLayout(nodes, edges);
    setNodes(arranged);
    window.setTimeout(() => {
      fitView({ padding: 0.22, duration: 400 });
    }, 40);
    showToast('Grafo organizado em colunas por profundidade.', 'gold');
  }, [edges, fitView, nodes, setNodes, showToast]);

  // "Foco" button in bottom-left bar
  const handleFocusAction = useCallback(() => {
    if (selectedNodeId) {
      focusOnNode(selectedNodeId);
    } else if (nodes.length > 0) {
      focusOnNode(nodes[0].id);
    }
  }, [focusOnNode, nodes, selectedNodeId]);

  // Save current graph to "Meus Grafos" in localStorage
  const handleSaveToMyGraphs = useCallback(() => {
    const now = new Date().toISOString();
    const cleanTitle = projectTitle.trim() || 'Meu Grafo';
    setSavedGraphs((prev) => {
      const existingIndex = prev.findIndex((g) => g.id === activeGraphId);
      let updated: SavedGraph[];
      if (existingIndex >= 0) {
        updated = prev.map((g, idx) =>
          idx === existingIndex
            ? { ...g, title: cleanTitle, updatedAt: now, nodes, edges }
            : g
        );
      } else {
        const newSaved: SavedGraph = {
          id: activeGraphId || `graph-${Date.now()}`,
          title: cleanTitle,
          createdAt: now,
          updatedAt: now,
          nodes,
          edges,
        };
        updated = [newSaved, ...prev];
      }
      saveGraphsToStorage(updated);
      return updated;
    });
    showToast(`Grafo "${cleanTitle}" salvo em Meus Grafos!`, 'emerald');
  }, [activeGraphId, edges, nodes, projectTitle, showToast]);

  const handleSaveCurrentAsNewInModal = useCallback(() => {
    const now = new Date().toISOString();
    const newId = `graph-${Date.now()}`;
    const cleanTitle = projectTitle.trim() || 'Meu Grafo';
    const newEntry: SavedGraph = {
      id: newId,
      title: cleanTitle,
      createdAt: now,
      updatedAt: now,
      nodes,
      edges,
    };
    setSavedGraphs((prev) => {
      const next = [newEntry, ...prev];
      saveGraphsToStorage(next);
      return next;
    });
    setActiveGraphId(newId);
    showToast(`Cópia salva em Meus Grafos: "${cleanTitle}"`, 'emerald');
  }, [edges, nodes, projectTitle, showToast]);

  const handleLoadSavedGraph = useCallback(
    (graph: SavedGraph) => {
      setActiveGraphId(graph.id);
      setProjectTitle(graph.title);
      setNodes(graph.nodes);
      setEdges(graph.edges);
      setSelectedNodeId(graph.nodes[0]?.id ?? null);
      window.setTimeout(() => {
        fitView({ padding: 0.22, duration: 350 });
      }, 50);
      showToast(`Grafo "${graph.title}" carregado.`, 'gold');
    },
    [fitView, setEdges, setNodes, showToast]
  );

  const handleRenameSavedGraph = useCallback(
    (id: string, newTitle: string) => {
      setSavedGraphs((prev) => {
        const next = prev.map((g) =>
          g.id === id ? { ...g, title: newTitle, updatedAt: new Date().toISOString() } : g
        );
        saveGraphsToStorage(next);
        return next;
      });
      if (id === activeGraphId) {
        setProjectTitle(newTitle);
      }
      showToast('Título do grafo atualizado.', 'gold');
    },
    [activeGraphId, showToast]
  );

  const handleDeleteSavedGraph = useCallback(
    (id: string) => {
      setSavedGraphs((prev) => {
        const next = prev.filter((g) => g.id !== id);
        saveGraphsToStorage(next);
        return next;
      });
      showToast('Grafo removido da lista.', 'amber');
    },
    [showToast]
  );

  const handleRestorePresets = useCallback(() => {
    setSavedGraphs((prev) => {
      const existingIds = new Set(prev.map((g) => g.id));
      const missingPresets = PRESET_TEMPLATES.filter((p) => !existingIds.has(p.id));
      const next = [...missingPresets, ...prev];
      saveGraphsToStorage(next);
      return next;
    });
    showToast('Templates de exemplo restaurados.', 'emerald');
  }, [showToast]);

  // Export JSON
  const handleExportJson = useCallback(() => {
    const payload = {
      id: activeGraphId,
      title: projectTitle.trim() || 'Meu Grafo',
      exportedAt: new Date().toISOString(),
      nodes,
      edges,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const slug =
      (projectTitle || 'meu-grafo')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'meu-grafo';
    a.href = url;
    a.download = `${slug}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Estrutura JSON exportada com sucesso.', 'emerald');
  }, [activeGraphId, edges, nodes, projectTitle, showToast]);

  // Import JSON
  const handleImportJson = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = String(event.target?.result || '');
          const parsed = parseImportedGraphJson(content);
          const importedTitle =
            parsed.title || file.name.replace(/\.json$/i, '') || 'Grafo Importado';
          setActiveGraphId(`imported-${Date.now()}`);
          setProjectTitle(importedTitle);
          setNodes(parsed.nodes);
          setEdges(parsed.edges);
          setSelectedNodeId(parsed.nodes[0]?.id ?? null);
          window.setTimeout(() => {
            fitView({ padding: 0.22, duration: 350 });
          }, 50);
          showToast(`JSON "${importedTitle}" importado com sucesso!`, 'emerald');
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Erro ao ler JSON.';
          showToast(msg, 'amber');
        }
      };
      reader.readAsText(file);
    },
    [fitView, setEdges, setNodes, showToast]
  );

  // Confirm Clear Canvas
  const handleConfirmClearCanvas = useCallback(() => {
    setActiveGraphId(`graph-${Date.now()}`);
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    showToast('Canvas limpo.', 'gold');
  }, [setEdges, setNodes, showToast]);

  // Live reactive validation report
  const validationReport = useMemo(
    () => validateAgentGraph(nodes, edges),
    [nodes, edges]
  );

  // Live compiled Meta-Prompt
  const compilationResult = useMemo(
    () => compileGraphToMetaPrompt(projectTitle || 'Meu Grafo', nodes, edges),
    [projectTitle, nodes, edges]
  );

  const hasEntradaNode = useMemo(
    () => nodes.some((n) => n.data.category === 'entrada'),
    [nodes]
  );

  // Fit view on initial mount
  const didInitialFit = useRef(false);
  const handleInitMove: OnMove = useCallback(() => {
    // no-op, viewport hook tracks zoom
  }, []);

  useEffect(() => {
    if (!didInitialFit.current && nodes.length > 0) {
      didInitialFit.current = true;
      window.setTimeout(() => {
        fitView({ padding: 0.22, duration: 300 });
      }, 80);
    }
  }, [fitView, nodes.length]);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#0B0B0E] text-[#F5F2EB]">
      {/* 1. TOPBAR */}
      <Topbar
        projectTitle={projectTitle}
        onChangeTitle={setProjectTitle}
        onOpenMyGraphs={() => setIsMyGraphsOpen(true)}
        onSaveToMyGraphs={handleSaveToMyGraphs}
        onImportJson={handleImportJson}
        onExportJson={handleExportJson}
        onRequestClear={() => setIsConfirmClearOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        savedCount={savedGraphs.length}
        isValidGraph={validationReport.isValid}
      />

      {/* MAIN 3-COLUMN WORKSPACE */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        {/* 2. LEFT SIDEBAR (PEÇAS & COMO USAR) */}
        <LeftSidebar
          onAddNodeByCategory={(cat) => handleAddNodeAtPosition(cat)}
          hasEntradaNode={hasEntradaNode}
        />

        {/* 3. CENTRAL CANVAS & FLOATING HUDs */}
        <main
          id="canvas-central-workspace"
          className="flex-1 h-full relative bg-[#0B0B0E] overflow-hidden"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Subtle Top Toast Notification */}
          {toast && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
              <div
                className={`px-3.5 py-2 rounded-lg border backdrop-blur-md shadow-lg flex items-center gap-2 text-[12px] font-medium ${
                  toast.tone === 'emerald'
                    ? 'bg-[#121D17]/95 border-[#4E9F6E]/50 text-[#F5F2EB]'
                    : toast.tone === 'amber'
                    ? 'bg-[#211513]/95 border-[#E07A5F]/50 text-[#F5F2EB]'
                    : 'bg-[#17171D]/95 border-[#D4AF37]/50 text-[#F5F2EB]'
                }`}
              >
                {toast.tone === 'emerald' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4E9F6E]" />
                ) : (
                  <Info className="w-3.5 h-3.5 text-[#D4AF37]" />
                )}
                <span>{toast.text}</span>
              </div>
            </div>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onMove={handleInitMove}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId(null)}
            deleteKeyCode={['Delete', 'Backspace']}
            defaultEdgeOptions={{
              type: 'smoothstep',
            }}
            minZoom={0.25}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={22}
              size={1.5}
              color="#222228"
            />
          </ReactFlow>

          {/* Bottom-Left Controls: Zoom %, Enquadrar, Arrumar, Foco */}
          <CanvasControlBar
            zoomPercent={zoomPercent}
            onZoomIn={() => zoomIn({ duration: 200 })}
            onZoomOut={() => zoomOut({ duration: 200 })}
            onFitView={() => fitView({ padding: 0.22, duration: 350 })}
            onAutoLayout={handleAutoLayout}
            onFocusSelected={handleFocusAction}
            hasSelectedNode={Boolean(selectedNodeId)}
          />

          {/* Bottom-Right Floating Card: ANTES DE EXPORTAR */}
          <FloatingValidatorCard
            report={validationReport}
            onSelectNode={focusOnNode}
            onOpenExportModal={() => setIsExportModalOpen(true)}
          />
        </main>

        {/* 4. RIGHT SIDEBAR (DYNAMIC PROPERTY INSPECTOR) */}
        <RightInspector
          selectedNode={selectedNode}
          nodes={nodes}
          edges={edges}
          onUpdateNodeData={handleUpdateNodeData}
          onDeleteNode={handleDeleteNode}
          onDuplicateNode={handleDuplicateNode}
          onSelectNode={focusOnNode}
        />
      </div>

      {/* MODALS */}
      <ExportPromptModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        projectTitle={projectTitle || 'Meu Grafo'}
        compilation={compilationResult}
        validationReport={validationReport}
      />

      <MyGraphsModal
        isOpen={isMyGraphsOpen}
        onClose={() => setIsMyGraphsOpen(false)}
        savedGraphs={savedGraphs}
        activeGraphId={activeGraphId}
        currentTitle={projectTitle || 'Meu Grafo'}
        onLoadGraph={handleLoadSavedGraph}
        onRenameGraph={handleRenameSavedGraph}
        onDeleteGraph={handleDeleteSavedGraph}
        onSaveCurrentAsNew={handleSaveCurrentAsNewInModal}
        onRestorePresets={handleRestorePresets}
      />

      <ConfirmClearModal
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        onConfirmClear={handleConfirmClearCanvas}
      />
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <GraphBuilderWorkspace />
    </ReactFlowProvider>
  );
}
