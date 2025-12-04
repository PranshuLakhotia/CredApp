"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Paper,
  LinearProgress,
  Avatar,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { 
  Wallet, 
  CheckCircle, 
  Error as ErrorIcon, 
  OpenInNew,
  AccountBalanceWallet,
  QrCode2,
  SwapHoriz,
  Download,
  Badge,
  Verified,
  RadioButtonUnchecked,
  HourglassEmpty,
} from '@mui/icons-material';
import { 
  useAccount, 
  useConnect, 
  useDisconnect,
  useChainId,
  useSwitchChain,
  useSignTypedData,
  type Connector,
} from 'wagmi';
import { polygon, polygonAmoy } from 'wagmi/chains';

interface MintNFTModalProps {
  open: boolean;
  onClose: () => void;
  certHash: string;
  credentialTitle?: string;
  issuerName?: string;
  learnerName?: string;
  onSuccess?: (tokenId: string, txHash: string) => void;
}

const BLOCKCHAIN_API_URL = process.env.NEXT_PUBLIC_BLOCKCHAIN_API_URL || 'https://credapp-blockchain.onrender.com';
const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || '';

// Use testnet in development, mainnet in production
const TARGET_CHAIN = process.env.NODE_ENV === 'production' ? polygon : polygonAmoy;

type MintStep = 'connect' | 'preview' | 'authorize' | 'sign' | 'mint' | 'success' | 'error';

// Wallet icons mapping
const WalletIcon = ({ connectorId }: { connectorId: string }) => {
  if (connectorId === 'metaMask' || connectorId === 'injected') {
    return (
      <Box 
        component="img" 
        src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
        alt="MetaMask"
        sx={{ width: 28, height: 28 }}
      />
    );
  }
  if (connectorId === 'walletConnect') {
    return (
      <Box 
        component="img" 
        src="https://walletconnect.com/walletconnect-logo.png"
        alt="WalletConnect"
        sx={{ width: 28, height: 28, borderRadius: 1 }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }
  return <AccountBalanceWallet sx={{ fontSize: 28, color: '#6366f1' }} />;
};

// Minting progress steps
const mintingSteps = [
  { label: 'Broadcasting transaction', key: 'broadcast' },
  { label: 'Verifying on blockchain', key: 'verify' },
  { label: 'Minted successfully', key: 'complete' },
];

export default function MintNFTModal({
  open,
  onClose,
  certHash,
  credentialTitle,
  issuerName,
  learnerName,
  onSuccess,
}: MintNFTModalProps) {
  const [step, setStep] = useState<MintStep>('connect');
  const [error, setError] = useState<string | null>(null);
  const [authorization, setAuthorization] = useState<any>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [tokenId, setTokenId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showWalletSelect, setShowWalletSelect] = useState(false);
  const [mintProgress, setMintProgress] = useState(0);

  // Wagmi v2 hooks
  const { address, isConnected, connector } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { signTypedDataAsync } = useSignTypedData();

  // Filter available connectors
  const availableConnectors = connectors.filter(
    (c) => c.id === 'injected' || c.id === 'metaMask' || c.id === 'walletConnect'
  );

  // Format address for display
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      // If wallet already connected, skip to preview
      if (isConnected && address) {
        setStep('preview');
        setShowWalletSelect(false);
      } else {
        setStep('connect');
      }
      setError(null);
      setAuthorization(null);
      setTxHash(null);
      setTokenId(null);
      setMintProgress(0);
    }
  }, [open, isConnected, address]);

  const handleConnect = useCallback((c: Connector) => {
    setError(null);
    connect({ connector: c });
  }, [connect]);

  // When connection succeeds, move to preview
  useEffect(() => {
    if (isConnected && address && step === 'connect' && !showWalletSelect) {
      setStep('preview');
    }
  }, [isConnected, address, step, showWalletSelect]);

  const handleChangeWallet = () => {
    disconnect();
    setShowWalletSelect(true);
    setStep('connect');
  };

  const handleAuthorize = async () => {
    if (!address) {
      setError('Wallet not connected');
      return;
    }

    try {
      setStep('authorize');
      setError(null);
      setIsLoading(true);

      const response = await fetch(
        `${BLOCKCHAIN_API_URL}/api/v1/credentials/${certHash}/nft/authorize?learner_address=${address}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Check for already minted (409 Conflict)
        if (response.status === 409) {
          setError('This credential has already been minted as an NFT. Each credential can only be minted once to prevent forgery.');
          setStep('error');
          return;
        }
        throw new Error(data.detail || 'Failed to authorize NFT mint');
      }

      setAuthorization(data);
      setStep('sign');
    } catch (err: any) {
      console.error('Authorization error:', err);
      setError(err.message || 'Authorization failed');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSign = async () => {
    try {
      setError(null);
      setIsLoading(true);

      if (!authorization?.eip712_payload) {
        throw new Error('Authorization data not available');
      }

      // Check if on correct chain
      if (chainId !== TARGET_CHAIN.id) {
        try {
          await switchChain({ chainId: TARGET_CHAIN.id });
          // Wait for chain switch
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (switchError: any) {
          throw new Error(`Please switch to ${TARGET_CHAIN.name} network in your wallet`);
        }
      }

      // Sign EIP-712 typed data
      const { domain, types, primaryType, message } = authorization.eip712_payload;
      
      // Remove EIP712Domain from types as wagmi adds it automatically
      const { EIP712Domain, ...signingTypes } = types;
      
      const signature = await signTypedDataAsync({
        domain,
        types: signingTypes,
        primaryType,
        message,
      });

      setStep('mint');
      await handleMint(signature);
    } catch (err: any) {
      console.error('Signing error:', err);
      if (err.message?.includes('User rejected')) {
        setError('Signature request was rejected');
      } else {
        setError(err.message || 'Signature failed');
      }
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMint = async (signature: string) => {
    try {
      setError(null);
      setIsLoading(true);
      setMintProgress(1); // Broadcasting

      const response = await fetch(
        `${BLOCKCHAIN_API_URL}/api/v1/credentials/${certHash}/nft/mint`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            learner_address: address,
            signature,
          }),
        }
      );

      setMintProgress(2); // Verifying

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Minting failed');
      }

      setMintProgress(3); // Complete
      setTxHash(data.transaction_hash);
      setTokenId(data.token_id?.toString());
      
      // Small delay to show complete state
      await new Promise(resolve => setTimeout(resolve, 500));
      setStep('success');

      if (onSuccess) {
        onSuccess(data.token_id?.toString() || '', data.transaction_hash);
      }
    } catch (err: any) {
      console.error('Minting error:', err);
      setError(err.message || 'Minting failed');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (step === 'success' || step === 'error' || step === 'connect' || step === 'preview') {
      setStep('connect');
      setError(null);
      setAuthorization(null);
      setTxHash(null);
      setTokenId(null);
      setShowWalletSelect(false);
    }
    onClose();
  };

  const handleDisconnect = () => {
    disconnect();
    setStep('connect');
  };

  const getBlockExplorerUrl = () => {
    if (!txHash) return null;
    if (chainId === polygonAmoy.id || TARGET_CHAIN.id === polygonAmoy.id) {
      return `https://amoy.polygonscan.com/tx/${txHash}`;
    }
    return `https://polygonscan.com/tx/${txHash}`;
  };

  const getOpenSeaUrl = () => {
    if (!tokenId || !NFT_CONTRACT_ADDRESS) return null;
    if (chainId === polygonAmoy.id || TARGET_CHAIN.id === polygonAmoy.id) {
      return `https://testnets.opensea.io/assets/amoy/${NFT_CONTRACT_ADDRESS}/${tokenId}`;
    }
    return `https://opensea.io/assets/matic/${NFT_CONTRACT_ADDRESS}/${tokenId}`;
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ 
            bgcolor: '#eef2ff', 
            p: 1, 
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Wallet sx={{ color: '#6366f1', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Mint as NFT
            </Typography>
            {credentialTitle && (
              <Typography variant="caption" color="text.secondary">
                {credentialTitle}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Step: Connect Wallet */}
        {step === 'connect' && (
          <Box>
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              Connect your wallet to mint this credential as a permanent NFT on the blockchain.
            </Alert>

            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
              Choose a wallet
            </Typography>

            <List sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 1 }}>
              {availableConnectors.map((c) => (
                <ListItem key={c.id} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => handleConnect(c)}
                    disabled={isConnecting}
                    sx={{
                      borderRadius: 2,
                      border: '1px solid #e2e8f0',
                      bgcolor: 'white',
                      '&:hover': {
                        bgcolor: '#f1f5f9',
                        borderColor: '#6366f1',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 44 }}>
                      <WalletIcon connectorId={c.id} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={c.name}
                      secondary={c.id === 'walletConnect' ? 'Scan QR code' : 'Browser extension'}
                      primaryTypographyProps={{ fontWeight: 500 }}
                      secondaryTypographyProps={{ fontSize: '0.75rem' }}
                    />
                    {isConnecting && <CircularProgress size={20} />}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Don&apos;t have a wallet? <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }}>Learn more</a>
              </Typography>
            </Box>
          </Box>
        )}

        {/* Step: Preview (when wallet already connected) */}
        {step === 'preview' && isConnected && address && (
          <Box>
            {/* Connected Wallet Info */}
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                mb: 3, 
                borderRadius: 2, 
                bgcolor: '#f0fdf4',
                borderColor: '#86efac'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#dcfce7', width: 36, height: 36 }}>
                    <WalletIcon connectorId={connector?.id || 'injected'} />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Using connected wallet
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#059669' }}>
                      {formatAddress(address)}
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  size="small" 
                  startIcon={<SwapHoriz />}
                  onClick={handleChangeWallet}
                  sx={{ textTransform: 'none', color: '#6366f1' }}
                >
                  Change
                </Button>
              </Box>
            </Paper>

            {/* NFT Preview Card */}
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
              NFT Preview
            </Typography>
            
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 3, 
                borderRadius: 3, 
                mb: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ 
                position: 'absolute', 
                top: -20, 
                right: -20, 
                width: 100, 
                height: 100, 
                borderRadius: '50%', 
                bgcolor: 'rgba(255,255,255,0.1)' 
              }} />
              
              <Chip 
                label="Credential NFT" 
                size="small" 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white', 
                  mb: 2,
                  fontWeight: 600 
                }} 
              />
              
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                {credentialTitle || 'Certificate'}
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
                {issuerName && (
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Issued by: {issuerName}
                  </Typography>
                )}
                {learnerName && (
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Awarded to: {learnerName}
                  </Typography>
                )}
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <Verified sx={{ fontSize: 16 }} />
                <Typography variant="caption" fontWeight={500}>
                  On-chain verified credential
                </Typography>
              </Box>
            </Paper>

            {/* Mint Details */}
            <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Network</Typography>
                <Typography variant="body2" fontWeight={600}>{TARGET_CHAIN.name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Gas Fee</Typography>
                <Chip label="Free (Sponsored)" size="small" color="success" sx={{ height: 22 }} />
              </Box>
            </Box>

            <Button
              variant="contained"
              onClick={handleAuthorize}
              fullWidth
              size="large"
              sx={{ 
                py: 1.5,
                bgcolor: '#6366f1',
                '&:hover': { bgcolor: '#4f46e5' },
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              Mint Now
            </Button>
          </Box>
        )}

        {/* Step: Authorize */}
        {step === 'authorize' && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={48} sx={{ color: '#6366f1' }} />
            <Typography variant="body1" sx={{ mt: 2, fontWeight: 500 }}>
              Preparing your credential...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Verifying ownership on blockchain
            </Typography>
          </Box>
        )}

        {/* Step: Sign */}
        {step === 'sign' && authorization && (
          <Box>
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              ✓ Credential verified! Sign the message to mint your NFT.
            </Alert>

            <Alert severity="info" sx={{ mb: 3, borderRadius: 2, bgcolor: '#f0f9ff' }}>
              <Typography variant="body2">
                Your wallet will ask you to sign a message. This proves you own this credential. <strong>No gas fees required.</strong>
              </Typography>
            </Alert>

            <Button
              variant="contained"
              onClick={handleSign}
              disabled={isLoading}
              fullWidth
              size="large"
              sx={{ 
                py: 1.5,
                bgcolor: '#6366f1',
                '&:hover': { bgcolor: '#4f46e5' },
                borderRadius: 2,
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Sign & Mint NFT'
              )}
            </Button>
          </Box>
        )}

        {/* Step: Minting with Progress */}
        {step === 'mint' && (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" fontWeight={600} textAlign="center" sx={{ mb: 3 }}>
              Minting Your NFT...
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {mintingSteps.map((s, index) => {
                const stepNum = index + 1;
                const isComplete = mintProgress >= stepNum;
                const isCurrent = mintProgress === stepNum - 1 || (mintProgress === index && index === mintProgress);
                
                return (
                  <Box 
                    key={s.key}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      opacity: isComplete || isCurrent ? 1 : 0.5
                    }}
                  >
                    {isComplete ? (
                      <CheckCircle sx={{ color: '#10b981', fontSize: 24 }} />
                    ) : isCurrent ? (
                      <CircularProgress size={24} sx={{ color: '#6366f1' }} />
                    ) : (
                      <RadioButtonUnchecked sx={{ color: '#cbd5e1', fontSize: 24 }} />
                    )}
                    <Typography 
                      variant="body1" 
                      fontWeight={isComplete || isCurrent ? 600 : 400}
                      color={isComplete ? '#10b981' : 'text.primary'}
                    >
                      {s.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
              Please don&apos;t close this window...
            </Typography>
          </Box>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <Box>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: '#dcfce7', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <CheckCircle sx={{ fontSize: 48, color: '#10b981' }} />
              </Box>
              <Typography variant="h5" fontWeight={700} mb={1}>
                NFT Minted Successfully! 🎉
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your credential is now a permanent NFT on the blockchain.
              </Typography>
            </Box>

            {tokenId && (
              <Paper sx={{ bgcolor: '#f0fdf4', p: 2, borderRadius: 2, mb: 3, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  TOKEN ID
                </Typography>
                <Typography variant="h4" fontWeight={700} color="#059669">
                  #{tokenId}
                </Typography>
              </Paper>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {txHash && getBlockExplorerUrl() && (
                <Button
                  variant="outlined"
                  startIcon={<OpenInNew />}
                  href={getBlockExplorerUrl()!}
                  target="_blank"
                  fullWidth
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  View on PolygonScan
                </Button>
              )}

              {tokenId && getOpenSeaUrl() && (
                <Button
                  variant="outlined"
                  startIcon={<OpenInNew />}
                  href={getOpenSeaUrl()!}
                  target="_blank"
                  fullWidth
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  View on OpenSea
                </Button>
              )}

              <Button
                variant="contained"
                startIcon={<Badge />}
                onClick={handleClose}
                fullWidth
                sx={{ 
                  borderRadius: 2, 
                  textTransform: 'none',
                  bgcolor: '#6366f1',
                  '&:hover': { bgcolor: '#4f46e5' },
                }}
              >
                Add to Profile
              </Button>
            </Box>

            <Box sx={{ 
              mt: 3, 
              p: 2, 
              bgcolor: '#fef3c7', 
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}>
              <Verified sx={{ color: '#d97706' }} />
              <Typography variant="body2" fontWeight={500} color="#92400e">
                Your credential now shows "On-Chain Verified" badge
              </Typography>
            </Box>
          </Box>
        )}

        {/* Step: Error */}
        {step === 'error' && (
          <Box>
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: 2 }}
              icon={<ErrorIcon />}
            >
              <Typography variant="body2" fontWeight={600} mb={0.5}>
                Minting Failed
              </Typography>
              <Typography variant="body2">
                {error || 'An unexpected error occurred'}
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="contained"
                onClick={() => {
                  setError(null);
                  if (isConnected) {
                    setStep('preview');
                  } else {
                    setStep('connect');
                  }
                }}
                fullWidth
                sx={{ 
                  bgcolor: '#6366f1',
                  '&:hover': { bgcolor: '#4f46e5' },
                  borderRadius: 2,
                }}
              >
                Try Again
              </Button>
              
              {isConnected && (
                <Button
                  variant="text"
                  onClick={handleDisconnect}
                  fullWidth
                  sx={{ color: 'text.secondary' }}
                >
                  Disconnect Wallet
                </Button>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        {isConnected && step !== 'success' && step !== 'error' && step !== 'connect' && (
          <Typography variant="caption" color="text.secondary" sx={{ mr: 'auto', fontFamily: 'monospace' }}>
            {formatAddress(address!)}
          </Typography>
        )}
        <Button 
          onClick={handleClose}
          sx={{ borderRadius: 2 }}
        >
          {step === 'success' ? 'Done' : 'Cancel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
