'use client';

import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  InputBase,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Logout,
  Settings,
  Dashboard,
  School,
  Work,
  Business,
  Analytics,
  VerifiedUser,
  Assignment,
  People,
  TrendingUp,
  LightMode,
  DarkMode,
  Refresh,
  Apps,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';
import DashboardSidebar from './DashboardSidebar';
import RoleSwitcher from '../debug/RoleSwitcher';

const drawerWidth = 280;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{
  open?: boolean;
}>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Provide default user data if not logged in
  const currentUser = user || {
    id: 'default-user',
    full_name: 'Demo User',
    email: 'demo@credify.com',
    role: 'learner' as const,
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const handleDrawerToggle = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = async () => {
    await logout();
    handleProfileMenuClose();
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    // You can implement actual theme switching logic here
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleAppsMenu = () => {
    // You can implement apps menu logic here
    console.log('Apps menu clicked');
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'learner': return 'Learner';
      case 'employer': return 'Employer';
      case 'institution': return 'Institution';
      case 'admin': return 'Administrator';
      default: return 'User';
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'learner': return theme.palette.primary.main;
      case 'employer': return theme.palette.secondary.main;
      case 'institution': return theme.palette.warning.main;
      case 'admin': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
        userRole={currentUser.role}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                {title || 'Dashboard Overview'}
              </Typography>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <Search>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search credentials, skills..."
                  inputProps={{ 'aria-label': 'search' }}
                />
              </Search>

              {/* Theme Toggle */}
              <IconButton
                size="medium"
                color="inherit"
                onClick={handleThemeToggle}
                sx={{ 
                  color: '#6b7280',
                  '&:hover': { 
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    color: '#374151'
                  }
                }}
              >
                {isDarkMode ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
              </IconButton>

              {/* Refresh */}
              <IconButton
                size="medium"
                color="inherit"
                onClick={handleRefresh}
                sx={{ 
                  color: '#6b7280',
                  '&:hover': { 
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    color: '#374151'
                  }
                }}
              >
                <Refresh fontSize="small" />
              </IconButton>

              {/* Apps Menu */}
              <IconButton
                size="medium"
                color="inherit"
                onClick={handleAppsMenu}
                sx={{ 
                  color: '#6b7280',
                  '&:hover': { 
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    color: '#374151'
                  }
                }}
              >
                <Apps fontSize="small" />
              </IconButton>

              {/* Notifications */}
              <IconButton
                size="medium"
                color="inherit"
                onClick={handleNotificationOpen}
                sx={{ 
                  color: '#6b7280',
                  '&:hover': { 
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    color: '#374151'
                  }
                }}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon fontSize="small" />
                </Badge>
              </IconButton>

              {/* Profile Menu */}
              <IconButton
                size="medium"
                edge="end"
                aria-label="account of current user"
                onClick={handleProfileMenuOpen}
                color="inherit"
                sx={{ ml: 1 }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: getRoleColor(currentUser.role || 'learner') }}>
                  {currentUser.full_name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>

      {/* Debug Role Switcher */}
      <RoleSwitcher />

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem>
          <Avatar sx={{ bgcolor: getRoleColor(currentUser.role || 'learner') }} />
          <Box>
            <Typography variant="subtitle2">{currentUser.full_name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {getRoleDisplayName(currentUser.role || 'learner')}
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleProfileMenuClose}>
          <Settings fontSize="small" sx={{ mr: 1 }} />
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Logout fontSize="small" sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 }
        }}
      >
        <MenuItem>
          <Box>
            <Typography variant="subtitle2">New credential verified</Typography>
            <Typography variant="caption" color="text.secondary">
              Your Machine Learning certificate has been verified
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem>
          <Box>
            <Typography variant="subtitle2">Profile viewed</Typography>
            <Typography variant="caption" color="text.secondary">
              An employer viewed your profile
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem>
          <Box>
            <Typography variant="subtitle2">New skill recommendation</Typography>
            <Typography variant="caption" color="text.secondary">
              Based on your profile, we recommend React.js
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
    </div>
  );
}
