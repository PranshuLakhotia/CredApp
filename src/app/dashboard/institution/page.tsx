'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RoleGuard from '@/components/auth/RoleGuard';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from '@/hooks/useTranslations';
import InlineKYCSteps from '@/components/auth/InlineKYCSteps';
import KYCVerificationCarousel from '@/components/auth/KYCVerificationCarousel';
import RoleGuard from '@/components/auth/RoleGuard';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from '@/hooks/useTranslations';

interface IssuedCredential {
  credential_id: string;
  learner_id: string;
  credential_details: {
    title: string;
    credential_type: string;
    issuer_name: string;
    learner_name: string;
    learner_address: string;
    learner_id: string;
    issued_at: string;
    grade: string;
    completion_date: string;
    status: string;
  };
  original_credential_data: {
    artifact_url: string;
    credential_type: string;
    idempotency_key: string;
    metadata: any;
    vc_payload: any;
  };
  blockchain_data: {
    credential_hash: string;
    status: string;
  };
  blockchain_verification: {
    credential_hash: string;
    is_valid: boolean;
    error?: string;
    verified_at: number;
  };
  qr_code_data: {
    certificate_qr_data: any;
    qr_code_image: string;
    qr_code_json: string;
    verification_url: string;
    image_size: string;
    template: string;
  };
  qr_code_available: boolean;
  last_updated: string;
  created_at: string;
}

interface CompleteCredentialInfo {
  credential_id: string;
  learner_id: string;
  credential_details: {
    title: string;
    credential_type: string;
    issuer_name: string;
    learner_name: string;
    learner_address: string;
    issued_at: string;
    grade: string;
    completion_date: string;
    status: string;
  };
  original_credential_data: {
    artifact_url: string;
    credential_type: string;
    idempotency_key: string;
    metadata: any;
    vc_payload: any;
  };
  blockchain_data: {
    credential_hash: string;
    status: string;
  };
  blockchain_verification: {
    credential_hash: string;
    is_valid: boolean;
    error?: string;
    verified_at: number;
  };
  qr_code_data: {
    certificate_qr_data: any;
    qr_code_image: string;
    qr_code_json: string;
    verification_url: string;
    image_size: string;
    template: string;
  };
  qr_code_available: boolean;
  last_updated: string;
  created_at: string;
}

interface DashboardStats {
  total_credentials: number;
  active_learners: number;
  completion_rate: number;
  monthly_issued: number;
  weekly_issued: number;
  daily_issued: number;
  avg_certificates_per_week: number;
  most_popular_course: string;
  completion_rate_percentage: number;
  blockchain_confirmed_rate: number;
}
import InlineKYCSteps from '@/components/auth/InlineKYCSteps';
import KYCVerificationCarousel from '@/components/auth/KYCVerificationCarousel';
import InstitutionDashboard from '@/components/dashboard/InstitutionDashboard';


interface IssuedCredential {
  credential_id: string;
  learner_id: string;
  credential_details: {
    title: string;
    credential_type: string;
    issuer_name: string;
    learner_name: string;
    learner_address: string;
    learner_id: string;
    issued_at: string;
    grade: string;
    completion_date: string;
    status: string;
  };
  original_credential_data: {
    artifact_url: string;
    credential_type: string;
    idempotency_key: string;
    metadata: any;
    vc_payload: any;
  };
  blockchain_data: {
    credential_hash: string;
    status: string;
  };
  blockchain_verification: {
    credential_hash: string;
    is_valid: boolean;
    error?: string;
    verified_at: number;
  };
  qr_code_data: {
    certificate_qr_data: any;
    qr_code_image: string;
    qr_code_json: string;
    verification_url: string;
    image_size: string;
    template: string;
  };
  qr_code_available: boolean;
  last_updated: string;
  created_at: string;
}

interface CompleteCredentialInfo {
  credential_id: string;
  learner_id: string;
  credential_details: {
    title: string;
    credential_type: string;
    issuer_name: string;
    learner_name: string;
    learner_address: string;
    issued_at: string;
    grade: string;
    completion_date: string;
    status: string;
  };
  original_credential_data: {
    artifact_url: string;
    credential_type: string;
    idempotency_key: string;
    metadata: any;
    vc_payload: any;
  };
  blockchain_data: {
    credential_hash: string;
    status: string;
  };
  blockchain_verification: {
    credential_hash: string;
    is_valid: boolean;
    error?: string;
    verified_at: number;
  };
  qr_code_data: {
    certificate_qr_data: any;
    qr_code_image: string;
    qr_code_json: string;
    verification_url: string;
    image_size: string;
    template: string;
  };
  qr_code_available: boolean;
  last_updated: string;
  created_at: string;
}

interface DashboardStats {
  total_credentials: number;
  active_learners: number;
  completion_rate: number;
  monthly_issued: number;
  weekly_issued: number;
  daily_issued: number;
  avg_certificates_per_week: number;
  most_popular_course: string;
  completion_rate_percentage: number;
  blockchain_confirmed_rate: number;
}

export default function InstitutionDashboardPage() {
  const { user } = useAuth();
  const t = useTranslations('institution');
  const [credentials, setCredentials] = useState<IssuedCredential[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_credentials: 0,
    active_learners: 0,
    completion_rate: 0,
    monthly_issued: 0,
    weekly_issued: 0,
    daily_issued: 0,
    avg_certificates_per_week: 0,
    most_popular_course: 'N/A',
    completion_rate_percentage: 0,
    blockchain_confirmed_rate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCredential, setSelectedCredential] = useState<CompleteCredentialInfo | null>(null);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [loadingCredentialDetails, setLoadingCredentialDetails] = useState(false);
  const [loadingCredentialId, setLoadingCredentialId] = useState<string | null>(null);
  const [isLoadingCredential, setIsLoadingCredential] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);


  // Fetch Issued Credentials
  const fetchCredentials = async (pageNum: number = 1, append: boolean = false) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/issuer/credentials?page=${pageNum}&limit=10&sort_by=issued_at&sort_order=desc`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        let newCredentials = data.credentials || [];
        
        // Sort by created_at/issued_at with latest first (fallback sorting)
        newCredentials.sort((a: IssuedCredential, b: IssuedCredential) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA; // Latest first
        });
        
        if (append) {
          setCredentials(prev => [...prev, ...newCredentials]);
        } else {
          setCredentials(newCredentials);
        }
        
        setHasMore(newCredentials.length === 10);
        
        // Calculate dynamic statistics
        const calculatedStats = calculateStats(newCredentials);
        setStats(calculatedStats);
      }
    } catch (error) {
      console.error('Error fetching credentials:', error);
    }
  };

  // Calculate Dynamic Statistics
  const calculateStats = (credentialsData: IssuedCredential[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Filter credentials by date
    const monthlyCredentials = credentialsData.filter(cred => 
      new Date(cred.created_at) >= monthAgo
    );
    const weeklyCredentials = credentialsData.filter(cred => 
      new Date(cred.created_at) >= weekAgo
    );
    const dailyCredentials = credentialsData.filter(cred => 
      new Date(cred.created_at) >= today
    );

    // Calculate unique learners
    const uniqueLearners = new Set(
      credentialsData.map(cred => cred.credential_details?.learner_address || cred.credential_id)
    ).size;

    // Calculate course popularity
    const courseCount: { [key: string]: number } = {};
    credentialsData.forEach(cred => {
      const course = cred.credential_details?.title || 'Unknown';
      courseCount[course] = (courseCount[course] || 0) + 1;
    });
    const mostPopularCourse = Object.keys(courseCount).reduce((a, b) => 
      courseCount[a] > courseCount[b] ? a : b, 'N/A'
    );

    // Calculate blockchain confirmation rate
    const confirmedCredentials = credentialsData.filter(cred => 
      cred.credential_details?.status === 'issued' || cred.credential_details?.status === 'confirmed'
    );
    const blockchainConfirmedRate = credentialsData.length > 0 
      ? (confirmedCredentials.length / credentialsData.length) * 100 
      : 0;

    // Calculate average certificates per week (last 4 weeks)
    const fourWeeksAgo = new Date(today.getTime() - 28 * 24 * 60 * 60 * 1000);
    const lastFourWeeksCredentials = credentialsData.filter(cred => 
      new Date(cred.created_at) >= fourWeeksAgo
    );
    const avgPerWeek = lastFourWeeksCredentials.length / 4;

    return {
      total_credentials: credentialsData.length,
      active_learners: uniqueLearners,
      completion_rate: 0, // This would need enrollment data
      monthly_issued: monthlyCredentials.length,
      weekly_issued: weeklyCredentials.length,
      daily_issued: dailyCredentials.length,
      avg_certificates_per_week: Math.round(avgPerWeek * 10) / 10,
      most_popular_course: mostPopularCourse,
      completion_rate_percentage: blockchainConfirmedRate,
      blockchain_confirmed_rate: Math.round(blockchainConfirmedRate * 10) / 10
    };
  };

  // Fetch Complete Credential Information
  const fetchCompleteCredentialInfo = async (credentialId: string): Promise<CompleteCredentialInfo | null> => {
    try {
      setLoadingCredentialDetails(true);
      const response = await fetch(`http://localhost:8000/api/v1/blockchain/credentials/${credentialId}/complete`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        const completeInfo = await response.json();
        console.log('Complete credential info:', completeInfo);
        return completeInfo;
      } else {
        console.error('Failed to fetch complete credential info:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error fetching complete credential info:', error);
      return null;
    } finally {
      setLoadingCredentialDetails(false);
    }
  };

  // Load more credentials for infinite scroll
  const loadMoreCredentials = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCredentials(nextPage, true);
    }
  }, [page, isLoading, hasMore]);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      await fetchCredentials(1);
      setIsLoading(false);
    };
    
    initializeData();
  }, []);


  // View credential details
  const viewCredential = async (credential: IssuedCredential) => {
    // Start full-screen loading animation
    setIsLoadingCredential(true);
    
    try {
      const completeInfo = await fetchCompleteCredentialInfo(credential.credential_id);
      if (completeInfo) {
        setSelectedCredential(completeInfo);
        setShowCredentialModal(true);
      } else {
        alert('Failed to load complete credential information');
      }
    } catch (error) {
      console.error('Error loading credential:', error);
      alert('Failed to load complete credential information');
    } finally {
      // Clear loading state
      setIsLoadingCredential(false);
    }
  };

  return (
    <RoleGuard allowedPath="/dashboard/institution" requiredRole="issuer">
      <DashboardLayout title={t('dashboard')}>
        <div className="w-full p-4 sm:p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{t('dashboardOverview')}</h1>
            <p className="text-gray-600 mt-2">{t('dashboardDescription')}</p>
          </div>

                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Credentials */}
                    <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-blue-500">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">{t('totalCredentials')}</dt>
                              <dd className="text-2xl font-bold text-gray-900">{stats.total_credentials}</dd>
                              <dd className="text-xs text-gray-500">All time issued</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* This Month */}
                    <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-green-500">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">{t('thisMonth')}</dt>
                              <dd className="text-2xl font-bold text-gray-900">{stats.monthly_issued}</dd>
                              <dd className="text-xs text-gray-500">Last 30 days</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* This Week */}
                    <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-yellow-500">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">{t('thisWeek')}</dt>
                              <dd className="text-2xl font-bold text-gray-900">{stats.weekly_issued}</dd>
                              <dd className="text-xs text-gray-500">Last 7 days</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Unique Learners */}
                    <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-purple-500">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">{t('uniqueLearners')}</dt>
                              <dd className="text-2xl font-bold text-gray-900">{stats.active_learners}</dd>
                              <dd className="text-xs text-gray-500">Total certified</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Today's Issued */}
                    <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-indigo-500">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">{t('today')}</dt>
                              <dd className="text-2xl font-bold text-gray-900">{stats.daily_issued}</dd>
                              <dd className="text-xs text-gray-500">Certificates issued</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Average Per Week */}
                    <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-pink-500">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">{t('avgWeek')}</dt>
                              <dd className="text-2xl font-bold text-gray-900">{stats.avg_certificates_per_week}</dd>
                              <dd className="text-xs text-gray-500">Last 4 weeks</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Blockchain Confirmation Rate */}
                    <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-emerald-500">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">{t('confirmed')}</dt>
                              <dd className="text-2xl font-bold text-gray-900">{stats.blockchain_confirmed_rate}%</dd>
                              <dd className="text-xs text-gray-500">Blockchain verified</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Most Popular Course */}
                    <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-orange-500">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">{t('popularCourse')}</dt>
                              <dd className="text-lg font-bold text-gray-900 truncate">{stats.most_popular_course}</dd>
                              <dd className="text-xs text-gray-500">Most issued</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

          {/* Issued Credentials Section */}
          <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">{t('issuedCredentials')}</h3>
                
                {credentials.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">{t('noCredentials')}</h3>
                    <p className="mt-1 text-sm text-gray-500">{t('noCredentialsDescription')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {credentials.map((credential) => (
                      <div
                        key={credential.credential_id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => viewCredential(credential)}
                      >
                        
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h4 className="text-sm font-medium text-gray-900">
                                {credential.credential_details?.title || 'Certificate'}
                              </h4>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                credential.credential_details?.status === 'issued' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {credential.credential_details?.status}
                              </span>
                            </div>
                            <div className="mt-1 text-sm text-gray-500">
                              <span>ID: {credential.credential_id}</span>
                              <span className="mx-2">•</span>
                              <span>Issued: {new Date(credential.created_at).toLocaleDateString()}</span>
                            </div>
                            {credential.original_credential_data?.vc_payload?.credentialSubject?.skills && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {credential.original_credential_data.vc_payload.credentialSubject.skills.slice(0, 3).map((skill: any, index: any) => (
                                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {skill}
                                  </span>
                                ))}
                                {credential.original_credential_data.vc_payload.credentialSubject.skills.length > 3 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    +{credential.original_credential_data.vc_payload.credentialSubject.skills.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {hasMore && (
                      <div className="text-center py-4">
                        <button
                          onClick={loadMoreCredentials}
                          disabled={isLoading}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          {isLoading ? 'Loading...' : 'Load More'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
          </div>

          {/* Credential Detail Modal */}
          {showCredentialModal && selectedCredential && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">Credential Details</h3>
                  <button
                    onClick={() => setShowCredentialModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-6">
                  {loadingCredentialDetails ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Loading credential details...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      
                      {/* Credential Basic Info Block */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-bold text-gray-900">Credential Information</h4>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Credential ID</label>
                            <p className="text-sm text-gray-900 font-mono bg-white p-2 rounded border break-all">{selectedCredential.credential_id}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Certificate Title</label>
                            <p className="text-sm text-gray-900 bg-white p-2 rounded border">{selectedCredential.credential_details?.title}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              selectedCredential.credential_details?.status === 'issued' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {selectedCredential.credential_details?.status}
                            </span>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Issued Date</label>
                            <p className="text-sm text-gray-900">{selectedCredential.credential_details?.issued_at ? new Date(selectedCredential.credential_details.issued_at).toLocaleDateString() : 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Grade</label>
                            <p className="text-sm text-gray-900 bg-white p-2 rounded border">{selectedCredential.credential_details?.grade || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Learner Details Block */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-bold text-gray-900">Learner Details</h4>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Learner Name</label>
                            <p className="text-sm text-gray-900 bg-white p-2 rounded border">{selectedCredential.credential_details?.learner_name}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Wallet Address</label>
                            <p className="text-xs text-gray-900 font-mono bg-white p-2 rounded border break-all">{selectedCredential.credential_details?.learner_address}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Completion Date</label>
                            <p className="text-sm text-gray-900 bg-white p-2 rounded border">{selectedCredential.credential_details?.completion_date ? new Date(selectedCredential.credential_details.completion_date).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Blockchain Data Block */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-bold text-gray-900">Blockchain Data</h4>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Credential Hash</label>
                            <p className="text-xs text-gray-900 font-mono bg-white p-2 rounded border break-all">{selectedCredential.blockchain_data?.credential_hash}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Blockchain Status</label>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              selectedCredential.blockchain_data?.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {selectedCredential.blockchain_data?.status}
                            </span>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Verification Status</label>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              selectedCredential.blockchain_verification?.is_valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {selectedCredential.blockchain_verification?.is_valid ? 'Valid' : 'Invalid'}
                            </span>
                          </div>
                          {selectedCredential.blockchain_verification?.verified_at && (
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Verified At</label>
                              <p className="text-sm text-gray-900 bg-white p-2 rounded border">{new Date(selectedCredential.blockchain_verification.verified_at * 1000).toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* QR Code Block */}
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-bold text-gray-900">QR Code</h4>
                        </div>
                        {selectedCredential.qr_code_available && selectedCredential.qr_code_data?.qr_code_image ? (
                          <div className="text-center">
                            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-3 inline-block">
                              <img
                                src={`data:image/png;base64,${selectedCredential.qr_code_data.qr_code_image}`}
                                alt="Certificate QR Code"
                                className="w-32 h-32"
                              />
                            </div>
                            <p className="text-xs text-gray-600">Scan to verify certificate</p>
                            <div className="mt-2 text-xs text-gray-500">
                              <p>Size: {selectedCredential.qr_code_data?.image_size}</p>
                              <p>Template: {selectedCredential.qr_code_data?.template}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center">QR code not available</p>
                        )}
                      </div>

                      {/* Verification URL Block */}
                      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-bold text-gray-900">Verification URL</h4>
                        </div>
                        {selectedCredential.qr_code_available && selectedCredential.qr_code_data?.verification_url ? (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Verification Link</label>
                              <p className="text-xs text-blue-600 font-mono bg-white p-2 rounded border break-all">{selectedCredential.qr_code_data.verification_url}</p>
                            </div>
                            <button
                              onClick={() => window.open(selectedCredential.qr_code_data.verification_url, '_blank')}
                              className="w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
                            >
                              Open Verification Page
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center">Verification URL not available</p>
                        )}
                      </div>

                      {/* Certificate Details Block */}
                      <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-6 lg:col-span-2 xl:col-span-3">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-bold text-gray-900">Certificate Details</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Issuer</label>
                            <p className="text-sm text-gray-900 bg-white p-2 rounded border">{selectedCredential.credential_details?.issuer_name}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Credential Type</label>
                            <p className="text-sm text-gray-900 bg-white p-2 rounded border">{selectedCredential.credential_details?.credential_type}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Last Updated</label>
                            <p className="text-sm text-gray-900 bg-white p-2 rounded border">{selectedCredential.last_updated ? new Date(selectedCredential.last_updated).toLocaleDateString() : 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Created At</label>
                            <p className="text-sm text-gray-900 bg-white p-2 rounded border">{selectedCredential.created_at ? new Date(selectedCredential.created_at).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        </div>
                        
                        {/* Original Credential Data */}
                        {selectedCredential.original_credential_data && (
                          <div className="mt-6">
                            <h5 className="text-sm font-semibold text-gray-700 mb-3">Original Submission Data</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Artifact URL</label>
                                <p className="text-xs text-gray-600 bg-white p-2 rounded border break-all">{selectedCredential.original_credential_data.artifact_url || 'N/A'}</p>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Idempotency Key</label>
                                <p className="text-xs text-gray-600 font-mono bg-white p-2 rounded border break-all">{selectedCredential.original_credential_data.idempotency_key}</p>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Duration</label>
                                <p className="text-sm text-gray-900 bg-white p-2 rounded border">{selectedCredential.original_credential_data.vc_payload?.credentialSubject?.duration || 'N/A'}</p>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Mode</label>
                                <p className="text-sm text-gray-900 bg-white p-2 rounded border">{selectedCredential.original_credential_data.vc_payload?.credentialSubject?.mode || 'N/A'}</p>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Skills Certified</label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {selectedCredential.original_credential_data.vc_payload?.credentialSubject?.skills?.map((skill: any, index: any) => (
                                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>

                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    This certificate is blockchain-verified and tamper-proof
                  </p>
                  <button
                    onClick={() => setShowCredentialModal(false)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Cool Minimalist Wave Loading Animation */}
        {isLoadingCredential && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-20 dark:bg-gray-100 dark:bg-opacity-20 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            {/* Wave Animation */}
            <div className="flex items-center space-x-1 mb-8">
              <div className="w-2 h-8 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-8 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '100ms' }}></div>
              <div className="w-2 h-8 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
              <div className="w-2 h-8 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
              <div className="w-2 h-8 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
            </div>
            
            {/* Loading Text with Fade Effect */}
            <div className="text-center">
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 animate-pulse">{t('loadingCredential')}</p>
            </div>
          </div>
        )}
      </DashboardLayout>
    </RoleGuard>
  );
}
