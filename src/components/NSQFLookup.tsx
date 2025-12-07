/**
 * NSQF Lookup Component
 * Simple component to search for course NSQF levels
 */

'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Stack,
  Chip
} from '@mui/material';
import { Search, Award } from 'lucide-react';
import { NSQFService, NSQFResponse } from '@/services/nsqf.service';

export default function NSQFLookup() {
  const [courseName, setCourseName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NSQFResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!courseName.trim()) {
      setError('Please enter a course name');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await NSQFService.getNSQFByCourse(courseName);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch NSQF level');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            {/* Header */}
            <Box sx={{ textAlign: 'center' }}>
              <Award size={48} color="#1976d2" style={{ marginBottom: 16 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                NSQF Level Lookup
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter a course name to find its NSQF level
              </Typography>
            </Box>

            {/* Search Input */}
            <TextField
              fullWidth
              label="Course Name"
              placeholder="e.g., Web Design & Development - Hindi"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />

            {/* Search Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Search size={20} />}
              onClick={handleSearch}
              disabled={loading || !courseName.trim()}
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem'
              }}
            >
              {loading ? 'Searching...' : 'Search NSQF Level'}
            </Button>

            {/* Error Message */}
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {/* Result */}
            {result && (
              <Card sx={{ bgcolor: 'primary.50', borderRadius: 2, border: '2px solid', borderColor: 'primary.main' }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Course Name
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {result.course_name}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        NSQF Level
                      </Typography>
                      <Chip
                        label={`Level ${result.nsqf_level}`}
                        color="primary"
                        sx={{
                          fontWeight: 700,
                          fontSize: '1rem',
                          height: 36,
                          px: 2
                        }}
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
