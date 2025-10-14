import axios, { AxiosResponse } from 'axios';

// Axios instance with base URL and auth header
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface LearnerCredential {
  _id: string;
  issuer_name?: string;
  credential_title?: string;
  nsqf_level?: number;
  skill_tags?: string[];
  tags?: string[];
  status?: string;
  blockchain_status?: string;
  issued_date?: string;
  completion_date?: string;
  credential_type?: string;
  credential_hash?: string;
  qr_code_image?: string;
}

export interface LearnerCredentialsResponse {
  credentials: LearnerCredential[];
  skip: number;
  limit: number;
  total: number;
}

export interface ShareResponse {
  user_id: string;
  share_token: string;
  share_id: string;
  share_url: string;
  expires_at: string;
}

export class LearnerService {
  static async getLearnerCredentials(params?: {
    status?: string;
    issuer?: string;
    nsqf_level?: number;
    tags?: string; // comma-separated per backend
    skip?: number;
    limit?: number;
  }): Promise<LearnerCredentialsResponse> {
    const response: AxiosResponse<LearnerCredentialsResponse> = await api.get('/api/v1/learner/credentials', {
      params,
    });
    return response.data;
  }

  static async downloadPortfolio(): Promise<Blob> {
    const response = await api.get('/api/v1/learner/download-portfolio', {
      responseType: 'blob',
    });
    return response.data;
  }

  static async createShareLink(expiresInDays: number = 30): Promise<ShareResponse> {
    const response: AxiosResponse<ShareResponse> = await api.post('/api/v1/learner/share', {
      expires_in_days: expiresInDays,
    });
    return response.data;
  }
}

export default LearnerService;


