'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const IconWrapper = styled(Avatar)(({ theme }) => ({
  width: 56,
  height: 56,
  marginBottom: theme.spacing(2),
}));

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  trend?: {
    value: number;
    label: string;
  };
  progress?: {
    value: number;
    total: number;
    label?: string;
  };
  badge?: {
    label: string;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  };
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  trend,
  progress,
  badge,
}: StatsCardProps) {
  
  const getTrendIcon = (trendValue: number) => {
    if (trendValue > 0) return <TrendingUp fontSize="small" />;
    if (trendValue < 0) return <TrendingDown fontSize="small" />;
    return <TrendingFlat fontSize="small" />;
  };

  const getTrendColor = (trendValue: number) => {
    if (trendValue > 0) return 'success.main';
    if (trendValue < 0) return 'error.main';
    return 'text.secondary';
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <StyledCard>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            {badge && (
              <Chip
                label={badge.label}
                size="small"
                color={badge.color || 'primary'}
                sx={{ mb: 1 }}
              />
            )}
          </Box>
          <IconWrapper sx={{ bgcolor: `${color}.main`, color: 'white' }}>
            {icon}
          </IconWrapper>
        </Box>

        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: `${color}.main` }}>
          {formatValue(value)}
        </Typography>

        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {subtitle}
          </Typography>
        )}

        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: getTrendColor(trend.value),
                mr: 1,
              }}
            >
              {getTrendIcon(trend.value)}
              <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 500 }}>
                {Math.abs(trend.value)}%
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {trend.label}
            </Typography>
          </Box>
        )}

        {progress && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {progress.label || 'Progress'}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {progress.value}/{progress.total}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(progress.value / progress.total) * 100}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  backgroundColor: `${color}.main`,
                },
              }}
            />
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
}
