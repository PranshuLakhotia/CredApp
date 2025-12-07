

'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  Card, 
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  InputAdornment
} from '@mui/material';
import { 
  Search as SearchIcon, 
  School as SchoolIcon,
  AutoGraph as GraphIcon,
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon
} from '@mui/icons-material';
import { NSQFService } from '@/services/nsqf.service';
import { LearnerCredential } from '@/services/learner.service';

interface NSQFStats {
  total_courses: number;
  courses_by_level: Record<string, number>;
  collection_name: string;
}

// Blue-themed color palette
const COLORS = ['#3b82f6', '#2563eb', '#1d4ed8', '#60a5fa', '#1e40af', '#0ea5e9', '#0284c7', '#0369a1'];

export default function ProfilePathwaysPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  const [credentials, setCredentials] = useState<LearnerCredential[]>([]);
  const [loadingCredentials, setLoadingCredentials] = useState(true);
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const lineChartRef = useRef<HTMLCanvasElement>(null);
  const barChartInstance = useRef<any>(null);
  const lineChartInstance = useRef<any>(null);

  // Hardcoded certificate data
  const hardcodedCredentials = [
    {
      name: 'AWS SOLUTIONS ARCHITECT',
      issuer: 'Amazon Web Services',
      issueDate: '2023-01-30',
      nsqfLevel: 3
    },
    {
      name: 'AWS SOLUTIONS ARCHITECT',
      issuer: 'Amazon Web Services',
      issueDate: '2023-01-30',
      nsqfLevel: 5
    },
    {
      name: 'AWS SOLUTIONS ARCHITECT',
      issuer: 'Amazon Web Services',
      issueDate: '2025-01-10',
      nsqfLevel: 5
    },
    {
      name: 'Computer Architecture',
      issuer: 'IIT Kharagpur',
      issueDate: '2025-01-14',
      nsqfLevel: 8
    },
    {
      name: 'Machine Learning',
      issuer: 'Coursera',
      issueDate: '2025-01-25',
      nsqfLevel: 5
    },
    {
      name: 'AWS SOLUTIONS ARCHITECT',
      issuer: 'Amazon Web Services',
      issueDate: '2025-01-30',
      nsqfLevel: 3
    }
  ];

  useEffect(() => {
    setLoadingCredentials(false);
    setCredentials(hardcodedCredentials as any);
  }, []);

  // Initialize Bar Chart
  useEffect(() => {
    const loadBarChart = async () => {
      if (typeof window !== 'undefined' && barChartRef.current) {
        const Chart = (await import('chart.js/auto')).default;
        
        if (barChartInstance.current) {
          barChartInstance.current.destroy();
        }

        const sortedData = [...hardcodedCredentials].sort(
          (a, b) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
        );

        const ctx = barChartRef.current.getContext('2d');
        if (ctx) {
          barChartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: sortedData.map(cert => {
                const date = new Date(cert.issueDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  year: 'numeric' 
                });
                return `${cert.name.substring(0, 20)}...\n${date}`;
              }),
              datasets: [{
                label: 'NSQF Level',
                data: sortedData.map(cert => cert.nsqfLevel),
                backgroundColor: sortedData.map((_, index) => COLORS[index % COLORS.length]),
                borderColor: sortedData.map((_, index) => COLORS[index % COLORS.length]),
                borderWidth: 2,
                borderRadius: 8,
                barThickness: 40
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 10,
                  ticks: {
                    stepSize: 1,
                    font: { size: 11 }
                  },
                  title: {
                    display: true,
                    text: 'NSQF Level',
                    font: { size: 13, weight: 'bold' }
                  }
                },
                x: {
                  ticks: {
                    font: { size: 9 },
                    maxRotation: 45,
                    minRotation: 45
                  }
                }
              },
              plugins: {
                legend: { display: true, position: 'top' },
                tooltip: {
                  callbacks: {
                    title: (context) => {
                      const index = context[0].dataIndex;
                      return sortedData[index].name;
                    },
                    label: (context) => {
                      const index = context.dataIndex;
                      const cert = sortedData[index];
                      return [
                        `NSQF Level: ${cert.nsqfLevel}`,
                        `Issuer: ${cert.issuer}`,
                        `Date: ${new Date(cert.issueDate).toLocaleDateString()}`
                      ];
                    }
                  }
                }
              }
            }
          });
        }
      }
    };

    loadBarChart();

    return () => {
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }
    };
  }, []);

  // Initialize Line Chart
  useEffect(() => {
    const loadLineChart = async () => {
      if (typeof window !== 'undefined' && lineChartRef.current) {
        const Chart = (await import('chart.js/auto')).default;
        
        if (lineChartInstance.current) {
          lineChartInstance.current.destroy();
        }

        const sortedData = [...hardcodedCredentials].sort(
          (a, b) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
        );

        const ctx = lineChartRef.current.getContext('2d');
        if (ctx) {
          lineChartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
              labels: sortedData.map(cert => {
                return new Date(cert.issueDate).toLocaleDateString('en-US', { 
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric' 
                });
              }),
              datasets: [{
                label: 'NSQF Level Progression',
                data: sortedData.map(cert => cert.nsqfLevel),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: sortedData.map((_, index) => COLORS[index % COLORS.length]),
                pointBorderColor: '#fff',
                pointBorderWidth: 2
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 10,
                  ticks: {
                    stepSize: 1,
                    font: { size: 11 }
                  },
                  title: {
                    display: true,
                    text: 'NSQF Level',
                    font: { size: 13, weight: 'bold' }
                  }
                },
                x: {
                  ticks: {
                    font: { size: 9 },
                    maxRotation: 45,
                    minRotation: 45
                  },
                  title: {
                    display: true,
                    text: 'Timeline',
                    font: { size: 13, weight: 'bold' }
                  }
                }
              },
              plugins: {
                legend: { display: true, position: 'top' },
                tooltip: {
                  callbacks: {
                    title: (context) => {
                      const index = context[0].dataIndex;
                      return sortedData[index].name;
                    },
                    label: (context) => {
                      const index = context.dataIndex;
                      const cert = sortedData[index];
                      return [
                        `NSQF Level: ${cert.nsqfLevel}`,
                        `Issuer: ${cert.issuer}`,
                        `Date: ${new Date(cert.issueDate).toLocaleDateString()}`
                      ];
                    }
                  }
                }
              }
            }
          });
        }
      }
    };

    loadLineChart();

    return () => {
      if (lineChartInstance.current) {
        lineChartInstance.current.destroy();
      }
    };
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter a course name');
      return;
    }

    setSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const result = await NSQFService.getNSQFByCourse(searchQuery.trim());
      setSearchResult(result);
      if (!result.found) {
        setSearchError('Course not found. Try searching with a different name.');
      }
    } catch (error: any) {
      setSearchError(error.message || 'Failed to search course');
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const totalCertificates = hardcodedCredentials.length;

  return (
    <DashboardLayout title="Learning Pathways">
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <GraphIcon sx={{ fontSize: 32, color: '#3b82f6' }} />
            Learning Pathways
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your learning journey and explore NSQF course levels
          </Typography>
        </Box>

        <Grid container spacing={0}>
          {/* Bar Chart - 50% width */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChartIcon sx={{ color: '#3b82f6', fontSize: 22 }} />
                Certificate Distribution
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Bar chart showing {totalCertificates} certificates by NSQF level
              </Typography>
              
              <Box sx={{ height: 350, width: '100%', position: 'relative' }}>
                <canvas ref={barChartRef} />
              </Box>
            </Paper>
          </Grid>

          {/* Line Chart - 50% width */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShowChartIcon sx={{ color: '#3b82f6', fontSize: 22 }} />
                Learning Progress Timeline
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Line chart showing your skill progression over time
              </Typography>
              
              <Box sx={{ height: 350, width: '100%', position: 'relative' }}>
                <canvas ref={lineChartRef} />
              </Box>
            </Paper>
          </Grid>

          {/* NSQF Course Search - Enhanced UI */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SearchIcon sx={{ color: '#3b82f6' }} />
                NSQF Course Level Lookup
              </Typography>
              
              {/* Enhanced Search Bar */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Enter course name (e.g., CRM Domestic Voice, Web Development)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={searching}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#3b82f6' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '48px',
                        fontSize: '0.95rem',
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSearch}
                    disabled={searching || !searchQuery.trim()}
                    startIcon={searching ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <SearchIcon />}
                    sx={{ 
                      height: '48px',
                      minWidth: '120px',
                      px: 3,
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      bgcolor: '#3b82f6',
                      '&:hover': {
                        bgcolor: '#2563eb',
                      }
                    }}
                  >
                    {searching ? 'Searching...' : 'Search'}
                  </Button>
                </Box>
              </Box>

              {searchError && (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                  {searchError}
                </Alert>
              )}

              {searchResult && searchResult.found && (
                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
                  border: '2px solid #3b82f6',
                  borderRadius: 3,
                  mb: 3
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={8}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {searchResult.course_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Course found in NSQF database
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                          <Chip
                            label={`NSQF Level ${searchResult.nsqf_level}`}
                            sx={{ 
                              fontSize: '1.1rem',
                              fontWeight: 700,
                              py: 2.5,
                              px: 2,
                              bgcolor: '#3b82f6',
                              color: 'white'
                            }}
                            icon={<SchoolIcon />}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              <Divider sx={{ my: 3 }} />

              {/* NSQF Level Guide */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
                  NSQF Level Guide
                </Typography>
                <Grid container spacing={1}>
                  {[
                    { level: 1, desc: 'Basic/Foundation' },
                    { level: 2, desc: 'Elementary' },
                    { level: 3, desc: 'Intermediate' },
                    { level: 4, desc: 'Advanced' },
                    { level: 5, desc: 'Diploma' },
                    { level: 6, desc: 'Advanced Diploma' },
                    { level: 7, desc: 'Bachelor Degree' },
                    { level: 8, desc: 'Master Degree' },
                  ].map((item) => (
                    <Grid item xs={6} sm={4} md={3} key={item.level}>
                      <Chip
                        label={`L${item.level}: ${item.desc}`}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          width: '100%', 
                          justifyContent: 'flex-start',
                          borderColor: '#3b82f6',
                          color: '#3b82f6'
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}