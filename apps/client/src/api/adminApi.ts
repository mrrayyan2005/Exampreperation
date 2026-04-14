import axiosInstance from './axiosInstance';
import { User } from '../redux/slices/authSlice';

export interface PlatformStats {
    totalUsers: number;
    recentSignups: number;
    activeUsers: number;
    roleDistribution: Record<string, number>;
}

export interface AdminUsersResponse {
    count: number;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    data: User[];
}

export interface AuditLogEntry {
    _id: string;
    adminId: string;
    adminName: string;
    action: string;
    targetType: string;
    targetId: string;
    targetName?: string;
    changes?: Record<string, any>;
    status: 'success' | 'failed';
    reason?: string;
    ipAddress?: string;
    createdAt: string;
}

export interface ContentReport {
    _id: string;
    reportedBy: any;
    contentType: string;
    contentId: string;
    contentTitle?: string;
    reason: string;
    description: string;
    status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'resolved';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    reviewerName?: string;
    reviewNotes?: string;
    action?: string;
    createdAt: string;
}

export interface SystemStatus {
    services: Array<{
        label: string;
        status: 'healthy' | 'degraded';
        latency: number;
    }>;
    riskSignals: Array<{
        issue: string;
        count: number;
        severity: string;
    }>;
    uptime: string;
    lastUpdated: string;
}

export const adminApi = {
    getPlatformStats: async (): Promise<PlatformStats> => {
        const response = await axiosInstance.get('/admin/stats');
        return response.data.data;
    },

    getAllUsers: async (page = 1, limit = 20, search = ''): Promise<AdminUsersResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search })
        });
        const response = await axiosInstance.get(`/admin/users?${params.toString()}`);
        return response.data;
    },

    updateUserRole: async (userId: string, role: string, isActive?: boolean): Promise<User> => {
        const playload: any = { role };
        if (isActive !== undefined) playload.isActive = isActive;

        const response = await axiosInstance.put(`/admin/users/${userId}`, playload);
        return response.data.data;
    },

    deleteUser: async (userId: string): Promise<void> => {
        await axiosInstance.delete(`/admin/users/${userId}`);
    },

    // Audit Log
    getAuditLog: async (page = 1, limit = 20, action?: string, targetType?: string) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (action) params.append('action', action);
        if (targetType) params.append('targetType', targetType);
        
        const response = await axiosInstance.get(`/admin/audit-log?${params}`);
        return response.data;
    },

    // Moderation Queue
    getModerationQueue: async (page = 1, limit = 15, status = 'pending', priority?: string) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        params.append('status', status);
        if (priority) params.append('priority', priority);
        
        const response = await axiosInstance.get(`/admin/moderation-queue?${params}`);
        return response.data;
    },

    resolveReport: async (reportId: string, action: string, reviewNotes: string) => {
        const response = await axiosInstance.put(`/admin/moderation-queue/${reportId}`, {
            action,
            reviewNotes
        });
        return response.data;
    },

    // System Status
    getSystemStatus: async () => {
        const response = await axiosInstance.get('/admin/system-status');
        return response.data.data;
    },

    // Activity Analytics
    getActivityAnalytics: async (days = 7) => {
        const response = await axiosInstance.get(`/admin/activity-analytics?days=${days}`);
        return response.data.data;
    },
};
