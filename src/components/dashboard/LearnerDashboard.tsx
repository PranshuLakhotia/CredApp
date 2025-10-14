

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
    <Card sx={{ p: 3, borderRadius: 2, bgcolor: '#fafbfc', boxShadow: 'none', border: '1px solid #e5e7eb', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transform: 'translateY(-2px)' } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={700} color="#1e293b" mb={1.5}>
            {credential.credential_title || '-'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={0.5}>
            Issuer: {credential.issuer_name || '-'}
          </Typography>
          {credential.nsqf_level !== undefined && (
            <Typography variant="body2" color="text.secondary" mb={0.5}>
              NSQF Level: {credential.nsqf_level}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" mb={2}>
            Issued Date: {issuedDate}
          </Typography>
          {/* Skill tags */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {(credential.skill_tags || []).slice(0, 3).map((t) => (
              <Chip key={t} label={t} size="small" sx={{ bgcolor: '#eef2ff', color: '#4338ca' }} />
            ))}
          </Box>
        </Box>
        
        {/* QR Code or Icon */}
        <Box sx={{ flexShrink: 0, ml: 2 }}>
          {credential.qr_code_image ? (
            <Box 
              component="img" 
              src={`data:image/png;base64,${credential.qr_code_image}`}
              alt="QR Code"
              sx={{ width: 64, height: 64, borderRadius: 1, border: '1px solid #e5e7eb', cursor: 'pointer' }}
              onClick={() => onViewDetails(credential)}
            />
          ) : (
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmojiEvents sx={{ fontSize: 36, color: '#7c4dff' }} />
            </Box>
          )}
        </Box>
      </Box>
      
      {verified && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
          <Verified sx={{ fontSize: 18, color: '#26c6da' }} />
          <Typography variant="body2" color="#26c6da" fontWeight={600}>
            Verified
          </Typography>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant="text" 
          size="small" 
          onClick={() => onViewDetails(credential)}
          sx={{ color: '#7c4dff', textTransform: 'none', fontWeight: 600, p: 0, minWidth: 'auto' }}
        >
          View Details
        </Button>
        <Button 
          variant="text" 
          size="small"
          onClick={() => onDownload(credential)}
          sx={{ color: '#64748b', textTransform: 'none', p: 0, minWidth: 'auto' }}
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
    <Box sx={{ px: { xs: 2, md: 4 }, py: 4, bgcolor: '#fafbfc', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
          Dashboard Overview
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Today
          </Typography>
          <Button variant="contained" sx={{ bgcolor: '#7c4dff', textTransform: 'none', borderRadius: 2, px: 3, '&:hover': { bgcolor: '#6a3de8' } }}>
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
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, mb: 3 }}>
        {baseStats.map((stat) => {
          const value = stat.key === 'total' ? totalCredentials : stat.key === 'verified' ? verifiedCount : pendingCount;
          return (
            <Card key={stat.label} sx={{ flex: '1 1 220px', p: 2.5, borderRadius: 3, bgcolor: stat.bgColor, boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h3" fontWeight={700} color="#1e293b">
                    {isLoading ? '...' : value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.note}
                  </Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.iconColor }}>
                  {stat.icon}
                </Box>
              </Box>
            </Card>
          );
        })}
        <Card sx={{ flex: '1 1 300px', p: 2.5, borderRadius: 3, bgcolor: '#e3f2fd', boxShadow: 'none' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1.5 }}>
            NSQF Progress
          </Typography>
          <LinearProgress variant="determinate" value={57} sx={{ height: 10, borderRadius: 5, bgcolor: '#bbdefb', '& .MuiLinearProgress-bar': { bgcolor: '#1976d2', borderRadius: 5 } }} />
          <Typography variant="h6" pt={1} sx={{ fontWeight: 700, color: '#1e293b', textAlign: 'right' }}>
            Level 4/7
          </Typography>
        </Card>
      </Box>

      {/* Line Chart + Top Skills */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
        <Card sx={{ flex: '1 1 60%', p: 3, borderRadius: 3, bgcolor: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                Total number of profile impressions
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h3" fontWeight={700} color="#1e293b">
                  1,235
                </Typography>
                <Chip label="+3.4%" size="small" sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 600, height: 24, fontSize: '0.75rem' }} />
              </Box>
            </Box>
          </Box>
          <LineChart />
        </Card>

        <Card sx={{ flex: '1 1 35%', p: 3, borderRadius: 3, bgcolor: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={700} color="#1e293b">
              Badges
            </Typography>
            <IconButton size="small">
              <ArrowForward fontSize="small" />
            </IconButton>
          </Box>
          <Typography variant="h2" fontWeight={700} color="#1e293b" textAlign="center" mt={2}>
            3
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, my: 3 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #c4b5fd' }}>
              <EmojiEvents sx={{ fontSize: 32, color: '#8b5cf6' }} />
            </Box>
            <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #fbbf24' }}>
              <EmojiEvents sx={{ fontSize: 42, color: '#f59e0b' }} />
            </Box>
            <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #c4b5fd' }}>
              <EmojiEvents sx={{ fontSize: 32, color: '#8b5cf6' }} />
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mb={0.5}>
            Most Recent Badge
          </Typography>
          <Typography variant="body1" fontWeight={600} sx={{ color: '#1e293b', textAlign: 'center' }}>
            Reinforcement Learning
          </Typography>
        </Card>
      </Box>

      {/* Certificate Distribution + Top Skills Row */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
        <Card sx={{ flex: 1, p: 3, borderRadius: 3, bgcolor: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
          <Typography variant="h6" fontWeight={700} mb={1} color="#1e293b">
            Certificate Distribution
          </Typography>
          <DonutChart />
        </Card>

        <Card sx={{ flex: 1, p: 3, borderRadius: 3, bgcolor: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={700} color="#1e293b">
              Top Skills
            </Typography>
            <IconButton size="small">
              <ArrowForward fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {topSkills.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No skills found.</Typography>
            ) : (
              topSkills.map(([skill, count]) => (
                <Chip key={skill} label={`${skill} (${count})`} size="small" />
              ))
            )}
          </Box>
        </Card>
      </Box>

      {/* My Credentials Section */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={700} color="#1e293b">
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
        <Box sx={{ bgcolor: '#fafbfc', p: 2.5, borderRadius: 2, mb: 3, border: '1px solid #e5e7eb' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleOutline sx={{ color: '#64748b' }} />
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {isLoading ? 'Loading...' : `${totalCredentials} Certificate${totalCredentials === 1 ? '' : 's'} Found`}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }} />
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
              sx={{ width: 280, bgcolor: '#ffffff', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
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
              sx={{ width: 180, bgcolor: '#ffffff', '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
            />
            <TextField 
              size="small" 
              label="NSQF" 
              type="number" 
              value={nsqfLevel} 
              onChange={(e) => { const v = e.target.value; setNsqfLevel(v === '' ? '' : Number(v)); handleFilterChange(); }} 
              sx={{ width: 100, bgcolor: '#ffffff', '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
            />
            <FormControl size="small" sx={{ minWidth: 170 }}>
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

        {/* Credentials Grid - 3 COLUMNS */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 3,
            '@media (max-width: 1200px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
            '@media (max-width: 768px)': { gridTemplateColumns: '1fr' },
          }}
        >
          {isLoading ? (
            <Card sx={{ p: 3, gridColumn: '1 / -1', textAlign: 'center' }}>
              <CircularProgress />
              <Typography mt={2}>Loading credentials...</Typography>
            </Card>
          ) : credentials.length === 0 ? (
            <Card sx={{ p: 3, gridColumn: '1 / -1' }}>
              <Typography>No credentials found.</Typography>
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
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4, gap: 2, flexWrap: 'wrap' }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
              sx={{ 
                '& .MuiPaginationItem-root': { 
                  fontWeight: 600 
                },
                '& .Mui-selected': {
                  bgcolor: '#7c4dff !important',
                  color: 'white'
                }
              }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
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
