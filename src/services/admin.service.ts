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

export interface KYCVerification {
    documentVerification?: {
        type?: string;
        data?: {
            status?: string;
            pan?: string;
        };
    };
    faceVerification?: {
        status?: string;
        image?: string;
        timestamp?: string;
    };
    addressVerification?: {
        status?: string;
        address?: {
            house?: string;
            street?: string;
            city?: string;
        };
        timestamp?: string;
    };
    emailVerification?: {
        status?: string;
        email?: string;
        timestamp?: string;
    };
    mobileVerification?: {
        status?: string;
        phone?: string;
        timestamp?: string;
    };
}

export interface Issuer {
    id: string;
    name: string;
    email: string;
    type: string;
    status: string;
    credentials_issued: number;
    created_at: string;
    phone_number?: string;
    is_active: boolean;
    is_verified: boolean;
    is_superuser: boolean;
    kyc_verified: boolean;
    kyc_verification?: KYCVerification;
    updated_at?: string;
    last_login?: string;
}

export interface Learner {
    id: string;
    name: string;
    email: string;
    credentials_held: number;
    status: string;
    created_at: string;
    phone_number?: string;
    is_active: boolean;
    is_verified: boolean;
    kyc_verified: boolean;
    kyc_verification?: KYCVerification;
    updated_at?: string;
    last_login?: string;
    // Learner-specific fields
    skills?: string[];
    education?: Record<string, any>;
    bio?: string;
    location?: Record<string, any>;
    social_links?: Record<string, any>;
    profile_completion?: number;
    date_of_birth?: string;
    gender?: string;
    address?: string;
}

export interface Employer {
    id: string;
    name: string;
    email: string;
    industry: string;
    active_jobs: number;
    status: string;
    created_at: string;
    phone_number?: string;
    is_active: boolean;
    is_verified: boolean;
    kyc_verified: boolean;
    kyc_verification?: KYCVerification;
    updated_at?: string;
    last_login?: string;
}

export interface VerificationRequest {
    id: number;
    entity_name: string;
    entity_type: string;
    requested_date: string;
    documents: string[];
    status: string;
}

export interface HealthStatus {
    status: string;
    service: string;
    timestamp: number;
    version: string;
    database: string;
    error?: string;
}

export interface ReadinessStatus {
    status: string;
    service: string;
    timestamp: number;
    dependencies: {
        database: string;
        api: string;
    };
    error?: string;
}

export interface LivenessStatus {
    status: string;
    service: string;
    timestamp: number;
}

export interface EntityAnalytics {
    total_count: number;
    active_count: number;
    verified_count: number;
    growth: {
        percentage: number;
        new_this_month: number;
    };
    registration_trends: {
        daily: number[];
        monthly: number[];
    };
    status_distribution: Record<string, number>;
    top_performers: Array<{
        id: string;
        name: string;
        [key: string]: any;
    }>;
    recent_activity: Array<{
        id: string;
        name: string;
        [key: string]: any;
    }>;
}

export interface IssuerAnalytics extends EntityAnalytics {
    total_credentials_issued: number;
    credentials_by_type: Array<{
        type: string;
        count: number;
    }>;
    average_credentials_per_issuer: number;
}

export interface LearnerAnalytics extends EntityAnalytics {
    total_credentials_held: number;
    credentials_by_type: Array<{
        type: string;
        count: number;
    }>;
    average_credentials_per_learner: number;
}

export interface EmployerAnalytics extends EntityAnalytics {
    total_active_jobs: number;
    industry_distribution: Array<{
        industry: string;
        count: number;
    }>;
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

    /**
     * Get health status from backend
     */
    async getHealthStatus(): Promise<HealthStatus> {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/health`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching health status:', error);
            throw new Error(error.response?.data?.detail || 'Failed to fetch health status');
        }
    }

    /**
     * Get readiness status from backend
     */
    async getReadinessStatus(): Promise<ReadinessStatus> {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/health/ready`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching readiness status:', error);
            throw new Error(error.response?.data?.detail || 'Failed to fetch readiness status');
        }
    }

    /**
     * Get liveness status from backend
     */
    async getLivenessStatus(): Promise<LivenessStatus> {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/health/live`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching liveness status:', error);
            throw new Error(error.response?.data?.detail || 'Failed to fetch liveness status');
        }
    }

    /**
     * Check service endpoint health (lightweight check)
     */
    async checkServiceHealth(servicePath: string, timeout: number = 3000, requireAuth: boolean = false): Promise<{ healthy: boolean; latency: number; error?: string }> {
        const start = Date.now();
        try {
            const config: any = {
                timeout,
                validateStatus: (status: number) => {
                    // Consider 2xx and 3xx as healthy (endpoint exists and is reachable)
                    // For 401/403, we consider it as "endpoint accessible but needs auth" which is still "healthy" for monitoring
                    return status < 500;
                }
            };
            
            // Add auth headers if required
            if (requireAuth) {
                config.headers = this.getAuthHeaders().headers;
            }
            
            const response = await axios.get(`${API_BASE_URL}${servicePath}`, config);
            const latency = Date.now() - start;
            
            // Even if we get 401/403, the endpoint exists and is responding, which is good for health checks
            if (response.status === 401 || response.status === 403) {
                return { healthy: true, latency, error: 'Auth required (normal for protected endpoints)' };
            }
            
            return { healthy: true, latency };
        } catch (error: any) {
            const latency = Date.now() - start;
            const isNetworkError = !error.response || error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK';
            const status = error.response?.status;
            
            if (isNetworkError) {
                return { healthy: false, latency, error: 'Service unavailable' };
            }
            
            // 404 means endpoint doesn't exist - mark as unhealthy
            if (status === 404) {
                return { healthy: false, latency, error: 'Endpoint not found' };
            }
            
            // 405 means wrong HTTP method - still counts as endpoint exists
            if (status === 405) {
                return { healthy: true, latency, error: 'Method not allowed (endpoint exists)' };
            }
            
            // Other 4xx errors mean endpoint exists but there's an issue
            if (status >= 400 && status < 500) {
                return { healthy: true, latency, error: `HTTP ${status} (endpoint accessible)` };
            }
            
            return { healthy: false, latency, error: 'Service error' };
        }
    }

    /**
     * Get services health status from dedicated health endpoint
     */
    async getServicesHealth(): Promise<any> {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/health/services`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching services health:', error);
            throw new Error(error.response?.data?.detail || 'Failed to fetch services health');
        }
    }

    /**
     * Get comprehensive analytics for issuers
     */
    async getIssuerAnalytics(): Promise<IssuerAnalytics> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/v1/admin/issuers/analytics`,
                this.getAuthHeaders()
            );
            return response.data;
        } catch (error: any) {
            console.error('Error fetching issuer analytics:', error);
            throw new Error(error.response?.data?.detail || 'Failed to fetch issuer analytics');
        }
    }

    /**
     * Get comprehensive analytics for learners
     */
    async getLearnerAnalytics(): Promise<LearnerAnalytics> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/v1/admin/learners/analytics`,
                this.getAuthHeaders()
            );
            return response.data;
        } catch (error: any) {
            console.error('Error fetching learner analytics:', error);
            throw new Error(error.response?.data?.detail || 'Failed to fetch learner analytics');
        }
    }

    /**
     * Get comprehensive analytics for employers
     */
    async getEmployerAnalytics(): Promise<EmployerAnalytics> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/v1/admin/employers/analytics`,
                this.getAuthHeaders()
            );
            return response.data;
        } catch (error: any) {
            console.error('Error fetching employer analytics:', error);
            throw new Error(error.response?.data?.detail || 'Failed to fetch employer analytics');
        }
    }

    /**
     * Perform admin action on issuer (suspend, revoke permissions, disable credentials, restore)
     */
    async issuerAdminAction(
        issuerId: string,
        action: 'suspend' | 'revoke_permissions' | 'disable_credentials' | 'restore',
        reason?: string
    ): Promise<{ success: boolean; message: string; action: string; issuer_id: string }> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/v1/admin/issuers/${issuerId}/actions`,
                {
                    action,
                    reason
                },
                this.getAuthHeaders()
            );
            return response.data;
        } catch (error: any) {
            console.error('Error performing admin action:', error);
            throw new Error(error.response?.data?.detail || 'Failed to perform admin action');
        }
    }

    /**
     * Get detailed information about a specific issuer
     */
    async getIssuerDetails(issuerId: string): Promise<Issuer> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/v1/admin/issuers/${issuerId}/details`,
                this.getAuthHeaders()
            );
            return response.data;
        } catch (error: any) {
            console.error('Error fetching issuer details:', error);
            throw new Error(error.response?.data?.detail || 'Failed to fetch issuer details');
        }
    }

    /**
     * Get system settings
     */
    async getSettings(): Promise<{ maintenance_mode: boolean; maintenance_message?: string; api_rate_limit: number; team_members?: string[] }> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/v1/admin/settings`,
                this.getAuthHeaders()
            );
            return response.data;
        } catch (error: any) {
            console.error('Error fetching settings:', error);
            throw new Error(error.response?.data?.detail || 'Failed to fetch settings');
        }
    }

    /**
     * Update maintenance mode
     */
    async updateMaintenanceMode(enabled: boolean, message?: string): Promise<{ maintenance_mode: boolean; maintenance_message?: string; api_rate_limit: number }> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/v1/admin/settings/maintenance`,
                {
                    enabled,
                    message: message || "System is currently under maintenance. Please check back later."
                },
                this.getAuthHeaders()
            );
            return response.data;
        } catch (error: any) {
            console.error('Error updating maintenance mode:', error);
            throw new Error(error.response?.data?.detail || 'Failed to update maintenance mode');
        }
    }

    /**
     * Update system settings
     */
    async updateSystemSettings(data: { maintenance_mode: boolean; maintenance_message?: string }): Promise<{ maintenance_mode: boolean; maintenance_message?: string; api_rate_limit: number; team_members?: string[] }> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/v1/admin/settings/maintenance`,
                {
                    enabled: data.maintenance_mode,
                    message: data.maintenance_message || "System is currently under maintenance. Please check back later."
                },
                this.getAuthHeaders()
            );
            return response.data;
        } catch (error: any) {
            console.error('Error updating system settings:', error);
            throw new Error(error.response?.data?.detail || 'Failed to update system settings');
        }
    }

    /**
     * Update API rate limit
     */
    async updateRateLimit(rateLimit: number): Promise<{ maintenance_mode: boolean; maintenance_message?: string; api_rate_limit: number }> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/v1/admin/settings/rate-limit`,
                {
                    api_rate_limit: rateLimit
                },
                this.getAuthHeaders()
            );
            return response.data;
        } catch (error: any) {
            console.error('Error updating rate limit:', error);
            throw new Error(error.response?.data?.detail || 'Failed to update rate limit');
        }
    }

    /**
     * Get maintenance mode status (public endpoint, no auth required)
     */
    async getMaintenanceStatus(): Promise<{ maintenance_mode: boolean; message?: string }> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/v1/admin/settings/maintenance/status`
            );
            return response.data;
        } catch (error: any) {
            console.error('Error fetching maintenance status:', error);
            // Return default if error (assume not in maintenance)
            return { maintenance_mode: false, message: undefined };
        }
    }

    /**
     * Add team member
     */
    async addTeamMember(email: string): Promise<{ success: boolean; message: string; team_members: string[] }> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/v1/admin/settings/team-members`,
                { email },
                this.getAuthHeaders()
            );
            return response.data;
        } catch (error: any) {
            console.error('Error adding team member:', error);
            throw new Error(error.response?.data?.detail || 'Failed to add team member');
        }
    }

    /**
     * Remove team member
     */
    async removeTeamMember(email: string): Promise<{ success: boolean; message: string; team_members: string[] }> {
        try {
            const response = await axios.delete(
                `${API_BASE_URL}/api/v1/admin/settings/team-members/${encodeURIComponent(email)}`,
                this.getAuthHeaders()
            );
            return response.data;
        } catch (error: any) {
            console.error('Error removing team member:', error);
            throw new Error(error.response?.data?.detail || 'Failed to remove team member');
        }
    }

}

export const adminService = new AdminService();
