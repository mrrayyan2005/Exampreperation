import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from '@/api/axiosInstance';
import { flowchartApi } from '@/api/flowchartApi';
import { Node, Edge } from 'reactflow';

export interface FlowchartData {
  id: string;
  owner: string;
  title: string;
  description?: string;
  concept: string;
  nodeData: Node[];
  edgeData: Edge[];
  linkedTo?: {
    monthly_plan_id?: string;
    subject_id?: string;
    chapter_id?: string;
  };
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  // New fields for text mode
  editorMode?: 'visual' | 'text';
  textContent?: string;
  subjectType?: string;
}

export interface FlowchartLink {
  monthly_plan_id?: string;
  subject_id?: string;
  chapter_id?: string;
}

export interface FlowchartVariantMetadata {
  variantType: 'hierarchical' | 'temporal' | 'relational';
  nodeCount: number;
  edgeCount: number;
  complexity?: string;
  flowchartType?: 'hierarchical' | 'temporal' | 'relational';
}

export interface FlowchartVariant {
  nodes: Node[];
  edges: Edge[];
  metadata: FlowchartVariantMetadata;
}

interface GenerateFlowchartResponse {
  success: boolean;
  data: {
    variants: FlowchartVariant[];
    textSource: string;
    concept: string;
  };
  message?: string;
}

export interface FlowchartState {
  flowcharts: FlowchartData[];
  currentFlowchart: FlowchartData | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  generatedVariants: FlowchartVariant[] | null;
  isGenerating: boolean;
  generationError: string | null;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string } | undefined)?.message || fallback;
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
};

const initialState: FlowchartState = {
  flowcharts: [],
  currentFlowchart: null,
  isLoading: false,
  error: null,
  isInitialized: false,
  generatedVariants: null,
  isGenerating: false,
  generationError: null
};

// Async thunks
export const fetchFlowcharts = createAsyncThunk(
  'flowchart/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/flowcharts');
      return response.data.data || [];
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch flowcharts'));
    }
  }
);

export const fetchFlowchartById = createAsyncThunk(
  'flowchart/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/flowcharts/${id}`);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch flowchart'));
    }
  }
);

export const createFlowchart = createAsyncThunk(
  'flowchart/create',
  async (
    data: {
      title: string;
      description?: string;
      concept: string;
      nodeData?: Node[];
      edgeData?: Edge[];
      linkedTo?: FlowchartLink;
      aiGenerated?: boolean;
      sourceText?: string;
      variantIndex?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post('/flowcharts', data);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to create flowchart'));
    }
  }
);

export const updateFlowchart = createAsyncThunk(
  'flowchart/update',
  async (
    { id, data }: { id: string; data: Partial<FlowchartData> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.put(`/flowcharts/${id}`, data);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update flowchart'));
    }
  }
);

export const updateFlowchartNodes = createAsyncThunk(
  'flowchart/updateNodes',
  async ({ id, nodes }: { id: string; nodes: Node[] }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/flowcharts/${id}/nodes`, { nodes });
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update nodes'));
    }
  }
);

export const updateFlowchartEdges = createAsyncThunk(
  'flowchart/updateEdges',
  async ({ id, edges }: { id: string; edges: Edge[] }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/flowcharts/${id}/edges`, { edges });
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update edges'));
    }
  }
);

export const deleteFlowchart = createAsyncThunk(
  'flowchart/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/flowcharts/${id}`);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to delete flowchart'));
    }
  }
);

export const searchFlowcharts = createAsyncThunk(
  'flowchart/search',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/flowcharts/search?q=${query}`);
      return response.data.data || [];
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to search flowcharts'));
    }
  }
);

export const generateFlowchartFromText = createAsyncThunk(
  'flowchart/generateFromText',
  async (
    { text, concept, notesId, instructions }: { text: string; concept: string; notesId?: string; instructions?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = (await flowchartApi.generateFromText({
        text,
        concept,
        notesId,
        instructions
      })) as GenerateFlowchartResponse;
      return response;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to generate flowchart variants'));
    }
  }
);

const flowchartSlice = createSlice({
  name: 'flowchart',
  initialState,
  reducers: {
    setCurrentFlowchart: (state, action: PayloadAction<FlowchartData | null>) => {
      state.currentFlowchart = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateCurrentFlowchartNodes: (state, action: PayloadAction<Node[]>) => {
      if (state.currentFlowchart) {
        state.currentFlowchart.nodeData = action.payload;
      }
    },
    updateCurrentFlowchartEdges: (state, action: PayloadAction<Edge[]>) => {
      if (state.currentFlowchart) {
        state.currentFlowchart.edgeData = action.payload;
      }
    },
    clearGenerationState: (state) => {
      state.generatedVariants = null;
      state.generationError = null;
      state.isGenerating = false;
    }
  },
  extraReducers: (builder) => {
    // Fetch all flowcharts
    builder
      .addCase(fetchFlowcharts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFlowcharts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.flowcharts = action.payload;
        state.isInitialized = true;
      })
      .addCase(fetchFlowcharts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch flowchart by ID
    builder
      .addCase(fetchFlowchartById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFlowchartById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFlowchart = action.payload;
      })
      .addCase(fetchFlowchartById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create flowchart
    builder
      .addCase(createFlowchart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createFlowchart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.flowcharts.push(action.payload);
        state.currentFlowchart = action.payload;
      })
      .addCase(createFlowchart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update flowchart
    builder
      .addCase(updateFlowchart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateFlowchart.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.flowcharts.findIndex((f) => f.id === action.payload.id);
        if (index !== -1) {
          state.flowcharts[index] = action.payload;
        }
        if (state.currentFlowchart?.id === action.payload.id) {
          state.currentFlowchart = action.payload;
        }
      })
      .addCase(updateFlowchart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update nodes
    builder
      .addCase(updateFlowchartNodes.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentFlowchart?.id === action.payload.id) {
          state.currentFlowchart.nodeData = action.payload.nodeData;
        }
        const index = state.flowcharts.findIndex((f) => f.id === action.payload.id);
        if (index !== -1) {
          state.flowcharts[index].nodeData = action.payload.nodeData;
        }
      });

    // Update edges
    builder
      .addCase(updateFlowchartEdges.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentFlowchart?.id === action.payload.id) {
          state.currentFlowchart.edgeData = action.payload.edgeData;
        }
        const index = state.flowcharts.findIndex((f) => f.id === action.payload.id);
        if (index !== -1) {
          state.flowcharts[index].edgeData = action.payload.edgeData;
        }
      });

    // Delete flowchart
    builder
      .addCase(deleteFlowchart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteFlowchart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.flowcharts = state.flowcharts.filter((f) => f.id !== action.payload);
        if (state.currentFlowchart?.id === action.payload) {
          state.currentFlowchart = null;
        }
      })
      .addCase(deleteFlowchart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Search flowcharts
    builder
      .addCase(searchFlowcharts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchFlowcharts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.flowcharts = action.payload;
      })
      .addCase(searchFlowcharts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Generate flowchart from text
    builder
      .addCase(generateFlowchartFromText.pending, (state) => {
        state.isGenerating = true;
        state.generationError = null;
        state.generatedVariants = null;
      })
      .addCase(generateFlowchartFromText.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.generatedVariants = action.payload.data.variants;
      })
      .addCase(generateFlowchartFromText.rejected, (state, action) => {
        state.isGenerating = false;
        state.generationError = action.payload as string;
      });
  }
});

export const { setCurrentFlowchart, clearError, updateCurrentFlowchartNodes, updateCurrentFlowchartEdges, clearGenerationState } =
  flowchartSlice.actions;

export default flowchartSlice.reducer;
