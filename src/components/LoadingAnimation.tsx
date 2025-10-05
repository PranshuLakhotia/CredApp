'use client';

import React from 'react';
import Lottie from 'lottie-react';
import loaderAnimation from '@/lib/loader.json';

interface LoadingAnimationProps {
  size?: number;
  className?: string;
  showText?: boolean;
  text?: string;
}

export default function LoadingAnimation({ 
  className = '',
  showText = false,
  text = 'Loading...'
}: LoadingAnimationProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Lottie
        animationData={loaderAnimation}
        loop={true}
        autoplay={true}
      />
    </div>
  );
}
