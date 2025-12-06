'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Box, Typography, Paper, Button, Stack, TextField, MenuItem, Alert, Chip, Avatar, IconButton, Divider, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '@/hooks/useAuth';
import { AuthService } from '@/services/auth.service';

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
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [clientToken, setClientToken] = useState('');
  const [state, setState] = useState('');
  const [digilockerData, setDigilockerData] = useState<any>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [walletNotice, setWalletNotice] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();


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

  // Load saved DigiLocker data from MongoDB on mount
  useEffect(() => {
    const loadSavedData = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        console.log('Auth still loading, waiting...');
        return;
      }

      // Check if user is available - user object has _id, not id
      const userId = user?._id || user?.id;
      if (!userId) {
        console.log('User not available yet:', { user, authLoading });
        return;
      }

      console.log('Loading saved DigiLocker data for user:', userId);
      setLoadingCredentials(true);
      
      try {
        const token = AuthService.getAccessToken();
        if (!token) {
          console.error('No access token available');
          setLoadingCredentials(false);
          return;
        }

        const backendUrl = process.env.BACKEND_ROUTE;
        const url = `${backendUrl}/learners/${userId}/digilocker-data`;
        
        console.log('Loading DigiLocker data from:', url);
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('DigiLocker data received:', data);
          if (data?.digilocker_data) {
            console.log('Setting DigiLocker data. Keys:', Object.keys(data.digilocker_data));
            setDigilockerData(data.digilocker_data);
          } else {
            console.warn('No digilocker_data in response:', data);
          }
        } else if (response.status === 404) {
          // No data found, that's okay - user hasn't fetched yet
          console.log('No saved DigiLocker data found (404)');
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to load DigiLocker data:', response.status, errorData);
        }
      } catch (error) {
        console.error('Failed to load saved DigiLocker data:', error);
      } finally {
        setLoadingCredentials(false);
      }
    };

    loadSavedData();
  }, [user?._id, user?.id, authLoading]);

  useEffect(() => {
    // Check if user is returning from DigiLocker with state parameter
    const stateParam = searchParams.get('state');
    const codeParam = searchParams.get('code');
    
    // Retrieve stored client_token and state from localStorage
    const storedClientToken = localStorage.getItem('digilocker_client_token');
    const storedState = localStorage.getItem('digilocker_state');
    
    console.log('DigiLocker redirect check:', {
      stateParam,
      codeParam,
      hasStoredToken: !!storedClientToken,
      hasStoredState: !!storedState,
      currentClientToken: clientToken,
      currentState: state
    });
    
    // If we have stored credentials, restore them
    if (storedClientToken && storedState) {
      setClientToken(storedClientToken);
      setState(storedState);
    }
    
    // If user is returning from DigiLocker (has state or code parameter)
    if (stateParam || codeParam) {
      if (storedClientToken && storedState) {
        // If state matches or we have a code (authorization successful)
        if (stateParam === storedState || codeParam) {
          setClientToken(storedClientToken);
          setState(storedState);
          setNotice('DigiLocker authorization successful! You can now fetch your documents.');
          
          // Clean URL parameters
          try {
            const url = new URL(window.location.href);
            url.searchParams.delete('state');
            url.searchParams.delete('code');
            window.history.replaceState({}, '', url.toString());
          } catch {}
        } else if (stateParam) {
          // State doesn't match, but we have one - still allow fetching
          console.warn('State parameter mismatch, but proceeding with stored credentials');
          setClientToken(storedClientToken);
          setState(storedState);
          setNotice('DigiLocker authorization completed. You can now fetch your documents.');
          
          // Clean URL parameters
          try {
            const url = new URL(window.location.href);
            url.searchParams.delete('state');
            url.searchParams.delete('code');
            window.history.replaceState({}, '', url.toString());
          } catch {}
        }
      } else {
        // We have a redirect but no stored credentials
        setNotice('Please initiate DigiLocker session again.');
      }
    } else if (storedClientToken && storedState) {
      // No redirect params but we have stored credentials - user might have refreshed
      setClientToken(storedClientToken);
      setState(storedState);
    }
  }, [searchParams]);

  const initiateDigiLocker = async () => {
    try {
      setLoading(true);
      setNotice(null);

      // Step 1: Generate Token (via API route to avoid CORS)
      const tokenResponse = await fetch('/api/digilocker/get-access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Check if response is ok and is JSON
      const tokenContentType = tokenResponse.headers.get('content-type');
      if (!tokenContentType || !tokenContentType.includes('application/json')) {
        const text = await tokenResponse.text();
        console.error('Non-JSON response from get-access-token:', text);
        throw new Error('Server returned an invalid response. Please check the console for details.');
      }

      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok || !tokenData.status || !tokenData.client_token || !tokenData.state) {
        throw new Error(tokenData.error || tokenData.msg || 'Failed to generate access token');
      }

      // Store token and state in localStorage
      localStorage.setItem('digilocker_client_token', tokenData.client_token);
      localStorage.setItem('digilocker_state', tokenData.state);
      
      setClientToken(tokenData.client_token);
      setState(tokenData.state);

      // Step 2: Generate DigiLocker Link (via API route to avoid CORS)
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/dashboard/profile/Integrations`
        : 'https://digilocker.meon.co.in/digilocker/thank-you-page';

      const linkResponse = await fetch('/api/digilocker/generate-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_token: tokenData.client_token,
          redirect_url: redirectUrl
        })
      });

      // Check if response is ok and is JSON
      const contentType = linkResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await linkResponse.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an invalid response. Please check the console for details.');
      }

      const linkData = await linkResponse.json();
      
      if (!linkResponse.ok || !linkData.success || !linkData.url) {
        throw new Error(linkData.error || linkData.msg || 'Failed to generate DigiLocker link');
      }

      // Redirect user to DigiLocker
      window.location.href = linkData.url;
    } catch (e: any) {
      console.error('DigiLocker initiation error:', e);
      alert(e.message || 'Unable to initiate DigiLocker. Please try again.');
      setLoading(false);
    }
  };

  const fetchDocument = async () => {
    // Get client_token and state from state or localStorage
    const token = clientToken || localStorage.getItem('digilocker_client_token');
    const stateValue = state || localStorage.getItem('digilocker_state');

    if (!token || !stateValue) {
      alert('Please initiate DigiLocker session first.');
      return;
    }

    try {
      setLoading(true);
      setNotice(null);

      // Step 3: Retrieve Data (via API route to avoid CORS)
      const response = await fetch('/api/digilocker/fetch-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_token: token,
          state: stateValue
        })
      });

      // Check if response is ok and is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response from fetch-data:', text);
        throw new Error('Server returned an invalid response. Please check the console for details.');
      }

      const data = await response.json();
      
      if (!response.ok || !data.success || data.code !== 200) {
        throw new Error(data.error || data.msg || 'Failed to retrieve documents');
      }

      // Store the retrieved data
      setDigilockerData(data.data);
      setNotice('Documents retrieved successfully! Check your credentials above.');

      // Save to MongoDB if user is logged in
      const userId = user?._id || user?.id;
      if (userId) {
        try {
          const token = AuthService.getAccessToken();
          await fetch('/api/digilocker/save-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              learner_id: userId,
              digilocker_data: data.data,
            }),
          });
          console.log('DigiLocker data saved to MongoDB');
        } catch (saveError) {
          console.error('Failed to save DigiLocker data:', saveError);
          // Don't throw - data is still displayed even if save fails
        }
      }

      // Display the data (you can customize this)
      console.log('DigiLocker Data:', data.data);

    } catch (e: any) {
      console.error('Fetch document error:', e);
      alert(e.message || 'Unable to fetch documents. Please ensure you have completed the DigiLocker authorization.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Integrations">
      <Box sx={{ p: 3 }}>
        <Paper elevation={1} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            Credentials
          </Typography>
          {loadingCredentials ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress size={48} sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Loading credentials...
                </Typography>
              </Box>
            </Box>
          ) : digilockerData ? (
            <Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {/* Personal Information */}
                <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' }, minWidth: 300 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                    Personal Information
                  </Typography>
                  <Stack spacing={2}>
                    {digilockerData.name && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Full Name</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{digilockerData.name}</Typography>
                      </Box>
                    )}
                    {digilockerData.dob && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Date of Birth</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{digilockerData.dob}</Typography>
                      </Box>
                    )}
                    {digilockerData.gender && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Gender</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{digilockerData.gender}</Typography>
                      </Box>
                    )}
                    {digilockerData.fathername && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Father's Name</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{digilockerData.fathername}</Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>

                {/* Address Information */}
                <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' }, minWidth: 300 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                    Address Information
                  </Typography>
                  <Stack spacing={2}>
                    {digilockerData.aadhar_address && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Address</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{digilockerData.aadhar_address}</Typography>
                      </Box>
                    )}
                    {digilockerData.house && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>House</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{digilockerData.house}</Typography>
                      </Box>
                    )}
                    {digilockerData.locality && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Locality</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{digilockerData.locality}</Typography>
                      </Box>
                    )}
                    {digilockerData.dist && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>District</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{digilockerData.dist}</Typography>
                      </Box>
                    )}
                    {digilockerData.state && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>State</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{digilockerData.state}</Typography>
                      </Box>
                    )}
                    {digilockerData.pincode && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Pincode</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{digilockerData.pincode}</Typography>
                      </Box>
                    )}
                    {digilockerData.country && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Country</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{digilockerData.country}</Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>

                {/* Aadhaar Documents */}
                {digilockerData.aadhar_no && (
                  <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' }, minWidth: 300 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Aadhaar
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Aadhaar Number</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>{digilockerData.aadhar_no}</Typography>
                      </Box>
                      {digilockerData.aadhar_filename && (
                        <Button 
                          size="small" 
                          variant="outlined" 
                          onClick={() => window.open(digilockerData.aadhar_filename, '_blank')}
                          fullWidth
                        >
                          View Aadhaar PDF
                        </Button>
                      )}
                      {digilockerData.aadhar_img_filename && (
                        <Button 
                          size="small" 
                          variant="outlined" 
                          onClick={() => window.open(digilockerData.aadhar_img_filename, '_blank')}
                          fullWidth
                        >
                          View Aadhaar Photo
                        </Button>
                      )}
                      {digilockerData.aadhar_xml && (
                        <Button 
                          size="small" 
                          variant="outlined" 
                          onClick={() => window.open(digilockerData.aadhar_xml, '_blank')}
                          fullWidth
                        >
                          View Aadhaar XML
                        </Button>
                      )}
                    </Stack>
                  </Box>
                )}

                {/* PAN Documents */}
                {digilockerData.pan_number && (
                  <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' }, minWidth: 300 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      PAN Card
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>PAN Number</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>{digilockerData.pan_number}</Typography>
                      </Box>
                      {digilockerData.name_on_pan && (
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Name on PAN</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>{digilockerData.name_on_pan}</Typography>
                        </Box>
                      )}
                      {digilockerData.pan_image_path && (
                        <Button 
                          size="small" 
                          variant="outlined" 
                          onClick={() => window.open(digilockerData.pan_image_path, '_blank')}
                          fullWidth
                        >
                          View PAN PDF
                        </Button>
                      )}
                    </Stack>
                  </Box>
                )}

                {/* Other Documents */}
                {digilockerData.other_documents_files && Object.keys(digilockerData.other_documents_files).length > 0 && (
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Other Documents
                    </Typography>
                    <Stack spacing={1}>
                      {Object.entries(digilockerData.other_documents_files).map(([key, url]: [string, any]) => (
                        <Button 
                          key={key}
                          size="small" 
                          variant="outlined" 
                          onClick={() => window.open(url, '_blank')}
                          sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                        >
                          View {key.replace(/[-_]/g, ' ')}
                        </Button>
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Metadata */}
                {digilockerData.date_time && (
                  <Box sx={{ width: '100%' }}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="caption" color="text.secondary">
                      Fetched on: {new Date(digilockerData.date_time).toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No credentials available. Connect DigiLocker below to fetch your documents.
            </Typography>
          )}
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

            {/* Available Wallets - Square Cards */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              {isConnected ? 'Other Wallets' : 'Available Wallets'}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {/* MetaMask */}
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' }, minWidth: 200 }}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 3, 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: 3,
                    aspectRatio: '1',
                    minHeight: 200,
                    textAlign: 'center',
                    gap: 2,
                    borderColor: (isConnected && connector?.id === 'injected') ? '#10b981' : undefined,
                    bgcolor: (isConnected && connector?.id === 'injected') ? 'rgba(16, 185, 129, 0.05)' : undefined,
                    '&:hover': { borderColor: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.02)', transform: 'translateY(-4px)' },
                    transition: 'all 0.2s',
                    cursor: (isConnecting || (isConnected && connector?.id === 'injected')) ? 'default' : 'pointer'
                  }}
                >
                  <Avatar sx={{ bgcolor: (isConnected && connector?.id === 'injected') ? '#f0fdf4' : '#fef3e2', width: 56, height: 56 }}>
                    <MetaMaskIcon />
                  </Avatar>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>MetaMask</Typography>
                    {isConnected && connector?.id === 'injected' && address ? (
                      <>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace', mb: 1, fontSize: '0.75rem' }}>
                          {formatAddress(address)}
                        </Typography>
                        <Chip 
                          icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                          label="Connected" 
                          size="small" 
                          color="success"
                          sx={{ height: 22, fontSize: '0.7rem', mb: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Polygon Amoy
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Browser extension wallet
                      </Typography>
                    )}
                  </Box>
                  {isConnected && connector?.id === 'injected' ? (
                    <Button 
                      variant="outlined" 
                      color="error" 
                      size="small"
                      startIcon={<LinkOffIcon />}
                      onClick={handleDisconnect}
                      sx={{ textTransform: 'none', mt: 'auto', minWidth: 120 }}
                      fullWidth
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button 
                      variant="contained"
                      size="small"
                      disabled={isConnecting}
                      onClick={() => handleConnectWallet('metamask')}
                      sx={{ textTransform: 'none', mt: 'auto', minWidth: 120 }}
                      fullWidth
                    >
                      {isConnecting ? 'Connecting...' : 'Connect'}
                    </Button>
                  )}
                </Paper>
              </Box>

              {/* WalletConnect */}
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' }, minWidth: 200 }}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 3, 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: 3,
                    aspectRatio: '1',
                    minHeight: 200,
                    textAlign: 'center',
                    gap: 2,
                    borderColor: (isConnected && connector?.id === 'walletConnect') ? '#10b981' : undefined,
                    bgcolor: (isConnected && connector?.id === 'walletConnect') ? 'rgba(16, 185, 129, 0.05)' : undefined,
                    '&:hover': { borderColor: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.02)', transform: 'translateY(-4px)' },
                    transition: 'all 0.2s',
                    cursor: (isConnecting || (isConnected && connector?.id === 'walletConnect')) ? 'default' : 'pointer'
                  }}
                >
                  <Avatar sx={{ bgcolor: (isConnected && connector?.id === 'walletConnect') ? '#f0fdf4' : '#eff6ff', width: 56, height: 56 }}>
                    <WalletConnectIcon />
                  </Avatar>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>WalletConnect</Typography>
                    {isConnected && connector?.id === 'walletConnect' && address ? (
                      <>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace', mb: 1, fontSize: '0.75rem' }}>
                          {formatAddress(address)}
                        </Typography>
                        <Chip 
                          icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                          label="Connected" 
                          size="small" 
                          color="success"
                          sx={{ height: 22, fontSize: '0.7rem', mb: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Polygon Amoy
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Connect mobile wallets via QR code
                      </Typography>
                    )}
                  </Box>
                  {isConnected && connector?.id === 'walletConnect' ? (
                    <Button 
                      variant="outlined" 
                      color="error" 
                      size="small"
                      startIcon={<LinkOffIcon />}
                      onClick={handleDisconnect}
                      sx={{ textTransform: 'none', mt: 'auto', minWidth: 120 }}
                      fullWidth
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button 
                      variant="contained"
                      size="small"
                      disabled={isConnecting}
                      onClick={() => handleConnectWallet('walletconnect')}
                      sx={{ textTransform: 'none', mt: 'auto', minWidth: 120 }}
                      fullWidth
                    >
                      {isConnecting ? 'Connecting...' : 'Connect'}
                    </Button>
                  )}
                </Paper>
              </Box>

              {/* Coinbase Wallet */}
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' }, minWidth: 200 }}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 3, 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: 3,
                    aspectRatio: '1',
                    minHeight: 200,
                    textAlign: 'center',
                    gap: 2,
                    opacity: 0.6,
                    '&:hover': { borderColor: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.02)', transform: 'translateY(-4px)' },
                    transition: 'all 0.2s'
                  }}
                >
                  <Avatar sx={{ bgcolor: '#eff6ff', width: 56, height: 56 }}>
                    <CoinbaseIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Coinbase Wallet</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Connect via Coinbase app
                    </Typography>
                  </Box>
                  <Button 
                    variant="outlined"
                    size="small"
                    disabled
                    sx={{ textTransform: 'none', mt: 'auto', minWidth: 120 }}
                    fullWidth
                  >
                    Coming Soon
                  </Button>
                </Paper>
              </Box>
            </Box>

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
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Connect your DigiLocker to share KYC documents securely.
            </Typography>
            {notice && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {notice}
              </Alert>
            )}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' }, minWidth: 200 }}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2.5, 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'flex-start',
                    borderRadius: 3,
                    aspectRatio: '1',
                    minHeight: { xs: 400, sm: 350, md: 320 },
                    textAlign: 'center',
                    gap: 1.5,
                    overflow: 'hidden',
                    '&:hover': { borderColor: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.02)', transform: 'translateY(-4px)' },
                    transition: 'all 0.2s'
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: 'transparent', 
                      width: { xs: 60, sm: 70, md: 80 }, 
                      height: { xs: 50, sm: 58, md: 64 },
                      mb: 0.5,
                      '& img': {
                        objectFit: 'contain',
                        width: '100%',
                        height: '100%'
                      }
                    }}
                  >
                    <img src="/digilocker_logo.jpeg" alt="DigiLocker" />
                  </Avatar>
                  <Box sx={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}>DigiLocker</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, fontSize: '0.7rem' }}>
                      Secure KYC document sharing
                    </Typography>
                    <Stack spacing={1.5} sx={{ width: '100%', flex: 1, overflowY: 'auto', pr: 0.2 }}>
                      <Button 
                        variant="contained" 
                        onClick={initiateDigiLocker} 
                        disabled={loading}
                        fullWidth
                        size="small"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' }, p: 0.7 }}
                      >
                        {loading ? 'Please wait...' : 'Initiate DigiLocker'}
                      </Button>
                      <Button 
                        variant={clientToken && state ? "contained" : "outlined"}
                        color={clientToken && state ? "success" : "primary"}
                        onClick={fetchDocument} 
                        disabled={loading || !clientToken || !state}
                        fullWidth
                        size="small"
                        sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.8rem' }, 
                          mb: 0.5,
                          ...(clientToken && state && {
                            bgcolor: '#10b981',
                            '&:hover': { bgcolor: '#059669' }
                          })
                        }}
                      >
                        {loading ? 'Fetching...' : 'Fetch Documents'}
                      </Button>
                      {(clientToken && state) ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 0.5 }}>
                          <CheckCircleIcon sx={{ fontSize: 14, color: '#10b981' }} />
                          <Typography variant="caption" color="success.main" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                            Session Active - Ready to fetch
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', textAlign: 'center', mt: 1 }}>
                          Complete authorization to enable
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </Paper>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
