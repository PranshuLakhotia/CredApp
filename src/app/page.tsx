'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Box, CircularProgress, Typography } from '@mui/material';
import LandingPage from '@/components/landing/LandingPage';

export default function Home() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [showLanding, setShowLanding] = useState(false);
  
  // Temporary: Add logout function to test landing page
  const handleTestLanding = () => {
    logout();
    setShowLanding(true);
  };

  useEffect(() => {
    console.log('Main page.tsx useEffect triggered:');
    console.log('- isLoading:', isLoading);
    console.log('- user:', user);
    console.log('- user.role:', user?.role);
    
    if (!isLoading) {
      if (user) {
        // Redirect to appropriate dashboard based on user role
        const role = user.role || 'learner';
        console.log('- Main page redirecting to:', `/dashboard/${role}`);
        router.push(`/dashboard/${role}`);
      } else {
        // Show landing page if not authenticated
        console.log('- No user, showing landing page');
        setShowLanding(true);
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <CircularProgress size={60} sx={{ color: 'white', mb: 3 }} />
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Credify
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.8 }}>
          Loading your digital credential platform...
        </Typography>
      </Box>
    );
  }

  if (showLanding) {
    return <LandingPage />;
  }

  return null;
}
