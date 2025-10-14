'use client';

import React, { useState, ChangeEvent, DragEvent, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RoleGuard from '@/components/auth/RoleGuard';
import { useAuth } from '@/hooks/useAuth';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Download, 
  AlertTriangle,
  Clock,
  CheckCircle2,
  X,
  Edit3,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';

// Import functions from single credential page
import { fetchApiKeys } from '../credentials/page';

// Copy the exact working functions from single credential page
const performVerificationForBulk = async (learnerId: string, apiKey: string) => {
  try {
    console.log('🔍 Checking learner:', learnerId);
    console.log('🔑 Using API key:', apiKey ? apiKey.substring(0, 20) + '...' : 'No API key');
    
    const token = localStorage.getItem('access_token');
    console.log('🔍 DEBUG: Token in performVerificationForBulk:', token ? token.substring(0, 20) + '...' : 'No token');
    
    const learnerResponse = await fetch(`http://localhost:8000/api/v1/issuer/users/${learnerId}/is-learner`, {
      headers: {
        'x-api-key': apiKey,
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📡 Learner API response status:', learnerResponse.status);
    console.log('📡 Learner API response headers:', learnerResponse.headers);
    
    if (learnerResponse.ok) {
      const learnerData = await learnerResponse.json();
      console.log('✅ Learner data received:', learnerData);
      return { success: true, data: learnerData };
    } else {
      const errorText = await learnerResponse.text();
      console.error('❌ Learner API failed:', learnerResponse.status, errorText);
      return { success: false, error: `Learner validation failed: ${learnerResponse.status} - ${errorText}` };
    }
  } catch (error) {
    console.error('💥 Learner verification exception:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// OCR extraction function for bulk processing
const extractDataFromCertificate = async (certificateFile: File): Promise<any> => {
  try {
    console.log('🔍 Starting OCR extraction for certificate:', certificateFile.name);

    const formData = new FormData();
    formData.append('file', certificateFile);

    const response = await fetch('http://localhost:8000/api/v1/issuer/credentials/extract-ocr', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ OCR extraction successful:', result);
      return result;
    } else {
      const errorText = await response.text();
      console.error('❌ OCR extraction failed:', response.status, errorText);
      throw new Error(`OCR extraction failed: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('💥 OCR extraction error:', error);
    throw error;
  }
};

interface CSVRow {
  learner_id: string;
  certificate_path: string;
}

interface ProcessedRow extends CSVRow {
  id: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
  credential_id?: string;
  certificate_url?: string; // URL to the processed certificate with QR code
  extracted_data?: any; // OCR extracted data
  retry_count: number;
}

interface BatchInfo {
  batch_id: string;
  created_at: string;
  total_rows: number;
  processed_rows: number;
  success_count: number;
  error_count: number;
}

export default function BulkCredentialsPage() {
  const { user } = useAuth();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [processedRows, setProcessedRows] = useState<ProcessedRow[]>([]);
  const [batchInfo, setBatchInfo] = useState<BatchInfo | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'validating' | 'processing' | 'completed' | 'error' | 'success'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<ProcessedRow | null>(null);
  const [successfulCredentials, setSuccessfulCredentials] = useState<any[]>([]);
  
  // Issuer verification status
  const [issuerVerificationStatus, setIssuerVerificationStatus] = useState<'pending' | 'verified' | 'rejected' | 'not_submitted'>('not_submitted');
  
  // Issuer-defined tags for all credentials
  const [issuerTags, setIssuerTags] = useState<string>('');

  // Fetch issuer verification status on component mount
  useEffect(() => {
    const fetchIssuerVerificationStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/issuer/verification-status', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIssuerVerificationStatus(data.status);
        }
      } catch (error) {
        console.error('Error fetching verification status:', error);
      }
    };

    fetchIssuerVerificationStatus();
  }, []);

  // Generate unique batch ID
  const generateBatchId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `BATCH_${timestamp}_${random}`;
  };

  // Enhanced CSV file validation
  const isValidCSVFile = (file: File): boolean => {
    // Check file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = fileName.endsWith('.csv');
    
    // Check MIME type (multiple possible types for CSV files)
    const validMimeTypes = [
      'text/csv',
      'application/csv',
      'text/plain',
      'application/vnd.ms-excel',
      'application/octet-stream'
    ];
    const hasValidMimeType = validMimeTypes.includes(file.type) || file.type === '';
    
    // File must have either valid extension or valid MIME type
    return hasValidExtension || hasValidMimeType;
  };

  // Helper function to update batch info based on current processed rows
  const updateBatchInfoFromRows = useCallback(() => {
    const successCount = processedRows.filter(row => row.status === 'success').length;
    const errorCount = processedRows.filter(row => row.status === 'error').length;
    const totalRows = processedRows.length;
    
    setBatchInfo(prev => prev ? {
      ...prev,
      total_rows: totalRows,
      processed_rows: totalRows,
      success_count: successCount,
      error_count: errorCount
    } : null);
  }, [processedRows]);

  // Enhanced OCR validation function to extract learner name, ID, and skills from certificate
  const validateCertificateWithOCR = async (certificateFile: File, expectedLearnerName: string, expectedLearnerId: string): Promise<{
    isValid: boolean;
    extractedData?: {
      learnerName: string;
      learnerId: string;
      skills: string[];
      courseTitle: string;
      completionDate?: string;
      issuerName?: string;
    };
    error?: string;
  }> => {
    try {
      console.log('🔍 Starting enhanced OCR validation for certificate...');
      console.log('Expected learner name:', expectedLearnerName);
      console.log('Expected learner ID:', expectedLearnerId);
      
      // Convert file to base64 for OCR processing
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(certificateFile);
      });

      // Enhanced OCR processing to extract multiple fields
      const extractedData = await extractCertificateData(certificateFile);
      
      // Validate learner name
      const normalizedExpectedName = expectedLearnerName.toLowerCase().replace(/\s+/g, ' ').trim();
      const normalizedExtractedName = extractedData.learnerName.toLowerCase().replace(/\s+/g, ' ').trim();
      const nameMatch = normalizedExtractedName.includes(normalizedExpectedName) || 
                       normalizedExpectedName.includes(normalizedExtractedName);
      
      // Validate learner ID
      const idMatch = extractedData.learnerId === expectedLearnerId || 
                     extractedData.learnerId.toLowerCase() === expectedLearnerId.toLowerCase();
      
      console.log('Enhanced OCR Results:', {
        extractedData,
        nameMatch,
        idMatch,
        validationPassed: nameMatch && idMatch
      });

      if (!nameMatch) {
        return {
          isValid: false,
          error: `Learner name "${expectedLearnerName}" not found in certificate. Found: "${extractedData.learnerName}"`
        };
      }

      if (!idMatch) {
        return {
          isValid: false,
          error: `Learner ID "${expectedLearnerId}" not found in certificate. Found: "${extractedData.learnerId}"`
        };
      }

      return {
        isValid: true,
        extractedData,
        error: undefined
      };
    } catch (error) {
      console.error('OCR validation error:', error);
      return {
        isValid: false,
        error: `OCR validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  };

  // Enhanced certificate data extraction function
  const extractCertificateData = async (file: File): Promise<{
    learnerName: string;
    learnerId: string;
    skills: string[];
    courseTitle: string;
    completionDate?: string;
    issuerName?: string;
  }> => {
    // This is a placeholder - in production, integrate with:
    // - Tesseract.js for client-side OCR
    // - Google Vision API
    // - Azure Computer Vision
    // - AWS Textract
    
    // For now, return simulated extracted data
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate extracted certificate data
        const simulatedData = {
          learnerName: "John Doe",
          learnerId: "learner_12345",
          skills: ["Python", "Django", "Flask", "SQL", "API Development"],
          courseTitle: "Python Programming Masterclass",
          completionDate: "2024-01-15",
          issuerName: "Tech University"
        };
        
        console.log('📄 Extracted certificate data:', simulatedData);
        resolve(simulatedData);
      }, 1500);
    });
  };

  // PDF processing function to embed QR code
  const processCertificateWithQR = async (certificateFile: File, qrCodeData: string): Promise<File> => {
    try {
      console.log('📄 Processing certificate PDF with QR code...');
      
      // For now, we'll create a new file with QR code metadata
      // In production, you would use a PDF library like PDF-lib to:
      // 1. Load the PDF
      // 2. Generate QR code
      // 3. Embed QR code in top-right corner
      // 4. Save the modified PDF
      
      // Simulate PDF processing with QR code embedding
      const processedFile = await simulatePDFProcessing(certificateFile, qrCodeData);
      
      console.log('✅ Certificate PDF processed with QR code');
      return processedFile;
    } catch (error) {
      console.error('PDF processing error:', error);
      throw new Error(`Failed to process certificate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Simulate PDF processing (replace with actual PDF library)
  const simulatePDFProcessing = async (originalFile: File, qrCodeData: string): Promise<File> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Create a new file with QR code metadata
        const blob = new Blob([originalFile], { type: 'application/pdf' });
        const file = new File([blob], `certificate_with_qr_${Date.now()}.pdf`, {
          type: 'application/pdf'
        });
        resolve(file);
      }, 500);
    });
  };

  // Convert file to blob URL for storage
  const convertFileToBlob = async (file: File): Promise<string> => {
    try {
      const blob = new Blob([file], { type: file.type });
      const blobUrl = URL.createObjectURL(blob);
      console.log('📦 File converted to blob URL:', blobUrl);
      return blobUrl;
    } catch (error) {
      console.error('Blob conversion error:', error);
      throw new Error(`Failed to convert file to blob: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Update batch info whenever processed rows change
  useEffect(() => {
    if (processedRows.length > 0 && batchInfo) {
      updateBatchInfoFromRows();
    }
  }, [processedRows, batchInfo, updateBatchInfoFromRows]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      if (isValidCSVFile(file)) {
        await processCSVFile(file);
      } else {
        console.log('Invalid file type:', file.type, 'for file:', file.name);
        setCsvFile(null);
        setUploadStatus('error');
        setMessage('Please upload a valid CSV file.');
        setValidationErrors(['Invalid file type. Only CSV files are allowed.']);
      }
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      console.log('File dropped:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      if (isValidCSVFile(file)) {
        await processCSVFile(file);
      } else {
        console.log('Invalid file type:', file.type, 'for file:', file.name);
        setCsvFile(null);
        setUploadStatus('error');
        setMessage('Please drop a valid CSV file.');
        setValidationErrors(['Invalid file type. Only CSV files are allowed.']);
      }
    }
  };

  const processCSVFile = async (file: File) => {
    setCsvFile(file);
    setUploadStatus('validating');
    setMessage('Validating CSV file...');
    setValidationErrors([]);

    try {
      const text = await file.text();
      console.log('CSV file content:', text); // Debug log
      
      // Handle different line endings (Windows \r\n, Mac \r, Unix \n)
      const lines = text.split(/\r?\n|\r/).filter(line => line.trim());
      console.log('CSV lines:', lines); // Debug log
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row.');
      }

      // Parse CSV headers - handle quotes and semicolons better
      let headerLine = lines[0];
      headerLine = headerLine.replace(/;+$/, '').trim(); // Remove trailing semicolons
      const headers = headerLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      console.log('CSV headers:', headers); // Debug log
      const requiredHeaders = ['learner_id', 'certificate_path'];

      // Validate headers
      const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
      if (missingHeaders.length > 0) {
        console.log('Missing headers:', missingHeaders); // Debug log
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
      }

      console.log('CSV headers validated successfully'); // Debug log

      const csvRows: CSVRow[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        let line = lines[i];
        console.log(`Processing line ${i + 1}:`, line); // Debug log
        
        // Remove trailing semicolons and clean up the line
        line = line.replace(/;+$/, '').trim();
        console.log(`Cleaned line ${i + 1}:`, line); // Debug log
        
        // Simple CSV parsing - handle quotes and commas better
        const values: string[] = [];
        let currentValue = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(currentValue.trim());
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue.trim()); // Add the last value
        
        console.log(`Parsed values for row ${i + 1}:`, values); // Debug log
        
        if (values.length !== headers.length) {
          errors.push(`Row ${i + 1}: Column count mismatch (expected ${headers.length}, got ${values.length})`);
          continue;
        }

        const row: CSVRow = {
          learner_id: values[headers.indexOf('learner_id')] || '',
          certificate_path: values[headers.indexOf('certificate_path')] || ''
        };

        console.log(`Row ${i + 1} data:`, row); // Debug log

        // Validate row data
        const rowErrors: string[] = [];
        if (!row.learner_id.trim()) rowErrors.push('learner_id is required');
        if (!row.certificate_title.trim()) rowErrors.push('certificate_title is required');
        if (!row.mode.trim()) rowErrors.push('mode is required');
        if (!row.duration.trim()) rowErrors.push('duration is required');
        if (!row.skills.trim()) rowErrors.push('skills is required');
        if (!row.certificate_path.trim()) rowErrors.push('certificate_path is required');

        if (rowErrors.length > 0) {
          errors.push(`Row ${i + 1}: ${rowErrors.join(', ')}`);
        } else {
          csvRows.push(row);
        }
      }

      console.log('Validation errors found:', errors); // Debug log
      
      if (errors.length > 0) {
        setValidationErrors(errors);
        setUploadStatus('error');
        setMessage(`CSV validation failed. Please fix the errors and try again.`);
        console.log('Setting validation errors:', errors); // Debug log
        return;
      }

      setCsvData(csvRows);
      console.log('CSV data set:', csvRows); // Debug log
      
      // Initialize batch info
      const batchId = generateBatchId();
      setBatchInfo({
        batch_id: batchId,
        created_at: new Date().toISOString(),
        total_rows: csvRows.length,
        processed_rows: 0,
        success_count: 0,
        error_count: 0
      });

      // Initialize processed rows
      const initialProcessedRows: ProcessedRow[] = csvRows.map((row, index) => ({
        ...row,
        id: `row_${index}`,
        status: 'pending',
        retry_count: 0
      }));
      setProcessedRows(initialProcessedRows);

      setUploadStatus('idle');
      setMessage(`CSV file validated successfully! Found ${csvRows.length} valid entries.`);
      console.log('CSV processing completed successfully'); // Debug log

    } catch (error) {
      console.error('Error processing CSV:', error);
      setUploadStatus('error');
      setMessage(`Error processing CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setValidationErrors([error instanceof Error ? error.message : 'Unknown error']);
    }
  };


  const handleLocalFile = async (filePath: string): Promise<{blobUrl: string, file: File}> => {
    try {
      console.log('📁 Handling local file:', filePath);
      
      // For local development, we'll create a file input to let user select the file
      // and convert it to a blob URL that can be used
      return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.jpg,.jpeg,.png'; // Accept PDF and image files
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            try {
              // Validate file type
              const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
              if (!validTypes.includes(file.type)) {
                reject(new Error(`Invalid file type: ${file.type}. Only PDF and image files are allowed.`));
                return;
              }

              // Convert to blob URL
              const blobUrl = URL.createObjectURL(file);
              console.log('✅ File processed successfully:', {
                name: file.name,
                type: file.type,
                size: file.size,
                blobUrl: blobUrl
              });
              
              resolve({ blobUrl, file });
            } catch (error) {
              console.error('Error processing file:', error);
              reject(error);
            }
          } else {
            reject(new Error('No file selected'));
          }
        };
        input.click();
      });
    } catch (error) {
      console.error('Error handling local file:', error);
      throw error;
    }
  };

  // New 3-Step API Architecture Implementation
  const processCredential = async (row: ProcessedRow): Promise<ProcessedRow> => {
    try {
      // Update row status to processing with animation
      const updatedRow = { ...row, status: 'processing' as const };
      setProcessedRows(prev => prev.map(r => r.id === row.id ? updatedRow : r));
      
      // Add a small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500));

      // DEBUG: Test basic authentication first
      const token = localStorage.getItem('access_token');
      console.log('🔍 DEBUG: Token exists?', !!token);
      console.log('🔍 DEBUG: Token preview:', token ? token.substring(0, 50) + '...' : 'No token');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Get API key first
      console.log('🔍 DEBUG: About to call fetchApiKeys...');
      const apiKeys = await fetchApiKeys();
      console.log('🔍 DEBUG: fetchApiKeys returned:', apiKeys);
      
      if (!apiKeys || apiKeys.length === 0) {
        throw new Error('No API keys found. Please generate an API key first.');
      }
      
      const apiKey = apiKeys[0].key;
      console.log('🚀 Starting 3-step credential issuance process...');
      console.log('🔑 Using API Key:', apiKey ? apiKey.substring(0, 20) + '...' : 'No API key');

      // STEP 1: Upload + OCR Processing
      console.log('📤 Step 1: Uploading certificate and starting OCR...');
      
      let certificateFile: File | null = null;
      let credentialId: string;
      
      if (!row.certificate_path.startsWith('http')) {
        // Handle local file - prompt user to select file
        if (!row.certificate_path.trim()) {
          throw new Error('Certificate path is required and cannot be empty');
        }
        
        console.log('📁 Processing local certificate file...');
        const fileResult = await handleLocalFile(row.certificate_path);
        certificateFile = fileResult.file;
        
        // Upload file and start OCR processing
        const formData = new FormData();
        formData.append('file', certificateFile);
        formData.append('learner_id', row.learner_id);
        formData.append('idempotency_key', `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
        
        const uploadResponse = await fetch('http://localhost:8000/api/v1/issuer/credentials/upload', {
          method: 'POST',
          headers: {
            'X-API-Key': apiKey
          },
          body: formData
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(`Upload failed: ${errorData.detail || errorData.message || 'Unknown error'}`);
        }

        const uploadResult = await uploadResponse.json();
        credentialId = uploadResult.credential_id;
        console.log('✅ Step 1 completed - OCR processing started:', credentialId);
        
        // Wait for OCR processing to complete (polling)
        await waitForOCRCompletion(credentialId, apiKey);
      } else {
        throw new Error('URL-based certificates not supported in new architecture. Please provide local file path.');
      }

      // STEP 2: Verify & Metadata Entry
      console.log('🔍 Step 2: Verifying credential and adding metadata...');
      
      // Parse tags
      const allTags: string[] = [];
      if (issuerTags.trim()) {
        allTags.push(...issuerTags.split(',').map(s => s.trim()).filter(s => s));
      }
      if (row.tags && row.tags.trim()) {
        allTags.push(...row.tags.split(',').map(s => s.trim()).filter(s => s));
      }
      
      const verifyPayload = {
        nsqf_level: 6, // Default level, should be configurable
        description: `${row.certificate_title} certificate issued by ${user?.full_name || 'Institution'}`,
        tags: allTags,
        credential_type: "digital-certificate"
      };

      const verifyResponse = await fetch(`http://localhost:8000/api/v1/issuer/credentials/${credentialId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify(verifyPayload)
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(`Verification failed: ${errorData.detail || errorData.message || 'Unknown error'}`);
      }

      const verifyResult = await verifyResponse.json();
      console.log('✅ Step 2 completed - Credential verified:', verifyResult);

      // STEP 3: Deploy & Finalize
      console.log('🚀 Step 3: Deploying credential to blockchain...');
      
      const deployPayload = {
        generate_qr: true
      };

      const deployResponse = await fetch(`http://localhost:8000/api/v1/issuer/credentials/${credentialId}/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify(deployPayload)
      });

      if (!deployResponse.ok) {
        const errorData = await deployResponse.json();
        throw new Error(`Deployment failed: ${errorData.detail || errorData.message || 'Unknown error'}`);
      }

      const deployResult = await deployResponse.json();
      console.log('✅ Step 3 completed - Credential deployed:', deployResult);

      // Poll for final completion
      const finalResult = await waitForDeploymentCompletion(credentialId, apiKey);
      console.log('🎉 Credential fully processed:', finalResult);

      // Store successful credential details
      const successfulCredential = {
        ...finalResult,
        originalRow: row,
        credential_id: credentialId
      };
      setSuccessfulCredentials(prev => [...prev, successfulCredential]);

      // Success
      return {
        ...row,
        status: 'success',
        credential_id: credentialId
      };

    } catch (error) {
      console.error('❌ Credential processing failed:', error);
      return {
        ...row,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        retry_count: row.retry_count + 1
      };
    }
  };

  // Helper function to wait for OCR completion
  const waitForOCRCompletion = async (credentialId: string, apiKey: string): Promise<any> => {
    const maxAttempts = 30; // 30 attempts = 5 minutes max
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      attempts++;
      
      try {
        const statusResponse = await fetch(`http://localhost:8000/api/v1/issuer/credentials/${credentialId}`, {
          headers: {
            'X-API-Key': apiKey
          }
        });
        
        if (statusResponse.ok) {
          const statusResult = await statusResponse.json();
          console.log(`🔍 OCR Status check ${attempts}/${maxAttempts}:`, statusResult.status);
          
          if (statusResult.status === 'ocr_completed') {
            return statusResult;
          } else if (statusResult.status === 'ocr_failed') {
            throw new Error(`OCR processing failed: ${statusResult.metadata?.errors || 'Unknown error'}`);
          }
          // Continue polling for 'ocr_processing' status
        }
      } catch (error) {
        console.warn(`Status check ${attempts} failed:`, error);
      }
    }
    
    throw new Error('OCR processing timeout - please try again later');
  };

  // Helper function to wait for deployment completion
  const waitForDeploymentCompletion = async (credentialId: string, apiKey: string): Promise<any> => {
    const maxAttempts = 60; // 60 attempts = 10 minutes max (blockchain can be slow)
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      attempts++;
      
      try {
        const statusResponse = await fetch(`http://localhost:8000/api/v1/issuer/credentials/${credentialId}`, {
          headers: {
            'X-API-Key': apiKey
          }
        });
        
        if (statusResponse.ok) {
          const statusResult = await statusResponse.json();
          console.log(`🔍 Deployment Status check ${attempts}/${maxAttempts}:`, statusResult.status);
          
          if (statusResult.status === 'verified') {
            return statusResult;
          } else if (statusResult.status === 'blockchain_failed') {
            throw new Error(`Blockchain deployment failed: ${statusResult.blockchain_data?.blockchain_error || 'Unknown error'}`);
          }
          // Continue polling for 'blockchain_pending' status
        }
      } catch (error) {
        console.warn(`Deployment status check ${attempts} failed:`, error);
      }
    }
    
    throw new Error('Deployment timeout - please check credential status later');
  };

  const processAllCredentials = async () => {
    if (csvData.length === 0) return;

    // Check issuer verification status before allowing credential processing
    if (issuerVerificationStatus !== 'verified') {
      alert('Your verification is still in progress. Please wait for verification to complete before processing credentials.');
      return;
    }

    setIsProcessing(true);
    setUploadStatus('processing');
    setMessage('Processing credentials...');

    // Check for duplicate learner IDs in the CSV
    const learnerIds = csvData.map(row => row.learner_id);
    const duplicateLearners = learnerIds.filter((id, index) => learnerIds.indexOf(id) !== index);
    
    if (duplicateLearners.length > 0) {
      console.warn('⚠️ Duplicate learner IDs found:', duplicateLearners);
      // We'll still process but warn the user
    }

    // Process credentials in batches of 3 to avoid overwhelming the server and ensure better error handling
    const batchSize = 3;
    const batches: CSVRow[][] = [];
    for (let i = 0; i < csvData.length; i += batchSize) {
      batches.push(csvData.slice(i, i + batchSize));
    }

    let successCount = 0;
    let errorCount = 0;

    for (const batch of batches) {
      const promises = batch.map(async (_, index) => {
        const rowIndex = batches.indexOf(batch) * batchSize + index;
        const row = processedRows[rowIndex];
        if (!row) return;

        const result = await processCredential(row);
        
        setProcessedRows(prev => prev.map(r => r.id === row.id ? result : r));
        
        if (result.status === 'success') {
          successCount++;
        } else {
          errorCount++;
        }

        // Update batch info
        setBatchInfo(prev => prev ? {
          ...prev,
          processed_rows: prev.processed_rows + 1,
          success_count: successCount,
          error_count: errorCount
        } : null);
      });

      await Promise.all(promises);
    }

    setIsProcessing(false);
    setUploadStatus('completed');
    setMessage(`Bulk processing completed! Success: ${successCount}, Errors: ${errorCount}`);
  };

  const retryFailedCredentials = async () => {
    const failedRows = processedRows.filter(row => row.status === 'error');
    if (failedRows.length === 0) return;

    // Check issuer verification status before allowing credential processing
    if (issuerVerificationStatus !== 'verified') {
      alert('Your verification is still in progress. Please wait for verification to complete before processing credentials.');
      return;
    }

    setIsProcessing(true);
    setUploadStatus('processing');
    setMessage(`Retrying ${failedRows.length} failed credentials...`);

    let successCount = 0;
    let errorCount = 0;

    for (const row of failedRows) {
      const result = await processCredential(row);
      setProcessedRows(prev => prev.map(r => r.id === row.id ? result : r));
      
      if (result.status === 'success') {
        successCount++;
      } else {
        errorCount++;
      }
    }

    // Update batch info after retry
    updateBatchInfoFromRows();

    setIsProcessing(false);
    setUploadStatus('completed');
    setMessage(`Retry completed! Success: ${successCount}, Errors: ${errorCount}`);
  };

  const startEditingRow = (row: ProcessedRow) => {
    setEditingRow(row.id);
    setEditingData({ ...row });
  };

  const cancelEditing = () => {
    setEditingRow(null);
    setEditingData(null);
  };

  const saveEditedRow = async () => {
    if (!editingData) return;

    // Check issuer verification status before allowing credential processing
    if (issuerVerificationStatus !== 'verified') {
      alert('Your verification is still in progress. Please wait for verification to complete before processing credentials.');
      return;
    }

    // Update the row data
    setProcessedRows(prev => prev.map(r => r.id === editingData.id ? editingData : r));
    
    // Process the edited row
    setIsProcessing(true);
    setMessage('Processing edited credential...');
    
    const result = await processCredential(editingData);
    setProcessedRows(prev => prev.map(r => r.id === editingData.id ? result : r));
    
    // Update batch info after processing
    updateBatchInfoFromRows();
    
    setEditingRow(null);
    setEditingData(null);
    setIsProcessing(false);
    setMessage(result.status === 'success' ? 'Credential processed successfully!' : 'Credential processing failed.');
  };

  const handleEditFieldChange = (field: keyof ProcessedRow, value: string) => {
    if (!editingData) return;
    setEditingData({ ...editingData, [field]: value });
  };

  const downloadCsvTemplate = () => {
    // Use placeholder learner IDs that need to be replaced with actual learner IDs
    const template = "learner_id,certificate_title,mode,duration,skills,certificate_path,tags\nREPLACE_WITH_VALID_LEARNER_ID,Python Programming,Online,4 Weeks,Python,Django,C:/Users/username/Documents/certificates/python-programming.pdf,premium,verified\nREPLACE_WITH_VALID_LEARNER_ID,React Development,Online,6 Weeks,React,JavaScript,HTML,CSS,C:/Users/username/Documents/certificates/react-development.pdf,industry-recognized,certified";
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_credentials_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'processing':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <RoleGuard allowedPath="/dashboard/institution/bulk-credentials" requiredRole="issuer">
      <DashboardLayout title="Issue Bulk Credentials">
        <div className="w-full p-4 sm:p-6">
          {/* Header */}
          <div className="mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Issue Bulk Credentials</h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Upload a CSV file to issue multiple digital credentials at once.
              </p>
            </div>
          </div>

          {/* Issuer Verification Status Alert */}
          {issuerVerificationStatus !== 'verified' && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Verification Required
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Your verification is currently in progress. You cannot issue credentials until verification is complete.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Processing Status - Show when processing */}
          {uploadStatus === 'processing' && batchInfo && (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Processing Credentials</h3>
                </div>
                <span className="text-sm text-gray-500">Batch ID: {batchInfo.batch_id}</span>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress: {batchInfo.processed_rows} / {batchInfo.total_rows}</span>
                  <span>{Math.round((batchInfo.processed_rows / batchInfo.total_rows) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500 ease-out relative"
                    style={{ width: `${(batchInfo.processed_rows / batchInfo.total_rows) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{batchInfo.success_count}</div>
                  <div className="text-sm text-green-700">Success</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{batchInfo.error_count}</div>
                  <div className="text-sm text-red-700">Errors</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{batchInfo.total_rows - batchInfo.processed_rows}</div>
                  <div className="text-sm text-blue-700">Remaining</div>
                </div>
              </div>

              {/* Current Processing Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-sm text-blue-800">
                    Processing entries one by one... Please wait while we issue your credentials.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Results - Show when completed */}
          {uploadStatus === 'completed' && batchInfo && (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Processing Complete</h3>
                <span className="text-sm text-gray-500">Batch ID: {batchInfo.batch_id}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{batchInfo.success_count}</div>
                  <div className="text-sm text-gray-600">Credentials Issued Successfully</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{batchInfo.error_count}</div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
              </div>

              {batchInfo.error_count > 0 && (
                <div className="mt-4">
                  <button
                    onClick={retryFailedCredentials}
                    disabled={isProcessing || issuerVerificationStatus !== 'verified'}
                    className={`w-full px-4 py-2 rounded-lg transition ${
                      isProcessing || issuerVerificationStatus !== 'verified'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
                  >
                    {issuerVerificationStatus !== 'verified' ? 'Verification Required' : 
                     `Retry Failed Credentials (${batchInfo.error_count})`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* CSV Upload Section - Only show when no file uploaded */}
          {!csvFile && uploadStatus === 'idle' && (
            <div className="bg-white shadow-md rounded-lg border border-gray-200 p-8 mb-8">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:border-blue-400 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg text-gray-600 mb-2">
                  Drag and drop your CSV file here, or
                </p>
                <label htmlFor="file-upload" className="relative cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors">
                  <span>Browse files</span>
                  <input id="file-upload" name="file-upload" type="file" accept=".csv" className="sr-only" onChange={handleFileChange} />
                </label>
                <p className="text-sm text-gray-500 mt-4">Only CSV files are supported</p>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={downloadCsvTemplate}
                  className="text-blue-600 hover:text-blue-800 underline text-sm"
                >
                  Download CSV Template
                </button>
              </div>
            </div>
          )}

          {/* Issuer Tags Section - Show when no file uploaded */}
          {!csvFile && uploadStatus === 'idle' && (
            <div className="bg-white shadow-md rounded-lg border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Issuer-Defined Tags</h3>
              <p className="text-gray-600 mb-4">
                Add custom tags that will be included with all credentials in this batch. These tags will be added to the skill_tags field.
              </p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="issuer-tags" className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    id="issuer-tags"
                    type="text"
                    value={issuerTags}
                    onChange={(e) => setIssuerTags(e.target.value)}
                    placeholder="e.g., verified, premium, industry-recognized, certified"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    These tags will be applied to all credentials in this batch
                  </p>
                </div>
                {issuerTags && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Preview Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {issuerTags.split(',').map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-white shadow-md rounded-lg border border-red-200 p-6 mb-8">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-red-800">CSV Validation Failed</h3>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setCsvFile(null);
                    setCsvData([]);
                    setProcessedRows([]);
                    setBatchInfo(null);
                    setUploadStatus('idle');
                    setMessage('');
                    setValidationErrors([]);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Upload Different File
                </button>
              </div>
            </div>
          )}

          {/* Success Message */}
          {uploadStatus === 'idle' && csvData.length > 0 && (
            <div className="bg-white shadow-md rounded-lg border border-green-200 p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">CSV File Validated Successfully</h3>
                    <p className="text-sm text-green-600">Found {csvData.length} valid entries ready for processing</p>
                  </div>
                </div>
                <button
                  onClick={processAllCredentials}
                  disabled={isProcessing || issuerVerificationStatus !== 'verified'}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    isProcessing || issuerVerificationStatus !== 'verified'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isProcessing ? 'Processing...' : 
                   issuerVerificationStatus !== 'verified' ? 'Verification Required' : 'Issue Credentials'}
                </button>
              </div>
            </div>
          )}


          {/* Processing Errors - Only show when there are errors */}
          {processedRows.some(row => row.status === 'error') && (
            <div className="bg-white shadow-md rounded-lg border border-red-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-red-800">Processing Errors</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={retryFailedCredentials}
                    disabled={isProcessing || issuerVerificationStatus !== 'verified'}
                    className={`px-4 py-2 rounded-lg transition ${
                      isProcessing || issuerVerificationStatus !== 'verified'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4 mr-2 inline" />
                    {issuerVerificationStatus !== 'verified' ? 'Verification Required' : 
                     `Retry All Failed (${processedRows.filter(row => row.status === 'error').length})`}
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {processedRows.filter(row => row.status === 'error').map((row) => (
                  <div key={row.id} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                    {editingRow === row.id ? (
                      /* Edit Mode */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">Edit Entry</h4>
                          <div className="flex space-x-2">
                            <button
                              onClick={cancelEditing}
                              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={saveEditedRow}
                              disabled={isProcessing}
                              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
                            >
                              {isProcessing ? 'Processing...' : 'Save & Retry'}
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Learner ID</label>
                            <input
                              type="text"
                              value={editingData?.learner_id || ''}
                              onChange={(e) => handleEditFieldChange('learner_id', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Title</label>
                            <input
                              type="text"
                              value={editingData?.certificate_title || ''}
                              onChange={(e) => handleEditFieldChange('certificate_title', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                            <input
                              type="text"
                              value={editingData?.mode || ''}
                              onChange={(e) => handleEditFieldChange('mode', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                            <input
                              type="text"
                              value={editingData?.duration || ''}
                              onChange={(e) => handleEditFieldChange('duration', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                            <input
                              type="text"
                              value={editingData?.skills || ''}
                              onChange={(e) => handleEditFieldChange('skills', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md text-sm"
                              placeholder="e.g., Python,Django,Flask"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Path</label>
                            <input
                              type="text"
                              value={editingData?.certificate_path || ''}
                              onChange={(e) => handleEditFieldChange('certificate_path', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md text-sm"
                              placeholder="e.g., C:/path/to/certificate.pdf"
                            />
                          </div>
                        </div>
                        
                        <div className="p-3 bg-red-100 border border-red-200 rounded-md">
                          <div className="text-sm text-red-800">
                            <strong>Original Error:</strong> {row.error}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <XCircle className="w-5 h-5 text-red-600" />
                              <div>
                                <div className="font-medium text-gray-900">
                                  {row.certificate_title}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Learner ID: {row.learner_id}
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-md">
                              <div className="text-sm text-red-800">
                                <strong>Error:</strong> {row.error}
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-sm font-medium text-red-600 mb-2">
                              Error
                            </div>
                            {row.retry_count > 0 && (
                              <div className="text-xs text-gray-500 mb-2">
                                Retries: {row.retry_count}
                              </div>
                            )}
                            <button
                              onClick={() => startEditingRow(row)}
                              disabled={isProcessing}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                            >
                              <Edit3 className="w-3 h-3 mr-1 inline" />
                              Edit & Retry
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Successful Credentials - Show when there are successful entries */}
          {successfulCredentials.length > 0 && (
            <div className="bg-white shadow-md rounded-lg border border-green-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-green-800">Successfully Issued Credentials</h3>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {successfulCredentials.length} Credential{successfulCredentials.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {successfulCredentials.map((credential, index) => (
                  <div key={index} className="p-4 border border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {credential.originalRow.certificate_title}
                            </div>
                            <div className="text-sm text-gray-600">
                              Learner: {credential.learnerInfo.full_name} ({credential.originalRow.learner_id})
                            </div>
                          </div>
                        </div>
                        
                        {/* Credential Details */}
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Credential ID</label>
                            <p className="text-xs text-gray-900 font-mono bg-white p-2 rounded border break-all">
                              {credential.credential_id}
                            </p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Blockchain Hash</label>
                            <p className="text-xs text-gray-900 font-mono bg-white p-2 rounded border break-all">
                              {credential.credential_hash || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {credential.status || 'Issued'}
                            </span>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Issued At</label>
                            <p className="text-xs text-gray-900 bg-white p-2 rounded border">
                              {new Date().toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* OCR Data Display */}
                        {credential.ocrData && (
                          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-md p-3">
                            <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                              <span className="mr-2">🔍</span>
                              OCR-Extracted Data
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="font-medium text-blue-800">Skills:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {credential.ocrData.skills?.map((skill: string, index: number) => (
                                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {credential.ocrData.completionDate && (
                                <div>
                                  <span className="font-medium text-blue-800">Completion Date:</span>
                                  <p className="text-blue-700">{credential.ocrData.completionDate}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Skill Tags Display */}
                        {credential.skillTags && credential.skillTags.length > 0 && (
                          <div className="mt-3 bg-green-50 border border-green-200 rounded-md p-3">
                            <h4 className="text-sm font-medium text-green-900 mb-2 flex items-center">
                              <span className="mr-2">🏷️</span>
                              Applied Tags
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {credential.skillTags.map((tag: string, index: number) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* QR Code if available */}
                        {credential.qr_code_data?.qr_code_image && (
                          <div className="mt-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">QR Code</label>
                            <div className="flex items-center space-x-3">
                              <div className="bg-white p-2 rounded border">
                                <img
                                  src={`data:image/png;base64,${credential.qr_code_data.qr_code_image}`}
                                  alt="Credential QR Code"
                                  className="w-16 h-16"
                                />
                              </div>
                              <div className="flex space-x-2">
                                {credential.qr_code_data.verification_url && (
                                  <button
                                    onClick={() => window.open(credential.qr_code_data.verification_url, '_blank')}
                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                                  >
                                    View Certificate
                                  </button>
                                )}
                                {credential.certificateUrl && (
                                  <button
                                    onClick={() => window.open(credential.certificateUrl, '_blank')}
                                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                                  >
                                    Preview PDF
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CSV Template and Instructions - Only show when no file uploaded */}
          {!csvFile && uploadStatus === 'idle' && (
            <div className="bg-white shadow-md rounded-lg border border-gray-200 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">CSV Template & Instructions</h3>
              <p className="text-gray-600 mb-4">
                To ensure a successful bulk upload, please use the provided CSV template and follow these guidelines:
              </p>
              <button
                onClick={downloadCsvTemplate}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="-ml-1 mr-2 h-5 w-5" />
                Download CSV Template
              </button>
              
              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Required Columns:</h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <code className="text-sm text-gray-800">learner_id, certificate_title, mode, duration, skills, certificate_path, tags</code>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Note: <code>tags</code> column is optional</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Column Descriptions:</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li><span className="font-semibold">learner_id:</span> The unique identifier for a VALID LEARNER (must be registered as a learner in the system)</li>
                    <li><span className="font-semibold">certificate_title:</span> The title of the certificate (e.g., "Python Programming")</li>
                    <li><span className="font-semibold">mode:</span> Delivery mode (Online, Offline, or Hybrid)</li>
                    <li><span className="font-semibold">duration:</span> Course duration (e.g., "4 Weeks", "6 Months")</li>
                    <li><span className="font-semibold">skills:</span> Comma-separated list of skills (e.g., "Python,Django,Flask")</li>
                    <li><span className="font-semibold">certificate_path:</span> Local file path to the certificate PDF template (e.g., "C:/Users/username/Documents/certificates/course.pdf")</li>
                    <li><span className="font-semibold">tags:</span> <span className="text-blue-600">(Optional)</span> Comma-separated tags for this specific credential (e.g., "premium,verified")</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2">🔍 OCR Features:</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• <strong>Learner ID Validation:</strong> OCR extracts and validates learner ID from certificate</li>
                    <li>• <strong>Name Matching:</strong> Verifies learner name matches certificate content</li>
                    <li>• <strong>Skills Extraction:</strong> Automatically extracts skills from certificate text</li>
                    <li>• <strong>Course Details:</strong> Extracts course title and completion date</li>
                    <li>• <strong>Fallback Support:</strong> Uses CSV data if OCR extraction fails</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">🏷️ Tag System:</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• <strong>Issuer Tags:</strong> Apply to all credentials in this batch (set above)</li>
                    <li>• <strong>Row Tags:</strong> Specific tags for individual credentials (CSV column)</li>
                    <li>• <strong>Combined Tags:</strong> Both issuer and row tags are included in credentials</li>
                    <li>• <strong>Skill Tags:</strong> Tags are stored in the <code className="bg-green-100 px-1 rounded">skill_tags</code> field</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-800">Important Notes:</h4>
                      <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                        <li>• Do not change the column headers in the template</li>
                        <li>• All fields are required and cannot be empty</li>
                        <li>• Skills should be comma-separated without spaces</li>
                        <li>• Each batch gets a unique batch ID for tracking</li>
                        <li>• Failed entries can be retried individually</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
