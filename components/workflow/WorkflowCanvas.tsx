"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";

import { ToolNode } from "./ToolNode";
import { InputNode } from "./InputNode";
import { OutputNode } from "./OutputNode";

const nodeTypes = {
  tool: ToolNode,
  input: InputNode,
  output: OutputNode,
};

interface WorkflowCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onChange?: (nodes: Node[], edges: Edge[]) => void;
  readOnly?: boolean;
}

export function WorkflowCanvas({
  initialNodes = [],
  initialEdges = [],
  onSave,
  onChange,
  readOnly = false,
}: WorkflowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<unknown>(null);

  // Notify parent of changes
  useEffect(() => {
    onChange?.(nodes, edges);
  }, [nodes, edges, onChange]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      const toolData = event.dataTransfer.getData("tool-data");

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = (reactFlowInstance as { screenToFlowPosition?: (pos: { x: number; y: number }) => { x: number; y: number } })?.screenToFlowPosition?.({
        x: event.clientX,
        y: event.clientY,
      }) || { x: event.clientX, y: event.clientY };

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: toolData ? JSON.parse(toolData) : { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const handleSave = () => {
    if (onSave) {
      onSave(nodes, edges);
    }
  };

  return (
    <div ref={reactFlowWrapper} className="w-full h-[600px] bg-background rounded-lg border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        onInit={setReactFlowInstance}
        onDrop={readOnly ? undefined : onDrop}
        onDragOver={readOnly ? undefined : onDragOver}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-muted/30"
      >
        <Controls />
        <MiniMap 
          nodeStrokeWidth={3}
          zoomable
          pannable
          className="bg-background border rounded-lg"
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        
        {!readOnly && (
          <Panel position="top-right" className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Save Workflow
            </button>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
