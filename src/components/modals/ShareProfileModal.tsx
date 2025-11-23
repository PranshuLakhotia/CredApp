'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Copy,
  X,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  MessageCircle
} from 'lucide-react';
import { LearnerService } from '@/services/learner.service';

interface ShareProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ShareProfileModal({ open, onClose }: ShareProfileModalProps) {
  const [shareLink, setShareLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      generateShareLink();
    }
  }, [open]);

  const generateShareLink = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const data = await LearnerService.createShareLink(30);
      
      // Backend now returns user_id and share_token directly
      const userId = data.user_id;
      const shareToken = data.share_token;
      
      if (userId && shareToken) {
        const fullLink = `${window.location.origin}/shared/${userId}/${shareToken}`;
        setShareLink(fullLink);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error generating share link:', err);
      setError('Failed to generate share link. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleSocialShare = (platform: string) => {
    const text = "Check out my professional credentials and portfolio on Credify!";
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(shareLink);

    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=My Professional Portfolio&body=${encodedText}%0A%0A${encodedUrl}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: 6
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Share2 size={24} color="#1976d2" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Share Profile
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          This is a message that displays to provide the user with reminders, 
          communication from other people, or other timely information, or other 
          a timely information
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Share Link Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Share Link
          </Typography>
          
          {isGenerating ? (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              p: 2, 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'grey.50'
            }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Generating share link...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              p: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'grey.50'
            }}>
              <TextField
                value={shareLink}
                variant="standard"
                fullWidth
                InputProps={{
                  disableUnderline: true,
                  readOnly: true,
                  sx: { 
                    fontSize: '0.875rem',
                    '& input': { 
                      cursor: 'text',
                      color: 'text.primary'
                    }
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleCopyLink}
                startIcon={<Copy size={16} />}
                sx={{ 
                  minWidth: 'auto',
                  px: 2,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Social Share Section */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Share on Social Media
          </Typography>
          
          <Stack direction="row" spacing={2} justifyContent="center">
            <IconButton
              onClick={() => handleSocialShare('twitter')}
              sx={{ 
                bgcolor: '#1DA1F2', 
                color: 'white',
                '&:hover': { bgcolor: '#1a91da' },
                width: 48,
                height: 48
              }}
            >
              <Twitter size={20} />
            </IconButton>
            
            <IconButton
              onClick={() => handleSocialShare('facebook')}
              sx={{ 
                bgcolor: '#4267B2', 
                color: 'white',
                '&:hover': { bgcolor: '#365899' },
                width: 48,
                height: 48
              }}
            >
              <Facebook size={20} />
            </IconButton>
            
            <IconButton
              onClick={() => handleSocialShare('linkedin')}
              sx={{ 
                bgcolor: '#0077B5', 
                color: 'white',
                '&:hover': { bgcolor: '#006396' },
                width: 48,
                height: 48
              }}
            >
              <Linkedin size={20} />
            </IconButton>
            
            <IconButton
              onClick={() => handleSocialShare('whatsapp')}
              sx={{ 
                bgcolor: '#25D366', 
                color: 'white',
                '&:hover': { bgcolor: '#20b954' },
                width: 48,
                height: 48
              }}
            >
              <MessageCircle size={20} />
            </IconButton>
            
            <IconButton
              onClick={() => handleSocialShare('email')}
              sx={{ 
                bgcolor: '#EA4335', 
                color: 'white',
                '&:hover': { bgcolor: '#d33b2c' },
                width: 48,
                height: 48
              }}
            >
              <Mail size={20} />
            </IconButton>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{ 
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
