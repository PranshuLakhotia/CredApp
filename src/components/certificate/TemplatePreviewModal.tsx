'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Chip,
  IconButton,
  alpha,
  useTheme
} from '@mui/material';
import {
  Close,
  Download,
  Visibility,
  School,
  Business,
  EmojiEvents as Award,
  WorkspacePremium as CertificateIcon
} from '@mui/icons-material';
import { CertificateTemplate } from './CertificateTemplateSelector';

interface TemplatePreviewModalProps {
  template: CertificateTemplate | null;
  open: boolean;
  onClose: () => void;
  onSelect?: (template: CertificateTemplate) => void;
  showSelectButton?: boolean;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  open,
  onClose,
  onSelect,
  showSelectButton = true
}) => {
  const theme = useTheme();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return <School />;
      case 'professional': return <Business />;
      case 'achievement': return <Award />;
      case 'corporate': return <Business />;
      default: return <CertificateIcon />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return '#3b82f6';
      case 'professional': return '#10b981';
      case 'achievement': return '#f59e0b';
      case 'corporate': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getStyleColor = (color: string) => {
    switch (color) {
      case 'blue': return '#3b82f6';
      case 'green': return '#10b981';
      case 'gold': return '#f59e0b';
      case 'purple': return '#8b5cf6';
      case 'red': return '#ef4444';
      case 'teal': return '#14b8a6';
      default: return '#6b7280';
    }
  };

  if (!template) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {template.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {template.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Chip 
              size="small"
              label={template.category}
              icon={getCategoryIcon(template.category)}
              sx={{ 
                backgroundColor: alpha(getCategoryColor(template.category), 0.1),
                color: getCategoryColor(template.category),
                fontWeight: 600
              }}
            />
            <Chip 
              size="small"
              label={`${template.style} style`}
              sx={{ 
                backgroundColor: alpha(getStyleColor(template.color), 0.1),
                color: getStyleColor(template.color),
                fontWeight: 600
              }}
            />
            {template.recommended && (
              <Chip 
                size="small"
                label="Recommended"
                color="warning"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{ 
            color: 'text.secondary',
            '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.1) }
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Grid container>
          {/* Template Image */}
          <Grid item xs={12} md={8}>
            <Box sx={{ 
              p: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 400,
              backgroundColor: alpha(theme.palette.grey[100], 0.3)
            }}>
              <Box
                component="img"
                src={template.imageUrl}
                alt={template.name}
                sx={{
                  width: '100%',
                  maxHeight: 500,
                  objectFit: 'contain',
                  borderRadius: 2,
                  boxShadow: theme.shadows[8],
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              />
            </Box>
          </Grid>

          {/* Template Details */}
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3, height: '100%', backgroundColor: alpha(theme.palette.grey[50], 0.5) }}>
              
              {/* Features Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CertificateIcon color="primary" fontSize="small" />
                  Template Features
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {template.features.map((feature, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: getStyleColor(template.color)
                      }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {feature}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Specifications */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Specifications
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      CATEGORY
                    </Typography>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                      {template.category}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      DESIGN STYLE
                    </Typography>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                      {template.style}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      COLOR SCHEME
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{
                        width: 16,
                        height: 16,
                        borderRadius: 1,
                        backgroundColor: getStyleColor(template.color),
                        border: '1px solid',
                        borderColor: 'divider'
                      }} />
                      <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                        {template.color}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Best For Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Best For
                </Typography>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  backgroundColor: alpha(getCategoryColor(template.category), 0.1),
                  border: '1px solid',
                  borderColor: alpha(getCategoryColor(template.category), 0.2)
                }}>
                  <Typography variant="body2" sx={{ 
                    color: getCategoryColor(template.category),
                    fontWeight: 500,
                    lineHeight: 1.6
                  }}>
                    {template.category === 'academic' && 'Educational institutions, universities, schools, and academic achievement recognition.'}
                    {template.category === 'professional' && 'Professional certifications, skill-based courses, and career development programs.'}
                    {template.category === 'achievement' && 'Special recognitions, awards, competitions, and milestone celebrations.'}
                    {template.category === 'corporate' && 'Corporate training, employee development, and business skill certifications.'}
                  </Typography>
                </Box>
              </Box>

              {/* Usage Tips */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Usage Tips
                </Typography>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  backgroundColor: alpha(theme.palette.info.main, 0.1),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.info.main, 0.2)
                }}>
                  <Typography variant="body2" sx={{ 
                    color: theme.palette.info.main,
                    fontWeight: 500,
                    lineHeight: 1.6
                  }}>
                    This template works best with clear, concise text. Ensure your institution logo is high-quality for optimal results.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 3, 
        borderTop: '1px solid', 
        borderColor: 'divider',
        gap: 2
      }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ minWidth: 100 }}
        >
          Close
        </Button>
        
        <Button
          startIcon={<Visibility />}
          onClick={() => window.open(template.imageUrl, '_blank')}
          variant="outlined"
          sx={{ minWidth: 120 }}
        >
          Full View
        </Button>

        {showSelectButton && onSelect && (
          <Button 
            onClick={() => {
              onSelect(template);
              onClose();
            }}
            variant="contained"
            sx={{ 
              minWidth: 140,
              fontWeight: 600,
              backgroundColor: getStyleColor(template.color),
              '&:hover': {
                backgroundColor: alpha(getStyleColor(template.color), 0.8)
              }
            }}
          >
            Select Template
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TemplatePreviewModal;
