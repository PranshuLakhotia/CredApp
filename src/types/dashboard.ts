export interface Credential {
  id: string;
  title: string;
  issuer: string;
  issuer_logo?: string;
  nsqf_level: number;
  credit_points: number;
  issue_date: string;
  expiry_date?: string;
  verification_status: 'verified' | 'pending' | 'expired' | 'revoked';
  verification_url?: string;
  skills: string[];
  description: string;
  certificate_url?: string;
  blockchain_hash?: string;
}

export interface SkillProgress {
  skill_name: string;
  current_level: number;
  target_level: number;
  progress_percentage: number;
  credentials_earned: number;
  total_credentials: number;
  last_updated: string;
}

export interface NSQFPathway {
  id: string;
  title: string;
  description: string;
  current_level: number;
  target_level: number;
  completed_credentials: Credential[];
  pending_credentials: {
    id: string;
    title: string;
    nsqf_level: number;
    estimated_duration: string;
    provider: string;
  }[];
  progress_percentage: number;
}

export interface Candidate {
  id: string;
  full_name: string;
  email: string;
  profile_image?: string;
  skills: string[];
  nsqf_level: number;
  total_credentials: number;
  verified_credentials: number;
  match_percentage?: number;
  location?: string;
  experience_years?: number;
  last_active: string;
}

export interface AnalyticsData {
  total_learners: number;
  total_credentials_issued: number;
  verification_rate: number;
  completion_rate: number;
  monthly_growth: number;
  skill_demand: {
    skill: string;
    demand_count: number;
    growth_rate: number;
  }[];
  nsqf_distribution: {
    level: number;
    count: number;
  }[];
}

export interface Institution {
  id: string;
  name: string;
  logo?: string;
  type: 'university' | 'training_center' | 'corporate' | 'government';
  accreditation_status: 'accredited' | 'pending' | 'expired';
  total_credentials_issued: number;
  active_learners: number;
  api_status: 'connected' | 'disconnected' | 'error';
}

export interface CredentialTemplate {
  id: string;
  title: string;
  description: string;
  nsqf_level: number;
  credit_points: number;
  duration: string;
  skills_covered: string[];
  assessment_criteria: string[];
  is_active: boolean;
}

export interface DashboardStats {
  learner: {
    total_credentials: number;
    verified_credentials: number;
    pending_verifications: number;
    nsqf_progress: number;
    skill_completions: number;
  };
  employer: {
    total_searches: number;
    candidates_viewed: number;
    verifications_completed: number;
    saved_profiles: number;
  };
  institution: {
    credentials_issued: number;
    active_learners: number;
    completion_rate: number;
    revenue_generated: number;
  };
}
