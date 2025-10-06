'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Box,
  Typography,
  Card,
  CardContent,
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
  Badge,
  Paper,
  Divider,
} from '@mui/material';
import {
  Search,
  ExpandMore,
  FilterList,
  Clear,
  Visibility,
  Star,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
  VerifiedUser,
} from '@mui/icons-material';

// Mock learner data based on the Figma design
const mockLearners = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    email: 'iexamonis@gmail.com',
    phone: '+91 9823452842',
    location: 'Mumbai, India',
    skills: ['React', 'Node.js', 'Java Script'],
    aiScore: 85,
    match: 85,
    verified: 12,
    nsqfLevel: 4,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 2,
    name: 'Rajesh Kumar',
    email: 'iexamonis@gmail.com',
    phone: '+91 9823452842',
    location: 'Bangalore, India',
    skills: ['React', 'Node.js', 'Java Script'],
    aiScore: 85,
    match: 85,
    verified: 12,
    nsqfLevel: 4,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 3,
    name: 'Rajesh Kumar',
    email: 'iexamonis@gmail.com',
    phone: '+91 9823452842',
    location: 'Pune, India',
    skills: ['React', 'Node.js', 'Java Script'],
    aiScore: 85,
    match: 85,
    verified: 12,
    nsqfLevel: 4,
    avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 4,
    name: 'Rajesh Kumar',
    email: 'iexamonis@gmail.com',
    phone: '+91 9823452842',
    location: 'Delhi, India',
    skills: ['React', 'Node.js', 'Java Script'],
    aiScore: 85,
    match: 85,
    verified: 12,
    nsqfLevel: 4,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  },
];

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
                  8 Learners Found
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
                <List sx={{ p: 0 }}>
                  {mockLearners.map((learner, index) => (
                    <React.Fragment key={learner.id}>
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
                            src={learner.avatar}
                            sx={{ 
                              width: 56, 
                              height: 56,
                              border: '2px solid #e2e8f0'
                            }}
                          >
                            {learner.name.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>

                        <ListItemText
                          sx={{ flex: 1 }}
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
                                  {learner.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Email sx={{ fontSize: 16, color: '#64748b' }} />
                                    <Typography variant="body2" color="text.secondary">
                                      {learner.email}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Phone sx={{ fontSize: 16, color: '#64748b' }} />
                                    <Typography variant="body2" color="text.secondary">
                                      {learner.phone}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <LinkedIn sx={{ color: '#0077b5', fontSize: 20 }} />
                                  <Star sx={{ color: '#fbbf24', fontSize: 20 }} />
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
                                {learner.skills.map((skill, idx) => (
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
                                ))}
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', gap: 4 }}>
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">
                                      AI Score:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#10b981' }}>
                                      {learner.aiScore}%
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">
                                      Match:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#3b82f6' }}>
                                      {learner.match}%
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <VerifiedUser sx={{ fontSize: 16, color: '#10b981' }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#10b981' }}>
                                      Verified: {learner.verified}
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">
                                      NSQF Level:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {learner.nsqfLevel}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Button
                                  variant="contained"
                                  size="small"
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
                      {index < mockLearners.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
