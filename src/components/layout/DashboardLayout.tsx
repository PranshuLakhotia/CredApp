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
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setOpen(!open);
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
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBarStyled position="fixed" open={open && !isMobile}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title || 'CredHub Dashboard'}
          </Typography>

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

          {/* Notifications */}
          <IconButton
            size="large"
            color="inherit"
            onClick={handleNotificationOpen}
            sx={{ ml: 2 }}
          >
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Profile Menu */}
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            onClick={handleProfileMenuOpen}
            color="inherit"
            sx={{ ml: 2 }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: getRoleColor(user?.role || 'learner') }}>
              {user?.full_name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBarStyled>

      {/* Sidebar */}
      <DashboardSidebar
        open={open}
        onClose={() => setOpen(false)}
        userRole={user?.role || 'learner'}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <Main open={open && !isMobile}>
        <Toolbar />
        {children}
      </Main>

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
          <Avatar sx={{ bgcolor: getRoleColor(user?.role || 'learner') }} />
          <Box>
            <Typography variant="subtitle2">{user?.full_name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {getRoleDisplayName(user?.role || 'learner')}
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
    </Box>
  );
}
