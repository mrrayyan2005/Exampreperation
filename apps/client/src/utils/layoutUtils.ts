import dagre from 'dagre';
import { Node, Edge } from 'reactflow';

/**
 * Apply automatic layout to flowchart nodes using Dagre algorithm
 * Handles hierarchical tree layout with customizable direction
 */

export interface LayoutOptions {
  direction?: 'TB' | 'BT' | 'LR' | 'RL'; // Top-Bottom, Bottom-Top, Left-Right, Right-Left
  nodeWidth?: number;
  nodeHeight?: number;
  rankSep?: number; // Separation between ranks
  nodeSep?: number; // Separation between nodes
}

/**
 * Calculate node dimensions based on label length
 */
function getNodeDimensions(node: Node): { width: number; height: number } {
  const label = node.data?.label || '';
  const baseWidth = 180;
  const baseHeight = 80;
  
  // Adjust width based on label length
  const estimatedWidth = Math.max(baseWidth, Math.min(label.length * 8, 400));
  
  // Adjust height if there's a description
  const hasDescription = node.data?.description && node.data.description.length > 0;
  const estimatedHeight = hasDescription ? baseHeight + 30 : baseHeight;
  
  return {
    width: node.width || estimatedWidth,
    height: node.height || estimatedHeight
  };
}

/**
 * Apply Dagre layout algorithm to position nodes automatically
 * @param nodes - ReactFlow nodes to position
 * @param edges - ReactFlow edges defining connections
 * @param options - Layout configuration options
 * @returns Positioned nodes with x,y coordinates
 */
export function applyDagreLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): Node[] {
  const {
    direction = 'TB',
    nodeWidth = 180,
    nodeHeight = 80,
    rankSep = 80,
    nodeSep = 50
  } = options;

  // Create a new directed graph
  const dagreGraph = new dagre.graphlib.Graph();
  
  // Set graph properties
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: rankSep,
    nodesep: nodeSep,
    marginx: 20,
    marginy: 20
  });

  // Add nodes to the graph with their dimensions
  nodes.forEach((node) => {
    const dimensions = getNodeDimensions(node);
    dagreGraph.setNode(node.id, dimensions);
  });

  // Add edges to the graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate the layout
  dagre.layout(dagreGraph);

  // Apply calculated positions to nodes
  const positionedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    // Dagre provides center coordinates, but ReactFlow uses top-left
    // so we need to adjust by half the width/height
    const dimensions = getNodeDimensions(node);
    
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - dimensions.width / 2,
        y: nodeWithPosition.y - dimensions.height / 2
      },
      // Store dimensions if not already set
      width: dimensions.width,
      height: dimensions.height
    };
  });

  return positionedNodes;
}

/**
 * Apply hierarchical layout (top-down)
 * Best for concept breakdowns and taxonomies
 */
export function applyHierarchicalLayout(nodes: Node[], edges: Edge[]): Node[] {
  return applyDagreLayout(nodes, edges, {
    direction: 'TB',
    rankSep: 100,
    nodeSep: 60
  });
}

/**
 * Apply temporal/process layout (left-right)
 * Best for sequential flows and timelines
 */
export function applyTemporalLayout(nodes: Node[], edges: Edge[]): Node[] {
  return applyDagreLayout(nodes, edges, {
    direction: 'LR',
    rankSep: 120,
    nodeSep: 50
  });
}

/**
 * Apply relational layout (top-down with more spacing)
 * Best for interconnected concepts and network structures
 */
export function applyRelationalLayout(nodes: Node[], edges: Edge[]): Node[] {
  return applyDagreLayout(nodes, edges, {
    direction: 'TB',
    rankSep: 80,
    nodeSep: 80
  });
}

/**
 * Auto-detect best layout based on flowchart metadata
 */
export function applyAutoLayout(
  nodes: Node[],
  edges: Edge[],
  metadata?: { flowchartType?: 'hierarchical' | 'temporal' | 'relational' }
): Node[] {
  const flowchartType = metadata?.flowchartType || 'hierarchical';
  
  switch (flowchartType) {
    case 'hierarchical':
      return applyHierarchicalLayout(nodes, edges);
    case 'temporal':
      return applyTemporalLayout(nodes, edges);
    case 'relational':
      return applyRelationalLayout(nodes, edges);
    default:
      return applyHierarchicalLayout(nodes, edges);
  }
}

/**
 * Get layout bounds (useful for centering viewport)
 */
export function getLayoutBounds(nodes: Node[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    const { x, y } = node.position;
    const width = node.width || 180;
    const height = node.height || 80;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  };
}
