'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import LoadingAnimation from '@/components/LoadingAnimation';
import { 
  Box, 
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  School as CredentialsIcon,
  Person as UserProfileIcon,
  Settings as SettingsIcon,
  Article as BlogIcon,
  Share as SocialIcon,
  Timeline as PathwaysIcon,
  KeyboardArrowDown as ArrowDownIcon
} from '@mui/icons-material';
import LearnerDashboard from '@/components/dashboard/LearnerDashboard';
import EmployerDashboard from '@/components/dashboard/EmployerDashboard';
import InstitutionDashboard from '@/components/dashboard/InstitutionDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';

const drawerWidth = 280;

const roleColors = {
  learner: '#2196F3',
  employer: '#4CAF50', 
  institution: '#FF9800',
  admin: '#9C27B0'
};

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'learner' | 'employer' | 'institution' | 'admin'>('learner');
  const [selectedNavItem, setSelectedNavItem] = useState('Overview');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Auth check with loading state
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while auth is initializing
  if (isLoading) {
    return (
      <div className="mt-64 md:mt-24 flex items-center justify-center h-full w-full">
    <LoadingAnimation 
      />
    </div>
    );
  }

  // Show loading if not authenticated (will redirect)
  if (!isAuthenticated) {
    return (
      <div className="mt-64 md:mt-24 flex items-center justify-center h-full w-full">
    <LoadingAnimation 
      />
    </div>
    );
  }

  const handleRoleChange = (role: 'learner' | 'employer' | 'institution' | 'admin') => {
    setSelectedRole(role);
    setAnchorEl(null);
  };

  const renderDashboard = () => {
    switch (selectedRole) {
      case 'learner':
        return <LearnerDashboard />;
      case 'employer':
        return <EmployerDashboard />;
      case 'institution':
        return <InstitutionDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <LearnerDashboard />;
    }
  };

  const navItems = [
    { text: 'Overview', icon: <DashboardIcon />, category: 'Dashboards' },
    { text: 'Analytics', icon: <AnalyticsIcon />, category: 'Dashboards' },
    { text: 'Credentials', icon: <CredentialsIcon />, category: 'Dashboards' },
    { text: 'Overview', icon: <UserProfileIcon />, category: 'User Profile' },
    { text: 'Credentials', icon: <CredentialsIcon />, category: 'User Profile' },
    { text: 'Pathways', icon: <PathwaysIcon />, category: 'User Profile' },
    { text: 'Settings', icon: <SettingsIcon />, category: null },
    { text: 'Blog', icon: <BlogIcon />, category: null },
    { text: 'Social', icon: <SocialIcon />, category: null },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          backgroundColor: 'white',
          color: 'black',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" noWrap component="div" sx={{ color: '#666' }}>
            Dashboard Overview
          </Typography>
          
          {/* Role Selector for Testing */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Today
            </Typography>
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ p: 0 }}
            >
              <Chip
                label={selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                sx={{ 
                  backgroundColor: roleColors[selectedRole],
                  color: 'white',
                  fontWeight: 'bold'
                }}
                deleteIcon={<ArrowDownIcon sx={{ color: 'white !important' }} />}
                onDelete={(e) => setAnchorEl(e.currentTarget)}
              />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem onClick={() => handleRoleChange('learner')}>Learner</MenuItem>
              <MenuItem onClick={() => handleRoleChange('employer')}>Employer</MenuItem>
              <MenuItem onClick={() => handleRoleChange('institution')}>Institution</MenuItem>
              <MenuItem onClick={() => handleRoleChange('admin')}>Admin</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#fafafa',
            borderRight: '1px solid #e0e0e0',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        {/* User Profile Section */}
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 40, height: 40, backgroundColor: roleColors[selectedRole] }}>
            {user?.full_name?.charAt(0) || 'U'}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {user?.full_name || 'User'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#666' }}>
              {user?.email}
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* Navigation */}
        <List sx={{ px: 2, py: 1 }}>
          {/* Dashboards Section */}
          <Typography variant="overline" sx={{ px: 2, py: 1, color: '#999', fontSize: '0.75rem' }}>
            Dashboards
          </Typography>
          {navItems.filter(item => item.category === 'Dashboards').map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={selectedNavItem === item.text}
                onClick={() => setSelectedNavItem(item.text)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: roleColors[selectedRole],
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}

          <Divider sx={{ my: 2 }} />

          {/* User Profile Section */}
          <Typography variant="overline" sx={{ px: 2, py: 1, color: '#999', fontSize: '0.75rem' }}>
            User Profile
          </Typography>
          {navItems.filter(item => item.category === 'User Profile').map((item) => (
            <ListItem key={`profile-${item.text}`} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={selectedNavItem === `profile-${item.text}`}
                onClick={() => setSelectedNavItem(`profile-${item.text}`)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: roleColors[selectedRole],
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}

          <Divider sx={{ my: 2 }} />

          {/* Other Items */}
          {navItems.filter(item => !item.category).map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={selectedNavItem === item.text}
                onClick={() => setSelectedNavItem(item.text)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: roleColors[selectedRole],
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* CredHub Logo */}
        <Box sx={{ mt: 'auto', p: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 24, 
            height: 24, 
            backgroundColor: roleColors[selectedRole], 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
              C
            </Typography>
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>
            CredHub
          </Typography>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#f8f9fa',
          p: 3,
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {renderDashboard()}
      </Box>
    </Box>
  );
}
