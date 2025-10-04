'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  People,
  Business,
  VerifiedUser,
  TrendingUp,
  Security,
  Assessment,
  Warning,
  CheckCircle,
  Error,
  Settings,
  Visibility,
  Block,
} from '@mui/icons-material';
import StatsCard from './StatsCard';

// Mock data
const mockSystemStats = {
  total_users: 15420,
  active_institutions: 89,
  credentials_issued: 45230,
  verification_rate: 94.2,
  system_uptime: 99.8,
  monthly_growth: 18.5,
};

const mockInstitutions = [
  {
    id: '1',
    name: 'Indian Institute of Technology',
    type: 'university',
    status: 'active',
    credentials_issued: 2340,
    learners: 1200,
    compliance_score: 98,
  },
  {
    id: '2',
    name: 'Coursera India',
    type: 'training_center',
    status: 'active',
    credentials_issued: 8900,
    learners: 5600,
    compliance_score: 95,
  },
  {
    id: '3',
    name: 'TechCorp Learning',
    type: 'corporate',
    status: 'pending',
    credentials_issued: 450,
    learners: 230,
    compliance_score: 87,
  },
];

const mockRecentUsers = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    role: 'learner',
    status: 'active',
    joined: '2024-03-15',
  },
  {
    id: '2',
    name: 'TechCorp HR',
    email: 'hr@techcorp.com',
    role: 'employer',
    status: 'active',
    joined: '2024-03-14',
  },
  {
    id: '3',
    name: 'Learning Institute',
    email: 'admin@learninginst.edu',
    role: 'institution',
    status: 'pending',
    joined: '2024-03-13',
  },
];

const mockSystemAlerts = [
  {
    id: '1',
    type: 'warning',
    title: 'High API Usage',
    description: 'Institution API calls exceeded 80% of limit',
    timestamp: '2024-03-15T10:30:00Z',
  },
  {
    id: '2',
    type: 'error',
    title: 'Failed Verifications',
    description: '5 credential verifications failed in the last hour',
    timestamp: '2024-03-15T09:15:00Z',
  },
  {
    id: '3',
    type: 'info',
    title: 'System Maintenance',
    description: 'Scheduled maintenance completed successfully',
    timestamp: '2024-03-15T08:00:00Z',
  },
];

export default function AdminDashboard() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <Warning color="warning" />;
      case 'error': return <Error color="error" />;
      case 'info': return <CheckCircle color="info" />;
      default: return <CheckCircle />;
    }
  };

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          System Administration 🛠️
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor platform health and manage system-wide operations
        </Typography>
      </Box>

      {/* System Stats */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <StatsCard
            title="Total Users"
            value={mockSystemStats.total_users}
            icon={<People />}
            color="primary"
            trend={{ value: mockSystemStats.monthly_growth, label: 'monthly growth' }}
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <StatsCard
            title="Active Institutions"
            value={mockSystemStats.active_institutions}
            icon={<Business />}
            color="info"
            subtitle="Verified partners"
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <StatsCard
            title="Credentials Issued"
            value={mockSystemStats.credentials_issued}
            icon={<VerifiedUser />}
            color="success"
            trend={{ value: 22, label: 'vs last month' }}
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <StatsCard
            title="System Uptime"
            value={`${mockSystemStats.system_uptime}%`}
            icon={<TrendingUp />}
            color="warning"
            progress={{ value: mockSystemStats.system_uptime, total: 100, label: 'Availability' }}
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Institution Management */}
        <Box sx={{ flex: '2 1 600px', minWidth: '500px' }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Institution Management
                </Typography>
                <Button variant="contained" startIcon={<Business />}>
                  Add Institution
                </Button>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Institution</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Credentials</TableCell>
                      <TableCell>Learners</TableCell>
                      <TableCell>Compliance</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockInstitutions.map((institution) => (
                      <TableRow key={institution.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              <Business />
                            </Avatar>
                            <Typography variant="subtitle2">{institution.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={institution.type}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={institution.status}
                            size="small"
                            color={getStatusColor(institution.status) as any}
                          />
                        </TableCell>
                        <TableCell>{institution.credentials_issued.toLocaleString()}</TableCell>
                        <TableCell>{institution.learners.toLocaleString()}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={institution.compliance_score}
                              sx={{ width: 60, height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="caption">{institution.compliance_score}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                            <IconButton size="small">
                              <Settings />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <Block />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Recent User Registrations
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Joined</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockRecentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {user.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">{user.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.status}
                            size="small"
                            color={getStatusColor(user.status) as any}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(user.joined).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                            <IconButton size="small">
                              <Settings />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Sidebar */}
        <Box sx={{ flex: '1 1 400px', minWidth: '350px' }}>
          {/* System Health */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                System Health
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">API Response Time</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>120ms</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={85}
                  sx={{ height: 6, borderRadius: 3, mb: 2 }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Database Performance</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Good</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={92}
                  color="success"
                  sx={{ height: 6, borderRadius: 3, mb: 2 }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Storage Usage</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>67%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={67}
                  color="warning"
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                System Alerts
              </Typography>
              <List sx={{ p: 0 }}>
                {mockSystemAlerts.map((alert, index) => (
                  <React.Fragment key={alert.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'transparent' }}>
                          {getAlertIcon(alert.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={alert.title}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {alert.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(alert.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      />
                    </ListItem>
                    {index < mockSystemAlerts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="contained" startIcon={<Assessment />} fullWidth>
                  System Analytics
                </Button>
                <Button variant="outlined" startIcon={<Security />} fullWidth>
                  Security Audit
                </Button>
                <Button variant="outlined" startIcon={<Settings />} fullWidth>
                  System Settings
                </Button>
                <Button variant="outlined" startIcon={<People />} fullWidth>
                  User Management
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
