import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Analytics {
    total_users: number;
    active_issuers: number;
    verified_learners: number;
    pending_verifications: number;
    growth: {
        users: number;
        issuers: number;
        verifications: number;
    };
}

export interface DetailedAnalytics {
    credentials_issued: {
        daily: number[];
        monthly: number[];
        total: number;
    };
    top_issuers: Array<{
        name: string;
        count: number;
    }>;
    popular_credentials: Array<{
        name: string;
        count: number;
    }>;
}

export interface Issuer {
    id: number;
    name: string;
    email: string;
    type: string;
    status: string;
    credentials_issued: number;
    created_at: string;
}

export interface Learner {
    id: number;
    name: string;
    email: string;
    credentials_held: number;
    status: string;
    created_at: string;
}

export interface Employer {
    id: number;
    name: string;
    email: string;
    industry: string;
    active_jobs: number;
    status: string;
    created_at: string;
}

export interface VerificationRequest {
    id: number;
    entity_name: string;
    entity_type: string;
    requested_date: string;
    documents: string[];
    status: string;
}

class AdminService {
    private getAuthHeaders() {
        const token = localStorage.getItem('access_token');
        return {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        };
    }

    /**
     * Get overview analytics
     */
    async getAnalytics(): Promise<Analytics> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/v1/admin/analytics`,
                this.getAuthHeaders()
            );
            return response.data;
        } catch (error: any) {
            console.error('Error fetching analytics:', error);
            throw new Error(error.response?.data?.detail || 'Failed to fetch analytics');
        }
    }

    /**
     * Get detailed analytics including credentials issued, top issuers, etc.
     */
    async getDetailedAnalytics(): Promise<DetailedAnalytics> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/v1/admin/analytics/detailed`,
                this.getAuthHeaders()
            );
            return response.data;
        } catch (error: any) {
            console.error('Error fetching detailed analytics:', error);
            throw new Error(error.response?.data?.detail || 'Failed to fetch detailed analytics');
        }
    }

    /**
     * Get list of all issuers
     */
    async getIssuers(params?: { skip?: number; limit?: number; status?: string }): Promise<Issuer[]> {
        try {
            const queryParams = new URLSearchParams();
            if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
            if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
            if (params?.status) queryParams.append('status', params.status);

            const response = await axios.get(
                `${API_BASE_URL}/api/v1/admin/issuers?${queryParams.toString()}`,
                this.getAuthHeaders()
            );
            return response.data;
        } catch (error: any) {
            console.error('Error fetching issuers:', error);
            throw new Error(error.response?.data?.detail || 'Failed to fetch issuers');
        }
    }

    /**
     * Get list of all learners
     */
    async getLearners(params?: { skip?: number; limit?: number; status?: string }): Promise<Learner[]> {
        try {
            const queryParams = new URLSearchParams();
            if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
            if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
            if (params?.status) queryParams.append('status', params.status);

            const response = await axios.get(
                `${API_BASE_URL}/api/v1/admin/learners?${queryParams.toString()}`,
                this.getAuthHeaders()
            );
            return response.data;
        } catch (error: any) {
            console.error('Error fetching learners:', error);
            throw new Error(error.response?.data?.detail || 'Failed to fetch learners');
        }
    }

    /**
     * Get list of all employers
     */
    async getEmployers(params?: { skip?: number; limit?: number }): Promise<Employer[]> {
        try {
            const queryParams = new URLSearchParams();
            if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
            if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());

            const response = await axios.get(
                `${API_BASE_URL}/api/v1/admin/employers?${queryParams.toString()}`,
                this.getAuthHeaders()
            );
            return response.data;
        } catch (error: any) {
            console.error('Error fetching employers:', error);
            throw new Error(error.response?.data?.detail || 'Failed to fetch employers');
        }
    }

    /**
     * Get pending verification requests
     */
    async getVerificationRequests(): Promise<VerificationRequest[]> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/v1/admin/verifications`,
                this.getAuthHeaders()
            );
            return response.data;
        } catch (error: any) {
            console.error('Error fetching verification requests:', error);
            throw new Error(error.response?.data?.detail || 'Failed to fetch verification requests');
        }
    }

    /**
     * Approve or reject a verification request
     */
    async handleVerificationAction(
        verificationId: number,
        action: 'approve' | 'reject',
        notes?: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/v1/admin/verifications/action`,
                {
                    verification_id: verificationId,
                    action,
                    notes,
                },
                this.getAuthHeaders()
            );
            return response.data;
        } catch (error: any) {
            console.error('Error handling verification action:', error);
            throw new Error(error.response?.data?.detail || 'Failed to process verification action');
        }
    }

    /**
     * Delete a user
     */
    async deleteUser(userId: number): Promise<{ success: boolean; message: string }> {
        try {
            const response = await axios.delete(
                `${API_BASE_URL}/api/v1/admin/users/${userId}`,
                this.getAuthHeaders()
            );
            return response.data;
        } catch (error: any) {
            console.error('Error deleting user:', error);
            throw new Error(error.response?.data?.detail || 'Failed to delete user');
        }
    }

    /**
     * Update user active status
     */
    async updateUserStatus(
        userId: number,
        isActive: boolean
    ): Promise<{ success: boolean; message: string }> {
        try {
            const response = await axios.patch(
                `${API_BASE_URL}/api/v1/admin/users/${userId}/status`,
                { is_active: isActive },
                this.getAuthHeaders()
            );
            return response.data;
        } catch (error: any) {
            console.error('Error updating user status:', error);
            throw new Error(error.response?.data?.detail || 'Failed to update user status');
        }
    }
}

export const adminService = new AdminService();
