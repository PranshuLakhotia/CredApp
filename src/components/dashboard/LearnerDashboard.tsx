

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  LinearProgress,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Pagination,
} from '@mui/material';
import {
  School,
  Verified,
  Timeline,
  MoreVert,
  Search,
  ViewModule,
  ViewList,
  EmojiEvents,
  PeopleOutline,
  ArrowForward,
  Close,
  Download,
} from '@mui/icons-material';
import LearnerService, { LearnerCredential } from '@/services/learner.service';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);


// --- STATS placeholders; values computed from API ---
const baseStats = [
  { label: 'Total Credentials', key: 'total', icon: <School sx={{ fontSize: 28 }} />, bgColor: '#e8eaf6', iconColor: '#5c6bc0', note: 'from your account' },
  { label: 'Verified', key: 'verified', icon: <Verified sx={{ fontSize: 28 }} />, bgColor: '#e8f5e9', iconColor: '#66bb6a', note: 'credentials' },
  { label: 'Pending', key: 'pending', icon: <Timeline sx={{ fontSize: 28 }} />, bgColor: '#fff3e0', iconColor: '#ffa726', note: 'under review' },
];

const categories = [
  { label: 'All', color: '#fbbf24', active: true },
  { label: 'Academic', color: '#a78bfa' },
  { label: 'Technical', color: '#f87171' },
  { label: 'Co-Curricular', color: '#4ade80' },
  { label: 'Performing Arts', color: '#60a5fa' },
  { label: 'Others', color: '#94a3b8' },
];

// Profile impressions data
const impressionsData = [
  { time: "0:00", impressions: 160 },
  { time: "2:00", impressions: 140 },
  { time: "4:00", impressions: 180 },
  { time: "6:00", impressions: 120 },
  { time: "8:00", impressions: 115 },
  { time: "10:00", impressions: 140 },
  { time: "12:00", impressions: 100 },
  { time: "14:00", impressions: 110 },
  { time: "16:00", impressions: 90 },
];

// --- LINE CHART COMPONENT using Chart.js ---
const LineChart = () => {
  const chartData = {
    labels: impressionsData.map(d => d.time),
    datasets: [
      {
        label: 'Profile Impressions',
        data: impressionsData.map(d => d.impressions),
        fill: true,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 240);
          gradient.addColorStop(0, 'rgba(124, 77, 255, 0.15)');
          gradient.addColorStop(1, 'rgba(124, 77, 255, 0)');
          return gradient;
        },
        borderColor: '#7c4dff',
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#7c4dff',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#7c4dff',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#7c4dff',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `Impressions: ${context.parsed.y}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <Box sx={{ position: 'relative', height: 240, mt: 3 }}>
      <Line data={chartData} options={options} />
    </Box>
  );
};

// --- DONUT CHART COMPONENT using Chart.js ---
const DonutChart = () => {
  const chartData = {
    labels: [
      "Co-curricular",
      "Performing Arts",
      "Other",
      "Academics",
      "Technical",
    ],
    datasets: [
      {
        label: "Certificates",
        data: [15, 12, 8, 10, 3],
        backgroundColor: [
          "#8b5cf6", // purple
          "#ec4899", // pink
          "#06b6d4", // cyan
          "#f59e0b", // orange
          "#10b981", // green
        ],
        borderColor: "#ffffff",
        borderWidth: 3,
        hoverOffset: 10,
        hoverBorderWidth: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#7c4dff',
        borderWidth: 1,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
  };

  const totalCertificates = chartData.datasets[0].data.reduce((a, b) => a + b, 0);

  return (
    <Box sx={{ position: 'relative', width: 200, height: 200, mx: 'auto', my: 2 }}>
      <Doughnut data={chartData} options={options} />
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
        <Typography variant="h3" fontWeight={700} color="#1e293b">{totalCertificates}</Typography>
        <Typography variant="caption" color="text.secondary">In total</Typography>
      </Box>
    </Box>
  );
};

const BarChart = () => {
  const data = [
    { label: 'Python', value: 50, color: '#a5b4fc' },
    { label: 'Frontend', value: 78, color: '#7c4dff' },
    { label: 'Java', value: 95, color: '#1e293b' },
    { label: 'AI/ML', value: 70, color: '#7c4dff' },
    { label: 'Android', value: 48, color: '#a5b4fc' },
    { label: 'Other', value: 65, color: '#86efac' },
  ];
  const maxValue = 100;

  return (
    <Box sx={{ height: 200, display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', gap: 1.5, mt: 3, px: 2 }}>
      {data.map((item) => (
        <Box key={item.label} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', flex: 1 }}>
          <Box sx={{ width: '100%', maxWidth: 45, height: `${(item.value / maxValue) * 100}%`, bgcolor: item.color, borderRadius: '6px 6px 0 0' }} />
          <Typography variant="caption" mt={1} color="text.secondary" fontSize="0.7rem">
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// --- CREDENTIAL CARD COMPONENT (API-driven) ---
interface CredentialCardProps {
  credential: LearnerCredential;
  onViewDetails: (cred: LearnerCredential) => void;
  onDownload: (cred: LearnerCredential) => void;
}

const CredentialCard: React.FC<CredentialCardProps> = ({ credential, onViewDetails, onDownload }) => {
  const verified = (credential.status || '').toLowerCase() === 'verified';
  const issuedDate = credential.issued_date ? new Date(credential.issued_date).toLocaleDateString() : '-';
  
  return (
    <Card sx={{ 
      p: { xs: 2, sm: 3 }, 
      borderRadius: 2, 
      bgcolor: '#fafbfc', 
      boxShadow: 'none', 
      border: '1px solid #e5e7eb', 
      transition: 'all 0.2s', 
      '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transform: 'translateY(-2px)' },
      height: 'fit-content'
    }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'flex-start' }, 
        mb: 2,
        gap: { xs: 2, sm: 0 }
      }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={700} color="#1e293b" mb={1.5} sx={{ 
            fontSize: { xs: '1rem', sm: '1.125rem' },
            lineHeight: 1.3,
            wordBreak: 'break-word'
          }}>
            {credential.credential_title || '-'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={0.5} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            Issuer: {credential.issuer_name || '-'}
          </Typography>
          {credential.nsqf_level !== undefined && (
            <Typography variant="body2" color="text.secondary" mb={0.5} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              NSQF Level: {credential.nsqf_level}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" mb={2} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            Issued Date: {issuedDate}
          </Typography>
          {/* Skill tags */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {(credential.skill_tags || []).slice(0, 3).map((t) => (
              <Chip 
                key={t} 
                label={t} 
                size="small" 
                sx={{ 
                  bgcolor: '#eef2ff', 
                  color: '#4338ca',
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  height: { xs: 20, sm: 24 }
                }} 
              />
            ))}
          </Box>
        </Box>
        
        {/* QR Code or Icon */}
        <Box sx={{ 
          flexShrink: 0, 
          ml: { xs: 0, sm: 2 },
          alignSelf: { xs: 'center', sm: 'flex-start' }
        }}>
          {credential.qr_code_image ? (
            <Box 
              component="img" 
              src={`data:image/png;base64,${credential.qr_code_image}`}
              alt="QR Code"
              sx={{ 
                width: { xs: 48, sm: 64 }, 
                height: { xs: 48, sm: 64 }, 
                borderRadius: 1, 
                border: '1px solid #e5e7eb', 
                cursor: 'pointer' 
              }}
              onClick={() => onViewDetails(credential)}
            />
          ) : (
            <Box sx={{ 
              width: { xs: 48, sm: 64 }, 
              height: { xs: 48, sm: 64 }, 
              borderRadius: '50%', 
              bgcolor: '#ede9fe', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <EmojiEvents sx={{ fontSize: { xs: 28, sm: 36 }, color: '#7c4dff' }} />
            </Box>
          )}
        </Box>
      </Box>
      
      {verified && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
          <Verified sx={{ fontSize: { xs: 16, sm: 18 }, color: '#26c6da' }} />
          <Typography variant="body2" color="#26c6da" fontWeight={600} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            Verified
          </Typography>
        </Box>
      )}
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1, sm: 2 },
        alignItems: { xs: 'stretch', sm: 'center' }
      }}>
        <Button 
          variant="text" 
          size="small" 
          onClick={() => onViewDetails(credential)}
          sx={{ 
            color: '#7c4dff', 
            textTransform: 'none', 
            fontWeight: 600, 
            p: 0, 
            minWidth: 'auto',
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            justifyContent: { xs: 'center', sm: 'flex-start' }
          }}
        >
          View Details
        </Button>
        <Button 
          variant="text" 
          size="small"
          onClick={() => onDownload(credential)}
          sx={{ 
            color: '#64748b', 
            textTransform: 'none', 
            p: 0, 
            minWidth: 'auto',
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            justifyContent: { xs: 'center', sm: 'flex-start' }
          }}
        >
          Download
        </Button>
      </Box>
    </Card>
  );
};

// --- VIEW DETAILS MODAL ---
interface ViewDetailsModalProps {
  credential: LearnerCredential | null;
  open: boolean;
  onClose: () => void;
  onDownload: (cred: LearnerCredential) => void;
}

const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({ credential, open, onClose, onDownload }) => {
  if (!credential) return null;

  const issuedDate = credential.issued_date ? new Date(credential.issued_date).toLocaleDateString() : '-';
  const completionDate = credential.completion_date ? new Date(credential.completion_date).toLocaleDateString() : '-';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', pb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Credential Details
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '200px 1fr' }, gap: 3, mb: 4 }}>
          {/* QR Code */}
          {credential.qr_code_image && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box 
                component="img" 
                src={`data:image/png;base64,${credential.qr_code_image}`}
                alt="QR Code"
                sx={{ width: 180, height: 180, borderRadius: 2, border: '2px solid #e5e7eb', mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary" textAlign="center">
                Scan to verify
              </Typography>
            </Box>
          )}
          
          {/* Details Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Credential Title</Typography>
              <Typography variant="body1" fontWeight={600} mt={0.5}>{credential.credential_title || '-'}</Typography>
            </Box>
            
            <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Issuer</Typography>
              <Typography variant="body1" fontWeight={600} mt={0.5}>{credential.issuer_name || '-'}</Typography>
            </Box>
            
            <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Issue Date</Typography>
              <Typography variant="body2" mt={0.5}>{issuedDate}</Typography>
            </Box>
            
            <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Completion Date</Typography>
              <Typography variant="body2" mt={0.5}>{completionDate}</Typography>
            </Box>
            
            <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>NSQF Level</Typography>
              <Typography variant="body2" mt={0.5}>{credential.nsqf_level || '-'}</Typography>
            </Box>
            
            <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Type</Typography>
              <Typography variant="body2" mt={0.5}>{credential.credential_type || '-'}</Typography>
            </Box>
            
            <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Status</Typography>
              <Chip 
                label={credential.status || 'Unknown'} 
                size="small" 
                color={credential.status === 'verified' ? 'success' : 'warning'}
                sx={{ mt: 0.5 }}
              />
            </Box>
            
            <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Blockchain Status</Typography>
              <Chip 
                label={credential.blockchain_status || 'Unknown'} 
                size="small" 
                color={credential.blockchain_status === 'confirmed' ? 'success' : 'default'}
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Box>
        </Box>
        
        {/* Credential Hash */}
        {credential.credential_hash && (
          <Box sx={{ bgcolor: '#fef3c7', p: 3, borderRadius: 2, mb: 3, border: '1px solid #fde047' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Credential Hash</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all', mt: 1 }}>
              {credential.credential_hash}
            </Typography>
          </Box>
        )}
        
        {/* Skills */}
        {(credential.skill_tags && credential.skill_tags.length > 0) && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} mb={1.5}>Skills Certified</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {credential.skill_tags.map((skill) => (
                <Chip key={skill} label={skill} size="medium" sx={{ bgcolor: '#eef2ff', color: '#4338ca', fontWeight: 500 }} />
              ))}
            </Box>
          </Box>
        )}
        
        {/* Tags */}
        {(credential.tags && credential.tags.length > 0) && (
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1.5}>Tags</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {credential.tags.map((tag) => (
                <Chip key={tag} label={tag} size="medium" sx={{ bgcolor: '#ecfeff', color: '#0e7490', fontWeight: 500 }} />
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ borderTop: '1px solid #e5e7eb', p: 3, gap: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: '#64748b' }}>
          Close
        </Button>
        <Button 
          variant="contained" 
          startIcon={<Download />}
          onClick={() => onDownload(credential)}
          sx={{ textTransform: 'none', bgcolor: '#7c4dff', '&:hover': { bgcolor: '#6a3de8' } }}
        >
          Download Certificate
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// --- MAIN DASHBOARD COMPONENT ---
export default function LearnerDashboard() {
  const [credentials, setCredentials] = useState<LearnerCredential[]>([]);
  const [totalCredentials, setTotalCredentials] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCredential, setSelectedCredential] = useState<LearnerCredential | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);

  // Filter states
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string>('');
  const [issuer, setIssuer] = useState('');
  const [nsqfLevel, setNsqfLevel] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<'issued_date_desc' | 'issued_date_asc'>('issued_date_desc');
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);

  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(totalCredentials / limit);

  const total = credentials.length;
  const verifiedCount = credentials.filter(c => (c.status || '').toLowerCase() === 'verified').length;
  const pendingCount = Math.max(total - verifiedCount, 0);

  // top skills calculation (from skill_tags)
  const topSkills = React.useMemo(() => {
    const freq: Record<string, number> = {};
    credentials.forEach((c) => (c.skill_tags || []).forEach((t) => { freq[t] = (freq[t] || 0) + 1; }));
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [credentials]);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: any = { skip, limit };
      if (status) params.status = status;
      if (issuer) params.issuer = issuer;
      if (nsqfLevel) params.nsqf_level = nsqfLevel;
      
      const data = await LearnerService.getLearnerCredentials(params);
      let items = data.credentials || [];
      
      // Client-side search filter
      if (query.trim()) {
        const q = query.toLowerCase();
        items = items.filter((c) =>
          (c.credential_title || '').toLowerCase().includes(q) ||
          (c.issuer_name || '').toLowerCase().includes(q) ||
          (c.skill_tags || []).some(t => t.toLowerCase().includes(q)) ||
          (c.tags || []).some(t => t.toLowerCase().includes(q))
        );
      }
      
      // Sort by issued_date
      items.sort((a, b) => {
        const da = a.issued_date ? new Date(a.issued_date).getTime() : 0;
        const db = b.issued_date ? new Date(b.issued_date).getTime() : 0;
        return sortBy === 'issued_date_desc' ? db - da : da - db;
      });
      
      setCredentials(items);
      setTotalCredentials(data.total || items.length);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.response?.data?.message || e?.message || 'Failed to load credentials');
    } finally {
      setIsLoading(false);
    }
  }, [status, issuer, nsqfLevel, query, sortBy, skip, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const handleViewDetails = (credential: LearnerCredential) => {
    setSelectedCredential(credential);
    setViewDetailsOpen(true);
  };

  const handleDownload = async (credential: LearnerCredential) => {
    try {
      // TODO: Implement actual download functionality
      console.log('Download credential:', credential._id);
      alert('Download functionality will be implemented with PDF generation');
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleFilterChange = () => {
    setPage(1); // Reset to first page when filters change
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 2, sm: 3, md: 4 }, bgcolor: '#fafbfc', minHeight: '100vh' }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        mb: { xs: 3, sm: 4 },
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          color: '#1e293b',
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
        }}>
          Dashboard Overview
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          flexDirection: { xs: 'row', sm: 'row' },
          width: { xs: '100%', sm: 'auto' },
          justifyContent: { xs: 'space-between', sm: 'flex-end' }
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '0.875rem' } }}>
            Today
          </Typography>
          <Button 
            variant="contained" 
            sx={{ 
              bgcolor: '#7c4dff', 
              textTransform: 'none', 
              borderRadius: 2, 
              px: { xs: 2, sm: 3 }, 
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: '0.875rem', sm: '0.875rem' },
              '&:hover': { bgcolor: '#6a3de8' } 
            }}
          >
            Learner
          </Button>
        </Box>
      </Box>

      {error && (
        <Card sx={{ p: 2, mb: 2, border: '1px solid #fecaca', bgcolor: '#fef2f2', color: '#991b1b' }}>
          <Typography variant="body2">{error}</Typography>
        </Card>
      )}

      {/* Top Stats Cards Row (computed) */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: 'repeat(2, 1fr)', 
          md: 'repeat(3, 1fr)', 
          lg: 'repeat(4, 1fr)' 
        },
        gap: { xs: 2, sm: 2.5 },
        mb: { xs: 3, sm: 3 }
      }}>
        {baseStats.map((stat) => {
          const value = stat.key === 'total' ? totalCredentials : stat.key === 'verified' ? verifiedCount : pendingCount;
          return (
            <Card key={stat.label} sx={{ 
              p: { xs: 2, sm: 2.5 }, 
              borderRadius: 3, 
              bgcolor: stat.bgColor, 
              boxShadow: 'none',
              minHeight: { xs: '120px', sm: '140px' }
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                height: '100%'
              }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h3" fontWeight={700} color="#1e293b" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>
                    {isLoading ? '...' : value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    {stat.note}
                  </Typography>
                </Box>
                <Box sx={{ 
                  width: { xs: 40, sm: 48 }, 
                  height: { xs: 40, sm: 48 }, 
                  borderRadius: 2, 
                  bgcolor: 'rgba(255,255,255,0.7)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: stat.iconColor,
                  flexShrink: 0
                }}>
                  {React.cloneElement(stat.icon, { sx: { fontSize: { xs: 24, sm: 28 } } })}
                </Box>
              </Box>
            </Card>
          );
        })}
        <Card sx={{ 
          p: { xs: 2, sm: 2.5 }, 
          borderRadius: 3, 
          bgcolor: '#e3f2fd', 
          boxShadow: 'none',
          minHeight: { xs: '120px', sm: '140px' }
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            NSQF Progress
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={57} 
            sx={{ 
              height: { xs: 8, sm: 10 }, 
              borderRadius: 5, 
              bgcolor: '#bbdefb', 
              '& .MuiLinearProgress-bar': { bgcolor: '#1976d2', borderRadius: 5 } 
            }} 
          />
          <Typography variant="h6" pt={1} sx={{ 
            fontWeight: 700, 
            color: '#1e293b', 
            textAlign: 'right',
            fontSize: { xs: '1rem', sm: '1.25rem' }
          }}>
            Level 4/7
          </Typography>
        </Card>
      </Box>

      {/* Line Chart + Top Skills */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', lg: 'row' },
        gap: { xs: 2, sm: 3 }, 
        mb: { xs: 3, sm: 3 }
      }}>
        <Card sx={{ 
          flex: { xs: '1 1 100%', lg: '1 1 60%' }, 
          p: { xs: 2, sm: 3 }, 
          borderRadius: 3, 
          bgcolor: '#ffffff', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)' 
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            mb: 2,
            gap: { xs: 1, sm: 0 }
          }}>
            <Box>
              <Typography variant="body2" color="text.secondary" mb={0.5} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Total number of profile impressions
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="h3" fontWeight={700} color="#1e293b" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>
                  1,235
                </Typography>
                <Chip 
                  label="+3.4%" 
                  size="small" 
                  sx={{ 
                    bgcolor: '#dcfce7', 
                    color: '#16a34a', 
                    fontWeight: 600, 
                    height: { xs: 20, sm: 24 }, 
                    fontSize: { xs: '0.7rem', sm: '0.75rem' } 
                  }} 
                />
              </Box>
            </Box>
          </Box>
          <Box sx={{ position: 'relative', height: { xs: 200, sm: 240 }, mt: 3 }}>
            <LineChart />
          </Box>
        </Card>

        <Card sx={{ 
          flex: { xs: '1 1 100%', lg: '1 1 35%' }, 
          p: { xs: 2, sm: 3 }, 
          borderRadius: 3, 
          bgcolor: '#ffffff', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)' 
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2 
          }}>
            <Typography variant="h6" fontWeight={700} color="#1e293b" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Badges
            </Typography>
            <IconButton size="small">
              <ArrowForward fontSize="small" />
            </IconButton>
          </Box>
          <Typography variant="h2" fontWeight={700} color="#1e293b" textAlign="center" mt={2} sx={{ fontSize: { xs: '2rem', sm: '2.5rem' } }}>
            3
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: { xs: 2, sm: 3 }, 
            my: 3,
            flexWrap: 'wrap'
          }}>
            <Box sx={{ 
              width: { xs: 48, sm: 56 }, 
              height: { xs: 48, sm: 56 }, 
              borderRadius: '50%', 
              bgcolor: '#ede9fe', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              border: '3px solid #c4b5fd' 
            }}>
              <EmojiEvents sx={{ fontSize: { xs: 28, sm: 32 }, color: '#8b5cf6' }} />
            </Box>
            <Box sx={{ 
              width: { xs: 64, sm: 72 }, 
              height: { xs: 64, sm: 72 }, 
              borderRadius: '50%', 
              bgcolor: '#fef3c7', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              border: '4px solid #fbbf24' 
            }}>
              <EmojiEvents sx={{ fontSize: { xs: 36, sm: 42 }, color: '#f59e0b' }} />
            </Box>
            <Box sx={{ 
              width: { xs: 48, sm: 56 }, 
              height: { xs: 48, sm: 56 }, 
              borderRadius: '50%', 
              bgcolor: '#ede9fe', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              border: '3px solid #c4b5fd' 
            }}>
              <EmojiEvents sx={{ fontSize: { xs: 28, sm: 32 }, color: '#8b5cf6' }} />
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mb={0.5} sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
            Most Recent Badge
          </Typography>
          <Typography variant="body1" fontWeight={600} sx={{ color: '#1e293b', textAlign: 'center', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Reinforcement Learning
          </Typography>
        </Card>
      </Box>

      {/* Certificate Distribution + Top Skills Row */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', lg: 'row' },
        gap: { xs: 2, sm: 3 }, 
        mb: { xs: 3, sm: 4 }
      }}>
        <Card sx={{ 
          flex: 1, 
          p: { xs: 2, sm: 3 }, 
          borderRadius: 3, 
          bgcolor: '#ffffff', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)' 
        }}>
          <Typography variant="h6" fontWeight={700} mb={1} color="#1e293b" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Certificate Distribution
          </Typography>
          <Box sx={{ 
            position: 'relative', 
            width: { xs: 150, sm: 200 }, 
            height: { xs: 150, sm: 200 }, 
            mx: 'auto', 
            my: 2 
          }}>
            <DonutChart />
          </Box>
        </Card>

        <Card sx={{ 
          flex: 1, 
          p: { xs: 2, sm: 3 }, 
          borderRadius: 3, 
          bgcolor: '#ffffff', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)' 
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Typography variant="h6" fontWeight={700} color="#1e293b" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Top Skills
            </Typography>
            <IconButton size="small">
              <ArrowForward fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            flexWrap: 'wrap',
            mt: 2
          }}>
            {topSkills.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '0.875rem' } }}>
                No skills found.
              </Typography>
            ) : (
              topSkills.map(([skill, count]) => (
                <Chip 
                  key={skill} 
                  label={`${skill} (${count})`} 
                  size="small" 
                  sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    height: { xs: 24, sm: 28 }
                  }}
                />
              ))
            )}
          </Box>
        </Card>
      </Box>

      {/* My Credentials Section */}
      <Box>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          mb: { xs: 2, sm: 3 },
          gap: { xs: 2, sm: 0 }
        }}>
          <Typography variant="h5" fontWeight={700} color="#1e293b" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            My Credentials
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" sx={{ bgcolor: '#f1f5f9' }}>
              <ViewModule fontSize="small" />
            </IconButton>
            <IconButton size="small">
              <ViewList fontSize="small" />
            </IconButton>
            <IconButton size="small">
              <MoreVert fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Search, Filter, Sort Bar */}
        <Box sx={{ 
          bgcolor: '#fafbfc', 
          p: { xs: 2, sm: 2.5 }, 
          borderRadius: 2, 
          mb: { xs: 2, sm: 3 }, 
          border: '1px solid #e5e7eb' 
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', lg: 'row' },
            alignItems: { xs: 'stretch', lg: 'center' }, 
            gap: { xs: 2, lg: 2 }, 
            mb: { xs: 2, lg: 2 }
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              justifyContent: { xs: 'center', sm: 'flex-start' }
            }}>
              <PeopleOutline sx={{ color: '#64748b' }} />
              <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                {isLoading ? 'Loading...' : `${totalCredentials} Certificate${totalCredentials === 1 ? '' : 's'} Found`}
              </Typography>
            </Box>
            
            {/* Search and Filters Row */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 2 },
              flex: 1,
              alignItems: { xs: 'stretch', sm: 'center' }
            }}>
              <TextField
                size="small"
                placeholder="Search Skills, Tags, Title, Issuer"
                value={query}
                onChange={(e) => { setQuery(e.target.value); handleFilterChange(); }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#94a3b8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  flex: { xs: '1 1 100%', sm: '1 1 auto' },
                  bgcolor: '#ffffff', 
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                  minWidth: { xs: '100%', sm: 280 }
                }}
              />
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 2 },
                flex: { xs: '1 1 100%', sm: '0 0 auto' }
              }}>
                <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 } }}>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select 
                    labelId="status-label" 
                    label="Status" 
                    value={status} 
                    onChange={(e) => { setStatus(e.target.value); handleFilterChange(); }}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="verified">Verified</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="blockchain_pending">Blockchain Pending</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField 
                  size="small" 
                  label="Issuer" 
                  value={issuer} 
                  onChange={(e) => { setIssuer(e.target.value); handleFilterChange(); }} 
                  sx={{ 
                    width: { xs: '100%', sm: 180 }, 
                    bgcolor: '#ffffff', 
                    '& .MuiOutlinedInput-root': { borderRadius: 2 } 
                  }} 
                />
                
                <TextField 
                  size="small" 
                  label="NSQF" 
                  type="number" 
                  value={nsqfLevel} 
                  onChange={(e) => { const v = e.target.value; setNsqfLevel(v === '' ? '' : Number(v)); handleFilterChange(); }} 
                  sx={{ 
                    width: { xs: '100%', sm: 100 }, 
                    bgcolor: '#ffffff', 
                    '& .MuiOutlinedInput-root': { borderRadius: 2 } 
                  }} 
                />
                
                <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 170 } }}>
                  <InputLabel id="sort-label">Sort</InputLabel>
                  <Select 
                    labelId="sort-label" 
                    label="Sort" 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as any)}
                  >
                    <MenuItem value="issued_date_desc">Newest First</MenuItem>
                    <MenuItem value="issued_date_asc">Oldest First</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Credentials Grid - Responsive */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              lg: 'repeat(3, 1fr)' 
            },
            gap: { xs: 2, sm: 3 },
            mb: { xs: 3, sm: 4 }
          }}
        >
          {isLoading ? (
            <Card sx={{ p: 3, gridColumn: '1 / -1', textAlign: 'center' }}>
              <CircularProgress />
              <Typography mt={2} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Loading credentials...</Typography>
            </Card>
          ) : credentials.length === 0 ? (
            <Card sx={{ p: 3, gridColumn: '1 / -1' }}>
              <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>No credentials found.</Typography>
            </Card>
          ) : (
            credentials.map((cred) => (
              <CredentialCard 
                key={cred._id} 
                credential={cred}
                onViewDetails={handleViewDetails}
                onDownload={handleDownload}
              />
            ))
          )}
        </Box>

        {/* Pagination */}
        {!isLoading && credentials.length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'center', 
            alignItems: 'center', 
            mt: 4, 
            gap: { xs: 2, sm: 2 }, 
            flexWrap: 'wrap' 
          }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
              size={window.innerWidth < 600 ? "small" : "medium"}
              sx={{ 
                '& .MuiPaginationItem-root': { 
                  fontWeight: 600,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                },
                '& .Mui-selected': {
                  bgcolor: '#7c4dff !important',
                  color: 'white'
                }
              }}
            />
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 }, maxWidth: { xs: '200px', sm: 'none' } }}>
              <InputLabel>Per Page</InputLabel>
              <Select 
                value={limit} 
                label="Per Page"
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              >
                <MenuItem value={9}>9 per page</MenuItem>
                <MenuItem value={12}>12 per page</MenuItem>
                <MenuItem value={18}>18 per page</MenuItem>
                <MenuItem value={24}>24 per page</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
      </Box>

      {/* View Details Modal */}
      <ViewDetailsModal
        credential={selectedCredential}
        open={viewDetailsOpen}
        onClose={() => setViewDetailsOpen(false)}
        onDownload={handleDownload}
      />
    </Box>
  );
}
