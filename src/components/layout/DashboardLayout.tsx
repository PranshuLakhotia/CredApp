'use client';

import React, { useState, useEffect } from 'react';
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
  Breadcrumbs,
  Link,
  Tooltip,
  ButtonGroup,
  Button,
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
  NavigateNext,
  Home,
  TextIncrease,
  TextDecrease,
  TextFields,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';
import DashboardSidebar from './DashboardSidebar';
import RoleSwitcher from '../debug/RoleSwitcher';
import { usePathname, useRouter } from 'next/navigation';

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
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();
  const router = useRouter();

  // Provide default user data if not logged in
  const currentUser = user || {
    id: 'default-user',
    full_name: 'Demo User',
    email: 'demo@credify.com',
    role: 'learner' as UserRole,
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

  const handleFontSizeIncrease = () => {
    if (fontSize === 'small') setFontSize('medium');
    else if (fontSize === 'medium') setFontSize('large');
  };

  const handleFontSizeDecrease = () => {
    if (fontSize === 'large') setFontSize('medium');
    else if (fontSize === 'medium') setFontSize('small');
  };

  const handleFontSizeReset = () => {
    setFontSize('medium');
  };

  // Apply font size to main content
  useEffect(() => {
    const mainContent = document.getElementById('dashboard-main-content');
    if (mainContent) {
      mainContent.style.fontSize = 
        fontSize === 'small' ? '0.875rem' : 
        fontSize === 'large' ? '1.125rem' : 
        '1rem';
    }
  }, [fontSize]);

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const paths = pathname?.split('/').filter(Boolean) || [];
    
    return paths.map((path, index) => {
      const href = '/' + paths.slice(0, index + 1).join('/');
      const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
      const isLast = index === paths.length - 1;
      
      return {
        href,
        label,
        isLast,
      };
    });
  };

  const breadcrumbs = generateBreadcrumbs();

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
        userRole={(currentUser.role as UserRole) || 'learner'}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              {/* Page Title */}
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                {title || 'Dashboard Overview'}
              </Typography>
              
              {/* Breadcrumb Navigation */}
              {breadcrumbs.length > 0 && (
                <Breadcrumbs
                  separator={<NavigateNext fontSize="small" />}
                  aria-label="breadcrumb"
                  sx={{ fontSize: '0.875rem' }}
                >
                  <Link
                    underline="hover"
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: '#6b7280',
                      cursor: 'pointer',
                      '&:hover': { color: '#374151' }
                    }}
                    onClick={() => router.push('/dashboard')}
                  >
                    <Home sx={{ mr: 0.5, fontSize: '1rem' }} />
                    Dashboard
                  </Link>
                  {breadcrumbs.map((crumb, index) => (
                    crumb.isLast ? (
                      <Typography
                        key={index}
                        sx={{ 
                          color: '#1e293b',
                          fontWeight: 600,
                          fontSize: '0.875rem'
                        }}
                      >
                        {crumb.label}
                      </Typography>
                    ) : (
                      <Link
                        key={index}
                        underline="hover"
                        sx={{ 
                          color: '#6b7280',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          '&:hover': { color: '#374151' }
                        }}
                        onClick={() => router.push(crumb.href)}
                      >
                        {crumb.label}
                      </Link>
                    )
                  ))}
                </Breadcrumbs>
              )}
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

              {/* Font Size Controls */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                <Tooltip title="Decrease font size">
                  <IconButton
                    size="small"
                    onClick={handleFontSizeDecrease}
                    disabled={fontSize === 'small'}
                    sx={{ 
                      color: fontSize === 'small' ? '#d1d5db' : '#6b7280',
                      '&:hover': { 
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        color: '#374151'
                      },
                      padding: '4px'
                    }}
                  >
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>A-</Typography>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reset font size">
                  <IconButton
                    size="small"
                    onClick={handleFontSizeReset}
                    sx={{ 
                      color: fontSize === 'medium' ? '#3b82f6' : '#6b7280',
                      '&:hover': { 
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        color: '#374151'
                      },
                      padding: '4px'
                    }}
                  >
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 700 }}>A</Typography>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Increase font size">
                  <IconButton
                    size="small"
                    onClick={handleFontSizeIncrease}
                    disabled={fontSize === 'large'}
                    sx={{ 
                      color: fontSize === 'large' ? '#d1d5db' : '#6b7280',
                      '&:hover': { 
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        color: '#374151'
                      },
                      padding: '4px'
                    }}
                  >
                    <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>A+</Typography>
                  </IconButton>
                </Tooltip>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

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
        <div 
          id="dashboard-main-content" 
          className="flex-1 overflow-auto"
          style={{ transition: 'font-size 0.2s ease' }}
        >
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
