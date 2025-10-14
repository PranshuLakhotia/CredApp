'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Paper,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Search,
  People,
  VerifiedUser,
  TrendingUp,
  Assessment,
  WorkOutline,
  Schedule,
  Star,
  Visibility,
  PersonAdd,
  Analytics,
  FilterList,
  Business,
  Assignment,
  Notifications,
  Add,
  Work,
} from '@mui/icons-material';
import StatsCard from './StatsCard';
import { useRouter } from 'next/navigation';
import PostJobModal from '@/components/modals/PostJobModal';
import JobListings from '@/components/employer/JobListings';

// Mock data for employer dashboard
const mockHiringData = {
  activeJobs: 12,
  candidatesViewed: 89,
  interviewsScheduled: 15,
  hiredThisMonth: 3,
};

const mockRecentActivity = [
  { id: 1, type: 'application', candidate: 'Rajesh Kumar', job: 'React Developer', time: '2 hours ago' },
  { id: 2, type: 'interview', candidate: 'Priya Sharma', job: 'ML Engineer', time: '4 hours ago' },
  { id: 3, type: 'hired', candidate: 'Amit Patel', job: 'Full Stack Dev', time: '1 day ago' },
];

const mockTopSkills = [
  { skill: 'React', demand: 85, growth: '+12%' },
  { skill: 'Python', demand: 78, growth: '+8%' },
  { skill: 'Node.js', demand: 72, growth: '+15%' },
  { skill: 'Machine Learning', demand: 68, growth: '+25%' },
];

// Mock jobs data
const initialMockJobs = [
  {
    id: '1',
    title: 'Senior React Developer',
    company: 'Tech Solutions Inc.',
    location: 'Mumbai, India',
    type: 'full-time' as const,
    experience_level: 'senior' as const,
    salary_range: { min: 800000, max: 1200000, currency: 'INR' },
    description: 'We are looking for a Senior React Developer to join our dynamic team. You will be responsible for developing user interface components and implementing them following well-known React.js workflows.',
    requirements: ['5+ years of React experience', 'Strong JavaScript skills', 'Experience with Redux'],
    responsibilities: ['Develop new user-facing features', 'Build reusable components', 'Optimize components for performance'],
    skills_required: ['React', 'JavaScript', 'Redux', 'HTML', 'CSS'],
    benefits: ['Health insurance', 'Flexible working hours', 'Work from home'],
    application_deadline: '2024-12-31',
    remote_friendly: true,
    urgent: false,
    posted_date: '2024-01-15T10:00:00Z',
    status: 'active' as const,
    applications_count: 24
  },
  {
    id: '2',
    title: 'Python Data Scientist',
    company: 'Data Analytics Corp',
    location: 'Bangalore, India',
    type: 'full-time' as const,
    experience_level: 'mid' as const,
    salary_range: { min: 600000, max: 900000, currency: 'INR' },
    description: 'Join our data science team to work on cutting-edge machine learning projects. You will analyze large datasets and build predictive models.',
    requirements: ['3+ years Python experience', 'Machine Learning knowledge', 'Statistics background'],
    responsibilities: ['Analyze complex datasets', 'Build ML models', 'Present insights to stakeholders'],
    skills_required: ['Python', 'Machine Learning', 'SQL', 'Pandas', 'Scikit-learn'],
    benefits: ['Competitive salary', 'Learning budget', 'Team outings'],
    application_deadline: '2024-11-30',
    remote_friendly: false,
    urgent: true,
    posted_date: '2024-01-10T14:30:00Z',
    status: 'active' as const,
    applications_count: 18
  }
];

export default function EmployerDashboard() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [postJobModalOpen, setPostJobModalOpen] = useState(false);
  const [jobs, setJobs] = useState(initialMockJobs);

  const handleSearchLearners = () => {
    router.push('/dashboard/employer/search-learners');
  };

  const handlePostJob = () => {
    setPostJobModalOpen(true);
  };

  const handleJobPosted = (newJob: any) => {
    setJobs(prev => [newJob, ...prev]);
  };

  const handleEditJob = (job: any) => {
    console.log('Edit job:', job);
    // TODO: Implement edit job functionality
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
  };

  const handleViewApplications = (jobId: string) => {
    router.push(`/dashboard/employer/jobs/${jobId}/applications`);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: '#0f172a' }}>
          Employer Dashboard 💼
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Manage your hiring process and find verified talent
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 5 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <StatsCard
            title="Active Jobs"
            value={mockHiringData.activeJobs}
            icon={<WorkOutline />}
            color="primary"
            trend={{ value: 8, label: 'this month' }}
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <StatsCard
            title="Candidates Viewed"
            value={mockHiringData.candidatesViewed}
            icon={<People />}
            color="info"
            trend={{ value: 15, label: 'this week' }}
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <StatsCard
            title="Interviews Scheduled"
            value={mockHiringData.interviewsScheduled}
            icon={<Schedule />}
            color="warning"
            trend={{ value: 3, label: 'pending' }}
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <StatsCard
            title="Hired This Month"
            value={mockHiringData.hiredThisMonth}
            icon={<Star />}
            color="success"
            subtitle="Great progress!"
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {/* Main Actions */}
        <Box sx={{ flex: '2 1 600px', minWidth: '400px' }}>
          {/* Quick Actions Card */}
          <Card 
            elevation={0}
            sx={{ 
              mb: 4,
              border: '1px solid #e2e8f0',
              borderRadius: 4,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0f172a' }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Search />}
                  onClick={handleSearchLearners}
                  sx={{
                    px: 4,
                    py: 2,
                    borderRadius: 3,
                    fontWeight: 600,
                    bgcolor: '#3b82f6',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                    '&:hover': {
                      bgcolor: '#2563eb',
                      boxShadow: '0 6px 16px rgba(59, 130, 246, 0.5)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Search Learners
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Add />}
                  onClick={handlePostJob}
                  sx={{
                    px: 4,
                    py: 2,
                    borderRadius: 3,
                    fontWeight: 600,
                    borderColor: '#10b981',
                    color: '#10b981',
                    '&:hover': {
                      borderColor: '#059669',
                      bgcolor: 'rgba(16, 185, 129, 0.05)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Post New Job
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Analytics />}
                  sx={{
                    px: 4,
                    py: 2,
                    borderRadius: 3,
                    fontWeight: 600,
                    borderColor: '#10b981',
                    color: '#10b981',
                    '&:hover': {
                      borderColor: '#059669',
                      bgcolor: 'rgba(16, 185, 129, 0.05)',
                    }
                  }}
                >
                  View Analytics
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card 
            elevation={0}
            sx={{ 
              border: '1px solid #e2e8f0',
              borderRadius: 4,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0f172a' }}>
                Recent Activity
              </Typography>
              <List sx={{ p: 0 }}>
                {mockRecentActivity.map((activity) => (
                  <ListItem key={activity.id} sx={{ px: 0, py: 2 }}>
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: activity.type === 'hired' ? '#10b981' : 
                                  activity.type === 'interview' ? '#f59e0b' : '#3b82f6',
                          width: 48,
                          height: 48
                        }}
                      >
                        {activity.type === 'hired' ? <Star /> : 
                         activity.type === 'interview' ? <Schedule /> : <Visibility />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {activity.candidate}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {activity.type === 'hired' ? 'Hired for' : 
                             activity.type === 'interview' ? 'Interview scheduled for' : 'Applied for'} {activity.job}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {activity.time}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Sidebar */}
        <Box sx={{ flex: '1 1 400px', minWidth: '350px' }}>
          {/* Top Skills in Demand */}
          <Card 
            elevation={0}
            sx={{ 
              mb: 4,
              border: '1px solid #e2e8f0',
              borderRadius: 4,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#0f172a' }}>
                Top Skills in Demand
              </Typography>
              {mockTopSkills.map((skillData, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {skillData.skill}
                    </Typography>
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                      {skillData.growth}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={skillData.demand} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: '#f1f5f9',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        bgcolor: '#3b82f6'
                      }
                    }} 
                  />
                  <Typography variant="caption" color="text.secondary">
                    {skillData.demand}% demand
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card 
            elevation={0}
            sx={{ 
              border: '1px solid #e2e8f0',
              borderRadius: 4,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Notifications sx={{ color: '#f59e0b' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Notifications
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  New applications received
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  5 new candidates applied for React Developer position
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Interview reminder
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Interview with Priya Sharma scheduled for tomorrow at 2 PM
                </Typography>
              </Box>
              <Button 
                variant="text" 
                size="small" 
                sx={{ 
                  color: '#3b82f6',
                  fontWeight: 600,
                  textTransform: 'none'
                }}
              >
                View all notifications
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Jobs Management Section */}
      <Box sx={{ mt: 6 }}>
        <Card 
          elevation={0}
          sx={{ 
            border: '1px solid #e2e8f0',
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* Tabs Header */}
            <Box sx={{ borderBottom: '1px solid #e2e8f0', px: 4, pt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Job Management
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handlePostJob}
                  sx={{
                    borderRadius: 3,
                    fontWeight: 600,
                    px: 3,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      boxShadow: '0 6px 16px rgba(16, 185, 129, 0.5)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Post New Job
                </Button>
              </Box>
              
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                sx={{
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#3b82f6',
                    height: 3,
                    borderRadius: '3px 3px 0 0'
                  }
                }}
              >
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Work sx={{ fontSize: 18 }} />
                      <span>Active Jobs ({jobs.filter(job => job.status === 'active').length})</span>
                    </Box>
                  }
                  sx={{ 
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.95rem'
                  }}
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Analytics sx={{ fontSize: 18 }} />
                      <span>All Jobs ({jobs.length})</span>
                    </Box>
                  }
                  sx={{ 
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.95rem'
                  }}
                />
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ p: 4 }}>
              {tabValue === 0 && (
                <JobListings
                  jobs={jobs.filter(job => job.status === 'active')}
                  onEditJob={handleEditJob}
                  onDeleteJob={handleDeleteJob}
                  onViewApplications={handleViewApplications}
                />
              )}
              {tabValue === 1 && (
                <JobListings
                  jobs={jobs}
                  onEditJob={handleEditJob}
                  onDeleteJob={handleDeleteJob}
                  onViewApplications={handleViewApplications}
                />
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Post Job Modal */}
      <PostJobModal
        open={postJobModalOpen}
        onClose={() => setPostJobModalOpen(false)}
        onJobPosted={handleJobPosted}
      />
    </Box>
  );
}
