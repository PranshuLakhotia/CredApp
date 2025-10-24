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
  CircularProgress,
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
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';
import DashboardSidebar from './DashboardSidebar';
import { usePathname, useRouter } from 'next/navigation';
import LanguageSelector from '@/components/LanguageSelector';
import AIChatbot from '@/components/chatbot/AIChatbot';

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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const { user, logout, isLoading } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();
  const router = useRouter();

  // Determine user role from current path if not available in user object
  const getRoleFromPath = (path: string): UserRole => {
    if (path.includes('/dashboard/institution')) return 'institution';
    if (path.includes('/dashboard/employer')) return 'employer';
    if (path.includes('/dashboard/admin')) return 'admin';
    return 'learner'; // default
  };

  // Redirect to register if user is not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/register');
    }
  }, [isLoading, user, router]);

  // Provide default user data if not logged in (temporary fallback)
  const currentUser = user || {
    id: 'default-user',
    full_name: 'Demo User',
    email: 'demo@credify.com',
    role: getRoleFromPath(pathname),
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Ensure user has a role (either from user object or derived from path)
  const userRole = currentUser.role || getRoleFromPath(pathname);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setSidebarExpanded(!sidebarExpanded);
    }
  };

  const handleMobileSidebarClose = () => {
    setMobileSidebarOpen(false);
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
    try {
      setIsLoggingOut(true);
      await logout();
      handleProfileMenuClose();
      // Redirect to login page after successful logout
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
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
    if (fontSize === 'small') {
      setFontSize('medium');
    } else if (fontSize === 'medium') {
      setFontSize('large');
    }
    // Don't allow increasing beyond large
  };

  const handleFontSizeDecrease = () => {
    if (fontSize === 'large') {
      setFontSize('medium');
    } else if (fontSize === 'medium') {
      setFontSize('small');
    }
    // Don't allow decreasing beyond small
  };

  const handleFontSizeReset = () => {
    setFontSize('medium');
  };

  // Apply font size to the entire dashboard layout
  useEffect(() => {
    const rootElement = document.documentElement;
    if (rootElement) {
      // Use more conservative font size scaling for better accessibility
      const fontSizeMap = {
        small: '0.9rem',    // Slightly smaller than default
        medium: '1rem',     // Default size
        large: '1.05rem'    // Slightly larger, not too overwhelming
      };
      
      rootElement.style.fontSize = fontSizeMap[fontSize];
    }

    // Cleanup function to reset font size when component unmounts
    return () => {
      const rootElement = document.documentElement;
      if (rootElement) {
        rootElement.style.fontSize = '1rem'; // Reset to default
      }
    };
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

  const getRoleDisplayName = (role?: UserRole) => {
    // Use the dynamically determined role from the current dashboard path
    const currentRole = role || userRole;
    switch (currentRole) {
      case 'learner': return 'Learner';
      case 'employer': return 'Employer';
      case 'institution': return 'Institution';
      case 'admin': return 'Administrator';
      default: return 'User';
    }
  };

  const getRoleColor = (role?: UserRole) => {
    // Use the dynamically determined role from the current dashboard path
    const currentRole = role || userRole;
    switch (currentRole) {
      case 'learner': return theme.palette.primary.main;
      case 'employer': return theme.palette.secondary.main;
      case 'institution': return theme.palette.warning.main;
      case 'admin': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <DashboardSidebar
          sidebarExpanded={sidebarExpanded}
          setSidebarExpanded={setSidebarExpanded}
          userRole={userRole}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileSidebarOpen}
          onClose={handleMobileSidebarClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
            },
          }}
        >
          <DashboardSidebar
            sidebarExpanded={true}
            setSidebarExpanded={() => {}}
            userRole={userRole}
            onMobileClose={handleMobileSidebarClose}
          />
        </Drawer>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col overflow-hidden min-w-0 h-screen ${isMobile ? '' : sidebarExpanded ? 'ml-0' : ''}`}>
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Mobile Menu Button */}
              {isMobile && (
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleDrawerToggle}
                  sx={{ 
                    mr: 1,
                    color: '#6b7280',
                    '&:hover': { 
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      color: '#374151'
                    }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              )}

              <div className="flex flex-col gap-1 sm:gap-2 min-w-0 flex-1">
                {/* Page Title */}
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#1e293b',
                    fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' }
                  }}
                >
                  {title || 'Dashboard Overview'}
                </Typography>
                
                {/* Breadcrumb Navigation - Hidden on mobile */}
                {breadcrumbs.length > 0 && !isMobile && (
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
            </div>

            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
              {/* Search Bar */}
              {/* <Search className="hidden sm:flex">
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search credentials, skills..."
                  inputProps={{ 'aria-label': 'search' }}
                />
              </Search> */}

              {/* Font Size Controls - Hidden on mobile */}
              {!isMobile && (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                    <Tooltip title="Decrease font size">
                      <IconButton
                        size="small"
                        onClick={handleFontSizeDecrease}
                        disabled={fontSize === 'small'}
                        sx={{ 
                          color: fontSize === 'small' ? '#d1d5db' : '#6b7280',
                          '&:hover': { 
                            backgroundColor: fontSize === 'small' ? 'transparent' : 'rgba(0, 0, 0, 0.04)',
                            color: fontSize === 'small' ? '#d1d5db' : '#374151'
                          },
                          padding: '6px',
                          minWidth: '32px',
                          minHeight: '32px'
                        }}
                      >
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, lineHeight: 1 }}>A-</Typography>
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
                          padding: '6px',
                          minWidth: '32px',
                          minHeight: '32px'
                        }}
                      >
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, lineHeight: 1 }}>A</Typography>
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
                            backgroundColor: fontSize === 'large' ? 'transparent' : 'rgba(0, 0, 0, 0.04)',
                            color: fontSize === 'large' ? '#d1d5db' : '#374151'
                          },
                          padding: '6px',
                          minWidth: '32px',
                          minHeight: '32px'
                        }}
                      >
                        <Typography sx={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1 }}>A+</Typography>
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                </>
              )}

              {/* Theme Toggle */}
              {/* <IconButton
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
              </IconButton> */}

              {/* Refresh - Hidden on mobile */}
              {!isMobile && (
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
              )}

              {/* Language Selector */}
              <LanguageSelector />

              {/* Notifications */}
              <IconButton
                size={isMobile ? "small" : "medium"}
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
                  <NotificationsIcon fontSize={isMobile ? "small" : "small"} />
                </Badge>
              </IconButton>

              {/* Profile Menu */}
              <IconButton
                size={isMobile ? "small" : "medium"}
                edge="end"
                aria-label="account of current user"
                onClick={handleProfileMenuOpen}
                color="inherit"
                sx={{ ml: isMobile ? 0.5 : 1 }}
              >
                <Avatar sx={{ 
                  width: isMobile ? 28 : 32, 
                  height: isMobile ? 28 : 32, 
                  bgcolor: getRoleColor() 
                }}>
                  {currentUser.full_name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div 
          id="dashboard-main-content" 
          className="flex-1 overflow-auto min-h-0 max-h-full"
          style={{ transition: 'font-size 0.2s ease' }}
        >
          {children}
        </div>
      </div>


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
          <Avatar sx={{ bgcolor: getRoleColor() }} />
          <Box>
            <Typography variant="subtitle2">{currentUser.full_name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {getRoleDisplayName()}
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        {/* <MenuItem onClick={handleProfileMenuClose}>
          <Settings fontSize="small" sx={{ mr: 1 }} />
          Settings
        </MenuItem> */}
        <MenuItem onClick={handleLogout} disabled={isLoggingOut}>
          <Logout fontSize="small" sx={{ mr: 1 }} />
          {isLoggingOut ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} />
              Logging out...
            </Box>
          ) : (
            'Logout'
          )}
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

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
}
