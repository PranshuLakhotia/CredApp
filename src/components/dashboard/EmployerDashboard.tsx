'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import {
  Search,
  FilterList,
  BookmarkBorder,
  Bookmark,
  Visibility,
  Download,
  People,
  VerifiedUser,
  TrendingUp,
  Assessment,
} from '@mui/icons-material';
import StatsCard from './StatsCard';
import { Candidate } from '@/types/dashboard';

// Mock data
const mockCandidates: Candidate[] = [
  {
    id: '1',
    full_name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    skills: ['React', 'Node.js', 'JavaScript'],
    nsqf_level: 5,
    total_credentials: 12,
    verified_credentials: 10,
    match_percentage: 95,
    location: 'Mumbai, India',
    experience_years: 3,
    last_active: '2024-03-15',
  },
  {
    id: '2',
    full_name: 'Priya Sharma',
    email: 'priya@example.com',
    skills: ['Python', 'Machine Learning', 'Data Science'],
    nsqf_level: 6,
    total_credentials: 15,
    verified_credentials: 14,
    match_percentage: 92,
    location: 'Bangalore, India',
    experience_years: 5,
    last_active: '2024-03-14',
  },
  {
    id: '3',
    full_name: 'Amit Patel',
    email: 'amit@example.com',
    skills: ['Java', 'Spring Boot', 'Microservices'],
    nsqf_level: 4,
    total_credentials: 8,
    verified_credentials: 7,
    match_percentage: 88,
    location: 'Pune, India',
    experience_years: 2,
    last_active: '2024-03-13',
  },
];

const mockRecentSearches = [
  'React Developer Mumbai',
  'Machine Learning Engineer',
  'Full Stack Developer 3+ years',
  'Python Developer Remote',
];

export default function EmployerDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [nsqfFilter, setNsqfFilter] = useState('');
  const [savedCandidates, setSavedCandidates] = useState<string[]>(['1']);

  const toggleSaveCandidate = (candidateId: string) => {
    setSavedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Find Verified Talent 🎯
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Search and verify candidates with blockchain-backed credentials
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <StatsCard
            title="Total Searches"
            value={247}
            icon={<Search />}
            color="primary"
            trend={{ value: 12, label: 'vs last month' }}
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <StatsCard
            title="Candidates Viewed"
            value={89}
            icon={<People />}
            color="info"
            trend={{ value: 8, label: 'this week' }}
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <StatsCard
            title="Verifications"
            value={156}
            icon={<VerifiedUser />}
            color="success"
            trend={{ value: 15, label: 'completed' }}
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <StatsCard
            title="Saved Profiles"
            value={23}
            icon={<Bookmark />}
            color="warning"
            subtitle="Ready for review"
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Search & Filter Section */}
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Candidate Search & Filter
              </Typography>
              
              {/* Search Bar */}
              <TextField
                fullWidth
                placeholder="Search by skills, job title, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              {/* Filters */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Skills</InputLabel>
                    <Select
                      value={skillFilter}
                      label="Skills"
                      onChange={(e) => setSkillFilter(e.target.value)}
                    >
                      <MenuItem value="">All Skills</MenuItem>
                      <MenuItem value="react">React</MenuItem>
                      <MenuItem value="python">Python</MenuItem>
                      <MenuItem value="java">Java</MenuItem>
                      <MenuItem value="ml">Machine Learning</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Location</InputLabel>
                    <Select
                      value={locationFilter}
                      label="Location"
                      onChange={(e) => setLocationFilter(e.target.value)}
                    >
                      <MenuItem value="">All Locations</MenuItem>
                      <MenuItem value="mumbai">Mumbai</MenuItem>
                      <MenuItem value="bangalore">Bangalore</MenuItem>
                      <MenuItem value="pune">Pune</MenuItem>
                      <MenuItem value="remote">Remote</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>NSQF Level</InputLabel>
                    <Select
                      value={nsqfFilter}
                      label="NSQF Level"
                      onChange={(e) => setNsqfFilter(e.target.value)}
                    >
                      <MenuItem value="">All Levels</MenuItem>
                      <MenuItem value="3">Level 3+</MenuItem>
                      <MenuItem value="4">Level 4+</MenuItem>
                      <MenuItem value="5">Level 5+</MenuItem>
                      <MenuItem value="6">Level 6+</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Button variant="contained" startIcon={<Search />}>
                  Search Candidates
                </Button>
                <Button variant="outlined" startIcon={<FilterList />}>
                  Advanced Filters
                </Button>
                <Button variant="outlined" startIcon={<Download />}>
                  Bulk Verification
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Search Results */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Search Results ({mockCandidates.length} candidates found)
              </Typography>
              
              <List sx={{ p: 0 }}>
                {mockCandidates.map((candidate, index) => (
                  <React.Fragment key={candidate.id}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {candidate.full_name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {candidate.full_name}
                            </Typography>
                            {candidate.match_percentage && (
                              <Chip
                                label={`${candidate.match_percentage}% match`}
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {candidate.location} • {candidate.experience_years} years experience
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                              {candidate.skills.slice(0, 3).map((skill, idx) => (
                                <Chip key={idx} label={skill} size="small" variant="outlined" />
                              ))}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="caption" color="text.secondary">
                                NSQF Level {candidate.nsqf_level}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {candidate.verified_credentials}/{candidate.total_credentials} verified
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            onClick={() => toggleSaveCandidate(candidate.id)}
                            color={savedCandidates.includes(candidate.id) ? 'primary' : 'default'}
                          >
                            {savedCandidates.includes(candidate.id) ? <Bookmark /> : <BookmarkBorder />}
                          </IconButton>
                          <Button variant="outlined" size="small" startIcon={<Visibility />}>
                            View Profile
                          </Button>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < mockCandidates.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Sidebar */}
        <Box sx={{ flex: '1 1 400px', minWidth: '350px' }}>
          {/* Quick Actions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="contained" startIcon={<Download />} fullWidth>
                  Bulk Verification Tool
                </Button>
                <Button variant="outlined" startIcon={<Assessment />} fullWidth>
                  Analytics Dashboard
                </Button>
                <Button variant="outlined" startIcon={<Bookmark />} fullWidth>
                  Saved Candidates ({savedCandidates.length})
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Recent Searches */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Recent Searches
              </Typography>
              <List sx={{ p: 0 }}>
                {mockRecentSearches.map((search, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary={search}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Hiring Trends */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Hiring Trends
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Most in-demand skills this month:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                <Chip label="React" size="small" color="primary" />
                <Chip label="Python" size="small" color="primary" />
                <Chip label="Machine Learning" size="small" color="primary" />
                <Chip label="DevOps" size="small" color="primary" />
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary">
              📈 React developers saw 25% increase in demand
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
