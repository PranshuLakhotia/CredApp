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
  TextField,
  Button,
  Chip,
  Avatar,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  AlertTitle,
  Fade,
  Zoom,
  Slide,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Checkbox,
  FormControlLabel,
  Slider,
} from '@mui/material';
import {
  Search,
  FilterList,
  Sort,
  Visibility,
  Download,
  Email,
  Phone,
  LocationOn,
  VerifiedUser,
  School,
  TrendingUp,
  Star,
  CheckCircle,
  Cancel,
  Warning,
  CloudDone,
  Security,
  Assessment,
  People,
  WorkspacePremium,
} from '@mui/icons-material';

// Types
interface CandidateProfile {
  _id: string;
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  profile_picture?: string;
  credentials: CredentialSummary[];
  total_credentials: number;
  verified_credentials: number;
  avg_nsqf_level: number;
  top_skills: string[];
  last_credential_date: string;
  verification_status: 'verified' | 'unverified' | 'partial';
}

interface CredentialSummary {
  _id: string;
  credential_title: string;
  issuer_name: string;
  issued_date: string;
  expiry_date?: string;
  verification_status: 'verified' | 'unverified' | 'revoked' | 'expired';
  blockchain_hash?: string;
  skills: string[];
  nsqf_level: number;
  credential_type: string;
}

interface CandidateFilters {
  search_query: string;
  skill_tags: string[];
  nsqf_level_range: [number, number];
  issuer_id: string;
  verification_status: string[];
  sort_by: string;
  sort_order: 'asc' | 'desc';
}

export default function CandidateDirectoryPage() {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);
  const [showCandidateDialog, setShowCandidateDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<CandidateFilters>({
    search_query: '',
    skill_tags: [],
    nsqf_level_range: [1, 10],
    issuer_id: '',
    verification_status: [],
    sort_by: 'last_credential_date',
    sort_order: 'desc',
  });

  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [availableIssuers, setAvailableIssuers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchCandidates();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [candidates, filters]);

  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/v1/employer/candidates', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCandidates(data.candidates || []);
      } else {
        // Mock data for development
        setCandidates([
          {
            _id: '1',
            full_name: 'John Doe',
            email: 'john.doe@email.com',
            phone: '+1-555-0123',
            location: 'San Francisco, CA',
            total_credentials: 5,
            verified_credentials: 4,
            avg_nsqf_level: 7.2,
            top_skills: ['Cloud Computing', 'AWS', 'DevOps', 'Python'],
            last_credential_date: '2024-01-15T10:30:00Z',
            verification_status: 'verified',
            credentials: [
              {
                _id: 'cred1',
                credential_title: 'AWS Solutions Architect',
                issuer_name: 'Tech University',
                issued_date: '2024-01-15T10:30:00Z',
                verification_status: 'verified',
                blockchain_hash: '0x1234...abcd',
                skills: ['Cloud Computing', 'AWS'],
                nsqf_level: 8,
                credential_type: 'professional',
              },
              {
                _id: 'cred2',
                credential_title: 'Python Developer',
                issuer_name: 'Code Academy',
                issued_date: '2024-01-10T14:20:00Z',
                verification_status: 'verified',
                blockchain_hash: '0x5678...efgh',
                skills: ['Python', 'Programming'],
                nsqf_level: 6,
                credential_type: 'professional',
              },
            ],
          },
          {
            _id: '2',
            full_name: 'Jane Smith',
            email: 'jane.smith@email.com',
            phone: '+1-555-0124',
            location: 'New York, NY',
            total_credentials: 3,
            verified_credentials: 3,
            avg_nsqf_level: 6.8,
            top_skills: ['Machine Learning', 'Data Science', 'Python', 'TensorFlow'],
            last_credential_date: '2024-01-14T15:45:00Z',
            verification_status: 'verified',
            credentials: [
              {
                _id: 'cred3',
                credential_title: 'Machine Learning Specialist',
                issuer_name: 'Data Science Institute',
                issued_date: '2024-01-14T15:45:00Z',
                verification_status: 'verified',
                blockchain_hash: '0x9abc...def0',
                skills: ['Machine Learning', 'Data Science'],
                nsqf_level: 7,
                credential_type: 'professional',
              },
            ],
          },
          {
            _id: '3',
            full_name: 'Mike Johnson',
            email: 'mike.johnson@email.com',
            phone: '+1-555-0125',
            location: 'Austin, TX',
            total_credentials: 4,
            verified_credentials: 2,
            avg_nsqf_level: 5.5,
            top_skills: ['Cybersecurity', 'Network Security', 'Linux'],
            last_credential_date: '2024-01-13T09:20:00Z',
            verification_status: 'partial',
            credentials: [
              {
                _id: 'cred4',
                credential_title: 'Cybersecurity Analyst',
                issuer_name: 'Security Academy',
                issued_date: '2024-01-13T09:20:00Z',
                verification_status: 'unverified',
                skills: ['Cybersecurity', 'Network Security'],
                nsqf_level: 6,
                credential_type: 'professional',
              },
            ],
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setError('Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/v1/employer/filter-options', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableSkills(data.skills || []);
        setAvailableIssuers(data.issuers || []);
      } else {
        // Mock data for development
        setAvailableSkills(['Cloud Computing', 'AWS', 'DevOps', 'Python', 'Machine Learning', 'Data Science', 'Cybersecurity', 'Network Security', 'Linux']);
        setAvailableIssuers([
          { id: '1', name: 'Tech University' },
          { id: '2', name: 'Code Academy' },
          { id: '3', name: 'Data Science Institute' },
          { id: '4', name: 'Security Academy' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...candidates];

    // Search query filter
    if (filters.search_query) {
      const query = filters.search_query.toLowerCase();
      filtered = filtered.filter(candidate =>
        candidate.full_name.toLowerCase().includes(query) ||
        candidate.email.toLowerCase().includes(query) ||
        candidate.top_skills.some(skill => skill.toLowerCase().includes(query)) ||
        candidate.credentials.some(cred => cred.credential_title.toLowerCase().includes(query))
      );
    }

    // Skill tags filter
    if (filters.skill_tags.length > 0) {
      filtered = filtered.filter(candidate =>
        filters.skill_tags.every(tag =>
          candidate.top_skills.some(skill => skill.toLowerCase().includes(tag.toLowerCase()))
        )
      );
    }

    // NSQF level range filter
    filtered = filtered.filter(candidate =>
      candidate.avg_nsqf_level >= filters.nsqf_level_range[0] &&
      candidate.avg_nsqf_level <= filters.nsqf_level_range[1]
    );

    // Issuer filter
    if (filters.issuer_id) {
      filtered = filtered.filter(candidate =>
        candidate.credentials.some(cred => cred.issuer_name === filters.issuer_id)
      );
    }

    // Verification status filter
    if (filters.verification_status.length > 0) {
      filtered = filtered.filter(candidate =>
        filters.verification_status.includes(candidate.verification_status)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sort_by) {
        case 'name':
          aValue = a.full_name;
          bValue = b.full_name;
          break;
        case 'avg_nsqf_level':
          aValue = a.avg_nsqf_level;
          bValue = b.avg_nsqf_level;
          break;
        case 'total_credentials':
          aValue = a.total_credentials;
          bValue = b.total_credentials;
          break;
        case 'verified_credentials':
          aValue = a.verified_credentials;
          bValue = b.verified_credentials;
          break;
        case 'last_credential_date':
          aValue = new Date(a.last_credential_date).getTime();
          bValue = new Date(b.last_credential_date).getTime();
          break;
        default:
          aValue = a.full_name;
          bValue = b.full_name;
      }

      if (filters.sort_order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCandidates(filtered);
  };

  const handleFilterChange = (field: keyof CandidateFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
    setPage(0); // Reset to first page when filters change
  };

  const handleViewCandidate = (candidate: CandidateProfile) => {
    setSelectedCandidate(candidate);
    setShowCandidateDialog(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle sx={{ color: '#10b981' }} />;
      case 'unverified':
        return <Warning sx={{ color: '#f59e0b' }} />;
      case 'revoked':
        return <Cancel sx={{ color: '#ef4444' }} />;
      case 'expired':
        return <Warning sx={{ color: '#6b7280' }} />;
      default:
        return <Warning sx={{ color: '#6b7280' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return '#10b981';
      case 'unverified':
        return '#f59e0b';
      case 'revoked':
        return '#ef4444';
      case 'expired':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <DashboardLayout title="Candidate Directory">
        <DashboardLoader 
          title="Loading Candidates" 
          message="Fetching candidate profiles and verification data..." 
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Candidate Directory">
      <Box sx={{ p: 3 }}>
        <Fade in={true} timeout={800}>
          <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                👥 Candidate Directory
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Search and discover verified talent with blockchain-verified credentials
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                <AlertTitle>Error</AlertTitle>
                {error}
              </Alert>
            )}

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                  <FilterList sx={{ mr: 1, color: '#3b82f6' }} />
                  Filters & Search
                </Typography>

                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { 
                    xs: '1fr', 
                    md: 'repeat(3, 1fr)' 
                  }, 
                  gap: 3 
                }}>
                  {/* Search */}
                  <Box>
                    <TextField
                      fullWidth
                      label="Search candidates"
                      placeholder="Name, email, skills, credentials..."
                      value={filters.search_query}
                      onChange={(e) => handleFilterChange('search_query', e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  {/* Skills */}
                  <Box>
                    <FormControl fullWidth>
                      <InputLabel>Skills</InputLabel>
                      <Select
                        multiple
                        value={filters.skill_tags}
                        onChange={(e) => handleFilterChange('skill_tags', e.target.value)}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(selected as string[]).map((value) => (
                              <Chip key={value} label={value} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        {availableSkills.map((skill) => (
                          <MenuItem key={skill} value={skill}>
                            {skill}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* NSQF Level Range */}
                  <Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        NSQF Level Range: {filters.nsqf_level_range[0]} - {filters.nsqf_level_range[1]}
                      </Typography>
                      <Slider
                        value={filters.nsqf_level_range}
                        onChange={(e, newValue) => handleFilterChange('nsqf_level_range', newValue)}
                        valueLabelDisplay="auto"
                        min={1}
                        max={10}
                        step={0.1}
                      />
                    </Box>
                  </Box>

                  {/* Issuer */}
                  <Box>
                    <FormControl fullWidth>
                      <InputLabel>Issuer</InputLabel>
                      <Select
                        value={filters.issuer_id}
                        onChange={(e) => handleFilterChange('issuer_id', e.target.value)}
                      >
                        <MenuItem value="">All Issuers</MenuItem>
                        {availableIssuers.map((issuer) => (
                          <MenuItem key={issuer.id} value={issuer.name}>
                            {issuer.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Verification Status */}
                  <Box>
                    <FormControl fullWidth>
                      <InputLabel>Verification Status</InputLabel>
                      <Select
                        multiple
                        value={filters.verification_status}
                        onChange={(e) => handleFilterChange('verification_status', e.target.value)}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(selected as string[]).map((value) => (
                              <Chip key={value} label={value} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        <MenuItem value="verified">Verified</MenuItem>
                        <MenuItem value="unverified">Unverified</MenuItem>
                        <MenuItem value="partial">Partial</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Sort */}
                  <Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <FormControl fullWidth>
                        <InputLabel>Sort By</InputLabel>
                        <Select
                          value={filters.sort_by}
                          onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                        >
                          <MenuItem value="last_credential_date">Latest Credential</MenuItem>
                          <MenuItem value="avg_nsqf_level">NSQF Level</MenuItem>
                          <MenuItem value="total_credentials">Total Credentials</MenuItem>
                          <MenuItem value="verified_credentials">Verified Credentials</MenuItem>
                          <MenuItem value="name">Name</MenuItem>
                        </Select>
                      </FormControl>
                      <IconButton
                        onClick={() => handleFilterChange('sort_order', filters.sort_order === 'asc' ? 'desc' : 'asc')}
                        sx={{ alignSelf: 'flex-end', mb: 1 }}
                      >
                        <Sort sx={{ transform: filters.sort_order === 'desc' ? 'rotate(180deg)' : 'none' }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Found {filteredCandidates.length} candidates
                  </Typography>
                  <Button
                    startIcon={<Download />}
                    variant="outlined"
                    disabled={filteredCandidates.length === 0}
                  >
                    Export Results
                  </Button>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Candidate</TableCell>
                        <TableCell>Credentials</TableCell>
                        <TableCell>Skills</TableCell>
                        <TableCell>NSQF Level</TableCell>
                        <TableCell>Verification Status</TableCell>
                        <TableCell>Last Credential</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredCandidates
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((candidate) => (
                          <TableRow key={candidate._id} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: '#3b82f6' }}>
                                  {candidate.full_name.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {candidate.full_name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {candidate.email}
                                  </Typography>
                                  {candidate.location && (
                                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <LocationOn fontSize="small" />
                                      {candidate.location}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {candidate.verified_credentials}/{candidate.total_credentials} verified
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={(candidate.verified_credentials / candidate.total_credentials) * 100}
                                  sx={{ mt: 0.5 }}
                                />
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {candidate.top_skills.slice(0, 3).map((skill, index) => (
                                  <Chip key={index} label={skill} size="small" variant="outlined" />
                                ))}
                                {candidate.top_skills.length > 3 && (
                                  <Chip label={`+${candidate.top_skills.length - 3}`} size="small" />
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Assessment sx={{ color: '#3b82f6', fontSize: 20 }} />
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {candidate.avg_nsqf_level}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {getStatusIcon(candidate.verification_status)}
                                <Chip
                                  label={candidate.verification_status.toUpperCase()}
                                  size="small"
                                  sx={{
                                    bgcolor: getStatusColor(candidate.verification_status),
                                    color: 'white',
                                    fontWeight: 600,
                                  }}
                                />
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(candidate.last_credential_date).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="View Full Profile">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleViewCandidate(candidate)}
                                  >
                                    <Visibility />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Contact">
                                  <IconButton size="small">
                                    <Email />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={filteredCandidates.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </CardContent>
            </Card>
          </Box>
        </Fade>

        {/* Candidate Detail Dialog */}
        <Dialog open={showCandidateDialog} onClose={() => setShowCandidateDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <People color="primary" />
            Candidate Profile
          </DialogTitle>
          <DialogContent>
            {selectedCandidate && (
              <Box>
                {/* Candidate Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                  <Avatar sx={{ width: 64, height: 64, bgcolor: '#3b82f6', mr: 2, fontSize: '1.5rem' }}>
                    {selectedCandidate.full_name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {selectedCandidate.full_name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {selectedCandidate.email}
                    </Typography>
                    {selectedCandidate.phone && (
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Phone fontSize="small" />
                        {selectedCandidate.phone}
                      </Typography>
                    )}
                    {selectedCandidate.location && (
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOn fontSize="small" />
                        {selectedCandidate.location}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Stats */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { 
                    xs: 'repeat(2, 1fr)', 
                    sm: 'repeat(4, 1fr)' 
                  }, 
                  gap: 2, 
                  mb: 3 
                }}>
                  <Box>
                    <Card sx={{ textAlign: 'center', bgcolor: '#f0f9ff' }}>
                      <CardContent sx={{ py: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                          {selectedCandidate.total_credentials}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Credentials
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                  <Box>
                    <Card sx={{ textAlign: 'center', bgcolor: '#f0fdf4' }}>
                      <CardContent sx={{ py: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981' }}>
                          {selectedCandidate.verified_credentials}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Verified
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                  <Box>
                    <Card sx={{ textAlign: 'center', bgcolor: '#fef3c7' }}>
                      <CardContent sx={{ py: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                          {selectedCandidate.avg_nsqf_level}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Avg NSQF Level
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                  <Box>
                    <Card sx={{ textAlign: 'center', bgcolor: '#fdf2f8' }}>
                      <CardContent sx={{ py: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#ec4899' }}>
                          {selectedCandidate.top_skills.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Skills
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Skills */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Top Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedCandidate.top_skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        sx={{
                          bgcolor: index < 3 ? '#3b82f6' : '#6b7280',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Credentials */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Credentials
                  </Typography>
                  <List>
                    {selectedCandidate.credentials.map((credential, index) => (
                      <ListItem key={index} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, mb: 1 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: getStatusColor(credential.verification_status) }}>
                            {getStatusIcon(credential.verification_status)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={credential.credential_title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {credential.issuer_name} • {new Date(credential.issued_date).toLocaleDateString()}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                {credential.skills.slice(0, 3).map((skill, skillIndex) => (
                                  <Chip key={skillIndex} label={skill} size="small" variant="outlined" />
                                ))}
                                <Chip label={`NSQF ${credential.nsqf_level}`} size="small" color="primary" />
                                {credential.blockchain_hash && (
                                  <Chip label="Blockchain" size="small" sx={{ color: '#10b981', borderColor: '#10b981' }} variant="outlined" />
                                )}
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCandidateDialog(false)}>Close</Button>
            <Button variant="contained" startIcon={<Email />}>
              Contact Candidate
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}
