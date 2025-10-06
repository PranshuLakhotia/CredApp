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
} from '@mui/icons-material';
import StatsCard from './StatsCard';
import { useRouter } from 'next/navigation';

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

export default function EmployerDashboard() {
  const router = useRouter();

  const handleSearchLearners = () => {
    router.push('/dashboard/employer/search-learners');
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
                  startIcon={<PersonAdd />}
                  sx={{
                    px: 4,
                    py: 2,
                    borderRadius: 3,
                    fontWeight: 600,
                    borderColor: '#3b82f6',
                    color: '#3b82f6',
                    '&:hover': {
                      borderColor: '#2563eb',
                      bgcolor: 'rgba(59, 130, 246, 0.05)',
                    }
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
    </Box>
  );
}
