'use client';

import React from 'react';
import { Box, Container, Grid, Paper, Typography, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  illustration?: string;
}

export default function AuthLayout({ children, title, subtitle, illustration }: AuthLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center" justifyContent="center">
          {/* Left side -Illustration (hidden on mobile) */}
          {!isMobile && (
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                  }}
                >
                  {/*Illustration */}
                  {illustration && (
                    <Box
                      sx={{
                        width: '100%',
                        maxWidth: 400,
                        height: 300,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                      }}
                    >
                      <motion.div
                        animate={{
                          y: [0, -10, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        <Box
                          sx={{
                            width: 280,
                            height: 200,
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                          }}
                        >
                          <Typography variant="h6" sx={{ color: 'white', opacity: 0.7 }}>
                            {illustration}
                          </Typography>
                        </Box>
                      </motion.div>
                    </Box>
                  )}

                  <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: 400, color: 'white', textAlign: 'center' }}>
                    Securely manage and verify your digital credentials with our comprehensive platform.
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          )}

          {/* Right side -Form */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Paper
                elevation={24}
                sx={{
                  p: { xs: 3, sm: 4, md: 5 },
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  maxWidth: 480,
                  mx: 'auto',
                }}
              >
                {/* Mobile Logo */}
                {isMobile && (
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        background: 'linear-gradient(45deg, #4F46E5 30%, #6366F1 90%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      Credify
                    </Typography>
                  </Box>
                )}

                {/* Form Header */}
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      mb: 1,
                    }}
                  >
                    {title}
                  </Typography>
                  {subtitle && (
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.secondary',
                        lineHeight: 1.6,
                      }}
                    >
                      {subtitle}
                    </Typography>
                  )}
                </Box>

                {/* Form Content */}
                {children}
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
