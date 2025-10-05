


'use client';

import React from 'react';
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
} from '@mui/material';
import {
  School,
  Verified,
  Timeline,
  MoreVert,
  Search,
  FilterList,
  Sort,
  ViewModule,
  ViewList,
  EmojiEvents,
  PeopleOutline,
  ArrowForward,
} from '@mui/icons-material';

// --- MOCK DATA ---
const credentials = [
  { id: '1', title: 'Machine Learning', issuer: 'Coursera', level: 4, date: 'May 2025', verified: true },
  { id: '2', title: 'Machine Learning', issuer: 'Coursera', level: 4, date: 'May 2025', verified: true },
  { id: '3', title: 'Machine Learning', issuer: 'Coursera', level: 4, date: 'May 2025', verified: true },
  { id: '4', title: 'Machine Learning', issuer: 'Coursera', level: 4, date: 'May 2025', verified: true },
  { id: '5', title: 'Machine Learning', issuer: 'Coursera', level: 4, date: 'May 2025', verified: true },
  { id: '6', title: 'Machine Learning', issuer: 'Coursera', level: 4, date: 'May 2025', verified: true },
];

const stats = [
  { label: 'Total Credentials', value: '12', icon: <School sx={{ fontSize: 28 }} />, bgColor: '#e8eaf6', iconColor: '#5c6bc0', note: 'in last 30 days' },
  { label: 'Verified', value: '9', icon: <Verified sx={{ fontSize: 28 }} />, bgColor: '#e8f5e9', iconColor: '#66bb6a', note: 'credentials' },
  { label: 'Pending', value: '3', icon: <Timeline sx={{ fontSize: 28 }} />, bgColor: '#fff3e0', iconColor: '#ffa726', note: 'under review' },
];

const categories = [
  { label: 'All', color: '#fbbf24', active: true },
  { label: 'Academic', color: '#a78bfa' },
  { label: 'Technical', color: '#f87171' },
  { label: 'Co-Curricular', color: '#4ade80' },
  { label: 'Performing Arts', color: '#60a5fa' },
  { label: 'Others', color: '#94a3b8' },
];

// --- SVG CHART COMPONENTS ---

const LineChart = () => (
  <Box sx={{ position: 'relative', height: 240, mt: 3 }}>
    <Box sx={{ position: 'absolute', top: 0, left: 0 }}>
      <Typography variant="body2" color="text.secondary" mb={0.5}>
        Total number of profile impressions
      </Typography>
      <Typography variant="h3" fontWeight={700} color="#1e293b">
        1,235
      </Typography>
    </Box>
    <svg width="100%" height="100%" viewBox="0 0 600 240" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c4dff" stopOpacity={0.15} />
          <stop offset="100%" stopColor="#7c4dff" stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Vertical Grid Lines */}
      {[0, 100, 200, 300, 400, 500, 600].map(x => (
        <line key={x} x1={x} y1="40" x2={x} y2="200" stroke="#e5e7eb" strokeWidth="1" opacity="0.3" />
      ))}
      {/* Area + Line */}
      <path d="M 0 160 L 80 140 L 160 180 L 240 120 L 320 115 L 400 140 L 480 100 L 560 110 L 600 90 V 240 H 0 Z" fill="url(#lineGradient)" />
      <path d="M 0 160 L 80 140 L 160 180 L 240 120 L 320 115 L 400 140 L 480 100 L 560 110 L 600 90" stroke="#7c4dff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Data Points */}
      {[
        { x: 240, y: 120 },
        { x: 400, y: 140 },
        { x: 480, y: 100 },
        { x: 600, y: 90 },
      ].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="5" fill="#7c4dff" stroke="white" strokeWidth="2" />
      ))}
    </svg>
    <Box sx={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <Typography variant="caption" color="text.secondary">29 July 00:00</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
        <Typography variant="h6" fontWeight={700} color="#1e293b">2321.0</Typography>
        <Chip label="+3.4%" size="small" sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 600, height: 20, fontSize: '0.7rem' }} />
      </Box>
    </Box>
  </Box>
);

const DonutChart = () => (
  <Box sx={{ position: 'relative', width: 200, height: 200, mx: 'auto', my: 2 }}>
    <svg width="100%" height="100%" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="35" fill="none" stroke="#f0f0f0" strokeWidth="14" />
      {/* Purple segment */}
      <circle cx="50" cy="50" r="35" fill="none" stroke="#8b5cf6" strokeWidth="14" strokeDasharray="220" strokeDashoffset="55" strokeLinecap="round" transform="rotate(-90 50 50)" />
      {/* Pink segment */}
      <circle cx="50" cy="50" r="35" fill="none" stroke="#ec4899" strokeWidth="14" strokeDasharray="220" strokeDashoffset="110" strokeLinecap="round" transform="rotate(90 50 50)" />
      {/* Cyan segment */}
      <circle cx="50" cy="50" r="35" fill="none" stroke="#06b6d4" strokeWidth="14" strokeDasharray="220" strokeDashoffset="165" strokeLinecap="round" transform="rotate(180 50 50)" />
      {/* Orange segment */}
      <circle cx="50" cy="50" r="35" fill="none" stroke="#f59e0b" strokeWidth="14" strokeDasharray="220" strokeDashoffset="192" strokeLinecap="round" transform="rotate(260 50 50)" />
      {/* Green segment */}
      <circle cx="50" cy="50" r="35" fill="none" stroke="#10b981" strokeWidth="14" strokeDasharray="220" strokeDashoffset="208" strokeLinecap="round" transform="rotate(310 50 50)" />
    </svg>
    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
      <Typography variant="h3" fontWeight={700} color="#1e293b">48</Typography>
      <Typography variant="caption" color="text.secondary">In total</Typography>
    </Box>
    {/* Labels */}
    <Box sx={{ position: 'absolute', top: -10, left: '20%', bgcolor: 'white', px: 1, py: 0.5, borderRadius: 1, boxShadow: 1 }}>
      <Typography variant="caption" fontSize="0.65rem">Co-curricular</Typography>
    </Box>
    <Box sx={{ position: 'absolute', top: '30%', right: -20, bgcolor: 'white', px: 1, py: 0.5, borderRadius: 1, boxShadow: 1 }}>
      <Typography variant="caption" fontSize="0.65rem">Performing Arts</Typography>
    </Box>
    <Box sx={{ position: 'absolute', bottom: 10, right: '15%', bgcolor: 'white', px: 1, py: 0.5, borderRadius: 1, boxShadow: 1 }}>
      <Typography variant="caption" fontSize="0.65rem">Other</Typography>
    </Box>
    <Box sx={{ position: 'absolute', bottom: '25%', left: -15, bgcolor: 'white', px: 1, py: 0.5, borderRadius: 1, boxShadow: 1 }}>
      <Typography variant="caption" fontSize="0.65rem">Academics</Typography>
    </Box>
    <Box sx={{ position: 'absolute', bottom: '50%', left: -10, bgcolor: 'white', px: 1, py: 0.5, borderRadius: 1, boxShadow: 1 }}>
      <Typography variant="caption" fontSize="0.65rem">Technical</Typography>
    </Box>
  </Box>
);

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

// --- CREDENTIAL CARD COMPONENT ---
const CredentialCard = ({ credential }: { credential: typeof credentials[0] }) => (
  <Card sx={{ p: 3, borderRadius: 2, bgcolor: '#fafbfc', boxShadow: 'none', border: '1px solid #e5e7eb', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transform: 'translateY(-2px)' } }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" fontWeight={700} color="#1e293b" mb={1.5}>
          {credential.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={0.5}>
          Issuer : {credential.issuer}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={0.5}>
          NSQF Level : {credential.level}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Issued Date : {credential.date}
        </Typography>
      </Box>
      <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ml: 2 }}>
        <EmojiEvents sx={{ fontSize: 36, color: '#7c4dff' }} />
      </Box>
    </Box>
    {credential.verified && (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
        <Verified sx={{ fontSize: 18, color: '#26c6da' }} />
        <Typography variant="body2" color="#26c6da" fontWeight={600}>
          Verified
        </Typography>
      </Box>
    )}
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button variant="text" size="small" sx={{ color: '#7c4dff', textTransform: 'none', fontWeight: 600, p: 0, minWidth: 'auto' }}>
        View Details
      </Button>
      <Button variant="text" size="small" sx={{ color: '#64748b', textTransform: 'none', p: 0, minWidth: 'auto' }}>
        Download
      </Button>
      <Button variant="text" size="small" sx={{ color: '#64748b', textTransform: 'none', p: 0, minWidth: 'auto' }}>
        Share
      </Button>
    </Box>
  </Card>
);

// --- MAIN DASHBOARD COMPONENT ---
export default function LearnerDashboard() {
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

      {/* Top Stats Cards Row */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, mb: 3 }}>
        {stats.map((stat) => (
          <Card key={stat.label} sx={{ flex: '1 1 220px', p: 2.5, borderRadius: 3, bgcolor: stat.bgColor, boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                  {stat.label}
                </Typography>
                <Typography variant="h3" fontWeight={700} color="#1e293b">
                  {stat.value}
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
        ))}
        <Card sx={{ flex: '1 1 300px', p: 2.5, borderRadius: 3, bgcolor: '#e3f2fd', boxShadow: 'none' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1.5 }}>
            NQFQ Progress
          </Typography>
          <LinearProgress variant="determinate" value={57} sx={{ height: 10, borderRadius: 5, bgcolor: '#bbdefb', '& .MuiLinearProgress-bar': { bgcolor: '#1976d2', borderRadius: 5 } }} />
          <Typography variant="h6" pt={1} sx={{ fontWeight: 700, color: '#1e293b', textAlign: 'right' }}>
            Level 4/7
          </Typography>
        </Card>
      </Box>

      {/* Line Chart + Badges Row */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        <Card sx={{ flex: '1 1 60%', p: 3, borderRadius: 3, bgcolor: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
          <Typography variant="h6" fontWeight={700} color="#1e293b">
            Total Profile Impressions
          </Typography>
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
          <BarChart />
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

        {/* Search and Filter Bar */}
        <Box sx={{ bgcolor: '#fafbfc', p: 2.5, borderRadius: 2, mb: 3, border: '1px solid #e5e7eb' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleOutline sx={{ color: '#64748b' }} />
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                34 Certificate Found
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }} />
            <TextField
              size="small"
              placeholder="Search Skills, Tags, Type"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#94a3b8', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 280, bgcolor: '#ffffff', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Button variant="outlined" startIcon={<FilterList />} sx={{ textTransform: 'none', borderColor: '#e5e7eb', color: '#64748b' }}>
              Filter
            </Button>
            <Button variant="outlined" startIcon={<Sort />} sx={{ textTransform: 'none', borderColor: '#e5e7eb', color: '#64748b' }}>
              Sort
            </Button>
          </Box>

          {/* Category Chips */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <Chip
                key={cat.label}
                label={cat.label}
                icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: cat.color, ml: 1 }} />}
                sx={{
                  bgcolor: cat.active ? '#1e293b' : '#ffffff',
                  color: cat.active ? '#ffffff' : '#64748b',
                  fontWeight: 500,
                  border: cat.active ? 'none' : '1px solid #e5e7eb',
                  '&:hover': { bgcolor: cat.active ? '#1e293b' : '#f8fafc' },
                }}
              />
            ))}
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
          {credentials.map((cred) => (
            <CredentialCard key={cred.id} credential={cred} />
          ))}
        </Box>

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Showing 1 to 10 of 100 entries
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" variant="outlined" sx={{ minWidth: 32, px: 2, color: '#64748b', borderColor: '#e5e7eb', textTransform: 'none' }}>
              ← Back
            </Button>
            {[1, 2, 3, 4, 5].map((num) => (
              <Button
                key={num}
                size="small"
                variant={num === 1 ? 'contained' : 'outlined'}
                sx={{
                  minWidth: 32,
                  px: 1.5,
                  bgcolor: num === 1 ? '#1e293b' : 'transparent',
                  color: num === 1 ? '#fff' : '#64748b',
                  borderColor: '#e5e7eb',
                  '&:hover': { bgcolor: num === 1 ? '#1e293b' : '#f5f5f5' },
                }}
              >
                {num}
              </Button>
            ))}
            <Typography variant="body2" sx={{ px: 1, display: 'flex', alignItems: 'center' }}>
              ...
            </Typography>
            <Button size="small" variant="outlined" sx={{ minWidth: 32, px: 1.5, color: '#64748b', borderColor: '#e5e7eb' }}>
              10
            </Button>
            <Button size="small" variant="outlined" sx={{ minWidth: 32, px: 2, color: '#64748b', borderColor: '#e5e7eb', textTransform: 'none' }}>
              Next →
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
