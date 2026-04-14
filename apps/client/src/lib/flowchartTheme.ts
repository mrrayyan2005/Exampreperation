// Comprehensive theme system for flowcharts
// Based on flowchart-fun's FFTheme with enhancements

export type LayoutName =
  | 'dagre'
  | 'cose'
  | 'cose-bilkent'
  | 'fcose'
  | 'breadthfirst'
  | 'concentric'
  | 'circle'
  | 'grid';

export type LayoutDirection = 'TB' | 'LR' | 'RL' | 'BT';

export type NodeShape = 'rectangle' | 'roundrectangle' | 'ellipse' | 'diamond' | 'hexagon';

export type CurveStyle = 'bezier' | 'taxi' | 'round-taxi' | 'straight' | 'haystack';

export type ArrowShape =
  | 'none'
  | 'triangle'
  | 'vee'
  | 'triangle-backcurve'
  | 'circle';

export interface FlowchartTheme {
  // Metadata
  name: string;
  isDefault?: boolean;

  // Global
  backgroundColor: string;
  fontFamily: string;
  lineHeight: number;

  // Layout
  layoutName: LayoutName;
  layoutDirection: LayoutDirection;
  spacingFactor: number;
  animateLayout: boolean;
  animationDuration: number;

  // Node styling
  nodeShape: NodeShape;
  nodeBackgroundColor: string;
  nodeBorderColor: string;
  nodeBorderWidth: number;
  nodeTextColor: string;
  nodeFontSize: number;
  nodePadding: number;
  nodeCornerRadius: number;
  nodeShadowBlur: number;
  nodeShadowColor: string;
  nodeShadowOpacity: number;
  textMaxWidth: number;

  // Edge styling
  edgeColor: string;
  edgeWidth: number;
  curveStyle: CurveStyle;
  sourceArrowShape: ArrowShape;
  targetArrowShape: ArrowShape;
  arrowScale: number;
  edgeTextSize: number;
  edgeTextColor: string;

  // Color palette for .color_* classes
  colors: {
    red: string;
    orange: string;
    yellow: string;
    green: string;
    blue: string;
    purple: string;
    cyan: string;
    pink: string;
    gray: string;
  };
}

// Default light theme
export const defaultLightTheme: FlowchartTheme = {
  name: 'Default Light',
  isDefault: true,

  backgroundColor: '#ffffff',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  lineHeight: 1.5,

  layoutName: 'dagre',
  layoutDirection: 'TB',
  spacingFactor: 1.2,
  animateLayout: true,
  animationDuration: 300,

  nodeShape: 'roundrectangle',
  nodeBackgroundColor: '#f8fafc',
  nodeBorderColor: '#e2e8f0',
  nodeBorderWidth: 2,
  nodeTextColor: '#1e293b',
  nodeFontSize: 14,
  nodePadding: 16,
  nodeCornerRadius: 8,
  nodeShadowBlur: 0,
  nodeShadowColor: '#000000',
  nodeShadowOpacity: 0,
  textMaxWidth: 160,

  edgeColor: '#64748b',
  edgeWidth: 2,
  curveStyle: 'bezier',
  sourceArrowShape: 'none',
  targetArrowShape: 'triangle',
  arrowScale: 1.2,
  edgeTextSize: 12,
  edgeTextColor: '#64748b',

  colors: {
    red: '#ef4444',
    orange: '#f97316',
    yellow: '#eab308',
    green: '#22c55e',
    blue: '#3b82f6',
    purple: '#a855f7',
    cyan: '#06b6d4',
    pink: '#ec4899',
    gray: '#6b7280',
  },
};

// Default dark theme
export const defaultDarkTheme: FlowchartTheme = {
  name: 'Default Dark',
  isDefault: true,

  backgroundColor: '#0f172a',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  lineHeight: 1.5,

  layoutName: 'dagre',
  layoutDirection: 'TB',
  spacingFactor: 1.2,
  animateLayout: true,
  animationDuration: 300,

  nodeShape: 'roundrectangle',
  nodeBackgroundColor: '#1e293b',
  nodeBorderColor: '#334155',
  nodeBorderWidth: 2,
  nodeTextColor: '#f1f5f9',
  nodeFontSize: 14,
  nodePadding: 16,
  nodeCornerRadius: 8,
  nodeShadowBlur: 10,
  nodeShadowColor: '#000000',
  nodeShadowOpacity: 0.3,
  textMaxWidth: 160,

  edgeColor: '#64748b',
  edgeWidth: 2,
  curveStyle: 'bezier',
  sourceArrowShape: 'none',
  targetArrowShape: 'triangle',
  arrowScale: 1.2,
  edgeTextSize: 12,
  edgeTextColor: '#94a3b8',

  colors: {
    red: '#ef4444',
    orange: '#f97316',
    yellow: '#eab308',
    green: '#22c55e',
    blue: '#3b82f6',
    purple: '#a855f7',
    cyan: '#06b6d4',
    pink: '#ec4899',
    gray: '#6b7280',
  },
};

// High contrast theme
export const highContrastTheme: FlowchartTheme = {
  name: 'High Contrast',

  backgroundColor: '#000000',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  lineHeight: 1.5,

  layoutName: 'dagre',
  layoutDirection: 'TB',
  spacingFactor: 1.3,
  animateLayout: true,
  animationDuration: 300,

  nodeShape: 'rectangle',
  nodeBackgroundColor: '#000000',
  nodeBorderColor: '#ffffff',
  nodeBorderWidth: 3,
  nodeTextColor: '#ffffff',
  nodeFontSize: 16,
  nodePadding: 20,
  nodeCornerRadius: 0,
  nodeShadowBlur: 0,
  nodeShadowColor: '#000000',
  nodeShadowOpacity: 0,
  textMaxWidth: 180,

  edgeColor: '#ffffff',
  edgeWidth: 3,
  curveStyle: 'taxi',
  sourceArrowShape: 'none',
  targetArrowShape: 'triangle',
  arrowScale: 1.5,
  edgeTextSize: 14,
  edgeTextColor: '#ffffff',

  colors: {
    red: '#ff0000',
    orange: '#ff8800',
    yellow: '#ffff00',
    green: '#00ff00',
    blue: '#0088ff',
    purple: '#ff00ff',
    cyan: '#00ffff',
    pink: '#ff66aa',
    gray: '#888888',
  },
};

// Minimal/clean theme
export const minimalTheme: FlowchartTheme = {
  name: 'Minimal',

  backgroundColor: '#fafafa',
  fontFamily: '"Inter", system-ui, sans-serif',
  lineHeight: 1.4,

  layoutName: 'dagre',
  layoutDirection: 'TB',
  spacingFactor: 1.5,
  animateLayout: true,
  animationDuration: 400,

  nodeShape: 'ellipse',
  nodeBackgroundColor: '#ffffff',
  nodeBorderColor: '#d1d5db',
  nodeBorderWidth: 1,
  nodeTextColor: '#374151',
  nodeFontSize: 13,
  nodePadding: 20,
  nodeCornerRadius: 50,
  nodeShadowBlur: 4,
  nodeShadowColor: '#000000',
  nodeShadowOpacity: 0.05,
  textMaxWidth: 140,

  edgeColor: '#9ca3af',
  edgeWidth: 1,
  curveStyle: 'bezier',
  sourceArrowShape: 'none',
  targetArrowShape: 'vee',
  arrowScale: 1,
  edgeTextSize: 11,
  edgeTextColor: '#6b7280',

  colors: {
    red: '#fca5a5',
    orange: '#fdba74',
    yellow: '#fde047',
    green: '#86efac',
    blue: '#93c5fd',
    purple: '#d8b4fe',
    cyan: '#67e8f9',
    pink: '#f9a8d4',
    gray: '#d1d5db',
  },
};

// Vibrant/fun theme
export const vibrantTheme: FlowchartTheme = {
  name: 'Vibrant',

  backgroundColor: '#f0f9ff',
  fontFamily: '"Poppins", system-ui, sans-serif',
  lineHeight: 1.6,

  layoutName: 'cose',
  layoutDirection: 'TB',
  spacingFactor: 1.4,
  animateLayout: true,
  animationDuration: 500,

  nodeShape: 'roundrectangle',
  nodeBackgroundColor: '#ffffff',
  nodeBorderColor: '#0ea5e9',
  nodeBorderWidth: 3,
  nodeTextColor: '#0f172a',
  nodeFontSize: 15,
  nodePadding: 18,
  nodeCornerRadius: 12,
  nodeShadowBlur: 8,
  nodeShadowColor: '#0ea5e9',
  nodeShadowOpacity: 0.15,
  textMaxWidth: 150,

  edgeColor: '#38bdf8',
  edgeWidth: 3,
  curveStyle: 'round-taxi',
  sourceArrowShape: 'none',
  targetArrowShape: 'triangle',
  arrowScale: 1.3,
  edgeTextSize: 13,
  edgeTextColor: '#0284c7',

  colors: {
    red: '#f87171',
    orange: '#fb923c',
    yellow: '#facc15',
    green: '#4ade80',
    blue: '#60a5fa',
    purple: '#c084fc',
    cyan: '#22d3ee',
    pink: '#f472b6',
    gray: '#9ca3af',
  },
};

export const presetThemes: FlowchartTheme[] = [
  defaultLightTheme,
  defaultDarkTheme,
  minimalTheme,
  vibrantTheme,
  highContrastTheme,
];

// Generate Cytoscape stylesheet from theme
export function generateCyStylesheet(theme: FlowchartTheme, isDark: boolean): any[] {
  const baseStyles = [
    {
      selector: 'core',
      style: {
        'background-color': theme.backgroundColor,
        'selection-box-color': theme.colors.blue,
        'selection-box-opacity': 0.2,
        'selection-box-border-color': theme.colors.blue,
        'selection-box-border-width': 1,
        'active-bg-color': isDark ? '#1e293b' : '#f1f5f9',
        'active-bg-opacity': 0.5,
      },
    },
    {
      selector: 'node',
      style: {
        'background-color': theme.nodeBackgroundColor,
        'border-color': theme.nodeBorderColor,
        'border-width': theme.nodeBorderWidth,
        'color': theme.nodeTextColor,
        'label': 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'text-wrap': 'wrap',
        'text-max-width': `${theme.textMaxWidth}px`,
        'font-size': `${theme.nodeFontSize}px`,
        'font-family': theme.fontFamily,
        'padding': `${theme.nodePadding}px`,
        'shape': theme.nodeShape,
        'corner-radius': theme.nodeShape === 'roundrectangle' ? theme.nodeCornerRadius : 0,
        'width': 'label',
        'height': 'label',
        'min-width': '80px',
        'min-height': '40px',
        'shadow-blur': theme.nodeShadowBlur,
        'shadow-color': theme.nodeShadowColor,
        'shadow-opacity': theme.nodeShadowOpacity,
        'shadow-offset-y': theme.nodeShadowBlur > 0 ? 2 : 0,
        'transition-property': 'background-color, border-color, color, border-width',
        'transition-duration': '0.2s',
      },
    },
    {
      selector: 'node:selected',
      style: {
        'border-color': theme.colors.blue,
        'border-width': theme.nodeBorderWidth + 2,
        'shadow-blur': 15,
        'shadow-color': theme.colors.blue,
        'shadow-opacity': 0.4,
      },
    },
    {
      selector: ':parent',
      style: {
        'background-color': isDark ? '#1e293b' : '#f8fafc',
        'border-color': isDark ? '#334155' : '#e2e8f0',
        'border-width': 1,
        'border-style': 'dashed',
        'text-valign': 'top',
        'text-halign': 'center',
        'padding': '24px',
      },
    },
    {
      selector: 'edge',
      style: {
        'width': theme.edgeWidth,
        'line-color': theme.edgeColor,
        'target-arrow-color': theme.edgeColor,
        'source-arrow-color': theme.edgeColor,
        'target-arrow-shape': theme.targetArrowShape,
        'source-arrow-shape': theme.sourceArrowShape,
        'arrow-scale': theme.arrowScale,
        'curve-style': theme.curveStyle,
        'label': 'data(label)',
        'font-size': `${theme.edgeTextSize}px`,
        'color': theme.edgeTextColor,
        'text-background-color': theme.backgroundColor,
        'text-background-opacity': 0.9,
        'text-background-padding': '4px',
        'text-background-shape': 'roundrectangle',
        'text-wrap': 'wrap',
        'text-max-width': '120px',
        'transition-property': 'line-color, target-arrow-color, width',
        'transition-duration': '0.2s',
      },
    },
    {
      selector: 'edge:selected',
      style: {
        'line-color': theme.colors.blue,
        'target-arrow-color': theme.colors.blue,
        'width': theme.edgeWidth + 1,
      },
    },
  ];

  // Add color class styles
  const colorStyles = Object.entries(theme.colors).map(([name, color]) => ({
    selector: `.color_${name}`,
    style: {
      'background-color': isDark ? adjustColorForDark(color) : color,
      'border-color': color,
      'color': getContrastColor(color),
    },
  }));

  // Special node types
  const specialStyles = [
    {
      selector: '[in_degree = 0][out_degree > 0]',
      style: {
        'background-color': isDark ? adjustColorForDark(theme.colors.green) : theme.colors.green + '20',
        'border-color': theme.colors.green,
        'color': isDark ? '#86efac' : '#166534',
      },
    },
    {
      selector: '[in_degree > 0][out_degree = 0]',
      style: {
        'background-color': isDark ? adjustColorForDark(theme.colors.red) : theme.colors.red + '20',
        'border-color': theme.colors.red,
        'color': isDark ? '#fca5a5' : '#991b1b',
      },
    },
    {
      selector: '[out_degree > 1]',
      style: {
        'shape': 'diamond',
        'background-color': isDark ? adjustColorForDark(theme.colors.blue) : theme.colors.blue + '20',
        'border-color': theme.colors.blue,
        'color': isDark ? '#93c5fd' : '#1e40af',
        'width': '70px',
        'height': '70px',
      },
    },
  ];

  return [...baseStyles, ...colorStyles, ...specialStyles];
}

// Get layout options based on theme and layout name
export function getLayoutOptions(
  theme: FlowchartTheme,
  boundingBox?: { x1: number; y1: number; x2: number; y2: number }
): any {
  const baseOptions = {
    name: theme.layoutName,
    animate: theme.animateLayout,
    animationDuration: theme.animationDuration,
    fit: true,
    padding: 50,
    boundingBox: boundingBox || undefined,
  };

  switch (theme.layoutName) {
    case 'dagre':
      return {
        ...baseOptions,
        rankDir: theme.layoutDirection,
        ranker: 'network-simplex',
        nodeSep: 60 * theme.spacingFactor,
        edgeSep: 30 * theme.spacingFactor,
        rankSep: 80 * theme.spacingFactor,
      };

    case 'cose':
    case 'cose-bilkent':
      return {
        ...baseOptions,
        componentSpacing: 100 * theme.spacingFactor,
        nodeRepulsion: 400000,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0,
      };

    case 'fcose':
      return {
        ...baseOptions,
        quality: 'default',
        randomize: true,
        animate: true,
        animationDuration: theme.animationDuration,
        nodeSeparation: 60 * theme.spacingFactor,
        idealEdgeLength: 100 * theme.spacingFactor,
        nodeRepulsion: 4500,
        edgeElasticity: 0.45,
        nestingFactor: 0.1,
        gravity: 0.25,
        numIter: 2500,
        tile: true,
        tilingPaddingVertical: 10,
        tilingPaddingHorizontal: 10,
        gravityRangeCompound: 1.5,
        gravityCompound: 1.0,
        gravityRange: 3.8,
        initialEnergyOnIncremental: 0.3,
      };

    case 'breadthfirst':
      return {
        ...baseOptions,
        directed: true,
        padding: 30,
        circle: false,
        grid: false,
        spacingFactor: theme.spacingFactor,
        avoidOverlap: true,
        nodeDimensionsIncludeLabels: false,
      };

    case 'concentric':
      return {
        ...baseOptions,
        startAngle: (3 / 2) * Math.PI,
        sweep: undefined,
        clockwise: true,
        equidistant: false,
        minNodeSpacing: 60 * theme.spacingFactor,
        avoidOverlap: true,
        nodeDimensionsIncludeLabels: false,
      };

    case 'circle':
      return {
        ...baseOptions,
        padding: 30,
        avoidOverlap: true,
        nodeDimensionsIncludeLabels: false,
        radius: undefined,
        startAngle: (3 / 2) * Math.PI,
        sweep: undefined,
        clockwise: true,
        sort: undefined,
      };

    case 'grid':
      return {
        ...baseOptions,
        fit: true,
        padding: 30,
        avoidOverlap: true,
        avoidOverlapPadding: 10,
        nodeDimensionsIncludeLabels: false,
        condense: false,
        rows: undefined,
        cols: undefined,
        positionFn: undefined,
        sort: undefined,
        animate: theme.animateLayout,
        animationDuration: theme.animationDuration,
      };

    default:
      return baseOptions;
  }
}

// Utility functions
function adjustColorForDark(hex: string): string {
  // Simple darkening for dark mode
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const darken = (c: number) => Math.max(0, Math.floor(c * 0.3));

  return `#${darken(r).toString(16).padStart(2, '0')}${darken(g).toString(16).padStart(2, '0')}${darken(b).toString(16).padStart(2, '0')}`;
}

function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

// Local storage key for custom themes
const CUSTOM_THEMES_KEY = 'flowchart-custom-themes';

export function saveCustomTheme(theme: FlowchartTheme): void {
  const existing = getCustomThemes();
  const updated = [...existing.filter((t) => t.name !== theme.name), theme];
  localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(updated));
}

export function getCustomThemes(): FlowchartTheme[] {
  try {
    const stored = localStorage.getItem(CUSTOM_THEMES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function deleteCustomTheme(name: string): void {
  const existing = getCustomThemes();
  const updated = existing.filter((t) => t.name !== name);
  localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(updated));
}
