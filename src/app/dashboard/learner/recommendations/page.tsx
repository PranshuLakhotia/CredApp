'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { AuthService } from '@/services/auth.service';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Button,
  Stack,
  Avatar,
  LinearProgress,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useTranslations } from '@/hooks/useTranslations';
import {
  TrendingUp,
  Star,
  Clock,
  BookOpen,
  Award,
  ArrowRight,
  Bookmark,
  ExternalLink,
  X
} from 'lucide-react';

// API Response interface
interface ApiRecommendation {
  title: string;
  partner: string;
  description: string;
  nsqf_level: number;
  duration: string;
  course_link: string;
  external_link: string;
  image_url: string;
  match_score: number;
}

// UI Display interface
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
  course_link?: string;
  external_link?: string;
  image_url?: string;
  partner?: string;
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState(6);
  const [selectedCourse, setSelectedCourse] = useState<Recommendation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  // adding filter
  const [filters, setFilters] = useState({
    sector: "",
    nsqf: "",
    duration: "",
  });
  // end adding filter
  const t = useTranslations('recommendations');

  // Map API response to UI format
  const mapApiToRecommendation = (apiRec: ApiRecommendation): Recommendation => ({
    course_id: apiRec.course_link || apiRec.title,
    title: apiRec.title,
    description: apiRec.description,
    nsqf_level: apiRec.nsqf_level,
    sector: apiRec.partner,
    partner: apiRec.partner,
    duration: apiRec.duration,
    similarity_score: apiRec.match_score / 100, // Convert percentage to decimal
    course_link: apiRec.course_link,
    external_link: apiRec.external_link,
    image_url: apiRec.image_url,
    skills_covered: ['Digital Skills', 'Computer Literacy'] // Default fallback
  });

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First, get the user profile to extract their context
        let userProfile: any = null;
        try {
          userProfile = await AuthService.getUserProfile();
          console.log('✅ User profile fetched successfully:', userProfile);
          console.log('  - Skills:', userProfile?.skills);
          console.log('  - Education:', userProfile?.education);
          console.log('  - Experience:', userProfile?.experience);
          console.log('  - Preferred NSQF Level:', userProfile?.preferred_nsqf_level);
        } catch (profileError) {
          console.warn('⚠️ Could not fetch user profile, using defaults:', profileError);
        }

        // Extract user's skills, interests, and preferred NSQF level from profile
        // Use actual profile data or fallback to defaults if not available
        const userSkills = (userProfile?.skills && userProfile.skills.length > 0)
          ? userProfile.skills.filter((skill: string) => skill && skill.trim() !== '')
          : ['Programming', 'Web Development'];

        // Since there's no interests field, derive interests from skills or use defaults
        const userInterests = (userProfile?.skills && userProfile.skills.length > 0)
          ? userProfile.skills.slice(0, 5).filter((skill: string) => skill && skill.trim() !== '')
          : ['Technology', 'Software'];

        const preferredNsqf = userProfile?.preferred_nsqf_level || 5;

        // Call the recommendation API with user's context
        const recommendationApiUrl = 'https://gaynell-unspendable-rolanda.ngrok-free.dev/api/v1/recommend';

        const requestBody = {
          skills: userSkills,
          interests: userInterests,
          preferred_nsqf: preferredNsqf
        };

        console.log('📤 Sending recommendation request:');
        console.log('  - User Skills:', userSkills);
        console.log('  - User Interests (derived from skills):', userInterests);
        console.log('  - Preferred NSQF Level:', preferredNsqf);
        console.log('  - Full Request Body:', requestBody);

        const response = await fetch(recommendationApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error(`Recommendation API returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Received recommendations:', data);

        // The API returns an array of recommendations
        const apiRecommendations: ApiRecommendation[] = Array.isArray(data) ? data : (data.recommendations || []);

        // Map API response to UI format
        const mappedRecommendations = apiRecommendations.map(mapApiToRecommendation);

        // Sort by similarity score (match_score)
        const sortedData = mappedRecommendations.sort((a, b) =>
          (b.similarity_score || 0) - (a.similarity_score || 0)
        );

        setRecommendations(sortedData); // Store all recommendations

      } catch (e: any) {
        console.error('Error fetching recommendations:', e);
        setError(e?.response?.data?.detail || e.message || 'Failed to load recommendations. Please try again later.');
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
  // FILTERED RECOMMENDATIONS (memoized + robust parsing)
  const filteredRecommendations = React.useMemo(() => {
    const filtered = recommendations.filter((rec) => {
      // Parse month safely: allow values like "6 months" or just "6". Use radix 10.
      const month = rec?.duration ? parseInt(String(rec.duration), 10) : NaN;

      const sectorMatch = filters.sector ? rec.sector === filters.sector : true;
      const nsqfMatch = filters.nsqf ? rec.nsqf_level <= parseInt(filters.nsqf, 10) : true;
      const durationMatch = filters.duration ? (!isNaN(month) && month <= parseInt(filters.duration, 10)) : true;

      return sectorMatch && nsqfMatch && durationMatch;
    });

    // Return only up to displayLimit
    return filtered.slice(0, displayLimit);
  }, [recommendations, filters, displayLimit]);

  // Handler to load more recommendations
  const handleViewAll = () => {
    setDisplayLimit(prev => prev + 6);
  };

  // Handler to open course link
  const handleCourseClick = (rec: Recommendation, isStartLearning: boolean) => {
    if (isStartLearning) {
      // Start Learning - open external link directly
      const url = rec.external_link || rec.course_link;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } else {
      // View Details - open modal
      setSelectedCourse(rec);
      setModalOpen(true);
    }
  };

  // Handler to close modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCourse(null);
  };

  // Handler to open link from modal
  const handleOpenLink = (url: string | undefined) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
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
                    {filteredRecommendations.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Top Matches
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {getMatchPercentage(filteredRecommendations[0]?.similarity_score || 0)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Best Match
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {filteredRecommendations.length > 0 ? Math.round(filteredRecommendations.reduce((acc, rec) => acc + rec.nsqf_level, 0) / filteredRecommendations.length) : '-'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg NSQF Level
                  </Typography>
                </Box>
              </Stack>
            </Box>
            {/* filter*/}
            {/* Filters */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 3,
                flexWrap: "wrap"
              }}
            >
              <Box>
                <Typography variant="caption" fontWeight={600}>Sector/Partner</Typography>
                <select
                  value={filters.sector}
                  onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    width: "200px"
                  }}
                >
                  <option value="">All Partners</option>
                  {Array.from(new Set(recommendations.map(r => r.sector).filter(Boolean))).map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </Box>

              <Box>
                <Typography variant="caption" fontWeight={600}>NSQF Level</Typography>
                <select
                  value={filters.nsqf}
                  onChange={(e) => setFilters({ ...filters, nsqf: e.target.value })}
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    width: "160px"
                  }}
                >
                  <option value="">All Levels</option>
                  <option value="4">Up to 4</option>
                  <option value="5">Up to 5</option>
                  <option value="6">Up to 6</option>
                  <option value="7">Up to 7</option>
                </select>
              </Box>

              <Box>
                <Typography variant="caption" fontWeight={600}>Duration</Typography>
                <select
                  value={filters.duration}
                  onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    width: "160px"
                  }}
                >
                  <option value="">Any</option>
                  <option value="3">3 months or less</option>
                  <option value="4">4 months</option>
                  <option value="5">5 months</option>
                  <option value="6">6 months</option>
                </select>
              </Box>

              <Box sx={{ display: "flex", alignItems: "flex-end" }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setFilters({ sector: "", nsqf: "", duration: "" })}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: "8px",
                    padding: "8px 16px"
                  }}
                >
                  Reset Filters
                </Button>
              </Box>
            </Box>




            {/* Recommendations Grid */}
            <Grid container spacing={3}>
              {filteredRecommendations.map((rec, index) => (
                <Grid size={{ xs: 12, md: 6 }} key={rec.course_id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 4,
                      boxShadow: 3,
                      border: index === 0 ? "2px solid" : "1px solid",
                      borderColor: index === 0 ? "primary.main" : "divider",
                      position: "relative",
                      transition: "all 0.3s ease",
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6
                      }
                    }}
                  >
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

                    <CardContent sx={{ p: 4, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                      {/* Course Image (if available) */}
                      {rec.image_url && (
                        <Box sx={{ mb: 2, borderRadius: 2, overflow: 'hidden', height: 160 }}>
                          <img
                            src={rec.image_url}
                            alt={rec.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              // Hide image if it fails to load
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </Box>
                      )}
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
                        onClick={() => handleCourseClick(rec, index === 0)}
                        sx={{
                          py: 1.5,
                          fontWeight: 600,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '1rem',
                          mt: "auto"
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
            {filteredRecommendations.length < recommendations.length && (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button
                  variant="text"
                  size="large"
                  endIcon={<ArrowRight size={20} />}
                  onClick={handleViewAll}
                  sx={{
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1.1rem'
                  }}
                >
                  View More Recommendations ({recommendations.length - filteredRecommendations.length} more)
                </Button>
              </Box>
            )}
          </Stack>
        )}
      </Box>

      {/* Course Details Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2
        }}>
          <Typography variant="h5" component="span" sx={{ fontWeight: 700 }}>
            Course Details
          </Typography>
          <IconButton onClick={handleCloseModal} size="small">
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedCourse && (
            <Stack spacing={3}>
              {/* Course Image */}
              {selectedCourse.image_url && (
                <Box sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  height: 250,
                  bgcolor: 'grey.100'
                }}>
                  <img
                    src={selectedCourse.image_url}
                    alt={selectedCourse.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </Box>
              )}

              {/* Title */}
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {selectedCourse.title}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    label={`NSQF Level ${selectedCourse.nsqf_level}`}
                    sx={{
                      bgcolor: getNSQFColor(selectedCourse.nsqf_level),
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                  {selectedCourse.partner && (
                    <Chip
                      icon={<Award size={16} />}
                      label={selectedCourse.partner}
                      variant="outlined"
                      color="primary"
                    />
                  )}
                </Stack>
              </Box>

              {/* Match Score */}
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Match Score
                  </Typography>
                  <Typography variant="h6" sx={{
                    fontWeight: 700,
                    color: getMatchPercentage(selectedCourse.similarity_score) >= 70 ? 'success.main' :
                      getMatchPercentage(selectedCourse.similarity_score) >= 50 ? 'warning.main' : 'error.main'
                  }}>
                    {getMatchPercentage(selectedCourse.similarity_score)}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={getMatchPercentage(selectedCourse.similarity_score)}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      bgcolor: getMatchPercentage(selectedCourse.similarity_score) >= 70 ? 'success.main' :
                        getMatchPercentage(selectedCourse.similarity_score) >= 50 ? 'warning.main' : 'error.main'
                    }
                  }}
                />
              </Box>

              <Divider />

              {/* Course Info */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Clock size={18} color="#666" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Duration</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedCourse.duration}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <BookOpen size={18} color="#666" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Sector</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedCourse.sector || 'N/A'}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>

              <Divider />

              {/* Description */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Course Description
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {selectedCourse.description}
                </Typography>
              </Box>

              {/* Skills */}
              {selectedCourse.skills_covered && selectedCourse.skills_covered.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Skills Covered
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {selectedCourse.skills_covered.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: 'primary.main',
                          color: 'primary.main'
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          {selectedCourse?.course_link && (
            <Button
              variant="outlined"
              startIcon={<BookOpen size={18} />}
              onClick={() => handleOpenLink(selectedCourse.course_link)}
              sx={{
                flex: 1,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none'
              }}
            >
              View Course Details
            </Button>
          )}
          {selectedCourse?.external_link && (
            <Button
              variant="contained"
              startIcon={<ExternalLink size={18} />}
              onClick={() => handleOpenLink(selectedCourse.external_link)}
              sx={{
                flex: 1,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none'
              }}
            >
              Start Learning on Platform
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
