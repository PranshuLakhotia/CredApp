'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Grid,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  ArrowBack,
  MoreVert,
  Email,
  Phone,
  LocationOn,
  School,
  Work,
  Star,
  Download,
  Visibility,
  CheckCircle,
  Cancel,
  Schedule
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RoleGuard from '@/components/auth/RoleGuard';

// Mock applications data
const mockApplications = [
  {
    id: '1',
    candidate: {
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@email.com',
      phone: '+91 9876543210',
      location: 'Mumbai, India',
      avatar: 'RK',
      experience: '5 years',
      education: 'B.Tech Computer Science',
      skills: ['React', 'JavaScript', 'Node.js', 'MongoDB', 'AWS'],
      currentRole: 'Senior Frontend Developer',
      company: 'Tech Solutions Ltd'
    },
    appliedDate: '2024-01-20T10:30:00Z',
    status: 'pending',
    coverLetter: 'I am excited to apply for the Senior React Developer position. With 5 years of experience in React development, I have successfully delivered multiple projects...',
    resumeUrl: '/resumes/rajesh-kumar.pdf',
    matchScore: 92
  },
  {
    id: '2',
    candidate: {
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      phone: '+91 9876543211',
      location: 'Bangalore, India',
      avatar: 'PS',
      experience: '4 years',
      education: 'M.Tech Software Engineering',
      skills: ['React', 'TypeScript', 'Redux', 'GraphQL', 'Docker'],
      currentRole: 'Full Stack Developer',
      company: 'Innovation Labs'
    },
    appliedDate: '2024-01-19T15:45:00Z',
    status: 'shortlisted',
    coverLetter: 'As a passionate React developer with 4 years of experience, I am thrilled about the opportunity to contribute to your team...',
    resumeUrl: '/resumes/priya-sharma.pdf',
    matchScore: 88
  },
  {
    id: '3',
    candidate: {
      name: 'Amit Patel',
      email: 'amit.patel@email.com',
      phone: '+91 9876543212',
      location: 'Pune, India',
      avatar: 'AP',
      experience: '6 years',
      education: 'B.E. Information Technology',
      skills: ['React', 'Vue.js', 'Angular', 'Python', 'Django'],
      currentRole: 'Lead Frontend Developer',
      company: 'Digital Dynamics'
    },
    appliedDate: '2024-01-18T09:15:00Z',
    status: 'interviewed',
    coverLetter: 'With 6 years of comprehensive frontend development experience, I bring a unique blend of technical expertise and leadership skills...',
    resumeUrl: '/resumes/amit-patel.pdf',
    matchScore: 95
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return '#ff9800';
    case 'shortlisted': return '#2196f3';
    case 'interviewed': return '#9c27b0';
    case 'hired': return '#4caf50';
    case 'rejected': return '#f44336';
    default: return '#757575';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'Pending Review';
    case 'shortlisted': return 'Shortlisted';
    case 'interviewed': return 'Interviewed';
    case 'hired': return 'Hired';
    case 'rejected': return 'Rejected';
    default: return status;
  }
};

export default function JobApplicationsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.jobId as string;
  
  const [applications, setApplications] = useState(mockApplications);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, application: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedApplication(application);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedApplication(null);
  };

  const handleStatusChange = (applicationId: string, newStatus: string) => {
    setApplications(prev => 
      prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      )
    );
    handleMenuClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <RoleGuard allowedPath="/dashboard/employer" requiredRole="employer">
      <DashboardLayout 
        title="Job Applications"
        subtitle="Review and manage applications for your job posting"
      >
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => router.push('/dashboard/employer')}
              sx={{ mb: 2, color: '#666' }}
            >
              Back to Dashboard
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                Applications for Job #{jobId}
              </Typography>
              <Chip
                label={`${applications.length} Applications`}
                color="primary"
                sx={{ fontWeight: 600 }}
              />
            </Box>

            {/* Stats */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                    {applications.filter(app => app.status === 'pending').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h6" color="info.main" sx={{ fontWeight: 700 }}>
                    {applications.filter(app => app.status === 'shortlisted').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Shortlisted
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 700 }}>
                    {applications.filter(app => app.status === 'interviewed').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Interviewed
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h6" color="success.main" sx={{ fontWeight: 700 }}>
                    {applications.filter(app => app.status === 'hired').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hired
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Applications List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {applications.map((application) => (
              <Card key={application.id} sx={{
                borderRadius: '16px',
                border: '1px solid #e0e0e0',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 3, flex: 1 }}>
                      <Avatar sx={{
                        width: 60,
                        height: 60,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontSize: '1.5rem',
                        fontWeight: 700
                      }}>
                        {application.candidate.avatar}
                      </Avatar>
                      
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                            {application.candidate.name}
                          </Typography>
                          <Chip
                            label={getStatusLabel(application.status)}
                            size="small"
                            sx={{
                              backgroundColor: `${getStatusColor(application.status)}20`,
                              color: getStatusColor(application.status),
                              fontWeight: 600
                            }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Work sx={{ fontSize: 16, color: '#666' }} />
                            <Typography variant="body2" color="text.secondary">
                              {application.candidate.currentRole} at {application.candidate.company}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationOn sx={{ fontSize: 16, color: '#666' }} />
                            <Typography variant="body2" color="text.secondary">
                              {application.candidate.location}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <School sx={{ fontSize: 16, color: '#666' }} />
                            <Typography variant="body2" color="text.secondary">
                              {application.candidate.education}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          {application.candidate.skills.slice(0, 5).map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              size="small"
                              variant="outlined"
                              sx={{ borderRadius: '20px' }}
                            />
                          ))}
                          {application.candidate.skills.length > 5 && (
                            <Chip
                              label={`+${application.candidate.skills.length - 5} more`}
                              size="small"
                              variant="outlined"
                              sx={{ borderRadius: '20px' }}
                            />
                          )}
                        </Box>

                        <Typography
                          variant="body2"
                          sx={{
                            color: '#666',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {application.coverLetter}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                          {application.matchScore}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Match
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={(e) => handleMenuClick(e, application)}
                        sx={{ color: '#666' }}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Applied: {formatDate(application.appliedDate)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Star sx={{ fontSize: 16, color: '#ff9800' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {application.candidate.experience} experience
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<Email />}
                        variant="outlined"
                        sx={{ borderRadius: '20px' }}
                      >
                        Contact
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Download />}
                        variant="outlined"
                        sx={{ borderRadius: '20px' }}
                      >
                        Resume
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        variant="contained"
                        sx={{
                          borderRadius: '20px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }}
                      >
                        View Profile
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Context Menu */}
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
            <MenuItem onClick={() => handleStatusChange(selectedApplication?.id, 'shortlisted')}>
              <CheckCircle sx={{ mr: 1, fontSize: 18, color: '#2196f3' }} />
              Shortlist
            </MenuItem>
            <MenuItem onClick={() => handleStatusChange(selectedApplication?.id, 'interviewed')}>
              <Schedule sx={{ mr: 1, fontSize: 18, color: '#9c27b0' }} />
              Mark as Interviewed
            </MenuItem>
            <MenuItem onClick={() => handleStatusChange(selectedApplication?.id, 'hired')}>
              <CheckCircle sx={{ mr: 1, fontSize: 18, color: '#4caf50' }} />
              Hire
            </MenuItem>
            <Divider />
            <MenuItem 
              onClick={() => handleStatusChange(selectedApplication?.id, 'rejected')}
              sx={{ color: '#f44336' }}
            >
              <Cancel sx={{ mr: 1, fontSize: 18 }} />
              Reject
            </MenuItem>
          </Menu>
        </Box>
      </DashboardLayout>
    </RoleGuard>
  );
}
