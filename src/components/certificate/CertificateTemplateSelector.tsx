'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Fade,
  Zoom,
  useTheme,
  alpha
} from '@mui/material';
import {
  CheckCircle,
  Close,
  Visibility,
  Star,
  Palette,
  School,
  Business,
  EmojiEvents as Award,
  WorkspacePremium as CertificateIcon
} from '@mui/icons-material';

export interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  category: 'academic' | 'professional' | 'achievement' | 'corporate';
  style: 'modern' | 'classic' | 'elegant' | 'minimal';
  color: 'blue' | 'green' | 'gold' | 'purple' | 'red' | 'teal';
  imageUrl: string;
  features: string[];
  recommended?: boolean;
}

const CERTIFICATE_TEMPLATES: CertificateTemplate[] = [
  {
    id: 'template_1',
    name: 'Academic Excellence',
    description: 'Perfect for educational institutions and academic achievements',
    category: 'academic',
    style: 'classic',
    color: 'blue',
    imageUrl: '/image1.jpeg',
    features: ['Formal Design', 'Institution Logo', 'Academic Seal', 'Traditional Layout'],
    recommended: true
  },
  {
    id: 'template_2',
    name: 'Professional Certification',
    description: 'Ideal for professional certifications and skill-based courses',
    category: 'professional',
    style: 'modern',
    color: 'green',
    imageUrl: '/image2.jpeg',
    features: ['Modern Design', 'Clean Layout', 'Professional Look', 'Skills Focus']
  },
  {
    id: 'template_3',
    name: 'Achievement Award',
    description: 'Great for recognizing special achievements and milestones',
    category: 'achievement',
    style: 'elegant',
    color: 'gold',
    imageUrl: '/image3.jpeg',
    features: ['Elegant Border', 'Achievement Focus', 'Premium Feel', 'Award Style']
  },
  {
    id: 'template_4',
    name: 'Corporate Training',
    description: 'Designed for corporate training programs and workshops',
    category: 'corporate',
    style: 'minimal',
    color: 'purple',
    imageUrl: '/image4.jpeg',
    features: ['Corporate Style', 'Minimal Design', 'Business Focus', 'Clean Typography']
  },
  {
    id: 'template_5',
    name: 'Technical Certification',
    description: 'Perfect for technical skills and IT certifications',
    category: 'professional',
    style: 'modern',
    color: 'teal',
    imageUrl: '/image5.jpeg',
    features: ['Tech-focused', 'Modern Layout', 'Skill Badges', 'Digital Style']
  },
  {
    id: 'template_6',
    name: 'Leadership Excellence',
    description: 'Ideal for leadership programs and management courses',
    category: 'professional',
    style: 'elegant',
    color: 'red',
    imageUrl: '/image6.jpeg',
    features: ['Leadership Theme', 'Executive Style', 'Premium Design', 'Authority Look']
  },
  {
    id: 'template_7',
    name: 'Creative Arts',
    description: 'Great for creative courses and artistic achievements',
    category: 'achievement',
    style: 'modern',
    color: 'purple',
    imageUrl: '/image7.jpeg',
    features: ['Creative Design', 'Artistic Elements', 'Colorful Layout', 'Expressive Style']
  },
  {
    id: 'template_8',
    name: 'International Standard',
    description: 'Universal design suitable for international certifications',
    category: 'academic',
    style: 'classic',
    color: 'blue',
    imageUrl: '/image8.jpeg',
    features: ['International Style', 'Multi-language Ready', 'Standard Format', 'Global Appeal']
  }
];

interface CertificateTemplateSelectorProps {
  selectedTemplate?: CertificateTemplate | null;
  onTemplateSelect: (template: CertificateTemplate) => void;
  disabled?: boolean;
  showPreview?: boolean;
}

const CertificateTemplateSelector: React.FC<CertificateTemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateSelect,
  disabled = false,
  showPreview = true
}) => {
  const theme = useTheme();
  const [previewTemplate, setPreviewTemplate] = useState<CertificateTemplate | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

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

  const filteredTemplates = filterCategory === 'all' 
    ? CERTIFICATE_TEMPLATES 
    : CERTIFICATE_TEMPLATES.filter(template => template.category === filterCategory);

  const categories = [
    { value: 'all', label: 'All Templates', icon: <Palette /> },
    { value: 'academic', label: 'Academic', icon: <School /> },
    { value: 'professional', label: 'Professional', icon: <Business /> },
    { value: 'achievement', label: 'Achievement', icon: <Award /> },
    { value: 'corporate', label: 'Corporate', icon: <Business /> }
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CertificateIcon color="primary" />
          Choose Certificate Template
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select a professional template for your certificate. Each template is optimized for different types of credentials.
        </Typography>
      </Box>

      {/* Category Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
          Filter by Category
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {categories.map((category) => (
            <Chip
              key={category.value}
              icon={category.icon}
              label={category.label}
              onClick={() => setFilterCategory(category.value)}
              variant={filterCategory === category.value ? 'filled' : 'outlined'}
              color={filterCategory === category.value ? 'primary' : 'default'}
              sx={{
                '&:hover': {
                  backgroundColor: filterCategory === category.value 
                    ? theme.palette.primary.dark 
                    : alpha(theme.palette.primary.main, 0.1)
                }
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Selected Template Preview */}
      {selectedTemplate && (
        <Fade in={true}>
          <Card sx={{ 
            mb: 4, 
            border: `2px solid ${theme.palette.success.main}`,
            backgroundColor: alpha(theme.palette.success.main, 0.05)
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <CheckCircle color="success" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Selected Template: {selectedTemplate.name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box
                  component="img"
                  src={selectedTemplate.imageUrl}
                  alt={selectedTemplate.name}
                  sx={{
                    width: 120,
                    height: 80,
                    objectFit: 'cover',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {selectedTemplate.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      size="small" 
                      label={selectedTemplate.category}
                      icon={getCategoryIcon(selectedTemplate.category)}
                      sx={{ 
                        backgroundColor: alpha(getCategoryColor(selectedTemplate.category), 0.1),
                        color: getCategoryColor(selectedTemplate.category)
                      }}
                    />
                    <Chip 
                      size="small" 
                      label={selectedTemplate.style}
                      sx={{ 
                        backgroundColor: alpha(getStyleColor(selectedTemplate.color), 0.1),
                        color: getStyleColor(selectedTemplate.color)
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      )}

      {/* Template Grid */}
      <Grid container spacing={3}>
        {filteredTemplates.map((template) => (
          <Grid item xs={6} sm={4} md={3} key={template.id}>
            <Zoom in={true} style={{ transitionDelay: '100ms' }}>
              <Card
                sx={{
                  height: 240,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  border: selectedTemplate?.id === template.id 
                    ? `2px solid ${theme.palette.primary.main}`
                    : '1px solid transparent',
                  opacity: disabled ? 0.6 : 1,
                  '&:hover': disabled ? {} : {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`
                  }
                }}
                onClick={() => !disabled && onTemplateSelect(template)}
              >
                {/* Template Image */}
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="100"
                    image={template.imageUrl}
                    alt={template.name}
                    onError={(e) => {
                      console.error(`Failed to load image: ${template.imageUrl}`);
                      console.error('Error details:', e);
                    }}
                    onLoad={() => {
                      console.log(`Successfully loaded image: ${template.imageUrl}`);
                    }}
                    sx={{
                      objectFit: 'cover',
                      filter: disabled ? 'grayscale(100%)' : 'none'
                    }}
                  />
                  
                  {/* Overlay Badges */}
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    left: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}>
                    {template.recommended && (
                      <Chip
                        icon={<Star />}
                        label="Recommended"
                        size="small"
                        color="warning"
                        sx={{ 
                          backgroundColor: alpha('#f59e0b', 0.9),
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    )}
                  </Box>

                  {/* Preview Button */}
                  {showPreview && (
                    <Box sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4
                    }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTemplate(template);
                        }}
                        sx={{
                          backgroundColor: alpha('#000', 0.7),
                          color: 'white',
                          width: 28,
                          height: 28,
                          '&:hover': {
                            backgroundColor: alpha('#000', 0.9),
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Box>
                  )}

                  {/* Selection Indicator */}
                  {selectedTemplate?.id === template.id && (
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <CheckCircle 
                        sx={{ 
                          fontSize: 48, 
                          color: theme.palette.primary.main,
                          backgroundColor: 'white',
                          borderRadius: '50%'
                        }} 
                      />
                    </Box>
                  )}
                </Box>

                {/* Template Info */}
                <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 120 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: '0.9rem' }}>
                    {template.name}
                  </Typography>
                  
                  {/* Category Tag */}
                  <Chip 
                    size="small" 
                    label={template.category}
                    icon={getCategoryIcon(template.category)}
                    sx={{ 
                      backgroundColor: alpha(getCategoryColor(template.category), 0.1),
                      color: getCategoryColor(template.category),
                      fontSize: '0.7rem',
                      height: 20,
                      mb: 2,
                      alignSelf: 'flex-start'
                    }}
                  />

                  {/* Select Button */}
                  <Button
                    variant={selectedTemplate?.id === template.id ? "contained" : "outlined"}
                    size="small"
                    fullWidth
                    disabled={disabled}
                    onClick={() => onTemplateSelect(template)}
                    sx={{
                      mt: 'auto',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      py: 0.5
                    }}
                  >
                    {selectedTemplate?.id === template.id ? '✓ Selected' : 'Select'}
                  </Button>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      {/* Preview Dialog */}
      <Dialog
        open={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        maxWidth="md"
        fullWidth
      >
        {previewTemplate && (
          <>
            <DialogTitle sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              pb: 1
            }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {previewTemplate.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {previewTemplate.description}
                </Typography>
              </Box>
              <IconButton onClick={() => setPreviewTemplate(null)}>
                <Close />
              </IconButton>
            </DialogTitle>
            
            <DialogContent>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box
                  component="img"
                  src={previewTemplate.imageUrl}
                  alt={previewTemplate.name}
                  sx={{
                    width: '100%',
                    maxHeight: 400,
                    objectFit: 'contain',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                />
              </Box>

              {/* Template Details */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Category & Style
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip 
                      label={previewTemplate.category}
                      icon={getCategoryIcon(previewTemplate.category)}
                      sx={{ 
                        backgroundColor: alpha(getCategoryColor(previewTemplate.category), 0.1),
                        color: getCategoryColor(previewTemplate.category)
                      }}
                    />
                    <Chip 
                      label={previewTemplate.style}
                      sx={{ 
                        backgroundColor: alpha(getStyleColor(previewTemplate.color), 0.1),
                        color: getStyleColor(previewTemplate.color)
                      }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Features
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {previewTemplate.features.map((feature, index) => (
                      <Typography key={index} variant="body2" color="text.secondary">
                        • {feature}
                      </Typography>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={() => setPreviewTemplate(null)}>
                Close
              </Button>
              <Button 
                variant="contained" 
                onClick={() => {
                  onTemplateSelect(previewTemplate);
                  setPreviewTemplate(null);
                }}
                disabled={disabled}
              >
                Select This Template
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CertificateTemplateSelector;
export { CERTIFICATE_TEMPLATES };
export type { CertificateTemplate };
