'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Avatar,
  IconButton,
  Button,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  VerifiedUser,
  Schedule,
  Error,
  Download,
  Share,
  MoreVert,
  School,
  WorkspacePremium,
  Image as ImageIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Credential } from '@/types/dashboard';
import { useState } from 'react';
import MintNFTModal from '@/components/nft/MintNFTModal';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const NSQFBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  borderRadius: '50%',
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.875rem',
  fontWeight: 600,
}));

const VerificationBadge = styled(Box)<{ status: string }>(({ theme, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'verified': return theme.palette.success.main;
      case 'pending': return theme.palette.warning.main;
      case 'expired': return theme.palette.error.main;
      case 'revoked': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  return {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    color: getStatusColor(),
    fontSize: '0.75rem',
    fontWeight: 500,
  };
});

interface CredentialCardProps {
  credential: Credential;
  onClick?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

export default function CredentialCard({ 
  credential, 
  onClick, 
  showActions = true,
  compact = false 
}: CredentialCardProps) {
  const [nftModalOpen, setNftModalOpen] = useState(false);
  const isLearner = typeof window !== 'undefined' && window.location.pathname.includes('/learner');
  
  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'verified': return <VerifiedUser fontSize="small" />;
      case 'pending': return <Schedule fontSize="small" />;
      case 'expired': return <Error fontSize="small" />;
      case 'revoked': return <Error fontSize="small" />;
      default: return <Schedule fontSize="small" />;
    }
  };

  const getVerificationText = (status: string) => {
    switch (status) {
      case 'verified': return 'Verified';
      case 'pending': return 'Pending';
      case 'expired': return 'Expired';
      case 'revoked': return 'Revoked';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpiringSoon = () => {
    if (!credential.expiry_date) return false;
    const expiryDate = new Date(credential.expiry_date);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
  };

  return (
    <StyledCard onClick={onClick}>
      <Box sx={{ position: 'relative' }}>
        <NSQFBadge>
          {credential.nsqf_level}
        </NSQFBadge>
        
        <CardContent sx={{ pb: compact ? 2 : 3 }}>
          {/* Issuer Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={credential.issuer_logo}
              sx={{ width: 32, height: 32, mr: 1.5 }}
            >
              <School />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {credential.issuer}
              </Typography>
              <VerificationBadge status={credential.verification_status}>
                {getVerificationIcon(credential.verification_status)}
                {getVerificationText(credential.verification_status)}
              </VerificationBadge>
            </Box>
          </Box>

          {/* Credential Title */}
          <Typography 
            variant={compact ? "subtitle2" : "h6"} 
            sx={{ 
              fontWeight: 600, 
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {credential.title}
          </Typography>

          {/* Description */}
          {!compact && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {credential.description}
            </Typography>
          )}

          {/* Skills */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {credential.skills.slice(0, compact ? 2 : 3).map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
              {credential.skills.length > (compact ? 2 : 3) && (
                <Chip
                  label={`+${credential.skills.length - (compact ? 2 : 3)}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              )}
            </Box>
          </Box>

          {/* Credit Points & Dates */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkspacePremium fontSize="small" color="primary" />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                {credential.credit_points} Credits
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {formatDate(credential.issue_date)}
            </Typography>
          </Box>

          {/* Expiry Warning */}
          {isExpiringSoon() && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="warning.main" sx={{ fontWeight: 500 }}>
                ⚠️ Expires {formatDate(credential.expiry_date!)}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Box>

      {/* Actions */}
      {showActions && !compact && (
        <CardActions sx={{ mt: 'auto', px: 2, pb: 2 }}>
          <Button size="small" startIcon={<Download />}>
            Download
          </Button>
          <Button size="small" startIcon={<Share />}>
            Share
          </Button>
          {/* Mint as NFT button - only visible to learners */}
          {isLearner && credential.blockchain_hash && (
            <Button 
              size="small" 
              startIcon={<ImageIcon />}
              onClick={(e) => {
                e.stopPropagation();
                setNftModalOpen(true);
              }}
              sx={{ ml: 'auto' }}
            >
              Mint as NFT
            </Button>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        </CardActions>
      )}

      {/* NFT Minting Modal */}
      {credential.blockchain_hash && (
        <MintNFTModal
          open={nftModalOpen}
          onClose={() => setNftModalOpen(false)}
          certHash={credential.blockchain_hash}
          credentialTitle={credential.title}
          issuerName={credential.issuer}
          onSuccess={(tokenId, txHash) => {
            console.log('NFT minted:', { tokenId, txHash });
            setNftModalOpen(false);
            // TODO: Update credential with NFT info
          }}
        />
      )}
    </StyledCard>
  );
}
