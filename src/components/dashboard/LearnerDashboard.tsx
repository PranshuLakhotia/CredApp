

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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
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
import LearnerService, { LearnerCredential } from '@/services/learner.service';

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

// --- SVG CHART COMPONENTS (kept minimal) ---

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

// --- CREDENTIAL CARD COMPONENT (API-driven) ---
const CredentialCard = ({ credential }: { credential: LearnerCredential }) => {
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
            Issuer : {credential.issuer_name || '-'}
          </Typography>
          {credential.nsqf_level !== undefined && (
            <Typography variant="body2" color="text.secondary" mb={0.5}>
              NSQF Level : {credential.nsqf_level}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" mb={2}>
            Issued Date : {issuedDate}
          </Typography>
          {/* Skill tags */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {(credential.skill_tags || []).map((t) => (
              <Chip key={t} label={t} size="small" sx={{ bgcolor: '#eef2ff', color: '#4338ca' }} />
            ))}
            {(credential.tags || []).map((t) => (
              <Chip key={t} label={t} size="small" sx={{ bgcolor: '#ecfeff', color: '#0e7490' }} />
            ))}
          </Box>
        </Box>
        <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ml: 2 }}>
          <EmojiEvents sx={{ fontSize: 36, color: '#7c4dff' }} />
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
};

// --- MAIN DASHBOARD COMPONENT ---
export default function LearnerDashboard() {
  const [credentials, setCredentials] = React.useState<LearnerCredential[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // query state
  const [query, setQuery] = React.useState('');
  const [status, setStatus] = React.useState<string>(''); // '', 'verified', etc.
  const [issuer, setIssuer] = React.useState('');
  const [nsqfLevel, setNsqfLevel] = React.useState<number | ''>('');
  const [sortBy, setSortBy] = React.useState<'issued_date_desc' | 'issued_date_asc'>('issued_date_desc');
  const [skip, setSkip] = React.useState(0);
  const [limit, setLimit] = React.useState(9);

  const total = credentials.length;
  const verifiedCount = credentials.filter(c => (c.status || '').toLowerCase() === 'verified').length;
  const pendingCount = Math.max(total - verifiedCount, 0);

  // top skills calculation (from skill_tags)
  const topSkills = React.useMemo(() => {
    const freq: Record<string, number> = {};
    credentials.forEach((c) => (c.skill_tags || []).forEach((t) => { freq[t] = (freq[t] || 0) + 1; }));
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [credentials]);

  const load = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: any = { skip, limit };
      if (status) params.status = status;
      if (issuer) params.issuer = issuer;
      if (nsqfLevel) params.nsqf_level = nsqfLevel;
      // tags/search not provided by this route; simple client filter will be used for query
      const data = await LearnerService.getLearnerCredentials(params);
      let items = data.credentials || [];
      // client-side search filter
      if (query.trim()) {
        const q = query.toLowerCase();
        items = items.filter((c) =>
          (c.credential_title || '').toLowerCase().includes(q) ||
          (c.issuer_name || '').toLowerCase().includes(q) ||
          (c.skill_tags || []).some(t => t.toLowerCase().includes(q)) ||
          (c.tags || []).some(t => t.toLowerCase().includes(q))
        );
      }
      // sort by issued_date
      items.sort((a, b) => {
        const da = a.issued_date ? new Date(a.issued_date).getTime() : 0;
        const db = b.issued_date ? new Date(b.issued_date).getTime() : 0;
        return sortBy === 'issued_date_desc' ? db - da : da - db;
      });
      setCredentials(items);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.response?.data?.message || e?.message || 'Failed to load credentials');
    } finally {
      setIsLoading(false);
    }
  }, [status, issuer, nsqfLevel, query, sortBy, skip, limit]);

  React.useEffect(() => {
    load();
  }, [load]);

  const pages = Math.max(1, Math.ceil((credentials.length || 0) / Math.max(1, limit)));

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
          const value = stat.key === 'total' ? total : stat.key === 'verified' ? verifiedCount : pendingCount;
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
            NQFQ Progress
          </Typography>
          <LinearProgress variant="determinate" value={57} sx={{ height: 10, borderRadius: 5, bgcolor: '#bbdefb', '& .MuiLinearProgress-bar': { bgcolor: '#1976d2', borderRadius: 5 } }} />
          <Typography variant="h6" pt={1} sx={{ fontWeight: 700, color: '#1e293b', textAlign: 'right' }}>
            Level 4/7
          </Typography>
        </Card>
      </Box>

      {/* Line Chart + Top Skills */}
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
                {isLoading ? 'Loading...' : `${credentials.length} Certificate${credentials.length === 1 ? '' : 's'} Found`}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }} />
            <TextField
              size="small"
              placeholder="Search Skills, Tags, Title, Issuer"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSkip(0); }}
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
              <Select labelId="status-label" label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setSkip(0); }}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="verified">Verified</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
            <TextField size="small" label="Issuer" value={issuer} onChange={(e) => { setIssuer(e.target.value); setSkip(0); }} sx={{ width: 180, bgcolor: '#ffffff', '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <TextField size="small" label="NSQF" type="number" value={nsqfLevel} onChange={(e) => { const v = e.target.value; setNsqfLevel(v === '' ? '' : Number(v)); setSkip(0); }} sx={{ width: 100, bgcolor: '#ffffff', '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel id="sort-label">Sort</InputLabel>
              <Select labelId="sort-label" label="Sort" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
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
            <Card sx={{ p: 3, gridColumn: '1 / -1' }}>
              <Typography>Loading credentials...</Typography>
            </Card>
          ) : credentials.length === 0 ? (
            <Card sx={{ p: 3, gridColumn: '1 / -1' }}>
              <Typography>No credentials found.</Typography>
            </Card>
          ) : (
            credentials.map((cred) => (
              <CredentialCard key={cred._id} credential={cred} />
            ))
          )}
        </Box>

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Page {Math.floor(skip / Math.max(1, limit)) + 1} of {pages}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button size="small" variant="outlined" sx={{ minWidth: 32, px: 2, color: '#64748b', borderColor: '#e5e7eb', textTransform: 'none' }} disabled={skip === 0} onClick={() => setSkip(Math.max(0, skip - limit))}>
              ← Back
            </Button>
            <TextField size="small" label="Per Page" type="number" value={limit} onChange={(e) => { const v = Number(e.target.value) || 1; setLimit(Math.max(1, Math.min(100, v))); setSkip(0); }} sx={{ width: 100 }} />
            <Button size="small" variant="outlined" sx={{ minWidth: 32, px: 2, color: '#64748b', borderColor: '#e5e7eb', textTransform: 'none' }} disabled={credentials.length < limit} onClick={() => setSkip(skip + limit)}>
              Next →
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
