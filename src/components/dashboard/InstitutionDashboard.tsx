'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Paper,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Business,
  Description,
  VerifiedUser,
  Key,
  Visibility,
  VisibilityOff,
  ContentCopy,
  CheckCircle,
  Warning,
  Refresh,
  Delete,
  Search,
} from '@mui/icons-material';
import { kycService } from '@/services/kyc.service';

interface IssuerVerificationData {
  // Step 1: Organization Details
  organization_name: string;
  organization_type: string;
  registration_number: string;
  year_established: string;
  website: string;
  
  // Step 2: Government Documents
  govt_id_type: string;
  govt_id_number: string;
  tax_id: string;
  registration_certificate_url: string;
  
  // Step 3: Contact Information
  official_email: string;
  official_phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  
  // Step 4: Authorized Representative
  representative_name: string;
  representative_designation: string;
  representative_email: string;
  representative_phone: string;
  representative_id_proof_url: string;
}

interface ApiKey {
  _id: string;
  key: string;
  name: string;
  created_at: string;
  last_used: string | null;
  is_active: boolean;
}

const steps = [
  'Organization Details',
  'Government Documents',
  'Contact Information',
  'Authorized Representative'
];

export default function InstitutionDashboard() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'rejected' | 'not_submitted'>('not_submitted');
  const [gstinNumber, setGstinNumber] = useState('');
  const [gstinVerified, setGstinVerified] = useState(false);
  const [gstinLoading, setGstinLoading] = useState(false);
  const [gstinError, setGstinError] = useState('');
  const [gstinData, setGstinData] = useState<any>(null);
  const [formData, setFormData] = useState<IssuerVerificationData>({
    organization_name: '',
    organization_type: '',
    registration_number: '',
    year_established: '',
    website: '',
    govt_id_type: '',
    govt_id_number: '',
    tax_id: '',
    registration_certificate_url: '',
    official_email: '',
    official_phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    representative_name: '',
    representative_designation: '',
    representative_email: '',
    representative_phone: '',
    representative_id_proof_url: '',
  });
  
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  const [newKeyDialog, setNewKeyDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/issuer/verification-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVerificationStatus(data.status);
        if (data.status === 'verified') {
          fetchApiKeys();
        }
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    }
  };

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/issuer/api-keys', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.api_keys);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  };

  const handleInputChange = (field: keyof IssuerVerificationData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmitVerification = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/v1/issuer/submit-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setVerificationStatus('pending');
        alert('Verification request submitted successfully! We will review your application within 2-3 business days.');
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || 'Failed to submit verification'}`);
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      alert('Failed to submit verification request');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateApiKey = async () => {
    // Check verification status before allowing API key generation
    if (verificationStatus !== 'verified') {
      alert('Your verification is still in progress. Please wait for verification to complete before generating API keys.');
      setNewKeyDialog(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/v1/issuer/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ name: newKeyName || 'Default API Key' }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedKey(data.api_key);
        setNewKeyDialog(false);
        setNewKeyName('');
        fetchApiKeys();
      } else {
        alert('Failed to generate API key');
      }
    } catch (error) {
      console.error('Error generating API key:', error);
      alert('Failed to generate API key');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/v1/issuer/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        fetchApiKeys();
      } else {
        alert('Failed to revoke API key');
      }
    } catch (error) {
      console.error('Error revoking API key:', error);
      alert('Failed to revoke API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleGSTINVerification = async () => {
    if (!gstinNumber || gstinNumber.length !== 15) {
      setGstinError('Please enter a valid 15-character GSTIN');
      return;
    }

    try {
      setGstinLoading(true);
      setGstinError('');

      const response = await kycService.searchGSTIN(gstinNumber);

      if (response.code === 200 && response.data?.data) {
        const gstData = response.data.data;
        setGstinData(gstData);
        setGstinVerified(true);

        // Auto-fill form data from GSTIN response
        setFormData(prev => ({
          ...prev,
          organization_name: gstData.lgnm || gstData.tradeNam || '',
          tax_id: gstinNumber,
          // Extract address from pradr (principal address)
          address_line1: gstData.pradr?.addr?.st || '',
          address_line2: gstData.pradr?.addr?.loc || '',
          city: gstData.pradr?.addr?.loc || '',
          state: gstData.pradr?.addr?.stcd || '',
          postal_code: gstData.pradr?.addr?.pncd || '',
        }));

        alert('GSTIN verified successfully! Form auto-filled with organization details.');
      } else if (response.data?.message === 'No records found') {
        setGstinError('No records found for this GSTIN. Please check the number.');
      } else {
        setGstinError('GSTIN verification failed. Please try again.');
      }
    } catch (error: any) {
      setGstinError(error.message || 'Failed to verify GSTIN');
    } finally {
      setGstinLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Organization Name"
              required
              fullWidth
              value={formData.organization_name}
              onChange={(e) => handleInputChange('organization_name', e.target.value)}
              placeholder="e.g., PhysicsWallah, BYJU'S, Unacademy"
              helperText={gstinData ? '✓ Auto-filled from GSTIN' : 'Enter your organization name'}
              InputProps={{
                readOnly: !!gstinData,
                sx: gstinData ? { bgcolor: '#f0fdf4' } : {}
              }}
            />
            <TextField
              label="Organization Type"
              required
              fullWidth
              select
              SelectProps={{ native: true }}
              value={formData.organization_type}
              onChange={(e) => handleInputChange('organization_type', e.target.value)}
            >
              <option value="">Select Type</option>
              <option value="educational_institution">Educational Institution</option>
              <option value="university">University</option>
              <option value="training_center">Training Center</option>
              <option value="certification_body">Certification Body</option>
              <option value="online_platform">Online Learning Platform</option>
            </TextField>
            <TextField
              label="Registration Number"
              required
              fullWidth
              value={formData.registration_number}
              onChange={(e) => handleInputChange('registration_number', e.target.value)}
              placeholder="Company/Trust/Society Registration Number"
            />
            <TextField
              label="Year Established"
              required
              fullWidth
              type="number"
              value={formData.year_established}
              onChange={(e) => handleInputChange('year_established', e.target.value)}
              placeholder="e.g., 2020"
            />
            <TextField
              label="Official Website"
              required
              fullWidth
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://www.yourorganization.com"
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Government ID Type"
              required
              fullWidth
              select
              SelectProps={{ native: true }}
              value={formData.govt_id_type}
              onChange={(e) => handleInputChange('govt_id_type', e.target.value)}
            >
              <option value="">Select ID Type</option>
              <option value="pan">PAN Card</option>
              <option value="cin">Corporate Identification Number (CIN)</option>
              <option value="llpin">Limited Liability Partnership Identification Number (LLPIN)</option>
              <option value="trust_registration">Trust Registration Number</option>
            </TextField>
            <TextField
              label="Government ID Number"
              required
              fullWidth
              value={formData.govt_id_number}
              onChange={(e) => handleInputChange('govt_id_number', e.target.value)}
              placeholder="Enter ID Number"
            />
            <TextField
              label="Tax ID / GSTIN"
              required
              fullWidth
              value={formData.tax_id}
              onChange={(e) => handleInputChange('tax_id', e.target.value)}
              placeholder="e.g., 29ABCDE1234F1Z5"
              helperText={gstinData ? '✓ Verified from GSTIN' : 'Enter GSTIN or Tax ID'}
              InputProps={{
                readOnly: !!gstinData,
                sx: gstinData ? { bgcolor: '#f0fdf4' } : {}
              }}
            />
            <TextField
              label="Registration Certificate URL"
              required
              fullWidth
              type="url"
              value={formData.registration_certificate_url}
              onChange={(e) => handleInputChange('registration_certificate_url', e.target.value)}
              placeholder="Upload to cloud and paste URL"
              helperText="Upload your registration certificate to Google Drive/Dropbox and paste the public link"
            />
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Official Email"
              required
              fullWidth
              type="email"
              value={formData.official_email}
              onChange={(e) => handleInputChange('official_email', e.target.value)}
              placeholder="contact@organization.com"
            />
            <TextField
              label="Official Phone"
              required
              fullWidth
              value={formData.official_phone}
              onChange={(e) => handleInputChange('official_phone', e.target.value)}
              placeholder="+91 9876543210"
            />
            <TextField
              label="Address Line 1"
              required
              fullWidth
              value={formData.address_line1}
              onChange={(e) => handleInputChange('address_line1', e.target.value)}
              placeholder="Building No., Street Name"
              helperText={gstinData ? '✓ Auto-filled from GSTIN' : ''}
              InputProps={{
                sx: gstinData && formData.address_line1 ? { bgcolor: '#f0fdf4' } : {}
              }}
            />
            <TextField
              label="Address Line 2"
              fullWidth
              value={formData.address_line2}
              onChange={(e) => handleInputChange('address_line2', e.target.value)}
              placeholder="Locality, Landmark"
              InputProps={{
                sx: gstinData && formData.address_line2 ? { bgcolor: '#f0fdf4' } : {}
              }}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              <TextField
                label="City"
                required
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                InputProps={{
                  sx: gstinData && formData.city ? { bgcolor: '#f0fdf4' } : {}
                }}
              />
              <TextField
                label="State"
                required
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                InputProps={{
                  sx: gstinData && formData.state ? { bgcolor: '#f0fdf4' } : {}
                }}
              />
              <TextField
                label="Postal Code"
                required
                value={formData.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value)}
                InputProps={{
                  sx: gstinData && formData.postal_code ? { bgcolor: '#f0fdf4' } : {}
                }}
              />
              <TextField
                label="Country"
                required
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
              />
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Representative Name"
              required
              fullWidth
              value={formData.representative_name}
              onChange={(e) => handleInputChange('representative_name', e.target.value)}
              placeholder="Full name of authorized person"
            />
            <TextField
              label="Designation"
              required
              fullWidth
              value={formData.representative_designation}
              onChange={(e) => handleInputChange('representative_designation', e.target.value)}
              placeholder="e.g., CEO, Director, Principal"
            />
            <TextField
              label="Representative Email"
              required
              fullWidth
              type="email"
              value={formData.representative_email}
              onChange={(e) => handleInputChange('representative_email', e.target.value)}
            />
            <TextField
              label="Representative Phone"
              required
              fullWidth
              value={formData.representative_phone}
              onChange={(e) => handleInputChange('representative_phone', e.target.value)}
            />
            <TextField
              label="ID Proof URL (Aadhaar/PAN/Passport)"
              required
              fullWidth
              type="url"
              value={formData.representative_id_proof_url}
              onChange={(e) => handleInputChange('representative_id_proof_url', e.target.value)}
              placeholder="Upload ID proof and paste URL"
              helperText="Upload representative's ID proof to cloud storage and paste the public link"
            />
          </Box>
        );

      default:
        return null;
    }
  };

  // Render verification form
  if (verificationStatus === 'not_submitted') {
    return (
      <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Institution Verification
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete the verification process to start issuing credentials
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ p: 4, border: '1px solid #e2e8f0', borderRadius: 3 }}>
          {/* GSTIN Verification Step */}
          {!gstinVerified ? (
            <Box>
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Business sx={{ fontSize: 60, color: '#3b82f6', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  Verify Your Organization
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter your GSTIN to auto-fill organization details
                </Typography>
              </Box>

              <Box sx={{ maxWidth: 500, mx: 'auto' }}>
                <TextField
                  label="GSTIN Number"
                  fullWidth
                  required
                  value={gstinNumber}
                  onChange={(e) => {
                    setGstinNumber(e.target.value.toUpperCase());
                    setGstinError('');
                  }}
                  placeholder="29ABCDE1234F1Z5"
                  helperText="15-character GST Identification Number"
                  inputProps={{ maxLength: 15 }}
                  disabled={gstinLoading}
                  error={!!gstinError}
                  sx={{ mb: 2 }}
                />

                {gstinError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {gstinError}
                  </Alert>
                )}

                {gstinData && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <strong>Organization Found:</strong> {gstinData.lgnm || gstinData.tradeNam}
                    <br />
                    <Typography variant="caption">
                      Status: {gstinData.sts} | Type: {gstinData.dty}
                    </Typography>
                  </Alert>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleGSTINVerification}
                  disabled={gstinLoading || gstinNumber.length !== 15}
                  startIcon={gstinLoading ? <CircularProgress size={20} /> : <Search />}
                  sx={{
                    bgcolor: '#3b82f6',
                    textTransform: 'none',
                    py: 1.5,
                    '&:hover': { bgcolor: '#2563eb' }
                  }}
                >
                  {gstinLoading ? 'Verifying GSTIN...' : 'Verify & Auto-Fill'}
                </Button>

                <Button
                  fullWidth
                  onClick={() => setGstinVerified(true)}
                  sx={{ mt: 2, textTransform: 'none', color: 'text.secondary' }}
                >
                  Skip & Fill Manually
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              {gstinData && (
                <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
                  <strong>GSTIN Verified:</strong> {gstinData.lgnm || gstinData.tradeNam} ({gstinNumber})
                </Alert>
              )}

              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {renderStepContent(activeStep)}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ textTransform: 'none' }}
                >
                  Back
                </Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleSubmitVerification}
                      disabled={loading}
                      sx={{
                        bgcolor: '#3b82f6',
                        textTransform: 'none',
                        px: 4,
                        '&:hover': { bgcolor: '#2563eb' }
                      }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Submit for Verification'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{
                        bgcolor: '#3b82f6',
                        textTransform: 'none',
                        px: 4,
                        '&:hover': { bgcolor: '#2563eb' }
                      }}
                    >
                      Next
                    </Button>
                  )}
                </Box>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    );
  }

  // Render pending status
  if (verificationStatus === 'pending') {
    return (
      <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
        <Card sx={{ textAlign: 'center', p: 6 }}>
          <Warning sx={{ fontSize: 80, color: '#f59e0b', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Verification In Progress
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your verification request is under review. We'll notify you via email within 2-3 business days.
          </Typography>
          <Alert severity="info" sx={{ textAlign: 'left', maxWidth: 500, mx: 'auto' }}>
            <Typography variant="body2">
              <strong>What's next?</strong><br />
              • You cannot generate API keys until verification is complete<br />
              • You cannot issue credentials until verification is complete<br />
              • Once verified, you'll have full access to all issuer features<br />
              • Check your email for updates on verification status
            </Typography>
          </Alert>
        </Card>
      </Box>
    );
  }

  // Render rejected status
  if (verificationStatus === 'rejected') {
    return (
      <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
        <Card sx={{ textAlign: 'center', p: 6 }}>
          <Warning sx={{ fontSize: 80, color: '#ef4444', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Verification Rejected
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your verification request was rejected. Please contact support for more information.
          </Typography>
          <Button variant="contained" sx={{ textTransform: 'none' }}>
            Contact Support
          </Button>
        </Card>
      </Box>
    );
  }

  // Render verified dashboard with API key management
  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Institution Dashboard
          </Typography>
          <Chip
            icon={<CheckCircle />}
            label="Verified"
            color="success"
            sx={{ fontWeight: 600 }}
          />
        </Box>
        <Typography variant="body1" color="text.secondary">
          Manage your API keys and issue digital credentials
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Description />}
            onClick={() => {
              console.log('🎯 CLICKING ISSUE SINGLE CREDENTIAL BUTTON');
              window.location.href = '/dashboard/institution/issue-credential';
            }}
            sx={{
              bgcolor: '#10b981',
              textTransform: 'none',
              '&:hover': { bgcolor: '#059669' }
            }}
          >
            Issue Single Credential
          </Button>
          <Button
            variant="outlined"
            startIcon={<Business />}
            onClick={() => window.location.href = '/dashboard/institution/bulk-credentials'}
            sx={{
              borderColor: '#10b981',
              color: '#10b981',
              textTransform: 'none',
              '&:hover': { 
                borderColor: '#059669',
                backgroundColor: '#f0fdf4'
              }
            }}
          >
            Bulk Credential Upload
          </Button>
          <Button
            variant="outlined"
            startIcon={<VerifiedUser />}
            onClick={() => window.location.href = '/dashboard/institution/credentials'}
            sx={{
              borderColor: '#3b82f6',
              color: '#3b82f6',
              textTransform: 'none',
              '&:hover': { 
                borderColor: '#2563eb',
                backgroundColor: '#eff6ff'
              }
            }}
          >
            View Issued Credentials
          </Button>
        </Box>
      </Box>

      {/* API Keys Section */}
      <Paper elevation={0} sx={{ p: 4, border: '1px solid #e2e8f0', borderRadius: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              API Keys
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use API keys to authenticate requests to issue credentials
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Key />}
            onClick={() => setNewKeyDialog(true)}
            disabled={verificationStatus !== 'verified'}
            sx={{
              bgcolor: verificationStatus === 'verified' ? '#3b82f6' : '#9ca3af',
              textTransform: 'none',
              '&:hover': { 
                bgcolor: verificationStatus === 'verified' ? '#2563eb' : '#9ca3af'
              }
            }}
          >
            Generate New Key
          </Button>
        </Box>

        {verificationStatus !== 'verified' ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Verification Required:</strong> You must complete the verification process before you can generate API keys or issue credentials. Your verification is currently in progress.
          </Alert>
        ) : apiKeys.length === 0 ? (
          <Alert severity="info">
            No API keys generated yet. Click "Generate New Key" to create your first API key.
          </Alert>
        ) : (
          <List>
            {apiKeys.map((apiKey, index) => (
              <React.Fragment key={apiKey._id}>
                <ListItem
                  sx={{
                    bgcolor: '#f8fafc',
                    borderRadius: 2,
                    mb: 2,
                    flexDirection: 'column',
                    alignItems: 'stretch'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {apiKey.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Created: {new Date(apiKey.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => setShowApiKey(showApiKey === apiKey._id ? null : apiKey._id)}
                      >
                        {showApiKey === apiKey._id ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(apiKey.key)}
                      >
                        <ContentCopy />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRevokeApiKey(apiKey._id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                  <TextField
                    fullWidth
                    value={apiKey.key}
                    type={showApiKey === apiKey._id ? 'text' : 'password'}
                    InputProps={{
                      readOnly: true,
                      sx: { fontFamily: 'monospace', fontSize: '0.875rem' }
                    }}
                  />
                  {apiKey.last_used && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      Last used: {new Date(apiKey.last_used).toLocaleString()}
                    </Typography>
                  )}
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* New Key Dialog */}
      <Dialog open={newKeyDialog} onClose={() => setNewKeyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate New API Key</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Key Name"
            fullWidth
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="e.g., Production Key, Development Key"
            helperText="Give your API key a descriptive name for easy identification"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewKeyDialog(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerateApiKey}
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: '#3b82f6',
              textTransform: 'none',
              '&:hover': { bgcolor: '#2563eb' }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Generated Key Dialog */}
      <Dialog open={!!generatedKey} onClose={() => setGeneratedKey(null)} maxWidth="sm" fullWidth>
        <DialogTitle>API Key Generated Successfully</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Important:</strong> Copy this API key now. You won't be able to see it again!
          </Alert>
          <TextField
            fullWidth
            value={generatedKey || ''}
            InputProps={{
              readOnly: true,
              sx: { fontFamily: 'monospace' },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => copyToClipboard(generatedKey || '')}>
                    <ContentCopy />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setGeneratedKey(null)}
            variant="contained"
            sx={{
              bgcolor: '#3b82f6',
              textTransform: 'none',
              '&:hover': { bgcolor: '#2563eb' }
            }}
          >
            I've Copied the Key
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}



