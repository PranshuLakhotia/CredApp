'use client';

import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Dashboard,
  School,
  Work,
  Business,
  Analytics,
  VerifiedUser,
  Assignment,
  People,
  TrendingUp,
  Search,
  BookmarkBorder,
  History,
  Settings,
  Help,
  Folder,
  Timeline,
  Assessment,
  GroupWork,
  AccountBalance,
  WorkspacePremium,
  ManageAccounts,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { UserRole } from '@/types/auth';

const drawerWidth = 280;

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string | number;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  // Learner Menu Items
  {
    id: 'learner-overview',
    label: 'Overview',
    icon: <Dashboard />,
    path: '/dashboard',
    roles: ['learner'],
  },
  {
    id: 'credentials',
    label: 'My Credentials',
    icon: <WorkspacePremium />,
    path: '/dashboard/credentials',
    roles: ['learner'],
  },
  {
    id: 'skill-progress',
    label: 'Skill Progress',
    icon: <TrendingUp />,
    path: '/dashboard/skills',
    roles: ['learner'],
  },
  {
    id: 'nsqf-pathway',
    label: 'NSQF Pathway',
    icon: <Timeline />,
    path: '/dashboard/pathway',
    roles: ['learner'],
  },
  {
    id: 'recommendations',
    label: 'Recommendations',
    icon: <School />,
    path: '/dashboard/recommendations',
    badge: '3',
    roles: ['learner'],
  },
  {
    id: 'digital-cv',
    label: 'Digital CV',
    icon: <Assignment />,
    path: '/dashboard/cv',
    roles: ['learner'],
  },

  // Employer Menu Items
  {
    id: 'employer-overview',
    label: 'Overview',
    icon: <Dashboard />,
    path: '/dashboard',
    roles: ['employer'],
  },
  {
    id: 'candidate-search',
    label: 'Find Candidates',
    icon: <Search />,
    path: '/dashboard/candidates',
    roles: ['employer'],
  },
  {
    id: 'bulk-verification',
    label: 'Bulk Verification',
    icon: <VerifiedUser />,
    path: '/dashboard/verification',
    roles: ['employer'],
  },
  {
    id: 'saved-candidates',
    label: 'Saved Profiles',
    icon: <BookmarkBorder />,
    path: '/dashboard/saved',
    badge: '12',
    roles: ['employer'],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <Analytics />,
    path: '/dashboard/analytics',
    roles: ['employer'],
  },
  {
    id: 'verification-history',
    label: 'Verification History',
    icon: <History />,
    path: '/dashboard/history',
    roles: ['employer'],
  },

  // Institution Menu Items
  {
    id: 'institution-overview',
    label: 'Overview',
    icon: <Dashboard />,
    path: '/dashboard',
    roles: ['institution'],
  },
  {
    id: 'credential-issuance',
    label: 'Issue Credentials',
    icon: <WorkspacePremium />,
    path: '/dashboard/issue',
    roles: ['institution'],
  },
  {
    id: 'learner-analytics',
    label: 'Learner Analytics',
    icon: <People />,
    path: '/dashboard/learners',
    roles: ['institution'],
  },
  {
    id: 'nsqf-compliance',
    label: 'NSQF Compliance',
    icon: <VerifiedUser />,
    path: '/dashboard/compliance',
    roles: ['institution'],
  },
  {
    id: 'api-integration',
    label: 'API Integration',
    icon: <Settings />,
    path: '/dashboard/api',
    roles: ['institution'],
  },
  {
    id: 'revenue-analytics',
    label: 'Revenue Analytics',
    icon: <Assessment />,
    path: '/dashboard/revenue',
    roles: ['institution'],
  },

  // Admin Menu Items
  {
    id: 'admin-overview',
    label: 'System Overview',
    icon: <Dashboard />,
    path: '/dashboard',
    roles: ['admin'],
  },
  {
    id: 'user-management',
    label: 'User Management',
    icon: <ManageAccounts />,
    path: '/dashboard/users',
    roles: ['admin'],
  },
  {
    id: 'institution-management',
    label: 'Institutions',
    icon: <AccountBalance />,
    path: '/dashboard/institutions',
    roles: ['admin'],
  },
  {
    id: 'system-analytics',
    label: 'System Analytics',
    icon: <Analytics />,
    path: '/dashboard/system-analytics',
    roles: ['admin'],
  },
];

interface DashboardSidebarProps {
  open: boolean;
  onClose: () => void;
  userRole: UserRole;
  isMobile: boolean;
}

export default function DashboardSidebar({ open, onClose, userRole, isMobile }: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      onClose();
    }
  };

  const getRoleInfo = (role: UserRole) => {
    switch (role) {
      case 'learner':
        return {
          title: 'Learner Portal',
          subtitle: 'Manage your credentials',
          color: theme.palette.primary.main,
        };
      case 'employer':
        return {
          title: 'Employer Portal',
          subtitle: 'Find verified talent',
          color: theme.palette.secondary.main,
        };
      case 'institution':
        return {
          title: 'Institution Portal',
          subtitle: 'Issue & manage credentials',
          color: theme.palette.warning.main,
        };
      case 'admin':
        return {
          title: 'Admin Portal',
          subtitle: 'System administration',
          color: theme.palette.error.main,
        };
      default:
        return {
          title: 'CredHub',
          subtitle: 'Dashboard',
          color: theme.palette.grey[500],
        };
    }
  };

  const roleInfo = getRoleInfo(userRole);

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: roleInfo.color }}>
          {roleInfo.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {roleInfo.subtitle}
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ px: 2, py: 1 }}>
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.path;
            
            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 48,
                    backgroundColor: isActive ? alpha(roleInfo.color, 0.1) : 'transparent',
                    color: isActive ? roleInfo.color : 'text.primary',
                    '&:hover': {
                      backgroundColor: alpha(roleInfo.color, 0.05),
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive ? roleInfo.color : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  />
                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.75rem',
                        backgroundColor: roleInfo.color,
                        color: 'white',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigation('/dashboard/settings')}
              sx={{ borderRadius: 2, minHeight: 40 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Settings />
              </ListItemIcon>
              <ListItemText
                primary="Settings"
                primaryTypographyProps={{ fontSize: '0.875rem' }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigation('/dashboard/help')}
              sx={{ borderRadius: 2, minHeight: 40 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Help />
              </ListItemIcon>
              <ListItemText
                primary="Help & Support"
                primaryTypographyProps={{ fontSize: '0.875rem' }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
      variant={isMobile ? 'temporary' : 'persistent'}
      anchor="left"
      open={open}
      onClose={onClose}
    >
      {drawerContent}
    </Drawer>
  );
}

// Helper function for alpha transparency
function alpha(color: string, opacity: number): string {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
}
