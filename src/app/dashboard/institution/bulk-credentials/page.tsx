'use client';

import React, { useState, ChangeEvent, DragEvent, useEffect } from 'react';
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

interface CSVRow {
  learner_id: string;
  certificate_title: string;
  mode: string;
  duration: string;
  skills: string;
  certificate_path: string;
}

interface ProcessedRow extends CSVRow {
  id: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
  credential_id?: string;
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


  // Generate unique batch ID
  const generateBatchId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `BATCH_${timestamp}_${random}`;
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      await processCSVFile(file);
    } else {
      setCsvFile(null);
      setUploadStatus('error');
      setMessage('Please upload a valid CSV file.');
      setValidationErrors(['Invalid file type. Only CSV files are allowed.']);
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
    if (file && file.type === 'text/csv') {
      await processCSVFile(file);
    } else {
      setCsvFile(null);
      setUploadStatus('error');
      setMessage('Please drop a valid CSV file.');
      setValidationErrors(['Invalid file type. Only CSV files are allowed.']);
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
      const requiredHeaders = ['learner_id', 'certificate_title', 'mode', 'duration', 'skills', 'certificate_path'];
      
      // Validate headers
      const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
      if (missingHeaders.length > 0) {
        console.log('Missing headers:', missingHeaders); // Debug log
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
      }

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
          certificate_title: values[headers.indexOf('certificate_title')] || '',
          mode: values[headers.indexOf('mode')] || '',
          duration: values[headers.indexOf('duration')] || '',
          skills: values[headers.indexOf('skills')] || '',
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


  const handleLocalFile = async (filePath: string): Promise<string> => {
    try {
      // For local development, we'll create a file input to let user select the file
      // and convert it to a blob URL that can be used
      return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const blobUrl = URL.createObjectURL(file);
            resolve(blobUrl);
          } else {
            reject(new Error('No file selected'));
          }
        };
        input.click();
      });
    } catch (error) {
      console.error('Error handling local file:', error);
      // Fallback: return the original path or empty string
      return filePath.startsWith('http') ? filePath : '';
    }
  };

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

      // Get API key first (exact same as single credential page)
      console.log('🔍 DEBUG: About to call fetchApiKeys...');
      const apiKeys = await fetchApiKeys();
      console.log('🔍 DEBUG: fetchApiKeys returned:', apiKeys);
      
      if (!apiKeys || apiKeys.length === 0) {
        throw new Error('No API keys found. Please generate an API key first.');
      }
      
      const apiKey = apiKeys[0].key;
      console.log('🚀 Starting credential issuance process...');
      console.log('🔑 Using API Key:', apiKey ? apiKey.substring(0, 20) + '...' : 'No API key');
      console.log('🎫 Access Token:', token ? token.substring(0, 20) + '...' : 'No token');

      // VALIDATION STEP 1: Validate learner using exact same function as single credential
      const learnerVerification = await performVerificationForBulk(row.learner_id, apiKey);
      if (!learnerVerification.success) {
        throw new Error(learnerVerification.error);
      }
      
      const learnerData = learnerVerification.data;
      if (!learnerData.is_learner) {
        throw new Error(`User ${row.learner_id} is not registered as a learner`);
      }

      console.log(`✅ Learner validated: ${learnerData.user_info.full_name}`);

      // VALIDATION STEP 2: Validate certificate file exists (for local paths)
      if (!row.certificate_path.startsWith('http')) {
        // For local paths, we'll validate that the file exists by trying to access it
        // This is a basic check - in production, you might want more sophisticated validation
        if (!row.certificate_path.trim()) {
          throw new Error('Certificate path is required and cannot be empty');
        }
        // Additional validation could be added here for file existence
      }

      // API key already obtained above

      // Parse skills
      const skills = row.skills.split(',').map(s => s.trim()).filter(s => s);
      if (skills.length === 0) {
        throw new Error('At least one skill is required');
      }

      // Handle certificate file (local path or URL)
      let certificateUrl = row.certificate_path;
      if (!certificateUrl.startsWith('http')) {
        // It's a local path, we need to handle it differently
        // For now, we'll use the path as-is and let the backend handle it
        certificateUrl = row.certificate_path;
      }

      // STEP 1: Create Credential in Database (exact copy from single credential)
      console.log('📝 Step 1: Creating credential in database...');
      
      // Get learner data from verification results (same pattern as single credential)
      const learnerUserInfo = learnerData?.user_info;
      const learnerAddress = learnerUserInfo?.wallet_address || "0x3AF15A0035a717ddb5b4B4D727B7EE94A52Cc4e3"; // Fallback if no wallet address

      const createPayload = {
        credential_id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        vc_payload: {
          "@context": ["https://www.w3.org/2018/credentials/v1"],
          "type": ["VerifiableCredential"],
          "credentialSubject": {
            "learner_address": learnerAddress,
            "name": learnerUserInfo?.full_name || "Learner Name",
            "course": row.certificate_title,
            "grade": "A+",
            "completion_date": new Date().toISOString().split('T')[0],
            "skills": skills,
            "duration": row.duration,
            "mode": row.mode
          },
          "issuer": {
            "name": user?.full_name || 'Institution',
            "did": "did:example:tech-university" // This should come from issuer profile
          },
          "issuanceDate": new Date().toISOString()
        },
        artifact_url: certificateUrl,
        idempotency_key: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        credential_type: "digital-certificate"
      };

      console.log('📤 Sending create credential request:', createPayload);

      const createResponse = await fetch('http://localhost:8000/api/v1/issuer/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify(createPayload)
      });

      console.log('📡 Create credential response status:', createResponse.status);

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        console.error('❌ Failed to create credential:', errorData);
        throw new Error(`Failed to create credential: ${errorData.detail || errorData.message || 'Unknown error'}`);
      }

      const createResult = await createResponse.json();
      console.log('✅ Credential created successfully:', createResult);

      // STEP 2: Issue on Blockchain (exact copy from single credential)
      console.log('⛓️ Step 2: Issuing credential on blockchain...');

      const issuePayload = {
        credential_id: createResult.credential_id,
        learner_address: learnerAddress,
        generate_qr: true,
        wait_for_confirmation: false
      };

      console.log('📤 Sending blockchain issue request:', issuePayload);

      const issueResponse = await fetch('http://localhost:8000/api/v1/blockchain/credentials/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(issuePayload)
      });

      console.log('📡 Blockchain issue response status:', issueResponse.status);

      if (!issueResponse.ok) {
        const errorData = await issueResponse.json();
        console.error('❌ Failed to issue credential on blockchain:', errorData);
        throw new Error(`Failed to issue credential on blockchain: ${errorData.detail || errorData.message || 'Unknown error'}`);
      }

      const issueResult = await issueResponse.json();
      console.log('✅ Credential issued on blockchain successfully:', issueResult);

      // Store successful credential details
      const successfulCredential = {
        ...issueResult,
        originalRow: row,
        learnerInfo: learnerData.user_info
      };
      setSuccessfulCredentials(prev => [...prev, successfulCredential]);

      // Success
      return {
        ...row,
        status: 'success',
        credential_id: issueResult.credential_id
      };

    } catch (error) {
      return {
        ...row,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        retry_count: row.retry_count + 1
      };
    }
  };

  const processAllCredentials = async () => {
    if (csvData.length === 0) return;

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

    setIsProcessing(true);
    setUploadStatus('processing');

    for (const row of failedRows) {
      const result = await processCredential(row);
      setProcessedRows(prev => prev.map(r => r.id === row.id ? result : r));
    }

    setIsProcessing(false);
    setUploadStatus('completed');
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

    // Update the row data
    setProcessedRows(prev => prev.map(r => r.id === editingData.id ? editingData : r));
    
    // Process the edited row
    setIsProcessing(true);
    const result = await processCredential(editingData);
    setProcessedRows(prev => prev.map(r => r.id === editingData.id ? result : r));
    
    setEditingRow(null);
    setEditingData(null);
    setIsProcessing(false);
  };

  const handleEditFieldChange = (field: keyof ProcessedRow, value: string) => {
    if (!editingData) return;
    setEditingData({ ...editingData, [field]: value });
  };

  const downloadCsvTemplate = () => {
    // Use placeholder learner IDs that need to be replaced with actual learner IDs
    const template = "learner_id,certificate_title,mode,duration,skills,certificate_path\nREPLACE_WITH_VALID_LEARNER_ID,Python Programming,Online,4 Weeks,Python,Django,C:/Users/username/Documents/certificates/python-programming.pdf\nREPLACE_WITH_VALID_LEARNER_ID,React Development,Online,6 Weeks,React,JavaScript,HTML,CSS,C:/Users/username/Documents/certificates/react-development.pdf";
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
                    className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                  >
                    Retry Failed Credentials ({batchInfo.error_count})
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
                  disabled={isProcessing}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    isProcessing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isProcessing ? 'Processing...' : 'Issue Credentials'}
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
                    disabled={isProcessing}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4 mr-2 inline" />
                    Retry All Failed ({processedRows.filter(row => row.status === 'error').length})
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
                              {credential.qr_code_data.verification_url && (
                                <div>
                                  <button
                                    onClick={() => window.open(credential.qr_code_data.verification_url, '_blank')}
                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                                  >
                                    View Certificate
                                  </button>
                                </div>
                              )}
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
                    <code className="text-sm text-gray-800">learner_id, certificate_title, mode, duration, skills, certificate_path</code>
                  </div>
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
