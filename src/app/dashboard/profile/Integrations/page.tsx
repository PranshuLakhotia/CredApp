'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Box, Typography, Paper, Button, Stack, TextField, MenuItem, Alert } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function IntegrationsPage() {
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [docType, setDocType] = useState<'aadhaar' | 'pan' | 'driving_license'>('aadhaar');
  const [notice, setNotice] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const sid = searchParams.get('session_id');
    if (sid) {
      setSessionId(sid);
      setNotice('DigiLocker session created. You can now fetch documents once consent succeeds.');
      // Optional: clean session_id from URL
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('session_id');
        window.history.replaceState({}, '', url.toString());
      } catch {}
    }
  }, [searchParams]);

  const initiateDigiLocker = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/v1/digilocker/sessions/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '@entity': 'in.co.sandbox.kyc.digilocker.session.request',
          flow: 'signin',
          doc_types: ['aadhaar', 'pan', 'driving_license'],
          // Redirect back to this Integrations page so we can capture session_id here
          redirect_url:
            typeof window !== 'undefined'
              ? `${window.location.origin}/dashboard/profile/Integrations`
              : 'https://example.com/dashboard/profile/Integrations'
        })
      });
      const data = await res.json();
      if (!res.ok || data?.code !== 200) {
        throw new Error(data?.message || 'Failed to initiate DigiLocker session');
      }
      const authUrl = data?.data?.authorization_url;
      const sid = data?.data?.session_id;
      if (sid) setSessionId(sid);
      if (authUrl) {
        window.location.href = authUrl;
      }
    } catch (e) {
      console.error(e);
      alert('Unable to initiate DigiLocker. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocument = async () => {
    if (!sessionId) {
      alert('Enter a session id first.');
      return;
    }
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/v1/digilocker/sessions/${sessionId}/documents/${docType}`);
      const data = await res.json();
      if (!res.ok || data?.code !== 200) {
        throw new Error(data?.message || 'Failed to fetch document');
      }
      const files = data?.data?.files || [];
      if (files.length && files[0].url) {
        window.open(files[0].url, '_blank');
      } else {
        alert('No file url returned.');
      }
    } catch (e) {
      console.error(e);
      alert('Unable to fetch document. Ensure session is succeeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Integrations">
      <Box sx={{ p: 3 }}>
        <Paper elevation={1} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Credentials
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your credentials will be displayed here.
          </Typography>
        </Paper>
        <Box sx={{ mt: 3 }}>
          <Paper elevation={1} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              DigiLocker
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Connect your DigiLocker to share KYC documents securely.
            </Typography>
            {notice && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {notice}
              </Alert>
            )}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <Button variant="contained" onClick={initiateDigiLocker} disabled={loading}>
                {loading ? 'Please wait...' : 'Initiate Session'}
              </Button>
              <TextField
                label="Session ID"
                size="small"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                sx={{ minWidth: 260 }}
              />
              <TextField
                label="Document Type"
                size="small"
                select
                value={docType}
                onChange={(e) => setDocType(e.target.value as any)}
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="aadhaar">Aadhaar</MenuItem>
                <MenuItem value="pan">PAN</MenuItem>
                <MenuItem value="driving_license">Driving License</MenuItem>
              </TextField>
              <Button variant="outlined" onClick={fetchDocument} disabled={loading}>
                {loading ? 'Fetching...' : 'Fetch Document'}
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
