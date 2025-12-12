import React, { useCallback } from 'react';
import {
  ReactFlow,
  type Node,
  type Edge,
  addEdge,
  type Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box } from '@mui/material';

export type TopologyType = 'star' | 'ring' | 'line' | 'bus' | 'mesh' | 'clean';

interface CanvasProps {
  topology?: TopologyType;
  deviceCount?: number;
}

const Canvas: React.FC<CanvasProps> = ({ topology, deviceCount }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const createTopology = (type: TopologyType, count: number) => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const centerX = 250;
    const centerY = 250;
    const radius = 150;

    switch (type.toLowerCase()) {
      case "clean":
        break;
      case 'star':
        // Center node
        newNodes.push({
          id: '0',
          data: { label: 'Center' },
          position: { x: centerX, y: centerY },
          style: { background: '#1976d2', color: '#fff', borderRadius: 8, padding: 10 },
        });
        for (let i = 1; i <= count; i++) {
          const angle = (2 * Math.PI * (i - 1)) / count;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          newNodes.push({
            id: i.toString(),
            data: { label: `Device ${i}` },
            position: { x, y },
            style: { background: '#f57c00', color: '#fff', borderRadius: 8, padding: 10 },
          });
          newEdges.push({ id: `0-${i}`, source: '0', target: i.toString() });
        }
        break;

      case 'ring':
        for (let i = 0; i < count; i++) {
          const angle = (2 * Math.PI * i) / count;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          newNodes.push({
            id: i.toString(),
            data: { label: `Device ${i + 1}` },
            position: { x, y },
            style: { background: '#f57c00', color: '#fff', borderRadius: 8, padding: 10 },
          });
        }
        for (let i = 0; i < count; i++) {
          newEdges.push({
            id: `e${i}-${(i + 1) % count}`,
            source: i.toString(),
            target: ((i + 1) % count).toString(),
          });
        }
        break;

      case 'line':
        for (let i = 0; i < count; i++) {
          const x = 100 + i * 100;
          const y = centerY;
          newNodes.push({
            id: i.toString(),
            data: { label: `Device ${i + 1}` },
            position: { x, y },
            style: { background: '#f57c00', color: '#fff', borderRadius: 8, padding: 10 },
          });
          if (i > 0) {
            newEdges.push({
              id: `e${i - 1}-${i}`,
              source: (i - 1).toString(),
              target: i.toString(),
            });
          }
        }
        break;

      case 'bus':
        // Main bus node
        newNodes.push({
          id: 'bus',
          data: { label: 'Bus' },
          position: { x: 100, y: centerY },
          style: { background: '#1976d2', color: '#fff', borderRadius: 8, padding: 10 },
        });
        for (let i = 0; i < count; i++) {
          const x = 200 + i * 100;
          const y = centerY;
          newNodes.push({
            id: `device-${i}`,
            data: { label: `Device ${i + 1}` },
            position: { x, y },
            style: { background: '#f57c00', color: '#fff', borderRadius: 8, padding: 10 },
          });
          newEdges.push({ id: `bus-${i}`, source: 'bus', target: `device-${i}` });
        }
        break;

      case 'mesh':
        for (let i = 0; i < count; i++) {
          const x = 100 + (i % 5) * 100;
          const y = centerY - 200 + Math.floor(i / 5) * 100;
          newNodes.push({
            id: i.toString(),
            data: { label: `Device ${i + 1}` },
            position: { x, y },
            style: { background: '#f57c00', color: '#fff', borderRadius: 8, padding: 10 },
          });
        }
        // Full mesh: connect each node to every other node
        for (let i = 0; i < count; i++) {
          for (let j = i + 1; j < count; j++) {
            newEdges.push({ id: `e${i}-${j}`, source: i.toString(), target: j.toString() });
          }
        }
        break;

      default:
        break;
    }

    setNodes(newNodes);
    setEdges(newEdges);
  };

  // Automatically create topology if props are passed
  React.useEffect(() => {
    if (topology && deviceCount !== undefined) {
      createTopology(topology, deviceCount);
    }
  }, [topology, deviceCount]);

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </Box>
  );
};

export default Canvas;
