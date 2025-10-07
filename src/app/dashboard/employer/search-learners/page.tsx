'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Paper,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import {
  Search,
  ExpandMore,
  FilterList,
  Email,
  Phone,
  LocationOn,
  VerifiedUser,
  Close,
  WorkspacePremium,
  School,
} from '@mui/icons-material';

// Types
interface Credential {
  _id: string;
  credential_title: string;
  issuer_name: string;
  nsqf_level: number | null;
  status: string;
  issued_date: string;
  verified_date: string | null;
  skill_tags: string[];
}

interface Learner {
  learner_id: string;
  email: string;
  full_name: string;
  location: string | null;
  experience_years: number | null;
  credentials: Credential[];
  total_credentials: number;
  highest_nsqf_level: number | null;
  skill_summary: Record<string, number>;
  last_updated: string;
}

interface ApiResponse {
  candidates: Learner[];
  total: number;
  skip: number;
  limit: number;
}

const filterCategories = [
  { name: 'Intent Filters', color: '#3b82f6' },
  { name: 'Resume Filters', color: '#10b981' },
  { name: 'AI Filters', color: '#f59e0b' },
  { name: 'Timeline Filters', color: '#ef4444' },
  { name: 'Interview Process Filters', color: '#8b5cf6' },
  { name: 'Must Have Filters', color: '#06b6d4' },
  { name: 'Basic Details', color: '#84cc16' },
  { name: 'Job & Compensation', color: '#f97316' },
  { name: 'Status & Communication', color: '#ec4899' },
  { name: 'Experience', color: '#6366f1' },
  { name: 'Education', color: '#14b8a6' },
  { name: 'Reason for Change', color: '#a855f7' },
  { name: 'Company Context', color: '#22c55e' },
  { name: 'Internal Notes', color: '#f43f5e' },
];

export default function SearchLearnersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [total, setTotal] = useState(0);

  // Fetch learners from API
  useEffect(() => {
    fetchLearners();
  }, []);

  const fetchLearners = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8000/api/v1/employer/candidates?skip=0&limit=50', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch learners');
      }

      const data: ApiResponse = await response.json();
      setLearners(data.candidates);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching learners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedFilters([]);
  };

  const handleFilterToggle = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const handleViewProfile = (learner: Learner) => {
    setSelectedLearner(learner);
    setProfileDialogOpen(true);
  };

  const handleCloseProfile = () => {
    setProfileDialogOpen(false);
    setSelectedLearner(null);
  };

  // Filter learners based on search query
  const filteredLearners = learners.filter(learner => 
    learner.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    learner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    Object.keys(learner.skill_summary).some(skill => 
      skill.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Get top skills from skill_summary (limit to 5)
  const getTopSkills = (skillSummary: Record<string, number>) => {
    return Object.entries(skillSummary)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([skill]) => skill);
  };

  return (
    <DashboardLayout title="Search Learners">
      <Box sx={{ p: 3, height: '100vh', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', height: '100%', gap: 3 }}>
          {/* Left Sidebar - Filters */}
          <Box sx={{ width: 320, flexShrink: 0 }}>
            <Paper 
              elevation={0}
              sx={{ 
                height: '100%',
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Filter Header */}
              <Box sx={{ 
                p: 3, 
                borderBottom: '1px solid #e2e8f0',
                bgcolor: '#f8fafc'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    Filters
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleClearFilters}
                    sx={{ 
                      color: '#3b82f6',
                      fontWeight: 600,
                      textTransform: 'none'
                    }}
                  >
                    Clear All
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterList sx={{ color: '#64748b', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Hide Filters
                  </Typography>
                </Box>
              </Box>

              {/* Filter Categories */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {filterCategories.map((category, index) => (
                  <Accordion 
                    key={index}
                    elevation={0}
                    sx={{ 
                      mb: 1,
                      '&:before': { display: 'none' },
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px !important',
                      '&.Mui-expanded': {
                        margin: '0 0 8px 0',
                      }
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      sx={{ 
                        minHeight: 48,
                        '&.Mui-expanded': {
                          minHeight: 48,
                        },
                        '& .MuiAccordionSummary-content': {
                          margin: '8px 0',
                          '&.Mui-expanded': {
                            margin: '8px 0',
                          }
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box 
                          sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            bgcolor: category.color 
                          }} 
                        />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {category.name}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      <Typography variant="body2" color="text.secondary">
                        Filter options for {category.name}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </Paper>
          </Box>

          {/* Main Content */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Learners Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {filteredLearners.length} Learner{filteredLearners.length !== 1 ? 's' : ''} Found
                </Typography>
              </Box>

              {/* Search Bar */}
              <TextField
                fullWidth
                placeholder="Search Learners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#64748b' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: 'white',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3b82f6',
                      }
                    },
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3b82f6',
                        borderWidth: 2,
                      }
                    }
                  }
                }}
              />
            </Box>

            {/* Learners List */}
            <Paper 
              elevation={0}
              sx={{ 
                flex: 1,
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8 }}>
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8 }}>
                    <Typography color="error">{error}</Typography>
                  </Box>
                ) : filteredLearners.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8 }}>
                    <Typography color="text.secondary">No learners found</Typography>
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {filteredLearners.map((learner, index) => (
                    <React.Fragment key={learner.learner_id}>
                      <ListItem 
                        sx={{ 
                          p: 3,
                          alignItems: 'flex-start',
                          '&:hover': {
                            bgcolor: '#f8fafc'
                          }
                        }}
                      >
                        <ListItemAvatar sx={{ mr: 2 }}>
                          <Avatar
                            sx={{ 
                              width: 56, 
                              height: 56,
                              border: '2px solid #e2e8f0',
                              bgcolor: '#3b82f6'
                            }}
                          >
                            {learner.full_name.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>

                        <ListItemText
                          sx={{ flex: 1 }}
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
                                  {learner.full_name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Email sx={{ fontSize: 16, color: '#64748b' }} />
                                    <Typography variant="body2" color="text.secondary">
                                      {learner.email}
                                    </Typography>
                                  </Box>
                                  {learner.location && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <LocationOn sx={{ fontSize: 16, color: '#64748b' }} />
                                      <Typography variant="body2" color="text.secondary">
                                        {learner.location}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                                Skills & Experience:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                {getTopSkills(learner.skill_summary).length > 0 ? (
                                  getTopSkills(learner.skill_summary).map((skill, idx) => (
                                    <Chip
                                      key={idx}
                                      label={skill}
                                      size="small"
                                      sx={{
                                        bgcolor: '#e0f2fe',
                                        color: '#0369a1',
                                        fontWeight: 500,
                                        fontSize: '0.75rem'
                                      }}
                                    />
                                  ))
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    No skills listed
                                  </Typography>
                                )}
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', gap: 4 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <VerifiedUser sx={{ fontSize: 18, color: '#10b981' }} />
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        Credentials
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#10b981' }}>
                                        {learner.total_credentials}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  {learner.highest_nsqf_level && (
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        NSQF Level
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {learner.highest_nsqf_level}
                                      </Typography>
                                    </Box>
                                  )}
                                  {learner.experience_years && (
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        Experience
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {learner.experience_years} years
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => handleViewProfile(learner)}
                                  sx={{
                                    bgcolor: '#3b82f6',
                                    color: 'white',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    px: 3,
                                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                                    '&:hover': {
                                      bgcolor: '#2563eb',
                                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                                      transform: 'translateY(-1px)',
                                    },
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  View Profile
                                </Button>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < filteredLearners.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                )}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Profile Dialog */}
      <Dialog
        open={profileDialogOpen}
        onClose={handleCloseProfile}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid #e2e8f0',
          pb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              sx={{ 
                width: 60, 
                height: 60,
                bgcolor: '#3b82f6',
                fontSize: '1.5rem'
              }}
            >
              {selectedLearner?.full_name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {selectedLearner?.full_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedLearner?.email}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleCloseProfile} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {selectedLearner && (
            <Box>
              {/* Basic Info */}
              <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedLearner.email}
                    </Typography>
                  </Box>
                  {selectedLearner.location && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Location
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedLearner.location}
                      </Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Total Credentials
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#10b981' }}>
                      {selectedLearner.total_credentials}
                    </Typography>
                  </Box>
                  {selectedLearner.highest_nsqf_level && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Highest NSQF Level
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Level {selectedLearner.highest_nsqf_level}
                      </Typography>
                    </Box>
                  )}
                  {selectedLearner.experience_years && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Experience
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedLearner.experience_years} years
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>

              {/* Skills Summary */}
              {Object.keys(selectedLearner.skill_summary).length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Object.entries(selectedLearner.skill_summary)
                      .sort(([, a], [, b]) => b - a)
                      .map(([skill, count]) => (
                        <Chip
                          key={skill}
                          label={`${skill} (${count})`}
                          sx={{
                            bgcolor: '#e0f2fe',
                            color: '#0369a1',
                            fontWeight: 500
                          }}
                        />
                      ))
                    }
                  </Box>
                </Box>
              )}

              {/* Credentials List */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Credentials ({selectedLearner.total_credentials})
                </Typography>
                {selectedLearner.credentials.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {selectedLearner.credentials.map((credential) => (
                      <Card key={credential._id} elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <WorkspacePremium sx={{ color: '#3b82f6', fontSize: 24 }} />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                  {credential.credential_title}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <School sx={{ fontSize: 16, color: '#64748b' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {credential.issuer_name}
                                </Typography>
                              </Box>
                            </Box>
                            <Chip
                              label={credential.status}
                              size="small"
                              sx={{
                                bgcolor: credential.status === 'verified' ? '#dcfce7' : '#fef3c7',
                                color: credential.status === 'verified' ? '#166534' : '#92400e',
                                fontWeight: 600
                              }}
                            />
                          </Box>

                          {credential.nsqf_level && (
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>NSQF Level:</strong> {credential.nsqf_level}
                            </Typography>
                          )}

                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Issued:</strong> {new Date(credential.issued_date).toLocaleDateString()}
                            {credential.verified_date && (
                              <> | <strong>Verified:</strong> {new Date(credential.verified_date).toLocaleDateString()}</>
                            )}
                          </Typography>

                          {credential.skill_tags.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
                              {credential.skill_tags.map((tag, idx) => (
                                <Chip
                                  key={idx}
                                  label={tag}
                                  size="small"
                                  sx={{
                                    bgcolor: '#f1f5f9',
                                    fontSize: '0.7rem',
                                    height: 24
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc' }}>
                    <Typography color="text.secondary">
                      No credentials available
                    </Typography>
                  </Paper>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={handleCloseProfile} variant="outlined" sx={{ textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
