'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Box } from '@mui/material';
import LoadingAnimation from '@/components/LoadingAnimation';


export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, router]);

  // Show custom loading animation while checking authentication
  return (
    <div className="mt-64 md:mt-24 flex items-center justify-center h-full w-full">
    <LoadingAnimation 
      />
    </div>
  );
}
