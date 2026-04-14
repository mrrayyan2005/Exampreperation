import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/api/axiosInstance';

export interface Resource {
  _id: string;
  id: string;
  title: string;
  link: string;
  description?: string;
  category: string;
  linkType: 'external_url' | 'file_upload' | 'notes' | 'document';
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  accessCount: number;
  lastAccessedAt?: string;
  isBookmarked: boolean;
  relatedBooks: Array<{
    _id: string;
    title: string;
    subject: string;
  }>;
  fileSize?: number;
  fileType?: string;
  originalFileName?: string;
  formattedFileSize?: string;
  linkPreview?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceFilters {
  search?: string;
  category?: string;
  tags?: string[];
  priority?: string;
  linkType?: string;
  isBookmarked?: boolean;
}

export interface ResourceStats {
  totalResources: number;
  totalBookmarked: number;
  totalAccesses: number;
  categoriesCount: number;
  avgAccessCount: number;
  linkTypeDistribution: Record<string, number>;
}

export interface ResourcePagination {
  currentPage: number;
  totalPages: number;
  totalResources: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

interface ResourceState {
  resources: Resource[];
  categories: string[];
  tags: Array<{ tag: string; count: number }>;
  stats: ResourceStats;
  pagination: ResourcePagination | null;
  filters: ResourceFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  isLoading: boolean;
  error: string | null;
  selectedResources: string[];
}

const initialState: ResourceState = {
  resources: [],
  categories: [],
  tags: [],
  stats: {
    totalResources: 0,
    totalBookmarked: 0,
    totalAccesses: 0,
    categoriesCount: 0,
    avgAccessCount: 0,
    linkTypeDistribution: {}
  },
  pagination: null,
  filters: {},
  sortBy: 'createdAt',
  sortOrder: 'desc',
  isLoading: false,
  error: null,
  selectedResources: []
};

// Async thunks
export const fetchResources = createAsyncThunk(
  'resources/fetchResources',
  async (params: {
    filters?: ResourceFilters;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  } = {}, { rejectWithValue }) => {
    try {
      const { filters = {}, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 50 } = params;

      const resParams = {
        ...filters,
        sortBy,
        sortOrder,
        page,
        limit
      };

      const response = await axiosInstance.get('/resources', { params: resParams });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch resources');
    }
  }
);

export const createResource = createAsyncThunk(
  'resources/createResource',
  async (resourceData: Partial<Resource>, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/resources', resourceData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create resource');
    }
  }
);

export const updateResource = createAsyncThunk(
  'resources/updateResource',
  async ({ id, data }: { id: string; data: Partial<Resource> }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/resources/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update resource');
    }
  }
);

export const deleteResource = createAsyncThunk(
  'resources/deleteResource',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/resources/${id}`);
      return { id };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete resource');
    }
  }
);

export const recordAccess = createAsyncThunk(
  'resources/recordAccess',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/resources/${id}/access`);
      const result = response.data;
      return { id, ...result.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to record access');
    }
  }
);

export const toggleBookmark = createAsyncThunk(
  'resources/toggleBookmark',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/resources/${id}/bookmark`);
      const result = response.data;
      return { id, ...result.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle bookmark');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'resources/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/resources/categories');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchTags = createAsyncThunk(
  'resources/fetchTags',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/resources/tags');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tags');
    }
  }
);

export const fetchStats = createAsyncThunk(
  'resources/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/resources/stats');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const bulkOperations = createAsyncThunk(
  'resources/bulkOperations',
  async ({ operation, resourceIds, data }: {
    operation: 'delete' | 'bookmark' | 'unbookmark' | 'updateCategory' | 'updatePriority';
    resourceIds: string[];
    data?: { category?: string; priority?: string };
  }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/resources/bulk', { operation, resourceIds, data });
      return { operation, resourceIds, data: response.data.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to perform bulk operation');
    }
  }
);

const resourceSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ResourceFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setSorting: (state, action: PayloadAction<{ sortBy: string; sortOrder: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    setSelectedResources: (state, action: PayloadAction<string[]>) => {
      state.selectedResources = action.payload;
    },
    toggleResourceSelection: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const index = state.selectedResources.indexOf(id);
      if (index > -1) {
        state.selectedResources.splice(index, 1);
      } else {
        state.selectedResources.push(id);
      }
    },
    clearSelection: (state) => {
      state.selectedResources = [];
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch resources
      .addCase(fetchResources.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resources = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch resources';
      })

      // Create resource
      .addCase(createResource.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createResource.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resources.unshift(action.payload.data);
      })
      .addCase(createResource.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to create resource';
      })

      // Update resource
      .addCase(updateResource.fulfilled, (state, action) => {
        const index = state.resources.findIndex(r => r._id === action.payload.data._id);
        if (index !== -1) {
          state.resources[index] = action.payload.data;
        }
      })
      .addCase(updateResource.rejected, (state, action) => {
        state.error = (action.payload as string) || action.error.message || 'Failed to update resource';
      })

      // Delete resource
      .addCase(deleteResource.fulfilled, (state, action) => {
        state.resources = state.resources.filter(r => r._id !== action.payload.id);
      })
      .addCase(deleteResource.rejected, (state, action) => {
        state.error = (action.payload as string) || action.error.message || 'Failed to delete resource';
      })

      // Record access
      .addCase(recordAccess.fulfilled, (state, action) => {
        const resource = state.resources.find(r => r._id === action.payload.id);
        if (resource) {
          resource.accessCount = action.payload.accessCount;
          resource.lastAccessedAt = action.payload.lastAccessedAt;
        }
      })

      // Toggle bookmark
      .addCase(toggleBookmark.fulfilled, (state, action) => {
        const resource = state.resources.find(r => r._id === action.payload.id);
        if (resource) {
          resource.isBookmarked = action.payload.isBookmarked;
        }
      })

      // Fetch categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })

      // Fetch tags
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.tags = action.payload;
      })

      // Fetch stats
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      // Bulk operations
      .addCase(bulkOperations.fulfilled, (state, action) => {
        const { operation, resourceIds } = action.payload;

        switch (operation) {
          case 'delete':
            state.resources = state.resources.filter(r => !resourceIds.includes(r._id));
            break;
          case 'bookmark':
            state.resources.forEach(r => {
              if (resourceIds.includes(r._id)) {
                r.isBookmarked = true;
              }
            });
            break;
          case 'unbookmark':
            state.resources.forEach(r => {
              if (resourceIds.includes(r._id)) {
                r.isBookmarked = false;
              }
            });
            break;
        }

        state.selectedResources = [];
      });
  }
});

export const {
  setFilters,
  clearFilters,
  setSorting,
  setSelectedResources,
  toggleResourceSelection,
  clearSelection,
  clearError
} = resourceSlice.actions;

export default resourceSlice.reducer;
