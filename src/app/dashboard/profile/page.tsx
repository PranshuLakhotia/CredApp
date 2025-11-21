'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Modal,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { Edit as EditIcon, Email as EmailIcon } from '@mui/icons-material';
import ChangePasswordModal from '@/components/profile/ChangePasswordModal';
import { AuthService } from '@/services/auth.service';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileOverviewPage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    fullName: '',
    nickName: '',
    gender: '',
    country: '',
    language: '',
    timeZone: '',
    email: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postal_code: ''
    } as {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postal_code?: string;
    } | null,
    preferred_nsqf_level: 0,
    skills: [] as string[],
    education: '',
    experience: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await AuthService.getUserProfile();
        setProfileData(prev => ({
          ...prev,
          fullName: data.full_name || '',
          email: data.email || '',
          gender: data.gender || '',
          phoneNumber: data.phone_number || '',
          address: data.address || {
            street: '',
            city: '',
            state: '',
            country: '',
            postal_code: ''
          },
          preferred_nsqf_level: data.preferred_nsqf_level || 0,
          skills: data.skills || [],
          education: data.education || '',
          experience: data.experience || '',
        }));
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const payload = {
        full_name: profileData.fullName || undefined,
        phone_number: profileData.phoneNumber || undefined,
        address: profileData.address
          ? {
            street: profileData.address.street || undefined,
            city: profileData.address.city || undefined,
            state: profileData.address.state || undefined,
            country: profileData.address.country || undefined,
            postal_code: profileData.address.postal_code || undefined,
          }
          : null,
        preferred_nsqf_level: profileData.preferred_nsqf_level || undefined,
        skills: profileData.skills || undefined,
        education: profileData.education || undefined,
        experience: profileData.experience || undefined,
      } as any;
      const updated = await AuthService.updateUserProfile(payload);
      setProfileData(prev => ({
        ...prev,
        fullName: updated.full_name || prev.fullName,
        email: updated.email || prev.email,
        gender: updated.gender || prev.gender,
        phoneNumber: updated.phone_number || prev.phoneNumber,
        address: updated.address || prev.address,
        preferred_nsqf_level: updated.preferred_nsqf_level || prev.preferred_nsqf_level,
        skills: updated.skills || prev.skills,
        education: updated.education || prev.education,
        experience: updated.experience || prev.experience,
      }));
      setIsEditing(false);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await AuthService.deleteAccount();
      // Clear tokens and redirect to login page
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/auth/login';
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to delete account');
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field: 'street' | 'city' | 'state' | 'country' | 'postal_code', value: string) => {
    setProfileData(prev => ({
      ...prev,
      address: {
        ...(prev.address || {}),
        [field]: value,
      },
    }));
  };

  return (
    <DashboardLayout title="User Profile" role={user?.role}>
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-0.025em' }}>
            User Profile
          </Typography>
          {error && (
            <Typography color="error" variant="body2" sx={{ mr: 2 }}>
              {error}
            </Typography>
          )}
          <Button
            variant={isEditing ? 'contained' : 'outlined'}
            onClick={isEditing ? handleSave : handleEdit}
            sx={{
              textTransform: 'none',
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontWeight: 600,
              fontSize: '0.95rem',
              ...(isEditing ? {
                bgcolor: '#3b82f6',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                '&:hover': {
                  bgcolor: '#2563eb',
                  boxShadow: '0 6px 16px rgba(59, 130, 246, 0.5)',
                }
              } : {
                borderColor: '#3b82f6',
                color: '#3b82f6',
                borderWidth: 2,
                '&:hover': {
                  borderColor: '#2563eb',
                  bgcolor: 'rgba(59, 130, 246, 0.05)',
                }
              })
            }}
          >
            {isEditing ? 'Save Changes' : 'Edit'}
          </Button>
        </Box>

        {/* Profile Card */}
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 4,
            mb: 4,
            border: '1px solid #e2e8f0',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Profile Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 5 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                sx={{
                  width: 140,
                  height: 140,
                  fontSize: '2.5rem',
                  fontWeight: 600,
                  bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: '4px solid white',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                }}
                src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face"
              >
                MI
              </Avatar>
              {isEditing && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
                    '&:hover': {
                      bgcolor: '#2563eb',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <EditIcon sx={{ color: 'white', fontSize: 18 }} />
                </Box>
              )}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#0f172a' }}>
                {profileData.fullName}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3, fontWeight: 400 }}>
                {profileData.email}
              </Typography>
              {isEditing && (
                <Button
                  variant="outlined"
                  size="medium"
                  sx={{
                    textTransform: 'none',
                    borderRadius: 3,
                    px: 3,
                    py: 1,
                    borderColor: '#e2e8f0',
                    color: '#64748b',
                    fontWeight: 500,
                    '&:hover': {
                      borderColor: '#3b82f6',
                      color: '#3b82f6',
                      bgcolor: 'rgba(59, 130, 246, 0.05)'
                    }
                  }}
                >
                  Change Photo
                </Button>
              )}
            </Box>
          </Box>

          {/* Profile Form */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {/* Full Name */}
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="Full Name"
                value={profileData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                disabled={!isEditing}
                placeholder="Your First Name"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isEditing ? 'white' : '#f8fafc',
                    borderRadius: 3,
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: isEditing ? '#3b82f6' : '#e2e8f0',
                      }
                    },
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3b82f6',
                        borderWidth: 2,
                      }
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontWeight: 500,
                    color: '#64748b',
                    '&.Mui-focused': {
                      color: '#3b82f6',
                    }
                  }
                }}
              />
            </Box>

            {/* Nick Name */}
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="Nick Name"
                value={profileData.nickName}
                onChange={(e) => handleInputChange('nickName', e.target.value)}
                disabled={!isEditing}
                placeholder="Your First Name"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isEditing ? 'white' : '#f8fafc',
                  }
                }}
              />
            </Box>

            {/* Phone Number */}
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="Phone Number"
                value={profileData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                disabled={!isEditing}
                placeholder="e.g. +1234567890"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isEditing ? 'white' : '#f8fafc',
                  }
                }}
              />
            </Box>

            {/* Gender */}
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <FormControl fullWidth disabled={!isEditing}>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={profileData.gender}
                  label="Gender"
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  sx={{
                    backgroundColor: isEditing ? 'white' : '#f8fafc',
                  }}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                  <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Country */}
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <FormControl fullWidth disabled={!isEditing}>
                <InputLabel>Country</InputLabel>
                <Select
                  value={profileData.country}
                  label="Country"
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  sx={{
                    backgroundColor: isEditing ? 'white' : '#f8fafc',
                  }}
                >
                  <MenuItem value="us">United States</MenuItem>
                  <MenuItem value="uk">United Kingdom</MenuItem>
                  <MenuItem value="ca">Canada</MenuItem>
                  <MenuItem value="au">Australia</MenuItem>
                  <MenuItem value="in">India</MenuItem>
                  <MenuItem value="de">Germany</MenuItem>
                  <MenuItem value="fr">France</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Language */}
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <FormControl fullWidth disabled={!isEditing}>
                <InputLabel>Language</InputLabel>
                <Select
                  value={profileData.language}
                  label="Language"
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  sx={{
                    backgroundColor: isEditing ? 'white' : '#f8fafc',
                  }}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                  <MenuItem value="hi">Hindi</MenuItem>
                  <MenuItem value="zh">Chinese</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Time Zone */}
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <FormControl fullWidth disabled={!isEditing}>
                <InputLabel>Time Zone</InputLabel>
                <Select
                  value={profileData.timeZone}
                  label="Time Zone"
                  onChange={(e) => handleInputChange('timeZone', e.target.value)}
                  sx={{
                    backgroundColor: isEditing ? 'white' : '#f8fafc',
                  }}
                >
                  <MenuItem value="utc-12">UTC-12:00</MenuItem>
                  <MenuItem value="utc-8">UTC-08:00 (PST)</MenuItem>
                  <MenuItem value="utc-5">UTC-05:00 (EST)</MenuItem>
                  <MenuItem value="utc+0">UTC+00:00 (GMT)</MenuItem>
                  <MenuItem value="utc+1">UTC+01:00 (CET)</MenuItem>
                  <MenuItem value="utc+5:30">UTC+05:30 (IST)</MenuItem>
                  <MenuItem value="utc+8">UTC+08:00 (CST)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Address - Street */}
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="Street"
                value={profileData.address?.street || ''}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                disabled={!isEditing}
                placeholder="123 Main St"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isEditing ? 'white' : '#f8fafc',
                  }
                }}
              />
            </Box>
            {/* Address - City */}
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="City"
                value={profileData.address?.city || ''}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                disabled={!isEditing}
                placeholder="Boston"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isEditing ? 'white' : '#f8fafc',
                  }
                }}
              />
            </Box>
            {/* Address - State */}
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="State"
                value={profileData.address?.state || ''}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                disabled={!isEditing}
                placeholder="MA"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isEditing ? 'white' : '#f8fafc',
                  }
                }}
              />
            </Box>
            {/* Address - Postal Code */}
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="Postal Code"
                value={profileData.address?.postal_code || ''}
                onChange={(e) => handleAddressChange('postal_code', e.target.value)}
                disabled={!isEditing}
                placeholder="02101"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isEditing ? 'white' : '#f8fafc',
                  }
                }}
              />
            </Box>
            {/* Address - Country */}
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="Address Country"
                value={profileData.address?.country || ''}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                disabled={!isEditing}
                placeholder="USA"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isEditing ? 'white' : '#f8fafc',
                  }
                }}
              />
            </Box>

            {/* Preferred NSQF Level */}
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <FormControl fullWidth disabled={!isEditing}>
                <InputLabel>Preferred NSQF Level</InputLabel>
                <Select
                  value={profileData.preferred_nsqf_level || ''}
                  label="Preferred NSQF Level"
                  onChange={(e) => handleInputChange('preferred_nsqf_level', e.target.value)}
                  sx={{
                    backgroundColor: isEditing ? 'white' : '#f8fafc',
                  }}
                >
                  {[1, 2, 3, 4, 4.5, 5, 5.5, 6, 7, 8, 9, 10].map(level => (
                    <MenuItem key={level} value={level}>{level}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Skills */}
            <Box sx={{ flex: '1 1 100%', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="Skills (comma-separated)"
                value={Array.isArray(profileData.skills) ? profileData.skills.join(', ') : ''}
                onChange={(e) => handleInputChange('skills', e.target.value.split(',').map(s => s.trim()))}
                disabled={!isEditing}
                placeholder="e.g., Python, Data Analysis, Project Management"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isEditing ? 'white' : '#f8fafc',
                  }
                }}
              />
            </Box>

            {/* Education */}
            <Box sx={{ flex: '1 1 100%', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="Education"
                value={profileData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., B.Sc. in Computer Science"
                variant="outlined"
                multiline
                rows={2}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isEditing ? 'white' : '#f8fafc',
                  }
                }}
              />
            </Box>

            {/* Experience */}
            <Box sx={{ flex: '1 1 100%', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="Professional Experience"
                value={profileData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., Software Engineer at XYZ Corp (2 years)"
                variant="outlined"
                multiline
                rows={4}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isEditing ? 'white' : '#f8fafc',
                  }
                }}
              />
            </Box>
          </Box>
        </Paper>

        {/* Email Section */}
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 4,
            border: '1px solid #e2e8f0',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, color: '#0f172a' }}>
            My email Address
          </Typography>

          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            mb: 4,
            p: 3,
            borderRadius: 3,
            bgcolor: 'white',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}>
              <EmailIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#0f172a', mb: 0.5 }}>
                {profileData.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Added 1 month ago
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Button
              variant="text"
              sx={{
                textTransform: 'none',
                color: '#3b82f6',
                fontWeight: 600,
                fontSize: '0.95rem',
                px: 3,
                py: 1.5,
                borderRadius: 3,
                '&:hover': {
                  bgcolor: 'rgba(59, 130, 246, 0.08)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease'
              }}
            >
              + Add Email Address
            </Button>
            <Button
              variant="contained"
              onClick={() => setShowPasswordModal(true)}
              sx={{
                textTransform: 'none',
                bgcolor: '#3b82f6',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.95rem',
                px: 4,
                py: 1.5,
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                '&:hover': {
                  bgcolor: '#2563eb',
                  boxShadow: '0 6px 16px rgba(59, 130, 246, 0.5)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease'
              }}
            >
              Change Password
            </Button>
          </Box>
        </Paper>

        {/* Danger Zone */}
        <Paper
          elevation={0}
          sx={{
            marginTop: 4,
            p: 5,
            borderRadius: 4,
            border: '1px solid #fee2e2',
            background: 'linear-gradient(135deg, #fff1f2 0%, #ffffff 100%)',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#991b1b' }}>
            Danger Zone
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: '#7f1d1d' }}>
            Deleting your account is irreversible. All your data will be permanently removed and cannot be recovered.
          </Typography>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setShowDeleteDialog(true)}
            sx={{
              textTransform: 'none',
              borderWidth: 2,
            }}
          >
            Delete Account
          </Button>
        </Paper>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
        >
          <DialogTitle>Confirm Account Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This action is permanent and cannot be undone. Type DELETE to confirm.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              fullWidth
              label="Type DELETE to confirm"
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button
              color="error"
              variant="contained"
              onClick={handleDeleteAccount}
              disabled={confirmText !== 'DELETE' || isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Change Password Modal */}
        <ChangePasswordModal
          open={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />
      </Box>
    </DashboardLayout>
  );
}
