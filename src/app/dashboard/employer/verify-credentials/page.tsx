'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  AlertTitle,
  Fade,
  Zoom,
  Slide,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  QrCodeScanner,
  Upload,
  VerifiedUser,
  CheckCircle,
  Cancel,
  Warning,
  Download,
  Link,
  ContentCopy,
  Visibility,
  CloudDone,
  Security,
  Schedule,
  PictureAsPdf,
  Scanner,
  Compare,
  FileUpload,
} from '@mui/icons-material';

// Types
interface VerificationResult {
  credential_id: string;
  credential_title: string;
  learner_name: string;
  issuer_name: string;
  issued_date: string;
  expiry_date?: string;
  verification_status: 'verified' | 'unverified' | 'revoked' | 'expired';
  blockchain_hash?: string;
  blockchain_transaction_link?: string;
  verification_timestamp: string;
  merkle_proof?: string;
  issuer_did?: string;
  credential_type: string;
  skills?: string[];
  nsqf_level?: number;
}

interface OCRData {
  learner_id: string;
  learner_name: string;
  credential_title: string;
  issuer_name: string;
  issued_date: string;
  expiry_date?: string;
  skills: string[];
  nsqf_level?: number;
  confidence_score: number;
  certificate_id?: string; // Add missing property
}

interface QRData {
  credential_id: string;
  credential_hash: string;
  learner_id: string;
  learner_name: string;
  issuer_name: string;
  issued_date: string;
  credential_title?: string;
  blockchain_hash?: string;
  expiry_date?: string; // Add missing property
  skill_tags?: string[]; // Add missing property
  nsqf_level?: number; // Add missing property
}

interface PDFVerificationResult {
  file_name: string;
  status: 'processing' | 'verified' | 'unverified' | 'error';
  ocr_data?: OCRData;
  qr_data?: QRData;
  verification_details?: {
    learner_id_match: boolean;
    learner_name_match: boolean;
    credential_title_match: boolean;
    issuer_name_match: boolean;
    issued_date_match: boolean;
    overall_match: boolean;
  };
  error_message?: string;
  processing_steps: {
    ocr_extraction: 'pending' | 'processing' | 'completed' | 'failed';
    qr_scanning: 'pending' | 'processing' | 'completed' | 'failed';
    credential_fetch: 'pending' | 'processing' | 'completed' | 'failed';
    data_matching: 'pending' | 'processing' | 'completed' | 'failed';
  };
}

interface BulkVerificationResult {
  total_processed: number;
  verified: number;
  unverified: number;
  errors: number;
  results: PDFVerificationResult[];
}

export default function VerifyCredentialsPage() {
  const [credentialId, setCredentialId] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [bulkResults, setBulkResults] = useState<BulkVerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSingleVerification = async () => {
    if (!credentialId.trim()) {
      setError('Please enter a credential ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) {
        setError('Authentication token not found');
        return;
      }
      
      const response = await fetch(`/api/v1/employer/verify/${credentialId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setVerificationResult(result);
        setShowResultDialog(true);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Network error occurred during verification');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkVerification = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select PDF files to upload');
      return;
    }

    // Check if all files are PDFs
    const nonPdfFiles = selectedFiles.filter(file => !file.name.toLowerCase().endsWith('.pdf'));
    if (nonPdfFiles.length > 0) {
      setError('Please select only PDF files');
      return;
    }

    setIsProcessing(true);
    setBulkLoading(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) {
        setError('Authentication token not found');
        return;
      }
      
      const results: PDFVerificationResult[] = [];

      // Process each PDF file
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Initialize result for this file
        const result: PDFVerificationResult = {
          file_name: file.name,
          status: 'processing',
          processing_steps: {
            ocr_extraction: 'pending',
            qr_scanning: 'pending',
            credential_fetch: 'pending',
            data_matching: 'pending',
          },
        };

        results.push(result);

        try {
          // Step 1: OCR Extraction
          result.processing_steps.ocr_extraction = 'processing';
          const ocrFormData = new FormData();
          ocrFormData.append('file', file);

          const ocrResponse = await fetch('https://credhub.twilightparadox.com/api/v1/employer/credentials/extract-ocr', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: ocrFormData,
          });

          if (ocrResponse.ok) {
            const ocrData = await ocrResponse.json();
            result.ocr_data = ocrData;
            result.processing_steps.ocr_extraction = 'completed';
          } else {
            result.processing_steps.ocr_extraction = 'failed';
            result.error_message = 'OCR extraction failed';
            result.status = 'error';
            continue;
          }

          // Step 2: QR Code Scanning
          result.processing_steps.qr_scanning = 'processing';
          const qrResponse = await fetch('https://credhub.twilightparadox.com/api/v1/verify/qr/pdf', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              file_data: await fileToBase64(file),
              file_name: file.name,
            }),
          });

          if (qrResponse.ok) {
            const qrResponseData = await qrResponse.json();
            
            // Extract credential ID from QR code data
            const credentialId = qrResponseData.credential_info?.credential_id;
            
            if (credentialId) {
              // Step 2.1: Fetch credential details from database using credential ID
              result.processing_steps.credential_fetch = 'processing';
              
              try {
                const credentialResponse = await fetch(`https://credhub.twilightparadox.com/api/v1/employer/credentials/${credentialId}`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                });
                
                if (credentialResponse.ok) {
                  const credentialData = await credentialResponse.json();
                  result.qr_data = {
                    ...qrResponseData.credential_info,
                    learner_id: credentialData.credential_info.learner_id, // Get learner ID from database
                    learner_name: credentialData.credential_info.learner_name,
                    credential_title: credentialData.credential_info.credential_title,
                    issuer_name: credentialData.credential_info.issuer_name,
                    issued_date: credentialData.credential_info.issued_date,
                    status: credentialData.credential_info.status
                  };
                  result.processing_steps.credential_fetch = 'completed';
                  result.processing_steps.qr_scanning = 'completed';
                } else {
                  result.processing_steps.credential_fetch = 'failed';
                  result.processing_steps.qr_scanning = 'failed';
                  result.error_message = 'Failed to fetch credential details from database';
                  result.status = 'error';
                  continue;
                }
              } catch (fetchError) {
                result.processing_steps.credential_fetch = 'failed';
                result.processing_steps.qr_scanning = 'failed';
                result.error_message = 'Error fetching credential details';
                result.status = 'error';
                continue;
              }
            } else {
              result.processing_steps.qr_scanning = 'failed';
              result.error_message = 'No credential ID found in QR code';
              result.status = 'error';
              continue;
            }
          } else if (qrResponse.status === 404) {
            // Handle case where no QR codes are found
            const errorData = await qrResponse.json();
            result.processing_steps.qr_scanning = 'failed';
            result.error_message = errorData.detail || 'No QR codes found in PDF';
            result.status = 'error';
            continue;
          } else {
            result.processing_steps.qr_scanning = 'failed';
            result.error_message = 'QR code scanning failed';
            result.status = 'error';
            continue;
          }

          // Step 3: Data Matching
          result.processing_steps.data_matching = 'processing';
          
          if (result.ocr_data && result.qr_data) {
            // Extract learner ID from OCR (this should be extracted from certificate text)
            const ocrLearnerId = result.ocr_data.certificate_id || result.ocr_data.learner_id;
            const dbLearnerId = result.qr_data.learner_id;
            
            // Only check learner ID matching
            const learnerIdMatch = dbLearnerId === ocrLearnerId;
            
            const verificationDetails = {
              learner_id_match: learnerIdMatch,
              learner_name_match: result.ocr_data.learner_name.toLowerCase() === result.qr_data.learner_name.toLowerCase(),
              credential_title_match: result.ocr_data.credential_title.toLowerCase() === (result.qr_data.credential_title || '').toLowerCase(),
              issuer_name_match: result.ocr_data.issuer_name.toLowerCase() === result.qr_data.issuer_name.toLowerCase(),
              issued_date_match: new Date(result.ocr_data.issued_date).getTime() === new Date(result.qr_data.issued_date).getTime(),
              overall_match: learnerIdMatch, // Only learner ID match determines verification
            };
            
            result.verification_details = verificationDetails;
            result.status = learnerIdMatch ? 'verified' : 'unverified';
            result.processing_steps.data_matching = 'completed';
            
            // If verified, add to employer's verified credentials list
            if (learnerIdMatch && result.qr_data) {
              try {
                const verifiedCredentialData = {
                  credential_id: result.qr_data.credential_id,
                  learner_id: result.qr_data.learner_id,
                  learner_name: result.qr_data.learner_name,
                  credential_title: result.qr_data.credential_title,
                  issuer_name: result.qr_data.issuer_name,
                  issued_date: result.qr_data.issued_date,
                  expiry_date: result.qr_data.expiry_date,
                  skill_tags: result.qr_data.skill_tags || [],
                  nsqf_level: result.qr_data.nsqf_level,
                  credential_hash: result.qr_data.credential_hash
                };
                
                const addVerifiedResponse = await fetch('https://credhub.twilightparadox.com/api/v1/employer/verified-credentials', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(verifiedCredentialData),
                });
                
                if (addVerifiedResponse.ok) {
                  console.log('✅ Verified credential added to employer list');
                } else {
                  console.warn('⚠️ Failed to add verified credential to employer list');
                }
              } catch (error) {
                console.warn('⚠️ Error adding verified credential:', error);
              }
            }
          }

        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          result.status = 'error';
          result.error_message = 'Processing failed';
        }
      }

      // Update bulk results
      const summary = {
        total_processed: results.length,
        verified: results.filter(r => r.status === 'verified').length,
        unverified: results.filter(r => r.status === 'unverified').length,
        errors: results.filter(r => r.status === 'error').length,
        results: results,
      };

      setBulkResults(summary);
      setShowBulkDialog(true);

    } catch (error) {
      console.error('Bulk verification error:', error);
      setError('Network error occurred during bulk verification');
    } finally {
      setIsProcessing(false);
      setBulkLoading(false);
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/...;base64, prefix
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const downloadVerificationReport = (result: VerificationResult) => {
    const reportData = {
      verification_report: {
        credential_id: result.credential_id,
        credential_title: result.credential_title,
        learner_name: result.learner_name,
        issuer_name: result.issuer_name,
        issued_date: result.issued_date,
        expiry_date: result.expiry_date,
        verification_status: result.verification_status,
        blockchain_hash: result.blockchain_hash,
        verification_timestamp: result.verification_timestamp,
        skills: result.skills,
        nsqf_level: result.nsqf_level,
      },
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verification-report-${result.credential_id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle sx={{ color: '#10b981' }} />;
      case 'unverified':
        return <Warning sx={{ color: '#f59e0b' }} />;
      case 'revoked':
        return <Cancel sx={{ color: '#ef4444' }} />;
      case 'expired':
        return <Schedule sx={{ color: '#6b7280' }} />;
      default:
        return <Warning sx={{ color: '#6b7280' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return '#10b981';
      case 'unverified':
        return '#f59e0b';
      case 'revoked':
        return '#ef4444';
      case 'expired':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  return (
    <DashboardLayout title="Credential Verification">
      <Box sx={{ p: 3 }}>
        <Fade in={true} timeout={800}>
          <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                 Credential Verification Panel
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Verify credential authenticity using blockchain verification
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                <AlertTitle>Verification Error</AlertTitle>
                {error}
              </Alert>
            )}

            <Grid container spacing={4}>
              {/* PDF Verification */}
              <Grid item xs={12} md={6}>
                <Zoom in={true} timeout={800}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                        <PictureAsPdf sx={{ mr: 1, color: '#10b981' }} />
                        PDF Credential Verification
                      </Typography>

                      <Box sx={{ mb: 3 }}>
                        <input
                          type="file"
                          accept=".pdf"
                          multiple
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                          id="pdf-upload"
                        />
                        <label htmlFor="pdf-upload">
                          <Button
                            component="span"
                            variant="outlined"
                            fullWidth
                            size="large"
                            sx={{ mb: 2, height: 56 }}
                          >
                            <FileUpload sx={{ mr: 1 }} />
                            {selectedFiles.length > 0 ? `${selectedFiles.length} PDF(s) Selected` : 'Select PDF Files'}
                          </Button>
                        </label>

                        {/* Selected Files List */}
                        {selectedFiles.length > 0 && (
                          <Box sx={{ mb: 2, maxHeight: 120, overflow: 'auto' }}>
                            {selectedFiles.map((file, index) => (
                              <Chip
                                key={index}
                                label={file.name}
                                onDelete={() => {
                                  setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                                }}
                                sx={{ mr: 1, mb: 1 }}
                                color="primary"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        )}

                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          onClick={handleBulkVerification}
                          disabled={bulkLoading || selectedFiles.length === 0}
                          sx={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #0d9668 0%, #047857 100%)',
                            },
                          }}
                        >
                          {bulkLoading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress sx={{ width: '100%', mr: 1 }} />
                              Processing...
                            </Box>
                          ) : (
                            `Verify ${selectedFiles.length} PDF(s)`
                          )}
                        </Button>
                      </Box>

                      <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Scanner sx={{ mr: 1, fontSize: 16 }} />
                          <strong>Verification Process:</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 3, mb: 0.5 }}>
                          1. Extract data using OCR
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 3, mb: 0.5 }}>
                          2. Scan QR code for credential details
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                          3. Compare and verify authenticity
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            </Grid>
          </Box>
        </Fade>

        {/* Single Verification Result Dialog */}
        <Dialog open={showResultDialog} onClose={() => setShowResultDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VerifiedUser color="primary" />
            Verification Result
          </DialogTitle>
          <DialogContent>
            {verificationResult && (
              <Box>
                {/* Status Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                  <Avatar sx={{ bgcolor: getStatusColor(verificationResult.verification_status), mr: 2 }}>
                    {getStatusIcon(verificationResult.verification_status)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {verificationResult.credential_title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {verificationResult.verification_status.toUpperCase()}
                    </Typography>
                  </Box>
                </Box>

                {/* Credential Details */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Learner Name</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {verificationResult.learner_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Issuer</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {verificationResult.issuer_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Issued Date</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {new Date(verificationResult.issued_date).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Expiry Date</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {verificationResult.expiry_date ? new Date(verificationResult.expiry_date).toLocaleDateString() : 'No expiry'}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Blockchain Information */}
                {verificationResult.blockchain_hash && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Blockchain Verification
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: '#f0f9ff', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Security sx={{ color: '#3b82f6', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Hash: {verificationResult.blockchain_hash}
                        </Typography>
                        <IconButton size="small" onClick={() => navigator.clipboard.writeText(verificationResult.blockchain_hash!)}>
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Box>
                      {verificationResult.blockchain_transaction_link && (
                        <Button
                          startIcon={<Link />}
                          size="small"
                          href={verificationResult.blockchain_transaction_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Transaction
                        </Button>
                      )}
                    </Box>
                  </Box>
                )}

                {/* Skills */}
                {verificationResult.skills && verificationResult.skills.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Skills
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {verificationResult.skills.map((skill, index) => (
                        <Chip key={index} label={skill} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* NSQF Level */}
                {verificationResult.nsqf_level && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      NSQF Level
                    </Typography>
                    <Chip label={`Level ${verificationResult.nsqf_level}`} color="primary" />
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowResultDialog(false)}>Close</Button>
            {verificationResult && (
              <Button
                startIcon={<Download />}
                onClick={() => downloadVerificationReport(verificationResult)}
                variant="contained"
              >
                Download Report
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* PDF Verification Result Dialog */}
        <Dialog open={showBulkDialog} onClose={() => setShowBulkDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PictureAsPdf color="primary" />
            PDF Verification Results
          </DialogTitle>
          <DialogContent>
            {bulkResults && (
              <Box>
                {/* Summary Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6} sm={3}>
                    <Card sx={{ textAlign: 'center', bgcolor: '#f0fdf4' }}>
                      <CardContent sx={{ py: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981' }}>
                          {bulkResults.verified}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Verified
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card sx={{ textAlign: 'center', bgcolor: '#fffbeb' }}>
                      <CardContent sx={{ py: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                          {bulkResults.unverified}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Unverified
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card sx={{ textAlign: 'center', bgcolor: '#fef2f2' }}>
                      <CardContent sx={{ py: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#ef4444' }}>
                          {bulkResults.errors}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Errors
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card sx={{ textAlign: 'center', bgcolor: '#f0f9ff' }}>
                      <CardContent sx={{ py: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                          {bulkResults.total_processed}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Processed
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Divider sx={{ mb: 3 }} />

                {/* Results List */}
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  PDF Verification Results
                </Typography>
                <List>
                  {bulkResults.results.map((result, index) => (
                    <ListItem key={index} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, mb: 1 }}>
                      <ListItemIcon>
                        {getStatusIcon(result.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={result.file_name}
                        secondary={
                          <Box>
                            {result.status === 'verified' && result.verification_details && (
                              <Typography variant="body2" color="text.secondary">
                                {result.ocr_data?.learner_name} • {result.ocr_data?.credential_title}
                              </Typography>
                            )}
                            {result.status === 'unverified' && result.verification_details && (
                              <Typography variant="body2" color="text.secondary">
                                Data mismatch detected
                              </Typography>
                            )}
                            {result.status === 'error' && (
                              <Typography variant="body2" color="error">
                                {result.error_message}
                              </Typography>
                            )}
                            {result.status === 'processing' && (
                              <Typography variant="body2" color="text.secondary">
                                Processing...
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={result.status.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(result.status),
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                        {result.status === 'verified' && (
                          <Chip
                            label="Blockchain"
                            size="small"
                            variant="outlined"
                            sx={{ color: '#10b981', borderColor: '#10b981' }}
                          />
                        )}
                      </Box>
                    </ListItem>
                  ))}
                </List>

                {/* Detailed Results */}
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 3 }}>
                  Detailed Verification Results
                </Typography>
                {bulkResults.results.map((result, index) => (
                  <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        {result.file_name}
                      </Typography>
                      
                      {result.verification_details && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            Verification Details:
                          </Typography>
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {result.verification_details.learner_id_match ? (
                                  <CheckCircle sx={{ color: '#10b981', fontSize: 16 }} />
                                ) : (
                                  <Cancel sx={{ color: '#ef4444', fontSize: 16 }} />
                                )}
                                <Typography variant="body2">Learner ID</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {result.verification_details.learner_name_match ? (
                                  <CheckCircle sx={{ color: '#10b981', fontSize: 16 }} />
                                ) : (
                                  <Cancel sx={{ color: '#ef4444', fontSize: 16 }} />
                                )}
                                <Typography variant="body2">Learner Name</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {result.verification_details.credential_title_match ? (
                                  <CheckCircle sx={{ color: '#10b981', fontSize: 16 }} />
                                ) : (
                                  <Cancel sx={{ color: '#ef4444', fontSize: 16 }} />
                                )}
                                <Typography variant="body2">Credential Title</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {result.verification_details.issuer_name_match ? (
                                  <CheckCircle sx={{ color: '#10b981', fontSize: 16 }} />
                                ) : (
                                  <Cancel sx={{ color: '#ef4444', fontSize: 16 }} />
                                )}
                                <Typography variant="body2">Issuer Name</Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      )}

                      {result.ocr_data && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            OCR Extracted Data:
                          </Typography>
                          <Typography variant="body2">
                            Learner: {result.ocr_data.learner_name} ({result.ocr_data.learner_id})
                          </Typography>
                          <Typography variant="body2">
                            Credential: {result.ocr_data.credential_title}
                          </Typography>
                          <Typography variant="body2">
                            Issuer: {result.ocr_data.issuer_name}
                          </Typography>
                          <Typography variant="body2">
                            Issued: {new Date(result.ocr_data.issued_date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}

                      {result.qr_data && (
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            QR Code Data:
                          </Typography>
                          <Typography variant="body2">
                            Credential ID: {result.qr_data.credential_id}
                          </Typography>
                          <Typography variant="body2">
                            Learner: {result.qr_data.learner_name} ({result.qr_data.learner_id})
                          </Typography>
                          {result.qr_data.blockchain_hash && (
                            <Typography variant="body2">
                              Blockchain: {result.qr_data.blockchain_hash.substring(0, 20)}...
                            </Typography>
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowBulkDialog(false)}>Close</Button>
            <Button variant="contained" startIcon={<Download />}>
              Download Full Report
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}
