'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Grid,
  Avatar,
  Divider,
  Badge,
  Tooltip
} from '@mui/material';
import {
  MoreVert,
  LocationOn,
  Schedule,
  AttachMoney,
  Visibility,
  Edit,
  Delete,
  People,
  TrendingUp,
  AccessTime,
  WorkOutline,
  Star,
  Business
} from '@mui/icons-material';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  experience_level: 'entry' | 'mid' | 'senior' | 'executive';
  salary_range: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills_required: string[];
  benefits: string[];
  application_deadline: string;
  remote_friendly: boolean;
  urgent: boolean;
  posted_date: string;
  status: 'active' | 'paused' | 'closed';
  applications_count: number;
}

interface JobListingsProps {
  jobs: Job[];
  onEditJob: (job: Job) => void;
  onDeleteJob: (jobId: string) => void;
  onViewApplications: (jobId: string) => void;
}

const JobListings: React.FC<JobListingsProps> = ({
  jobs,
  onEditJob,
  onDeleteJob,
  onViewApplications
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, job: Job) => {
    setAnchorEl(event.currentTarget);
    setSelectedJob(job);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedJob(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4caf50';
      case 'paused': return '#ff9800';
      case 'closed': return '#f44336';
      default: return '#757575';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return '#2196f3';
      case 'part-time': return '#9c27b0';
      case 'contract': return '#ff5722';
      case 'internship': return '#4caf50';
      case 'remote': return '#607d8b';
      default: return '#757575';
    }
  };

  const formatSalary = (salary: { min: number; max: number; currency: string }) => {
    if (salary.min === 0 && salary.max === 0) return 'Salary not disclosed';
    if (salary.min === salary.max) return `${salary.currency} ${salary.min.toLocaleString()}`;
    return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysAgo = (dateString: string) => {
    const now = new Date();
    const posted = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - posted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (jobs.length === 0) {
    return (
      <Box sx={{
        textAlign: 'center',
        py: 8,
        px: 4
      }}>
        <WorkOutline sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
        <Typography variant="h5" sx={{ color: '#666', mb: 1, fontWeight: 600 }}>
          No Jobs Posted Yet
        </Typography>
        <Typography variant="body1" sx={{ color: '#999', mb: 3 }}>
          Start by posting your first job to attract talented candidates
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {jobs.map((job) => (
          <Box key={job.id}>
            <Card sx={{
              borderRadius: '16px',
              border: '1px solid #e0e0e0',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                transform: 'translateY(-2px)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Avatar sx={{
                        width: 50,
                        height: 50,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontSize: '1.2rem',
                        fontWeight: 700
                      }}>
                        {job.company.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
                          {job.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Business sx={{ fontSize: 16, color: '#666' }} />
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              {job.company}
                            </Typography>
                          </Box>
                          {job.location && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocationOn sx={{ fontSize: 16, color: '#666' }} />
                              <Typography variant="body2" sx={{ color: '#666' }}>
                                {job.location}
                              </Typography>
                            </Box>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTime sx={{ fontSize: 16, color: '#666' }} />
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              {getDaysAgo(job.posted_date)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={job.status.toUpperCase()}
                      size="small"
                      sx={{
                        backgroundColor: `${getStatusColor(job.status)}20`,
                        color: getStatusColor(job.status),
                        fontWeight: 600,
                        borderRadius: '20px'
                      }}
                    />
                    {job.urgent && (
                      <Chip
                        label="URGENT"
                        size="small"
                        sx={{
                          backgroundColor: '#ff572220',
                          color: '#ff5722',
                          fontWeight: 600,
                          borderRadius: '20px'
                        }}
                      />
                    )}
                    <IconButton
                      onClick={(e) => handleMenuClick(e, job)}
                      sx={{ color: '#666' }}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    color: '#666',
                    mb: 3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {job.description}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  <Chip
                    label={job.type.replace('-', ' ').toUpperCase()}
                    size="small"
                    sx={{
                      backgroundColor: `${getTypeColor(job.type)}20`,
                      color: getTypeColor(job.type),
                      fontWeight: 600,
                      borderRadius: '20px'
                    }}
                  />
                  <Chip
                    label={job.experience_level.toUpperCase()}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: '20px' }}
                  />
                  {job.skills_required.slice(0, 3).map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: '20px' }}
                    />
                  ))}
                  {job.skills_required.length > 3 && (
                    <Chip
                      label={`+${job.skills_required.length - 3} more`}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: '20px' }}
                    />
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AttachMoney sx={{ fontSize: 18, color: '#4caf50' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                        {formatSalary(job.salary_range)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <People sx={{ fontSize: 18, color: '#2196f3' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#2196f3' }}>
                        {job.applications_count} applications
                      </Typography>
                    </Box>
                    {job.application_deadline && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Schedule sx={{ fontSize: 18, color: '#ff9800' }} />
                        <Typography variant="body2" sx={{ color: '#ff9800' }}>
                          Deadline: {formatDate(job.application_deadline)}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => onViewApplications(job.id)}
                    sx={{
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      }
                    }}
                  >
                    View Applications
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          }
        }}
      >
        <MenuItem onClick={() => {
          if (selectedJob) onViewApplications(selectedJob.id);
          handleMenuClose();
        }}>
          <Visibility sx={{ mr: 1, fontSize: 18 }} />
          View Applications
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedJob) onEditJob(selectedJob);
          handleMenuClose();
        }}>
          <Edit sx={{ mr: 1, fontSize: 18 }} />
          Edit Job
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => {
            if (selectedJob) onDeleteJob(selectedJob.id);
            handleMenuClose();
          }}
          sx={{ color: '#f44336' }}
        >
          <Delete sx={{ mr: 1, fontSize: 18 }} />
          Delete Job
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default JobListings;
