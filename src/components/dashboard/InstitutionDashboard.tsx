'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add,
  School,
  People,
  Assessment,
  Api,
  TrendingUp,
  VerifiedUser,
  AttachMoney,
  Download,
  Edit,
  Delete,
  Visibility,
} from '@mui/icons-material';
import StatsCard from './StatsCard';
import { Institution, CredentialTemplate } from '@/types/dashboard';

// Mock data
const mockLearners = [
  {
    id: '1',
    name: 'Rahul Singh',
    email: 'rahul@example.com',
    enrolled_courses: 3,
    completed_credentials: 2,
    progress: 67,
    last_active: '2024-03-15',
  },
  {
    id: '2',
    name: 'Sneha Patel',
    email: 'sneha@example.com',
    enrolled_courses: 2,
    completed_credentials: 2,
    progress: 100,
    last_active: '2024-03-14',
  },
  {
    id: '3',
    name: 'Vikram Kumar',
    email: 'vikram@example.com',
    enrolled_courses: 4,
    completed_credentials: 1,
    progress: 25,
    last_active: '2024-03-13',
  },
];

const mockCredentialTemplates: CredentialTemplate[] = [
  {
    id: '1',
    title: 'Web Development Fundamentals',
    description: 'Complete course covering HTML, CSS, JavaScript basics',
    nsqf_level: 3,
    credit_points: 8,
    duration: '12 weeks',
    skills_covered: ['HTML', 'CSS', 'JavaScript'],
    assessment_criteria: ['Project submission', 'Quiz scores', 'Peer review'],
    is_active: true,
  },
  {
    id: '2',
    title: 'Data Science with Python',
    description: 'Advanced data analysis and machine learning techniques',
    nsqf_level: 5,
    credit_points: 15,
    duration: '16 weeks',
    skills_covered: ['Python', 'Pandas', 'Machine Learning', 'Statistics'],
    assessment_criteria: ['Capstone project', 'Weekly assignments', 'Final exam'],
    is_active: true,
  },
];

export default function InstitutionDashboard() {
  const [openCredentialDialog, setOpenCredentialDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CredentialTemplate | null>(null);

  const handleIssueCredential = () => {
    setOpenCredentialDialog(true);
  };

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Institution Portal 🏫
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage credential issuance and track learner progress
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <StatsCard
            title="Credentials Issued"
            value={1247}
            icon={<VerifiedUser />}
            color="primary"
            trend={{ value: 18, label: 'vs last month' }}
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <StatsCard
            title="Active Learners"
            value={342}
            icon={<People />}
            color="info"
            trend={{ value: 12, label: 'new this week' }}
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <StatsCard
            title="Completion Rate"
            value="87%"
            icon={<Assessment />}
            color="success"
            progress={{ value: 87, total: 100, label: 'Overall Rate' }}
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <StatsCard
            title="Revenue Generated"
            value="₹2.4L"
            icon={<AttachMoney />}
            color="warning"
            trend={{ value: 22, label: 'this quarter' }}
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Credential Issuance Panel */}
        <Box sx={{ flex: '2 1 600px', minWidth: '500px' }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Credential Issuance Panel
                </Typography>
                <Button variant="contained" startIcon={<Add />} onClick={handleIssueCredential}>
                  Issue New Credential
                </Button>
              </Box>

              {/* Quick Issue Form */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Credential Template</InputLabel>
                    <Select label="Credential Template">
                      {mockCredentialTemplates.map((template) => (
                        <MenuItem key={template.id} value={template.id}>
                          {template.title} (Level {template.nsqf_level})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                  <TextField
                    fullWidth
                    label="Learner Email"
                    placeholder="Enter learner's email address"
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained">Issue Credential</Button>
                <Button variant="outlined">Bulk Issue</Button>
                <Button variant="outlined" startIcon={<Download />}>
                  Export Template
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Learner Analytics */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Learner Analytics
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Learner</TableCell>
                      <TableCell>Enrolled Courses</TableCell>
                      <TableCell>Completed</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Last Active</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockLearners.map((learner) => (
                      <TableRow key={learner.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {learner.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">{learner.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {learner.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{learner.enrolled_courses}</TableCell>
                        <TableCell>
                          <Chip
                            label={learner.completed_credentials}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={learner.progress}
                              sx={{ width: 60, height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="caption">{learner.progress}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(learner.last_active).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
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
          {/* NSQF Compliance */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                NSQF Compliance Status
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Compliance Score</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>94%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={94}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <List sx={{ p: 0 }}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Assessment Standards"
                    secondary="✅ Compliant"
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Credit Framework"
                    secondary="✅ Aligned"
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Quality Assurance"
                    secondary="⚠️ Needs Review"
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* API Integration Status */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                API Integration
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                <Typography variant="body2">Connected</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                Last sync: 2 minutes ago
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="outlined" size="small" startIcon={<Api />}>
                  API Documentation
                </Button>
                <Button variant="outlined" size="small">
                  Test Connection
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Recent Activity
              </Typography>
              <List sx={{ p: 0 }}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'success.main' }}>
                      <VerifiedUser fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Credential issued"
                    secondary="Web Development cert to Rahul Singh"
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
                <Divider />
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'info.main' }}>
                      <People fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="New enrollment"
                    secondary="5 learners joined Data Science course"
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
                <Divider />
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'warning.main' }}>
                      <Assessment fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Compliance review"
                    secondary="Quality assurance check pending"
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Issue Credential Dialog */}
      <Dialog open={openCredentialDialog} onClose={() => setOpenCredentialDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Issue New Credential</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <FormControl fullWidth>
                <InputLabel>Credential Template</InputLabel>
                <Select label="Credential Template">
                  {mockCredentialTemplates.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField fullWidth label="Learner Email" />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField fullWidth label="Issue Date" type="date" InputLabelProps={{ shrink: true }} />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField fullWidth label="Expiry Date" type="date" InputLabelProps={{ shrink: true }} />
            </Box>
            <Box sx={{ flex: '1 1 100%', minWidth: '300px' }}>
              <TextField fullWidth multiline rows={3} label="Additional Notes" />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCredentialDialog(false)}>Cancel</Button>
          <Button variant="contained">Issue Credential</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
