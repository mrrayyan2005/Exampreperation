import axiosInstance from './axiosInstance';
import { Node, Edge } from 'reactflow';

export interface FlowchartCreateRequest {
  title: string;
  description?: string;
  concept: string;
  nodeData?: Node[];
  edgeData?: Edge[];
  linkedTo?: {
    monthly_plan_id?: string;
    subject_id?: string;
    chapter_id?: string;
  };
}


const API_BASE_URL = '/flowcharts';

export const flowchartApi = {
  // Get all flowcharts
  async getAllFlowcharts(limit = 50, skip = 0) {
    const response = await axiosInstance.get(API_BASE_URL, {
      params: { limit, skip }
    });
    return response.data;
  },

  // Get single flowchart
  async getFlowchart(id: string) {
    const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // Create flowchart
  async createFlowchart(data: FlowchartCreateRequest) {
    const response = await axiosInstance.post(API_BASE_URL, data);
    return response.data;
  },

  // Update flowchart
  async updateFlowchart(id: string, data: Partial<FlowchartCreateRequest>) {
    const response = await axiosInstance.put(`${API_BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete flowchart
  async deleteFlowchart(id: string) {
    const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // Update nodes
  async updateNodes(id: string, nodes: Node[]) {
    const response = await axiosInstance.patch(`${API_BASE_URL}/${id}/nodes`, { nodes });
    return response.data;
  },

  // Update edges
  async updateEdges(id: string, edges: Edge[]) {
    const response = await axiosInstance.patch(`${API_BASE_URL}/${id}/edges`, { edges });
    return response.data;
  },

  // Search flowcharts
  async searchFlowcharts(query: string) {
    const response = await axiosInstance.get(`${API_BASE_URL}/search`, {
      params: { q: query }
    });
    return response.data;
  },

  // Get flowcharts by monthly plan
  async getFlowchartsByMonthlyPlan(monthlyPlanId: string) {
    const response = await axiosInstance.get(`${API_BASE_URL}/monthly-plan/${monthlyPlanId}`);
    return response.data;
  },

  // Generate flowchart variants from text using AI
  async generateFromText(data: { text: string; concept: string; notesId?: string; instructions?: string }) {
    const response = await axiosInstance.post(`${API_BASE_URL}/generate`, data);
    return response.data;
  }
};

