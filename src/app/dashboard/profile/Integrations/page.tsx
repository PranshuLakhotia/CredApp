'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Box, Typography, Paper, Button, Stack, TextField, MenuItem, Alert, Chip, Avatar, IconButton, Divider } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Wallet icons as simple components
const MetaMaskIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M21.6 2L13.2 8.4L14.7 4.5L21.6 2Z" fill="#E17726"/>
    <path d="M2.4 2L10.7 8.5L9.3 4.5L2.4 2Z" fill="#E27625"/>
    <path d="M18.6 16.8L16.5 20.1L21.2 21.4L22.5 16.9L18.6 16.8Z" fill="#E27625"/>
    <path d="M1.5 16.9L2.8 21.4L7.5 20.1L5.4 16.8L1.5 16.9Z" fill="#E27625"/>
    <path d="M7.3 10.5L6 12.5L10.6 12.7L10.4 7.7L7.3 10.5Z" fill="#E27625"/>
    <path d="M16.7 10.5L13.5 7.6L13.4 12.7L18 12.5L16.7 10.5Z" fill="#E27625"/>
    <path d="M7.5 20.1L10.3 18.8L7.9 17L7.5 20.1Z" fill="#E27625"/>
    <path d="M13.7 18.8L16.5 20.1L16.1 17L13.7 18.8Z" fill="#E27625"/>
  </svg>
);

const WalletConnectIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M6.09 8.62C9.36 5.35 14.64 5.35 17.91 8.62L18.29 9C18.44 9.15 18.44 9.39 18.29 9.54L17.07 10.76C16.99 10.84 16.87 10.84 16.8 10.76L16.27 10.23C13.91 7.87 10.09 7.87 7.73 10.23L7.16 10.8C7.08 10.88 6.96 10.88 6.89 10.8L5.67 9.58C5.52 9.43 5.52 9.19 5.67 9.04L6.09 8.62ZM20.56 11.27L21.63 12.34C21.78 12.49 21.78 12.73 21.63 12.88L16.44 18.07C16.29 18.22 16.05 18.22 15.9 18.07L12.27 14.44C12.23 14.4 12.17 14.4 12.13 14.44L8.5 18.07C8.35 18.22 8.11 18.22 7.96 18.07L2.37 12.88C2.22 12.73 2.22 12.49 2.37 12.34L3.44 11.27C3.59 11.12 3.83 11.12 3.98 11.27L7.61 14.9C7.65 14.94 7.71 14.94 7.75 14.9L11.38 11.27C11.53 11.12 11.77 11.12 11.92 11.27L15.55 14.9C15.59 14.94 15.65 14.94 15.69 14.9L19.32 11.27C19.47 11.12 19.71 11.12 19.86 11.27L20.56 11.27Z" fill="#3B99FC"/>
  </svg>
);

const CoinbaseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#0052FF"/>
    <path d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM14.5 13H13V14.5C13 14.78 12.78 15 12.5 15H11.5C11.22 15 11 14.78 11 14.5V13H9.5C9.22 13 9 12.78 9 12.5V11.5C9 11.22 9.22 11 9.5 11H11V9.5C11 9.22 11.22 9 11.5 9H12.5C12.78 9 13 9.22 13 9.5V11H14.5C14.78 11 15 11.22 15 11.5V12.5C15 12.78 14.78 13 14.5 13Z" fill="white"/>
  </svg>
);

export default function IntegrationsPage() {
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [docType, setDocType] = useState<'aadhaar' | 'pan' | 'driving_license'>('aadhaar');
  const [notice, setNotice] = useState<string | null>(null);
  const [walletNotice, setWalletNotice] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Wagmi hooks for wallet connection
  const { address, isConnected, connector } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  // Format wallet address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Handle wallet connection
  const handleConnectWallet = async (walletType: 'metamask' | 'walletconnect' | 'coinbase') => {
    try {
      setWalletNotice(null);
      
      if (walletType === 'metamask') {
        connect({ connector: injected() });
      } else if (walletType === 'walletconnect') {
        const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
        if (!projectId) {
          setWalletNotice('WalletConnect is not configured. Please use MetaMask.');
          return;
        }
        connect({ 
          connector: walletConnect({ 
            projectId,
            showQrModal: true,
            metadata: {
              name: 'CredHub',
              description: 'Verifiable Credentials Platform',
              url: window.location.origin,
              icons: [`${window.location.origin}/logo.png`],
            },
          }) 
        });
      }
      // Note: Coinbase wallet would need additional setup
    } catch (error) {
      console.error('Wallet connection error:', error);
      setWalletNotice('Failed to connect wallet. Please try again.');
    }
  };

  // Handle wallet disconnection
  const handleDisconnect = () => {
    disconnect();
    setWalletNotice('Wallet disconnected successfully.');
  };

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

        {/* Wallets Section */}
        <Box sx={{ mt: 3 }}>
          <Paper elevation={1} sx={{ p: 4, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AccountBalanceWalletIcon sx={{ color: '#3b82f6' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Wallets
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Connect your Web3 wallet to mint credentials as NFTs with one click.
            </Typography>
            
            {walletNotice && (
              <Alert 
                severity={walletNotice.includes('disconnect') || walletNotice.includes('Failed') ? 'info' : 'success'} 
                sx={{ mb: 3 }}
                onClose={() => setWalletNotice(null)}
              >
                {walletNotice}
              </Alert>
            )}

            {/* Connected Wallet */}
            {isConnected && address && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  Connected Wallet
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    borderColor: '#10b981',
                    bgcolor: 'rgba(16, 185, 129, 0.05)',
                    borderRadius: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#f0fdf4', width: 40, height: 40 }}>
                      <MetaMaskIcon />
                    </Avatar>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                          {formatAddress(address)}
                        </Typography>
                        <Chip 
                          icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                          label="Connected" 
                          size="small" 
                          color="success"
                          sx={{ height: 22, fontSize: '0.7rem' }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {connector?.name || 'MetaMask'} • Polygon Amoy
                      </Typography>
                    </Box>
                  </Box>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    size="small"
                    startIcon={<LinkOffIcon />}
                    onClick={handleDisconnect}
                    sx={{ textTransform: 'none' }}
                  >
                    Disconnect
                  </Button>
                </Paper>
              </Box>
            )}

            {/* Available Wallets */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              {isConnected ? 'Other Wallets' : 'Available Wallets'}
            </Typography>
            
            <Stack spacing={2}>
              {/* MetaMask */}
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  borderRadius: 2,
                  '&:hover': { borderColor: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.02)' },
                  transition: 'all 0.2s'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#fef3e2', width: 40, height: 40 }}>
                    <MetaMaskIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>MetaMask</Typography>
                    <Typography variant="caption" color="text.secondary">Browser extension wallet</Typography>
                  </Box>
                </Box>
                <Button 
                  variant={isConnected && connector?.id === 'injected' ? 'outlined' : 'contained'}
                  size="small"
                  disabled={isConnecting || (isConnected && connector?.id === 'injected')}
                  onClick={() => handleConnectWallet('metamask')}
                  sx={{ textTransform: 'none', minWidth: 100 }}
                >
                  {isConnecting ? 'Connecting...' : (isConnected && connector?.id === 'injected') ? 'Connected' : 'Connect'}
                </Button>
              </Paper>

              {/* WalletConnect */}
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  borderRadius: 2,
                  '&:hover': { borderColor: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.02)' },
                  transition: 'all 0.2s'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#eff6ff', width: 40, height: 40 }}>
                    <WalletConnectIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>WalletConnect</Typography>
                    <Typography variant="caption" color="text.secondary">Connect mobile wallets via QR code</Typography>
                  </Box>
                </Box>
                <Button 
                  variant={isConnected && connector?.id === 'walletConnect' ? 'outlined' : 'contained'}
                  size="small"
                  disabled={isConnecting || (isConnected && connector?.id === 'walletConnect')}
                  onClick={() => handleConnectWallet('walletconnect')}
                  sx={{ textTransform: 'none', minWidth: 100 }}
                >
                  {isConnecting ? 'Connecting...' : (isConnected && connector?.id === 'walletConnect') ? 'Connected' : 'Connect'}
                </Button>
              </Paper>

              {/* Coinbase Wallet */}
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  borderRadius: 2,
                  opacity: 0.6,
                  '&:hover': { borderColor: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.02)' },
                  transition: 'all 0.2s'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#eff6ff', width: 40, height: 40 }}>
                    <CoinbaseIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>Coinbase Wallet</Typography>
                    <Typography variant="caption" color="text.secondary">Connect via Coinbase app</Typography>
                  </Box>
                </Box>
                <Button 
                  variant="outlined"
                  size="small"
                  disabled
                  sx={{ textTransform: 'none', minWidth: 100 }}
                >
                  Coming Soon
                </Button>
              </Paper>
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
              Connecting your wallet only saves your address. No transactions or signatures required.
            </Typography>
          </Paper>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* DigiLocker Section */}
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
