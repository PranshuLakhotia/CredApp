'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  Close,
  Work,
  LocationOn,
  AttachMoney,
  Schedule,
  People,
  Add,
  Delete,
  BusinessCenter,
  School,
  Star
} from '@mui/icons-material';

interface JobPostingData {
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  experience_level: 'entry' | 'mid' | 'senior' | 'executive';
  salary_range: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills_required: string[];
  benefits: string[];
  application_deadline: string;
  remote_friendly: boolean;
  urgent: boolean;
}

interface PostJobModalProps {
  open: boolean;
  onClose: () => void;
  onJobPosted: (job: any) => void;
}

const PostJobModal: React.FC<PostJobModalProps> = ({ open, onClose, onJobPosted }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [jobData, setJobData] = useState<JobPostingData>({
    title: '',
    company: '',
    location: '',
    type: 'full-time',
    experience_level: 'mid',
    salary_range: {
      min: 0,
      max: 0,
      currency: 'INR'
    },
    description: '',
    requirements: [''],
    responsibilities: [''],
    skills_required: [],
    benefits: [''],
    application_deadline: '',
    remote_friendly: false,
    urgent: false
  });

  // Common skills for autocomplete
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'TypeScript', 'SQL', 'MongoDB',
    'AWS', 'Docker', 'Kubernetes', 'Git', 'HTML', 'CSS', 'Angular', 'Vue.js',
    'Machine Learning', 'Data Analysis', 'Project Management', 'Agile', 'Scrum',
    'UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Marketing', 'Sales',
    'Communication', 'Leadership', 'Problem Solving', 'Team Management'
  ];

  const handleInputChange = (field: keyof JobPostingData, value: any) => {
    setJobData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSalaryChange = (field: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0;
    setJobData(prev => ({
      ...prev,
      salary_range: {
        ...prev.salary_range,
        [field]: numValue
      }
    }));
  };

  const addListItem = (field: 'requirements' | 'responsibilities' | 'benefits') => {
    setJobData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateListItem = (field: 'requirements' | 'responsibilities' | 'benefits', index: number, value: string) => {
    setJobData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeListItem = (field: 'requirements' | 'responsibilities' | 'benefits', index: number) => {
    setJobData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Filter out empty strings from arrays
      const cleanedData = {
        ...jobData,
        requirements: jobData.requirements.filter(req => req.trim() !== ''),
        responsibilities: jobData.responsibilities.filter(resp => resp.trim() !== ''),
        benefits: jobData.benefits.filter(benefit => benefit.trim() !== ''),
        skills_required: jobData.skills_required
      };

      // Validate required fields
      if (!cleanedData.title || !cleanedData.company || !cleanedData.description) {
        throw new Error('Please fill in all required fields');
      }

      // Here you would make the API call to post the job
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newJob = {
        id: Date.now().toString(),
        ...cleanedData,
        posted_date: new Date().toISOString(),
        status: 'active',
        applications_count: 0
      };

      setSuccess(true);
      onJobPosted(newJob);
      
      setTimeout(() => {
        onClose();
        setSuccess(false);
        // Reset form
        setJobData({
          title: '',
          company: '',
          location: '',
          type: 'full-time',
          experience_level: 'mid',
          salary_range: { min: 0, max: 0, currency: 'INR' },
          description: '',
          requirements: [''],
          responsibilities: [''],
          skills_required: [],
          benefits: [''],
          application_deadline: '',
          remote_friendly: false,
          urgent: false
        });
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2,
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Work sx={{ color: 'white', fontSize: '24px' }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
              Post New Job
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
              Create a job posting to attract top talent
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#666' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
            Job posted successfully! 🎉
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: '12px', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessCenter sx={{ color: '#667eea' }} />
                  Basic Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Job Title *"
                      value={jobData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g. Senior Frontend Developer"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company Name *"
                      value={jobData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="e.g. Tech Solutions Inc."
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={jobData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g. Mumbai, India"
                      variant="outlined"
                      InputProps={{
                        startAdornment: <LocationOn sx={{ color: '#666', mr: 1 }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Application Deadline"
                      type="date"
                      value={jobData.application_deadline}
                      onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Job Details */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: '12px', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule sx={{ color: '#667eea' }} />
                  Job Details
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Job Type</InputLabel>
                      <Select
                        value={jobData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        label="Job Type"
                      >
                        <MenuItem value="full-time">Full Time</MenuItem>
                        <MenuItem value="part-time">Part Time</MenuItem>
                        <MenuItem value="contract">Contract</MenuItem>
                        <MenuItem value="internship">Internship</MenuItem>
                        <MenuItem value="remote">Remote</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Experience Level</InputLabel>
                      <Select
                        value={jobData.experience_level}
                        onChange={(e) => handleInputChange('experience_level', e.target.value)}
                        label="Experience Level"
                      >
                        <MenuItem value="entry">Entry Level</MenuItem>
                        <MenuItem value="mid">Mid Level</MenuItem>
                        <MenuItem value="senior">Senior Level</MenuItem>
                        <MenuItem value="executive">Executive</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Min Salary"
                      type="number"
                      value={jobData.salary_range.min || ''}
                      onChange={(e) => handleSalaryChange('min', e.target.value)}
                      placeholder="50000"
                      variant="outlined"
                      InputProps={{
                        startAdornment: <AttachMoney sx={{ color: '#666' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Max Salary"
                      type="number"
                      value={jobData.salary_range.max || ''}
                      onChange={(e) => handleSalaryChange('max', e.target.value)}
                      placeholder="100000"
                      variant="outlined"
                      InputProps={{
                        startAdornment: <AttachMoney sx={{ color: '#666' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Currency</InputLabel>
                      <Select
                        value={jobData.salary_range.currency}
                        onChange={(e) => handleInputChange('salary_range', { ...jobData.salary_range, currency: e.target.value })}
                        label="Currency"
                      >
                        <MenuItem value="INR">INR</MenuItem>
                        <MenuItem value="USD">USD</MenuItem>
                        <MenuItem value="EUR">EUR</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Job Description */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: '12px', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Job Description *
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Describe the role, company culture, and what makes this opportunity exciting"
                  value={jobData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  variant="outlined"
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Skills Required */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: '12px', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star sx={{ color: '#667eea' }} />
                  Skills Required
                </Typography>
                <Autocomplete
                  multiple
                  options={commonSkills}
                  value={jobData.skills_required}
                  onChange={(_, newValue) => handleInputChange('skills_required', newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        {...getTagProps({ index })}
                        key={index}
                        sx={{ borderRadius: '20px' }}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select or type skills"
                      placeholder="e.g. JavaScript, React, Node.js"
                    />
                  )}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Requirements */}
          <Grid item xs={12} sm={6}>
            <Card sx={{ borderRadius: '12px', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <School sx={{ color: '#667eea' }} />
                    Requirements
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Add />}
                    onClick={() => addListItem('requirements')}
                    sx={{ borderRadius: '20px' }}
                  >
                    Add
                  </Button>
                </Box>
                {jobData.requirements.map((req, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={req}
                      onChange={(e) => updateListItem('requirements', index, e.target.value)}
                      placeholder="e.g. Bachelor's degree in Computer Science"
                    />
                    {jobData.requirements.length > 1 && (
                      <IconButton
                        size="small"
                        onClick={() => removeListItem('requirements', index)}
                        sx={{ color: '#f44336' }}
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Responsibilities */}
          <Grid item xs={12} sm={6}>
            <Card sx={{ borderRadius: '12px', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <People sx={{ color: '#667eea' }} />
                    Responsibilities
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Add />}
                    onClick={() => addListItem('responsibilities')}
                    sx={{ borderRadius: '20px' }}
                  >
                    Add
                  </Button>
                </Box>
                {jobData.responsibilities.map((resp, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={resp}
                      onChange={(e) => updateListItem('responsibilities', index, e.target.value)}
                      placeholder="e.g. Develop and maintain web applications"
                    />
                    {jobData.responsibilities.length > 1 && (
                      <IconButton
                        size="small"
                        onClick={() => removeListItem('responsibilities', index)}
                        sx={{ color: '#f44336' }}
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Benefits */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: '12px', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Benefits & Perks
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Add />}
                    onClick={() => addListItem('benefits')}
                    sx={{ borderRadius: '20px' }}
                  >
                    Add
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {jobData.benefits.map((benefit, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={benefit}
                          onChange={(e) => updateListItem('benefits', index, e.target.value)}
                          placeholder="e.g. Health insurance, Flexible working hours"
                        />
                        {jobData.benefits.length > 1 && (
                          <IconButton
                            size="small"
                            onClick={() => removeListItem('benefits', index)}
                            sx={{ color: '#f44336' }}
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
        <Button 
          onClick={onClose} 
          sx={{ 
            borderRadius: '25px',
            px: 3,
            color: '#666'
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            borderRadius: '25px',
            px: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            }
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
              Posting...
            </>
          ) : (
            'Post Job'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PostJobModal;
