'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardLoader from '@/components/common/DashboardLoader';
import { buildApiUrl } from '@/config/api';
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
  LinearProgress,
  FormGroup,
  FormControlLabel,
  Checkbox as MuiCheckbox,
  Slider,
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

// placeholder filter categories removed — replaced by functional filters below

export default function SearchLearnersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [profileLoading, setProfileLoading] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    minCredentials: 0,
    maxCredentials: 100,
    minNSQF: 0,
    maxNSQF: 10,
    selectedSkills: [] as string[],
    minExperience: 0,
    maxExperience: 50,
  });

  // Fetch learners from API
  useEffect(() => {
    fetchLearners();
  }, []);

  const fetchLearners = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(buildApiUrl('/employer/candidates?skip=0&limit=50'), {
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
    setFilters({
      minCredentials: 0,
      maxCredentials: 100,
      minNSQF: 0,
      maxNSQF: 10,
      selectedSkills: [],
      minExperience: 0,
      maxExperience: 50,
    });
  };

  const handleSkillToggle = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter(s => s !== skill)
        : [...prev.selectedSkills, skill]
    }));
  };

  const getAllSkills = (): string[] => {
    const skillsSet = new Set<string>();
    learners.forEach(learner => {
      // include keys from skill_summary (aggregate counts)
      Object.keys(learner.skill_summary || {}).forEach(skill => {
        if (skill && typeof skill === 'string') skillsSet.add(skill);
      });

      // include any skill tags present on credentials as well
      (learner.credentials || []).forEach(cred => {
        (cred.skill_tags || []).forEach(tag => {
          if (tag && typeof tag === 'string') skillsSet.add(tag);
        });
      });
    });

    return Array.from(skillsSet).sort((a, b) => a.localeCompare(b));
  };

  const isFilterActive = (): boolean => {
    return (
      filters.minCredentials > 0 ||
      filters.maxCredentials < 100 ||
      filters.minNSQF > 0 ||
      filters.maxNSQF < 10 ||
      filters.selectedSkills.length > 0 ||
      filters.minExperience > 0 ||
      filters.maxExperience < 50
    );
  };

  const mapCredentialStatus = (status: string | undefined): string => {
    switch ((status || '').toLowerCase()) {
      case 'verified':
        return 'verified';
      case 'revoked':
        return 'revoked';
      case 'expired':
        return 'expired';
      default:
        return 'unverified';
    }
  };

  const enrichLearnerDetails = async (learner: Learner) => {
    try {
      setProfileLoading(true);
      const response = await fetch(
        buildApiUrl(`/employer/candidates/${learner.learner_id}/credentials`),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        },
      );

      if (!response.ok) {
        console.warn('Unable to load learner credentials for notification dispatch.');
        return;
      }

      const credentials = await response.json();
      if (!Array.isArray(credentials)) {
        return;
      }

      const normalizedCredentials: Credential[] = credentials.map((credential: any, index: number) => ({
        _id: String(credential._id ?? credential.credential_id ?? `${learner.learner_id}-${index}`),
        credential_title: credential.credential_title ?? credential.title ?? 'Credential',
        issuer_name: credential.issuer_name ?? 'Unknown issuer',
        nsqf_level: credential.nsqf_level ?? credential.nsqfLevel ?? null,
        status: mapCredentialStatus(credential.status),
        issued_date: credential.issued_date ?? new Date().toISOString(),
        verified_date: credential.verified_date ?? credential.verifiedDate ?? null,
        skill_tags: credential.skill_tags ?? credential.skills ?? [],
      }));

      const verifiedCount = normalizedCredentials.filter((cred) => cred.status === 'verified').length;
      const avgNsqfLevel = normalizedCredentials.length
        ? Number(
            (
              normalizedCredentials.reduce((sum, cred) => sum + (cred.nsqf_level || 0), 0) /
              normalizedCredentials.length
            ).toFixed(2),
          )
        : learner.highest_nsqf_level;
      const updatedSkillSummary = { ...learner.skill_summary };
      normalizedCredentials.forEach((cred) => {
        (cred.skill_tags ?? []).forEach((tag: string) => {
          updatedSkillSummary[tag] = (updatedSkillSummary[tag] || 0) + 1;
        });
      });

      const updatedLearner: Learner = {
        ...learner,
        credentials: normalizedCredentials,
        total_credentials: normalizedCredentials.length,
        highest_nsqf_level: learner.highest_nsqf_level ?? (avgNsqfLevel || null),
        skill_summary: updatedSkillSummary,
      };

      setSelectedLearner(updatedLearner);
      setLearners((prev) => prev.map((item) => (item.learner_id === learner.learner_id ? updatedLearner : item)));
    } catch (fetchError) {
      console.error('Error fetching learner credentials:', fetchError);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleViewProfile = (learner: Learner) => {
    setSelectedLearner(learner);
    setProfileDialogOpen(true);
    void enrichLearnerDetails(learner);
  };

  const handleCloseProfile = () => {
    setProfileDialogOpen(false);
    setSelectedLearner(null);
  };

  // Filter learners based on search query and filter criteria
  const filteredLearners = learners.filter(learner => {
    // Search filter
    const searchMatch = 
      learner.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      learner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      Object.keys(learner.skill_summary).some(skill => 
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );

    if (!searchMatch) return false;

    // Credentials filter
    if (learner.total_credentials < filters.minCredentials || learner.total_credentials > filters.maxCredentials) {
      return false;
    }

    // NSQF Level filter
    const nsqfLevel = learner.highest_nsqf_level || 0;
    if (nsqfLevel < filters.minNSQF || nsqfLevel > filters.maxNSQF) {
      return false;
    }

    // Skills filter
    if (filters.selectedSkills.length > 0) {
      const hasSelectedSkills = filters.selectedSkills.some(skill => learner.skill_summary[skill]);
      if (!hasSelectedSkills) return false;
    }

    // Experience filter
    const experience = learner.experience_years || 0;
    if (experience < filters.minExperience || experience > filters.maxExperience) {
      return false;
    }

    return true;
  });

  // Get top skills from skill_summary (limit to 5)
  const getTopSkills = (skillSummary: Record<string, number>) => {
    return Object.entries(skillSummary)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([skill]) => skill);
  };
  if (loading) {
    return (
      <DashboardLayout title="Search Learners">
        <DashboardLoader 
          title="Loading Candidates" 
          message="Fetching candidate profiles and verification data..." 
        />
      </DashboardLayout>
    );
  }

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
                {/* Credentials Filter */}
                <Accordion 
                  defaultExpanded
                  elevation={0}
                  sx={{ 
                    mb: 1,
                    '&:before': { display: 'none' },
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px !important',
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Credentials
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Min: {filters.minCredentials} | Max: {filters.maxCredentials}
                        </Typography>
                        <Slider
                          value={[filters.minCredentials, filters.maxCredentials]}
                          onChange={(_, value) => {
                            if (Array.isArray(value)) {
                              setFilters(prev => ({
                                ...prev,
                                minCredentials: value[0],
                                maxCredentials: value[1]
                              }));
                            }
                          }}
                          min={0}
                          max={100}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                {/* NSQF Level Filter */}
                <Accordion 
                  elevation={0}
                  sx={{ 
                    mb: 1,
                    '&:before': { display: 'none' },
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px !important',
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      NSQF Level
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Min: {filters.minNSQF} | Max: {filters.maxNSQF}
                        </Typography>
                        <Slider
                          value={[filters.minNSQF, filters.maxNSQF]}
                          onChange={(_, value) => {
                            if (Array.isArray(value)) {
                              setFilters(prev => ({
                                ...prev,
                                minNSQF: value[0],
                                maxNSQF: value[1]
                              }));
                            }
                          }}
                          min={0}
                          max={10}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                {/* Skills Filter */}
                <Accordion 
                  elevation={0}
                  sx={{ 
                    mb: 1,
                    '&:before': { display: 'none' },
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px !important',
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Skills {filters.selectedSkills.length > 0 && `(${filters.selectedSkills.length})`}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <FormGroup sx={{ maxHeight: 250, overflow: 'auto' }}>
                      {getAllSkills().map(skill => (
                        <FormControlLabel
                          key={skill}
                          control={
                            <MuiCheckbox
                              checked={filters.selectedSkills.includes(skill)}
                              onChange={() => handleSkillToggle(skill)}
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2">
                              {skill}
                            </Typography>
                          }
                        />
                      ))}
                    </FormGroup>
                  </AccordionDetails>
                </Accordion>

                {/* Experience Filter */}
                <Accordion 
                  elevation={0}
                  sx={{ 
                    mb: 1,
                    '&:before': { display: 'none' },
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px !important',
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Experience
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Min: {filters.minExperience} | Max: {filters.maxExperience} years
                        </Typography>
                        <Slider
                          value={[filters.minExperience, filters.maxExperience]}
                          onChange={(_, value) => {
                            if (Array.isArray(value)) {
                              setFilters(prev => ({
                                ...prev,
                                minExperience: value[0],
                                maxExperience: value[1]
                              }));
                            }
                          }}
                          min={0}
                          max={50}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
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
                  <DashboardLoader 
                    title="Searching Learners" 
                    message="Finding qualified candidates for your requirements..." 
                  />
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
          {profileLoading && <LinearProgress sx={{ mb: 2 }} />}
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
