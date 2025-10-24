'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardLoader from '@/components/common/DashboardLoader';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  Avatar,
  LinearProgress,
  Fade,
  Zoom,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  VerifiedUser,
  People,
  Assessment,
  Cloud,
  Psychology,
  Analytics,
} from '@mui/icons-material';

// Types
interface EmployerAnalytics {
  total_verifications: number;
  verified_learners_hired: number;
  recent_verification_results: {
    verified: number;
    unverified: number;
    revoked: number;
  };
  blockchain_verification_status: {
    total_anchored: number;
    pending: number;
    failed: number;
  };
  mini_analytics: {
    verified: number;
    unverified: number;
    avg_nsqf_level: number;
    top_skills: string[];
  };
}


export default function EmployerDashboard() {
  const [analytics, setAnalytics] = useState<EmployerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }
      
      const response = await fetch('https://credhub.twilightparadox.com/api/v1/employer/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.analytics) {
          setAnalytics(data.analytics);
        } else {
          console.error('Invalid response format:', data);
          setAnalytics(null);
        }
      } else {
        console.error('Failed to fetch analytics:', response.status);
        setAnalytics(null);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <DashboardLayout title="Employer Dashboard">
        <DashboardLoader 
          title="Loading Dashboard" 
          message="Fetching your analytics and verification data..." 
        />
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout title="Employer Dashboard">
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" color="error" sx={{ textAlign: 'center', mt: 4 }}>
            Failed to load analytics data. Please try again.
          </Typography>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button variant="contained" onClick={fetchAnalytics}>
              Retry
            </Button>
          </Box>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Employer Dashboard">
      <Box sx={{ p: { xs: 2, sm: 3, md: 4, lg: 5 }, maxWidth: '100%', mx: 'auto' }}>
        <Fade in={true} timeout={800}>
          <Box>
            {/* Header */}
            <Box sx={{ mb: { xs: 3, sm: 4, md: 5 } }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                 Overview Panel
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Your verification activity summary and key metrics
              </Typography>
            </Box>

            {/* Key Metrics Cards */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: 'repeat(2, 1fr)', 
                md: 'repeat(4, 1fr)' 
              }, 
              gap: { xs: 2, sm: 3, md: 4 }, 
              mb: { xs: 4, sm: 5, md: 6 } 
            }}>
              <Zoom in={true} timeout={600}>
                <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', minHeight: 160 }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Assessment sx={{ mr: 1, fontSize: { xs: 24, sm: 28 } }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        Total Verifications
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}>
                      {analytics?.total_verifications || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      All-time verifications completed
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>

              <Zoom in={true} timeout={800}>
                <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', minHeight: 160 }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <People sx={{ mr: 1, fontSize: { xs: 24, sm: 28 } }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        Hired Learners
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}>
                      {analytics?.verified_learners_hired || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Verified candidates hired
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>

              <Zoom in={true} timeout={1000}>
                <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', minHeight: 160 }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <VerifiedUser sx={{ mr: 1, fontSize: { xs: 24, sm: 28 } }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        Verified
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}>
                      {analytics?.recent_verification_results.verified || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Recent verifications
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>

              <Zoom in={true} timeout={1200}>
                <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', minHeight: 160 }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TrendingUp sx={{ mr: 1, fontSize: { xs: 24, sm: 28 } }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        Avg NSQF
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}>
                      {analytics?.mini_analytics.avg_nsqf_level || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Average skill level
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Box>

            {/* Mini Analytics Cards */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                lg: '2fr 1fr' 
              }, 
              gap: { xs: 2, sm: 3, md: 4 }, 
              mb: { xs: 4, sm: 5, md: 6 } 
            }}>
              <Fade in={true} timeout={1400}>
                <Card sx={{ height: '100%', minHeight: 280 }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                      <Analytics sx={{ mr: 1, color: '#3b82f6' }} />
                      Verification Breakdown
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { 
                        xs: 'repeat(2, 1fr)', 
                        sm: 'repeat(4, 1fr)' 
                      }, 
                      gap: { xs: 1.5, sm: 2, md: 3 } 
                    }}>
                      <Box sx={{ textAlign: 'center', p: { xs: 2, sm: 2.5, md: 3 }, bgcolor: '#f0f9ff', borderRadius: 2, minHeight: 100 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                          {analytics?.mini_analytics.verified || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          Verified
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', p: { xs: 2, sm: 2.5, md: 3 }, bgcolor: '#fffbeb', borderRadius: 2, minHeight: 100 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                          {analytics?.mini_analytics.unverified || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          Unverified
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', p: { xs: 2, sm: 2.5, md: 3 }, bgcolor: '#fef2f2', borderRadius: 2, minHeight: 100 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#ef4444', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                          {analytics?.recent_verification_results.revoked || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          Revoked
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', p: { xs: 2, sm: 2.5, md: 3 }, bgcolor: '#f8fafc', borderRadius: 2, minHeight: 100 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b82f6', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                          {analytics?.mini_analytics.avg_nsqf_level || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          Avg NSQF
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>

              <Fade in={true} timeout={1600}>
                <Card sx={{ height: '100%', minHeight: 280 }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                      <Cloud sx={{ mr: 1, color: '#3b82f6' }} />
                      Top Skills
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
                      {analytics?.mini_analytics.top_skills.slice(0, 5).map((skill, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', p: { xs: 1.5, sm: 2 }, bgcolor: '#f8fafc', borderRadius: 2, minHeight: 48 }}>
                          <Chip
                            label={skill}
                            size="small"
                            sx={{
                              bgcolor: index === 0 ? '#3b82f6' : index === 1 ? '#10b981' : index === 2 ? '#f59e0b' : '#6b7280',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              height: { xs: 24, sm: 28 },
                            }}
                          />
                          <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary', fontWeight: 600 }}>
                            #{index + 1}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Box>

          </Box>
        </Fade>
      </Box>
    </DashboardLayout>
  );
}