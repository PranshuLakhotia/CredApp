import React from 'react';
import { Box, Skeleton, Card, CardContent } from '@mui/material';

interface SkeletonLoaderProps {
  type?: 'card' | 'table' | 'list' | 'profile' | 'stats';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'card', 
  count = 3 
}) => {
  if (type === 'card') {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index}>
            <CardContent>
              <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" width="100%" height={118} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="80%" />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  if (type === 'stats') {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index}>
            <CardContent>
              <Skeleton variant="circular" width={48} height={48} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="80%" height={32} />
              <Skeleton variant="text" width="50%" />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  if (type === 'table') {
    return (
      <Box>
        <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2 }} />
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton 
            key={index} 
            variant="rectangular" 
            width="100%" 
            height={72} 
            sx={{ mb: 1 }} 
          />
        ))}
      </Box>
    );
  }

  if (type === 'list') {
    return (
      <Box>
        {Array.from({ length: count }).map((_, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" />
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  if (type === 'profile') {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Skeleton variant="circular" width={80} height={80} sx={{ mr: 2 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" height={32} />
              <Skeleton variant="text" width="60%" />
            </Box>
          </Box>
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="80%" />
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default SkeletonLoader;

