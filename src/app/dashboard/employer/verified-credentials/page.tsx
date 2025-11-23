'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  Stack,
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { buildApiUrl } from '@/config/api';
import {
  Verified as VerifiedIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Tag as TagIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface VerifiedCredential {
  verified_credential_id: string;
  credential_id: string;
  learner_id: string;
  learner_name: string;
  credential_title: string;
  issuer_name: string;
  issued_date: string;
  expiry_date?: string;
  skill_tags: string[];
  nsqf_level?: number;
  credential_hash: string;
  verification_method: string;
  verified_at: string;
  created_at: string;
}

interface VerifiedCredentialsResponse {
  success: boolean;
  total_count: number;
  verified_credentials: VerifiedCredential[];
}

const VerifiedCredentialsPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [verifiedCredentials, setVerifiedCredentials] = useState<VerifiedCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCredential, setSelectedCredential] = useState<VerifiedCredential | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const fetchVerifiedCredentials = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await fetch(buildApiUrl('/employer/verified-credentials'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch verified credentials: ${response.status}`);
      }

      const data: VerifiedCredentialsResponse = await response.json();
      setVerifiedCredentials(data.verified_credentials);
    } catch (err) {
      console.error('Error fetching verified credentials:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch verified credentials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchVerifiedCredentials();
    }
  }, [isAuthenticated, authLoading]);

  const handleViewDetails = (credential: VerifiedCredential) => {
    setSelectedCredential(credential);
    setDetailDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailDialogOpen(false);
    setSelectedCredential(null);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (credential: VerifiedCredential) => {
    if (credential.expiry_date) {
      const expiryDate = new Date(credential.expiry_date);
      const now = new Date();
      if (expiryDate < now) {
        return 'error';
      } else if (expiryDate.getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000) { // 30 days
        return 'warning';
      }
    }
    return 'success';
  };

  const getStatusText = (credential: VerifiedCredential) => {
    if (credential.expiry_date) {
      const expiryDate = new Date(credential.expiry_date);
      const now = new Date();
      if (expiryDate < now) {
        return 'Expired';
      } else if (expiryDate.getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000) {
        return 'Expiring Soon';
      }
    }
    return 'Valid';
  };

  if (authLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Please log in to access verified credentials.
        </Alert>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchVerifiedCredentials}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Verified Credentials
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {verifiedCredentials.length} verified credentials found
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchVerifiedCredentials}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: 'repeat(2, 1fr)', 
          md: 'repeat(4, 1fr)' 
        }, 
        gap: 3, 
        mb: 3 
      }}>
        <Box>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <VerifiedIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{verifiedCredentials.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Verified
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PersonIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {new Set(verifiedCredentials.map(c => c.learner_id)).size}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Unique Learners
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <SchoolIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {new Set(verifiedCredentials.map(c => c.credential_title)).size}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Credential Types
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <BusinessIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {new Set(verifiedCredentials.map(c => c.issuer_name)).size}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Issuers
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Credentials Table */}
      {verifiedCredentials.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <VerifiedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Verified Credentials
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Verified credentials will appear here after successful verification.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Learner</TableCell>
                  <TableCell>Credential</TableCell>
                  <TableCell>Issuer</TableCell>
                  <TableCell>Issued Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Skills</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {verifiedCredentials.map((credential) => (
                  <TableRow key={credential.verified_credential_id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {credential.learner_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {credential.learner_id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {credential.credential_title}
                        </Typography>
                        {credential.nsqf_level && (
                          <Chip
                            label={`NSQF Level ${credential.nsqf_level}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {credential.issuer_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(credential.issued_date)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(credential)}
                        color={getStatusColor(credential)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {credential.skill_tags.slice(0, 2).map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {credential.skill_tags.length > 2 && (
                          <Chip
                            label={`+${credential.skill_tags.length - 2}`}
                            size="small"
                            variant="outlined"
                            color="default"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(credential)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <VerifiedIcon color="primary" sx={{ mr: 1 }} />
            Credential Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCredential && (
            <Box>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { 
                  xs: '1fr', 
                  md: 'repeat(2, 1fr)' 
                }, 
                gap: 3 
              }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Learner Information
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Name
                      </Typography>
                      <Typography variant="body1">
                        {selectedCredential.learner_name}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Learner ID
                      </Typography>
                      <Typography variant="body1" fontFamily="monospace">
                        {selectedCredential.learner_id}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Credential Information
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Title
                      </Typography>
                      <Typography variant="body1">
                        {selectedCredential.credential_title}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Issuer
                      </Typography>
                      <Typography variant="body1">
                        {selectedCredential.issuer_name}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Issued Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedCredential.issued_date)}
                      </Typography>
                    </Box>
                    {selectedCredential.expiry_date && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Expiry Date
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(selectedCredential.expiry_date)}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>
                <Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Skills & Competencies
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedCredential.skill_tags.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
                <Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Verification Information
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Verification Method
                      </Typography>
                      <Typography variant="body1">
                        {selectedCredential.verification_method.replace('_', ' ').toUpperCase()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Verified At
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedCredential.verified_at)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Credential Hash
                      </Typography>
                      <Typography variant="body1" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                        {selectedCredential.credential_hash}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VerifiedCredentialsPage;
