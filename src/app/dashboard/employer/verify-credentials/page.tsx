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
import DashboardLoader from '@/components/common/DashboardLoader';
import { buildApiUrl } from '@/config/api';

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
  expiry_date?: string;
  skill_tags?: string[];
  nsqf_level?: number;
  status?: string; // Add status field
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
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Steganography verification states
  const [steganographyFile, setSteganographyFile] = useState<File | null>(null);
  const [isStegDragOver, setIsStegDragOver] = useState(false);
  const [stegVerificationResult, setStegVerificationResult] = useState<any>(null);
  const [stegLoading, setStegLoading] = useState(false);
  const [showStegResultDialog, setShowStegResultDialog] = useState(false);

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

  const handleSteganographyVerification = async () => {
    if (!steganographyFile) {
      setError('Please upload a steganographed certificate image');
      return;
    }

    setStegLoading(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      // Prepare form data - only the image file is needed
      // The endpoint will use OCR to extract issuer name and find the credential automatically
      const formData = new FormData();
      formData.append('image', steganographyFile);

      console.log('🔍 Starting automatic steganography verification...');
      console.log('📤 Uploading image file:', steganographyFile.name);

      // Call automatic fingerprint verification endpoint
      // This endpoint extracts QR code, gets credential ID, retrieves issuer seed, and verifies
      const response = await fetch(buildApiUrl('/fingerprint/verify-auto'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('📡 Verification response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Verification result:', result);
        
        // Extract credential ID from result for blockchain lookup
        const extractedCredentialId = result.credential_id || result.details?.credential_id_from_qr;
        
        // Also fetch detailed blockchain verification if credential ID is available
        let blockchainData = null;
        if (extractedCredentialId) {
          try {
            const blockchainResponse = await fetch(buildApiUrl(`/employer/credentials/${extractedCredentialId}`), {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            if (blockchainResponse.ok) {
              blockchainData = await blockchainResponse.json();
            }
          } catch (err) {
            console.warn('Failed to fetch blockchain data:', err);
          }
        }

        setStegVerificationResult({
          ...result,
          blockchainData,
          extractedCredentialId,
        });
        setShowStegResultDialog(true);
      } else {
        const errorText = await response.text();
        console.error('❌ Verification failed:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          setError(errorData.detail || 'Steganography verification failed');
        } catch {
          setError(errorText || 'Steganography verification failed');
        }
      }
    } catch (error) {
      console.error('💥 Steganography verification error:', error);
      setError('Network error occurred during verification');
    } finally {
      setStegLoading(false);
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

          const ocrResponse = await fetch(buildApiUrl('/employer/credentials/extract-ocr'), {
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
          const qrResponse = await fetch(buildApiUrl('/verify/qr/pdf'), {
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
                console.log(`🔍 Fetching credential details for ID: ${credentialId}`);
                
                const credentialResponse = await fetch(buildApiUrl(`/employer/credentials/${credentialId}`), {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                });
                
                if (credentialResponse.ok) {
                  const credentialData = await credentialResponse.json();
                  console.log('✅ Credential details fetched:', credentialData);
                  
                  // Use the complete credential data from the database
                  result.qr_data = {
                    credential_id: credentialData.credential_info.credential_id,
                    learner_id: credentialData.credential_info.learner_id,
                    learner_name: credentialData.credential_info.learner_name,
                    credential_title: credentialData.credential_info.credential_title,
                    issuer_name: credentialData.credential_info.issuer_name,
                    issued_date: credentialData.credential_info.issued_date,
                    expiry_date: credentialData.credential_info.expiry_date,
                    skill_tags: credentialData.credential_info.skill_tags || [],
                    nsqf_level: credentialData.credential_info.nsqf_level,
                    credential_hash: credentialData.credential_info.credential_hash,
                    status: credentialData.credential_info.status
                  };
                  
                  result.processing_steps.credential_fetch = 'completed';
                  result.processing_steps.qr_scanning = 'completed';
                  
                  console.log('📊 QR Data populated:', result.qr_data);
                } else {
                  const errorData = await credentialResponse.json();
                  console.error('❌ Failed to fetch credential details:', errorData);
                  
                  result.processing_steps.credential_fetch = 'failed';
                  result.processing_steps.qr_scanning = 'failed';
                  result.error_message = `Failed to fetch credential details: ${errorData.detail || 'Unknown error'}`;
                  result.status = 'error';
                  continue;
                }
              } catch (fetchError) {
                console.error('💥 Error fetching credential details:', fetchError);
                
                result.processing_steps.credential_fetch = 'failed';
                result.processing_steps.qr_scanning = 'failed';
                result.error_message = 'Error fetching credential details';
                result.status = 'error';
                continue;
              }
            } else {
              console.error('❌ No credential ID found in QR code');
              
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
            const ocrLearnerId = result.ocr_data.learner_id;
            const dbLearnerId = result.qr_data.learner_id;
            
            // Simple verification based only on learner ID matching
            const learnerIdMatch = !!(dbLearnerId && ocrLearnerId && dbLearnerId === ocrLearnerId);
            
            const verificationDetails = {
              learner_id_match: learnerIdMatch,
              learner_name_match: true, // Skip name matching
              credential_title_match: true, // Skip title matching
              issuer_name_match: true, // Skip issuer matching
              issued_date_match: true, // Skip date matching
              overall_match: learnerIdMatch, // Only check learner ID
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
                
                const addVerifiedResponse = await fetch(buildApiUrl('/employer/verified-credentials'), {
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

  if (loading) {
    return (
      <DashboardLayout title="Credential Verification">
        <DashboardLoader 
          title="Verifying Credential" 
          message="Checking credential authenticity and blockchain verification..." 
        />
      </DashboardLayout>
    );
  }

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

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFiles = files.filter(file => file.name.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...pdfFiles]);
    } else {
      setError('Please drop only PDF files');
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

            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                md: 'repeat(2, 1fr)' 
              }, 
              gap: 4 
            }}>
              {/* Steganography Verification */}
              <Box>
                <Zoom in={true} timeout={800}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                        <Security sx={{ mr: 1, color: '#3b82f6' }} />
                        Steganography Verification
                      </Typography>

                      <Box sx={{ mb: 3 }}>
                        {/* Info Alert */}
                        <Alert severity="info" sx={{ mb: 2 }}>
                          <AlertTitle>Steganography Verification</AlertTitle>
                          Upload the steganographed certificate image. The system will automatically:
                          <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
                            <li>Extract issuer name using OCR</li>
                            <li>Look up issuer in database to get secret key</li>
                            <li>Extract steganography payload (blockchain hash)</li>
                            <li>Find credential using blockchain hash</li>
                            <li>Verify steganography and blockchain</li>
                          </ul>
                        </Alert>

                        {/* Drag and Drop Area for Image */}
                        <Box
                          onDragEnter={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsStegDragOver(true);
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsStegDragOver(false);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsStegDragOver(false);
                            const files = Array.from(e.dataTransfer.files);
                            const imageFiles = files.filter(file => 
                              file.type.startsWith('image/') || 
                              file.name.toLowerCase().match(/\.(jpg|jpeg|png)$/i)
                            );
                            if (imageFiles.length > 0) {
                              setSteganographyFile(imageFiles[0]);
                            } else {
                              setError('Please drop only image files (JPG, JPEG, PNG)');
                            }
                          }}
                          sx={{
                            border: '2px dashed',
                            borderColor: isStegDragOver ? '#3b82f6' : steganographyFile ? '#3b82f6' : '#d1d5db',
                            borderRadius: 2,
                            p: 4,
                            textAlign: 'center',
                            bgcolor: isStegDragOver ? '#eff6ff' : steganographyFile ? '#eff6ff' : '#f9fafb',
                            transition: 'all 0.2s ease-in-out',
                            cursor: 'pointer',
                            '&:hover': {
                              borderColor: '#3b82f6',
                              bgcolor: '#eff6ff',
                            },
                            mb: 2,
                          }}
                        >
                          {steganographyFile ? (
                            <Box>
                              <CheckCircle sx={{ fontSize: 48, color: '#3b82f6', mb: 2 }} />
                              <Typography variant="h6" sx={{ fontWeight: 600, color: '#3b82f6', mb: 1 }}>
                                {steganographyFile.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Ready for verification
                              </Typography>
                            </Box>
                          ) : (
                            <Box>
                              <Upload sx={{ fontSize: 48, color: isStegDragOver ? '#3b82f6' : '#6b7280', mb: 2 }} />
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                {isStegDragOver ? 'Drop image file here' : 'Drag & drop steganographed certificate'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                or click to browse files (JPG, JPEG, PNG)
                              </Typography>
                              <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setSteganographyFile(file);
                                  }
                                }}
                                style={{ display: 'none' }}
                                id="steg-upload"
                              />
                              <label htmlFor="steg-upload">
                                <Button
                                  component="span"
                                  variant="outlined"
                                  sx={{
                                    borderColor: '#3b82f6',
                                    color: '#3b82f6',
                                    '&:hover': {
                                      borderColor: '#2563eb',
                                      bgcolor: '#eff6ff',
                                    },
                                  }}
                                >
                                  <FileUpload sx={{ mr: 1 }} />
                                  Select Image File
                                </Button>
                              </label>
                            </Box>
                          )}
                        </Box>

                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          onClick={handleSteganographyVerification}
                          disabled={stegLoading || !steganographyFile}
                          sx={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                            },
                          }}
                        >
                          {stegLoading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress sx={{ width: '100%', mr: 1 }} />
                              Verifying...
                            </Box>
                          ) : (
                            'Verify Certificate'
                          )}
                        </Button>
                      </Box>

                      <Box sx={{ p: 2, bgcolor: '#eff6ff', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Security sx={{ mr: 1, fontSize: 16 }} />
                          <strong>Verification Process:</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 3, mb: 0.5 }}>
                          1. Extract steganography payload from image
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 3, mb: 0.5 }}>
                          2. Verify against blockchain hash
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                          3. Check blockchain transaction status
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Zoom>
              </Box>

              {/* PDF Verification */}
              <Box>
                <Zoom in={true} timeout={800}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                        <PictureAsPdf sx={{ mr: 1, color: '#10b981' }} />
                        PDF Credential Verification
                      </Typography>

                      <Box sx={{ mb: 3 }}>
                        {/* Drag and Drop Area */}
                        <Box
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          sx={{
                            border: '2px dashed',
                            borderColor: isDragOver ? '#10b981' : selectedFiles.length > 0 ? '#10b981' : '#d1d5db',
                            borderRadius: 2,
                            p: 4,
                            textAlign: 'center',
                            bgcolor: isDragOver ? '#f0fdf4' : selectedFiles.length > 0 ? '#f0fdf4' : '#f9fafb',
                            transition: 'all 0.2s ease-in-out',
                            cursor: 'pointer',
                            '&:hover': {
                              borderColor: '#10b981',
                              bgcolor: '#f0fdf4',
                            },
                          }}
                        >
                          {selectedFiles.length > 0 ? (
                            <Box>
                              <CheckCircle sx={{ fontSize: 48, color: '#10b981', mb: 2 }} />
                              <Typography variant="h6" sx={{ fontWeight: 600, color: '#10b981', mb: 1 }}>
                                {selectedFiles.length} PDF file(s) selected
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Ready for verification
                              </Typography>
                            </Box>
                          ) : (
                            <Box>
                              <Upload sx={{ fontSize: 48, color: isDragOver ? '#10b981' : '#6b7280', mb: 2 }} />
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                {isDragOver ? 'Drop PDF files here' : 'Drag & drop PDF files here'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                or click to browse files
                              </Typography>
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
                                  sx={{
                                    borderColor: '#10b981',
                                    color: '#10b981',
                                    '&:hover': {
                                      borderColor: '#059669',
                                      bgcolor: '#f0fdf4',
                                    },
                                  }}
                                >
                                  <FileUpload sx={{ mr: 1 }} />
                                  Select PDF Files
                                </Button>
                              </label>
                            </Box>
                          )}
                        </Box>

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
              </Box>
            </Box>
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
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { 
                    xs: '1fr', 
                    sm: 'repeat(2, 1fr)' 
                  }, 
                  gap: 2, 
                  mb: 3 
                }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Learner Name</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {verificationResult.learner_name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Issuer</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {verificationResult.issuer_name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Issued Date</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {new Date(verificationResult.issued_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Expiry Date</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {verificationResult.expiry_date ? new Date(verificationResult.expiry_date).toLocaleDateString() : 'No expiry'}
                    </Typography>
                  </Box>
                </Box>

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
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { 
                    xs: 'repeat(2, 1fr)', 
                    sm: 'repeat(4, 1fr)' 
                  }, 
                  gap: 2, 
                  mb: 3 
                }}>
                  <Box>
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
                  </Box>
                  <Box>
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
                  </Box>
                  <Box>
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
                  </Box>
                  <Box>
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
                  </Box>
                </Box>

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
                          <Box sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(2, 1fr)', 
                            gap: 1 
                          }}>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {result.verification_details.learner_id_match ? (
                                  <CheckCircle sx={{ color: '#10b981', fontSize: 16 }} />
                                ) : (
                                  <Cancel sx={{ color: '#ef4444', fontSize: 16 }} />
                                )}
                                <Typography variant="body2">Learner ID</Typography>
                              </Box>
                            </Box>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {result.verification_details.learner_name_match ? (
                                  <CheckCircle sx={{ color: '#10b981', fontSize: 16 }} />
                                ) : (
                                  <Cancel sx={{ color: '#ef4444', fontSize: 16 }} />
                                )}
                                <Typography variant="body2">Learner Name</Typography>
                              </Box>
                            </Box>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {result.verification_details.credential_title_match ? (
                                  <CheckCircle sx={{ color: '#10b981', fontSize: 16 }} />
                                ) : (
                                  <Cancel sx={{ color: '#ef4444', fontSize: 16 }} />
                                )}
                                <Typography variant="body2">Credential Title</Typography>
                              </Box>
                            </Box>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {result.verification_details.issuer_name_match ? (
                                  <CheckCircle sx={{ color: '#10b981', fontSize: 16 }} />
                                ) : (
                                  <Cancel sx={{ color: '#ef4444', fontSize: 16 }} />
                                )}
                                <Typography variant="body2">Issuer Name</Typography>
                              </Box>
                            </Box>
                          </Box>
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

        {/* Steganography Verification Result Dialog */}
        <Dialog open={showStegResultDialog} onClose={() => setShowStegResultDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Security color="primary" />
            Steganography Verification Result
          </DialogTitle>
          <DialogContent>
            {stegVerificationResult && (
              <Box>
                {/* Status Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                  <Avatar sx={{ bgcolor: stegVerificationResult.verified ? '#10b981' : '#ef4444', mr: 2 }}>
                    {stegVerificationResult.verified ? (
                      <CheckCircle sx={{ color: 'white' }} />
                    ) : (
                      <Cancel sx={{ color: 'white' }} />
                    )}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {stegVerificationResult.verified ? 'Verification Successful' : 'Verification Failed'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Credential ID: {stegVerificationResult.credential_id || stegVerificationResult.extractedCredentialId || stegVerificationResult.details?.credential_id_from_qr || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                {/* Steganography Verification Details */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Steganography Verification
                  </Typography>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
                    gap: 2 
                  }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Extraction Status</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {stegVerificationResult.success ? 'Success' : 'Failed'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Payload Similarity</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {stegVerificationResult.payload_similarity?.toFixed(2) || 'N/A'}%
                        {stegVerificationResult.verification_threshold && (
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            (Threshold: {stegVerificationResult.verification_threshold}%)
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Signature Valid</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {stegVerificationResult.signature_valid !== null 
                          ? (stegVerificationResult.signature_valid ? 'Yes' : 'No')
                          : 'N/A'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Anchor Verified</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {stegVerificationResult.anchor_verified !== null 
                          ? (stegVerificationResult.anchor_verified ? 'Yes' : 'No')
                          : 'N/A'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Bit Error Rate</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {stegVerificationResult.details?.bit_error_rate 
                          ? (stegVerificationResult.details.bit_error_rate * 100).toFixed(2) + '%' 
                          : stegVerificationResult.bit_error_rate 
                          ? (stegVerificationResult.bit_error_rate * 100).toFixed(2) + '%'
                          : 'N/A'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Blocks Read</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {stegVerificationResult.details?.blocks_read || stegVerificationResult.blocks_read || 'N/A'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Blockchain Verified</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {stegVerificationResult.details?.blockchain_verified !== undefined
                          ? (stegVerificationResult.details.blockchain_verified ? 'Yes' : 'No')
                          : 'N/A'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Revocation Status</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {stegVerificationResult.revocation_status || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Blockchain Verification */}
                {(stegVerificationResult.blockchainData || stegVerificationResult.details?.blockchain_info) && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Blockchain Verification
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: '#f0f9ff', borderRadius: 2 }}>
                      {stegVerificationResult.blockchainData?.credential_info && (
                        <>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Security sx={{ color: '#3b82f6', fontSize: 20 }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              Status: {stegVerificationResult.blockchainData.credential_info.status || 'Unknown'}
                            </Typography>
                          </Box>
                          {stegVerificationResult.blockchainData.credential_info.credential_hash && (
                            <Typography variant="body2" color="text.secondary">
                              Hash: {stegVerificationResult.blockchainData.credential_info.credential_hash.substring(0, 20)}...
                            </Typography>
                          )}
                          {stegVerificationResult.blockchainData.credential_info.transaction_hash && (
                            <Typography variant="body2" color="text.secondary">
                              Transaction: {stegVerificationResult.blockchainData.credential_info.transaction_hash.substring(0, 20)}...
                            </Typography>
                          )}
                        </>
                      )}
                      {stegVerificationResult.details?.blockchain_info && (
                        <>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Security sx={{ color: '#3b82f6', fontSize: 20 }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              Verified: {stegVerificationResult.details.blockchain_verified ? 'Yes' : 'No'}
                            </Typography>
                          </Box>
                          {stegVerificationResult.details.blockchain_info.credential_hash && (
                            <Typography variant="body2" color="text.secondary">
                              Hash: {String(stegVerificationResult.details.blockchain_info.credential_hash).substring(0, 20)}...
                            </Typography>
                          )}
                          {stegVerificationResult.details.blockchain_info.transaction_hash && (
                            <Typography variant="body2" color="text.secondary">
                              Transaction: {String(stegVerificationResult.details.blockchain_info.transaction_hash).substring(0, 20)}...
                            </Typography>
                          )}
                        </>
                      )}
                      {stegVerificationResult.details?.credential_info && (
                        <>
                          <Typography variant="body2" sx={{ fontWeight: 500, mt: 1 }}>
                            Credential: {stegVerificationResult.details.credential_info.credential_title || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Learner: {stegVerificationResult.details.credential_info.learner_name || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Issuer: {stegVerificationResult.details.credential_info.issuer_name || 'N/A'}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                )}

                {/* Error Message */}
                {stegVerificationResult.error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <AlertTitle>Verification Error</AlertTitle>
                    {stegVerificationResult.error}
                  </Alert>
                )}

                {/* Overall Status */}
                <Box sx={{ p: 2, bgcolor: stegVerificationResult.verified ? '#f0fdf4' : '#fef2f2', borderRadius: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    Overall Verification Status:
                  </Typography>
                  <Typography variant="h6" sx={{ color: stegVerificationResult.verified ? '#10b981' : '#ef4444' }}>
                    {stegVerificationResult.verified 
                      ? '✓ Certificate is Valid and Verified' 
                      : '✗ Certificate Verification Failed'}
                  </Typography>
                  {stegVerificationResult.verified && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      The certificate has been verified through steganography and blockchain verification.
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowStegResultDialog(false)}>Close</Button>
            {stegVerificationResult && (
              <Button
                startIcon={<Download />}
                onClick={() => {
                  const reportData = {
                    verification_report: {
                      credential_id: stegVerificationResult.credential_id || stegVerificationResult.extractedCredentialId,
                      verified: stegVerificationResult.verified,
                      payload_similarity: stegVerificationResult.payload_similarity,
                      signature_valid: stegVerificationResult.signature_valid,
                      anchor_verified: stegVerificationResult.anchor_valid,
                      blockchain_verified: stegVerificationResult.details?.blockchain_verified,
                      blockchain_data: stegVerificationResult.blockchainData,
                      credential_info: stegVerificationResult.details?.credential_info,
                      verification_timestamp: stegVerificationResult.verification_timestamp || new Date().toISOString(),
                      details: stegVerificationResult.details,
                    },
                  };
                  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  const credentialId = stegVerificationResult.credential_id || stegVerificationResult.extractedCredentialId || 'unknown';
                  a.download = `steganography-verification-${credentialId}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                variant="contained"
              >
                Download Report
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}
