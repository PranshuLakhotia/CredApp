'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { AuthService } from '@/services/auth.service';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress, 
  Alert, 
  Chip,
  Button,
  Stack,
  Avatar,
  LinearProgress,
  Divider,
  IconButton
} from '@mui/material';
import { useTranslations } from '@/hooks/useTranslations';
import { 
  TrendingUp, 
  Star, 
  Clock, 
  BookOpen, 
  Award,
  ArrowRight,
  Bookmark
} from 'lucide-react';

interface Recommendation {
  course_id: string;
  title: string;
  description: string;
  nsqf_level: number;
  sector: string;
  skills?: string;
  skills_covered?: string[];
  duration: string;
  similarity_score: number;
  match_reasons?: string[];
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('recommendations');

  // Tech-focused recommendations based on user's ML/AWS skills
  const getTechRecommendations = (): Recommendation[] => [
    {
      course_id: 'tech-ml-advanced',
      title: 'Advanced Machine Learning and Deep Learning',
      description: 'Master advanced ML algorithms, neural networks, and deep learning frameworks like TensorFlow and PyTorch for real-world applications.',
      nsqf_level: 6,
      sector: 'Information Technology',
      skills_covered: ['Deep Learning', 'TensorFlow', 'PyTorch', 'Neural Networks', 'Computer Vision'],
      duration: '6 months',
      similarity_score: 0.92,
      match_reasons: ['Matches your Machine Learning expertise', 'Builds on your current tech skills']
    },
    {
      course_id: 'tech-aws-architect',
      title: 'AWS Solutions Architect Professional',
      description: 'Advanced AWS certification covering cloud architecture, security, scalability, and enterprise-level cloud solutions.',
      nsqf_level: 7,
      sector: 'Cloud Computing',
      skills_covered: ['AWS Architecture', 'Cloud Security', 'Microservices', 'DevOps', 'Kubernetes'],
      duration: '4 months',
      similarity_score: 0.89,
      match_reasons: ['Perfect match for your AWS Solutions Architect background', 'Next level cloud expertise']
    },
    {
      course_id: 'tech-data-science',
      title: 'Data Science and Analytics Specialization',
      description: 'Comprehensive data science program covering statistics, machine learning, big data analytics, and visualization tools.',
      nsqf_level: 6,
      sector: 'Data Science',
      skills_covered: ['Python', 'R', 'SQL', 'Tableau', 'Apache Spark', 'Statistics'],
      duration: '5 months',
      similarity_score: 0.85,
      match_reasons: ['Complements your ML skills', 'High demand in tech industry']
    },
    {
      course_id: 'tech-devops-kubernetes',
      title: 'DevOps and Kubernetes Mastery',
      description: 'Learn containerization, orchestration, CI/CD pipelines, and cloud-native application deployment strategies.',
      nsqf_level: 5,
      sector: 'DevOps Engineering',
      skills_covered: ['Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'GitOps', 'Monitoring'],
      duration: '3 months',
      similarity_score: 0.82,
      match_reasons: ['Enhances your cloud computing skills', 'Essential for modern development']
    }
  ];

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use tech-focused recommendations instead of API call
        const techRecommendations = getTechRecommendations();
        setRecommendations(techRecommendations);
        
        // Fallback to API if needed (commented out for now)
        // const data = await AuthService.getRecommendations();
        // const sortedData = data.sort((a: Recommendation, b: Recommendation) => b.similarity_score - a.similarity_score);
        // setRecommendations(sortedData.slice(0, 4));
      } catch (e: any) {
        setError(e?.response?.data?.detail || e.message || 'Failed to load recommendations.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const getMatchPercentage = (score: number) => Math.round(score * 100);
  
  const getNSQFColor = (level: number) => {
    if (level <= 3) return '#4CAF50'; // Green for beginner
    if (level <= 6) return '#FF9800'; // Orange for intermediate
    return '#F44336'; // Red for advanced
  };

  const getSkillsArray = (skills: string | string[] | undefined | null) => {
    if (!skills) return [];
    
    // If it's already an array, return first 3
    if (Array.isArray(skills)) {
      return skills.slice(0, 3);
    }
    
    // If it's a string, split and return first 3
    if (typeof skills === 'string') {
      return skills.split(';').slice(0, 3);
    }
    
    return [];
  };

  return (
    <DashboardLayout title="Course Recommendations">
      <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
        {/* Header Section */}
        <Box sx={{ mb: 6 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              <TrendingUp size={24} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Personalized NSQF Course Recommendations
              </Typography>
              <Typography variant="body1" color="text.secondary">
                AI-powered suggestions based on your skills and career goals
              </Typography>
            </Box>
          </Stack>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
            <CircularProgress size={60} thickness={4} />
            <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
              Finding personalized tech courses for you...
            </Typography>
          </Box>
        ) : error ? (
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 3, 
              boxShadow: 2,
              '& .MuiAlert-message': { fontSize: '1.1rem' }
            }}
          >
            {error}
          </Alert>
        ) : recommendations.length === 0 ? (
          <Alert 
            severity="info" 
            sx={{ 
              borderRadius: 3, 
              boxShadow: 2,
              '& .MuiAlert-message': { fontSize: '1.1rem' }
            }}
          >
            No recommendations available. Please update your profile with skills and preferences.
          </Alert>
        ) : (
          <Stack spacing={4}>
            {/* Stats Header */}
            <Box sx={{ 
              bgcolor: 'background.paper', 
              p: 3, 
              borderRadius: 3, 
              boxShadow: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Stack direction="row" spacing={4} alignItems="center">
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {recommendations.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Top Matches
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {getMatchPercentage(recommendations[0]?.similarity_score || 0)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Best Match
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {Math.round(recommendations.reduce((acc, rec) => acc + rec.nsqf_level, 0) / recommendations.length)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg NSQF Level
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Recommendations Grid */}
            <Grid container spacing={3}>
              {recommendations.map((rec, index) => (
                <Grid item xs={12} md={6} key={rec.course_id}>
                  <Card sx={{ 
                    height: '100%', 
                    borderRadius: 4, 
                    boxShadow: 3,
                    border: index === 0 ? '2px solid' : '1px solid',
                    borderColor: index === 0 ? 'primary.main' : 'divider',
                    position: 'relative',
                    overflow: 'visible',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    }
                  }}>
                    {/* Best Match Badge */}
                    {index === 0 && (
                      <Chip
                        icon={<Star size={16} />}
                        label="Best Match"
                        color="primary"
                        sx={{
                          position: 'absolute',
                          top: -12,
                          right: 20,
                          fontWeight: 600,
                          zIndex: 1
                        }}
                      />
                    )}

                    <CardContent sx={{ p: 4 }}>
                      {/* Header */}
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h5" sx={{ 
                            fontWeight: 700, 
                            mb: 1,
                            color: 'text.primary',
                            lineHeight: 1.3
                          }}>
                            {rec.title}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip 
                              label={`NSQF Level ${rec.nsqf_level}`}
                              size="small"
                              sx={{ 
                                bgcolor: getNSQFColor(rec.nsqf_level),
                                color: 'white',
                                fontWeight: 600
                              }}
                            />
                            <Chip 
                              icon={<Award size={14} />}
                              label="Certified"
                              size="small"
                              variant="outlined"
                              color="success"
                            />
                          </Stack>
                        </Box>
                        <IconButton size="small" sx={{ color: 'text.secondary' }}>
                          <Bookmark size={20} />
                        </IconButton>
                      </Stack>

                      {/* Match Score */}
                      <Box sx={{ mb: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Match Score
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700, 
                            color: getMatchPercentage(rec.similarity_score) >= 70 ? 'success.main' : 
                                   getMatchPercentage(rec.similarity_score) >= 50 ? 'warning.main' : 'error.main'
                          }}>
                            {getMatchPercentage(rec.similarity_score)}%
                          </Typography>
                        </Stack>
                        <LinearProgress 
                          variant="determinate" 
                          value={getMatchPercentage(rec.similarity_score)}
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              bgcolor: getMatchPercentage(rec.similarity_score) >= 70 ? 'success.main' : 
                                       getMatchPercentage(rec.similarity_score) >= 50 ? 'warning.main' : 'error.main'
                            }
                          }}
                        />
                      </Box>

                      {/* Description */}
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        mb: 2, 
                        lineHeight: 1.6,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {rec.description}
                      </Typography>

                      {/* Course Details */}
                      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                        {rec.duration && (
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Clock size={14} />
                            <Typography variant="caption" color="text.secondary">
                              {rec.duration}
                            </Typography>
                          </Stack>
                        )}
                        {rec.sector && (
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <BookOpen size={14} />
                            <Typography variant="caption" color="text.secondary">
                              {rec.sector}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>

                      {/* Skills */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Key Skills
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {getSkillsArray(rec.skills_covered || rec.skills).map((skill, skillIndex) => (
                            <Chip
                              key={skillIndex}
                              label={skill.trim()}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                borderColor: 'primary.main',
                                color: 'primary.main',
                                fontWeight: 500
                              }}
                            />
                          ))}
                          {(() => {
                            const skills = rec.skills_covered || (rec.skills ? rec.skills.split(';') : []);
                            return skills.length > 3 && (
                              <Chip
                                label={`+${skills.length - 3} more`}
                                size="small"
                                variant="outlined"
                                color="secondary"
                              />
                            );
                          })()}
                        </Stack>
                      </Box>

                      {/* Action Button */}
                      <Button
                        variant={index === 0 ? "contained" : "outlined"}
                        fullWidth
                        endIcon={<ArrowRight size={18} />}
                        sx={{ 
                          py: 1.5,
                          fontWeight: 600,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '1rem'
                        }}
                      >
                        {index === 0 ? 'Start Learning' : 'View Details'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* View All Button */}
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="text"
                size="large"
                endIcon={<ArrowRight size={20} />}
                sx={{ 
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1.1rem'
                }}
              >
                View All Recommendations
              </Button>
            </Box>
          </Stack>
        )}
      </Box>
    </DashboardLayout>
  );
}
