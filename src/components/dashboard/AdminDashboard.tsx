'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Building2,
    Briefcase,
    ShieldCheck,
    BarChart3,
    Search,
    Bell,
    Settings,
    MoreVertical,
    CheckCircle2,
    XCircle,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    FileText,
    Globe,
    Lock,
    ChevronLeft,
    ChevronRight,
    Activity,
    Server,
    Zap,
    Clock,
    Database,
    Code,
    AlertCircle,
    CheckCircle,
    WifiOff,
    AlertTriangle,
    RefreshCw,
    Pause,
    Play,
    TrendingDown,
    AlertTriangle as AlertTriangleIcon,
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    adminService,
    Analytics as AnalyticsType,
    DetailedAnalytics as DetailedAnalyticsType,
    VerificationRequest as VerificationRequestType,
    HealthStatus as HealthStatusType,
    ReadinessStatus as ReadinessStatusType,
    LivenessStatus as LivenessStatusType,
} from '@/services/admin.service';
import { IssuersSection } from '../admin/IssuersSection';
import { LearnersSection } from '../admin/LearnersSection';
import { EmployersSection } from '../admin/EmployersSection';
import { Loader } from '../admin/Loader';
import { ThemeSwitch } from '../admin/ThemeSwitch';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

// --- Components ---
const SidebarItem = ({ icon: Icon, label, active, onClick, darkMode, collapsed }: any) => (
    <motion.button
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
            ? darkMode
                ? 'bg-gray-800 shadow-sm text-blue-400'
                : 'bg-white shadow-sm text-blue-600'
            : darkMode
                ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            }`}
        title={collapsed ? label : ''}
    >
        <Icon size={20} className={active ? (darkMode ? 'text-blue-400' : 'text-blue-600') : (darkMode ? 'text-gray-500' : 'text-gray-400')} />
        {!collapsed && <span className="font-medium text-sm">{label}</span>}
        {active && (
            <motion.div
                layoutId="activeIndicator"
                className={`absolute left-0 w-1 h-8 rounded-r-full ${darkMode ? 'bg-blue-400' : 'bg-blue-600'}`}
            />
        )}
    </motion.button>
);

const StatCard = ({ title, value, change, icon: Icon, color, darkMode }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-2xl shadow-sm border hover:shadow-md transition-shadow ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
    >
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
            <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${change >= 0 ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                {change >= 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                {Math.abs(change)}%
            </span>
        </div>
        <h3 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</h3>
        <p className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{value?.toLocaleString() ?? '-'}</p>
    </motion.div>
);

const TableRow = ({ children, index, darkMode }: any) => (
    <motion.tr
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`border-b transition-colors ${darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-50 hover:bg-gray-50'}`}
    >
        {children}
    </motion.tr>
);

const StatusBadge = ({ status, darkMode }: any) => {
    const styles = {
        Verified: darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
        Active: darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
        Pending: darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
        Inactive: darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-700',
    };
    const style = styles[status as keyof typeof styles] || styles.Inactive;
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>{status}</span>;
};

// --- Sections (Settings unchanged) ---
const SettingsSection = ({ darkMode }: any) => {
    const [activeSetting, setActiveSetting] = useState('general');
    const settingsTabs = [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'team', label: 'Team Members', icon: Users },
    ];
    return (
        <div className={`rounded-2xl shadow-sm border overflow-hidden flex flex-col md:flex-row min-h-[600px] ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className={`w-full md:w-64 border-r p-6 ${darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-100 bg-gray-50/50'}`}>
                <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Settings</h3>
                <nav className="space-y-1">
                    {settingsTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSetting(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeSetting === tab.id
                                ? darkMode
                                    ? 'bg-gray-800 shadow-sm text-blue-400'
                                    : 'bg-white shadow-sm text-blue-600'
                                : darkMode
                                    ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                        >
                            <tab.icon size={18} />
                            <span className="font-medium text-sm">{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
            <div className="flex-1 p-8">
                {activeSetting === 'general' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>General Settings</h2>
                        <div className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Platform Name</label>
                                <input type="text" defaultValue="Credify Platform" className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${darkMode ? 'bg-gray-900 border-gray-700 text-gray-100 focus:border-blue-400' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'}`} />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Support Email</label>
                                <input type="email" defaultValue="support@credify.com" className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${darkMode ? 'bg-gray-900 border-gray-700 text-gray-100 focus:border-blue-400' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'}`} />
                            </div>
                            <div className="pt-4">
                                <button className={`px-6 py-2 rounded-xl font-medium transition-colors ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>Save Changes</button>
                            </div>
                        </div>
                    </motion.div>
                )}
                {/* Security, Notifications, Team omitted for brevity */}
            </div>
        </div>
    );
};

// --- Analytics Section with Health Integration ---
const AnalyticsSection = ({ darkMode }: any) => {
    const [analytics, setAnalytics] = useState<AnalyticsType | null>(null);
    const [detailed, setDetailed] = useState<DetailedAnalyticsType | null>(null);
    const [healthStatus, setHealthStatus] = useState<HealthStatusType | null>(null);
    const [readinessStatus, setReadinessStatus] = useState<ReadinessStatusType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [serverDown, setServerDown] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [a, d, h, r] = await Promise.all([
                    adminService.getAnalytics(),
                    adminService.getDetailedAnalytics(),
                    adminService.getHealthStatus(),
                    adminService.getReadinessStatus()
                ]);
                setAnalytics(a);
                setDetailed(d);
                setHealthStatus(h);
                setReadinessStatus(r);
                setServerDown(false);
                setError(null);
                setLoading(false);
            } catch (e: any) {
                console.error('Failed to fetch analytics:', e);
                // Check if it's a network error (server down)
                const isNetworkError = !e.response || e.code === 'ECONNREFUSED' || e.code === 'ERR_NETWORK';
                if (isNetworkError) {
                    setServerDown(true);
                    setError('Backend server is currently unavailable');
                } else {
                    setServerDown(false);
                    setError(e.message || 'Failed to load analytics');
                }
                setLoading(false);
            }
        };
        fetchData();

        // Refresh health status every 30 seconds
        const interval = setInterval(async () => {
            try {
                const [h, r] = await Promise.all([
                    adminService.getHealthStatus(),
                    adminService.getReadinessStatus()
                ]);
                setHealthStatus(h);
                setReadinessStatus(r);
                setServerDown(false);
            } catch (e: any) {
                console.error('Failed to refresh health status:', e);
                const isNetworkError = !e.response || e.code === 'ECONNREFUSED' || e.code === 'ERR_NETWORK';
                if (isNetworkError) {
                    setServerDown(true);
                    setHealthStatus(null);
                    setReadinessStatus(null);
                }
            }
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader size="lg" darkMode={darkMode} />
            </div>
        );
    }
    if (error || serverDown) {
        return (
            <div className="space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-2xl border-l-4 ${darkMode ? 'bg-red-900/20 border-red-500' : 'bg-red-50 border-red-500'}`}
                >
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${darkMode ? 'bg-red-900/40' : 'bg-red-100'}`}>
                            <WifiOff size={24} className={darkMode ? 'text-red-400' : 'text-red-600'} />
                        </div>
                        <div className="flex-1">
                            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-red-300' : 'text-red-800'}`}>
                                Backend Server is Currently Unavailable
                            </h3>
                            <p className={`text-sm mb-4 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                                We're unable to connect to the backend server at the moment. This could be due to maintenance, network issues, or the server being temporarily down.
                            </p>
                            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
                                <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>What's happening:</p>
                                <ul className={`text-sm space-y-1 list-disc list-inside ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <li>All dashboard data is temporarily unavailable</li>
                                    <li>Health status checks cannot be performed</li>
                                    <li>Analytics and metrics cannot be displayed</li>
                                </ul>
                            </div>
                            <p className={`text-xs mt-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                                <strong>Note:</strong> The system will automatically reconnect when the server is back online. Please check back in a few moments or contact your system administrator if the issue persists.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' as const, labels: { color: darkMode ? '#9CA3AF' : '#6B7280' } },
        },
        scales: {
            y: { grid: { display: false, color: darkMode ? '#374151' : '#F3F4F6' }, ticks: { color: darkMode ? '#9CA3AF' : '#6B7280' } },
            x: { grid: { display: false, color: darkMode ? '#374151' : '#F3F4F6' }, ticks: { color: darkMode ? '#9CA3AF' : '#6B7280' } },
        },
    };

    const lineData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            { label: 'New Users', data: [65, 59, 80, 81, 56, 125], borderColor: 'rgb(79, 70, 229)', backgroundColor: 'rgba(79, 70, 229, 0.5)', tension: 0.4 },
            { label: 'Credentials Issued', data: [28, 48, 40, 19, 86, 97], borderColor: 'rgb(147, 51, 234)', backgroundColor: 'rgba(147, 51, 234, 0.5)', tension: 0.4 },
        ],
    };

    const monthlyIssuedData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{ label: 'Monthly Issued Credentials', data: detailed?.credentials_issued?.monthly ?? [], backgroundColor: 'rgba(59, 130, 246, 0.8)', borderRadius: 4 }],
    };

    const dailyIssuedData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{ label: 'Daily Issued Credentials (Last 7 Days)', data: detailed?.credentials_issued?.daily ?? [], backgroundColor: 'rgba(16, 185, 129, 0.8)', borderRadius: 4 }],
    };

    const doughnutData = {
        labels: ['Universities', 'Corporations', 'Bootcamps'],
        datasets: [{ data: [12, 19, 3], backgroundColor: ['rgba(79, 70, 229, 0.8)', 'rgba(147, 51, 234, 0.8)', 'rgba(236, 72, 153, 0.8)'], borderWidth: 0 }],
    };

    const isBackendHealthy = healthStatus?.status === 'ok' && healthStatus?.database === 'connected';
    const apiStatus = readinessStatus?.dependencies?.api === 'healthy' ? 'Operational' : 'Degraded';
    const dbStatus = healthStatus?.database === 'connected' ? 'Connected' : 'Disconnected';

    return (
        <div className="space-y-6">
            {/* Backend Status Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border-l-4 ${isBackendHealthy ? 'bg-green-50 border-green-500 dark:bg-green-900/20' : 'bg-red-50 border-red-500 dark:bg-red-900/20'}`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isBackendHealthy ? 'bg-green-100 dark:bg-green-900/40' : 'bg-red-100 dark:bg-red-900/40'}`}>
                            <Server size={20} className={isBackendHealthy ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} />
                        </div>
                        <div>
                            <h3 className={`font-semibold text-sm ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                Backend Status: <span className={isBackendHealthy ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{isBackendHealthy ? 'Operational' : 'Issues Detected'}</span>
                            </h3>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                API: {apiStatus} • Database: {dbStatus} • Version: {healthStatus?.version || 'N/A'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isBackendHealthy ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}></div>
                        <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Live</span>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={analytics?.total_users ?? 0} change={analytics?.growth?.users ?? 0} icon={Users} color="bg-blue-500 text-blue-500" darkMode={darkMode} />
                <StatCard title="Active Issuers" value={analytics?.active_issuers ?? 0} change={analytics?.growth?.issuers ?? 0} icon={Building2} color="bg-purple-500 text-purple-500" darkMode={darkMode} />
                <StatCard title="Verified Learners" value={analytics?.verified_learners ?? 0} change={1.2} icon={ShieldCheck} color="bg-green-500 text-green-500" darkMode={darkMode} />
                <StatCard title="Verification Queue" value={analytics?.pending_verifications ?? 0} change={analytics?.growth?.verifications ?? 0} icon={Bell} color="bg-orange-500 text-orange-500" darkMode={darkMode} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`lg:col-span-2 p-6 rounded-2xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Growth Trends</h3>
                    <div className="h-64"><Line data={lineData} options={chartOptions} /></div>
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-6 rounded-2xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Issuer Distribution</h3>
                    <div className="h-64 flex items-center justify-center"><Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: darkMode ? '#9CA3AF' : '#6B7280' } } }, cutout: '70%' }} /></div>
                </motion.div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-2xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex justify-between items-center mb-4"><h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Monthly Credentials Issued</h3><button className={darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}><MoreVertical size={18} /></button></div>
                    <div className="h-64"><Bar data={monthlyIssuedData} options={chartOptions} /></div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-2xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex justify-between items-center mb-4"><h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Daily Activity (Last 7 Days)</h3><button className={darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}><MoreVertical size={18} /></button></div>
                    <div className="h-64"><Bar data={dailyIssuedData} options={chartOptions} /></div>
                </motion.div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-2xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Top Performing Issuers</h3>
                    <div className="space-y-4">
                        {detailed?.top_issuers?.map((issuer, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${darkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>{i + 1}</div>
                                    <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{issuer.name}</span>
                                </div>
                                <span className={`font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{issuer.count}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-2xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Most Popular Credentials</h3>
                    <div className="space-y-4">
                        {detailed?.popular_credentials?.map((cred, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'}`}><FileText size={16} /></div>
                                    <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{cred.name}</span>
                                </div>
                                <span className={`font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{cred.count}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

// --- Issuers Analytics Section --- (Now imported from components/admin/IssuersSection)

// --- Learners Analytics Section --- (Now imported from components/admin/LearnersSection)

// --- Employers Analytics Section --- (Now imported from components/admin/EmployersSection)

// --- System Status Section ---
const SystemStatusSection = ({ darkMode }: any) => {
    const [healthStatus, setHealthStatus] = useState<HealthStatusType | null>(null);
    const [readinessStatus, setReadinessStatus] = useState<ReadinessStatusType | null>(null);
    const [livenessStatus, setLivenessStatus] = useState<LivenessStatusType | null>(null);
    const [history, setHistory] = useState<{ time: string; latency: number; error: boolean }[]>([]);
    const [loading, setLoading] = useState(true);
    const [serverDown, setServerDown] = useState(false);
    const [lastErrorTime, setLastErrorTime] = useState<Date | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pollInterval, setPollInterval] = useState(30000); // Default 30s (reduced from 5s)
    const [consecutiveErrors, setConsecutiveErrors] = useState(0);
    
    // Service health checks
    const [serviceHealth, setServiceHealth] = useState<{
        auth: { healthy: boolean; latency: number; error?: string; message?: string };
        employer: { healthy: boolean; latency: number; error?: string; message?: string };
        issuer: { healthy: boolean; latency: number; error?: string; message?: string };
        learner: { healthy: boolean; latency: number; error?: string; message?: string };
        kyc: { healthy: boolean; latency: number; error?: string; message?: string };
    }>({
        auth: { healthy: false, latency: 0 },
        employer: { healthy: false, latency: 0 },
        issuer: { healthy: false, latency: 0 },
        learner: { healthy: false, latency: 0 },
        kyc: { healthy: false, latency: 0 },
    });


    const fetchData = async (isManualRefresh = false) => {
        if (isPaused && !isManualRefresh) return;
        
        if (isManualRefresh) setIsRefreshing(true);
        const start = Date.now();
        try {
            // Fetch core health checks
            const [h, r, l] = await Promise.all([
                adminService.getHealthStatus(),
                adminService.getReadinessStatus(),
                adminService.getLivenessStatus()
            ]);
            const latency = Date.now() - start;

            setHealthStatus(h);
            setReadinessStatus(r);
            setLivenessStatus(l);
            setServerDown(false);
            setConsecutiveErrors(0);
            setPollInterval(30000); // Reset to 30s on success

            // Fetch service health checks - try to use aggregated endpoint first, fallback to individual checks
            let serviceHealthResults;
            try {
                const servicesHealth = await adminService.getServicesHealth();
                // If we got aggregated health, use it
                if (servicesHealth?.services) {
                    serviceHealthResults = [
                        { status: 'fulfilled', value: servicesHealth.services.auth || { healthy: false, latency: 0, error: 'Not available' } },
                        { status: 'fulfilled', value: servicesHealth.services.employer || { healthy: false, latency: 0, error: 'Not available' } },
                        { status: 'fulfilled', value: servicesHealth.services.issuer || { healthy: false, latency: 0, error: 'Not available' } },
                        { status: 'fulfilled', value: servicesHealth.services.learner || { healthy: false, latency: 0, error: 'Not available' } },
                        { status: 'fulfilled', value: servicesHealth.services.kyc || { healthy: false, latency: 0, error: 'Not available' } },
                    ];
                } else {
                    throw new Error('No services data in response');
                }
            } catch (e) {
                // Fallback: check if backend is up (if health endpoint works, services are likely up too)
                const backendHealthy = latency < 1000; // If main health check was fast, services are likely up
                const fallbackServiceHealth = {
                    healthy: backendHealthy,
                    latency: latency,
                    error: backendHealthy ? undefined : 'Service check unavailable'
                };
                serviceHealthResults = [
                    { status: 'fulfilled', value: fallbackServiceHealth },
                    { status: 'fulfilled', value: fallbackServiceHealth },
                    { status: 'fulfilled', value: fallbackServiceHealth },
                    { status: 'fulfilled', value: fallbackServiceHealth },
                    { status: 'fulfilled', value: fallbackServiceHealth },
                ];
            }

            setServiceHealth({
                auth: serviceHealthResults[0].status === 'fulfilled' ? serviceHealthResults[0].value : { healthy: false, latency: 0, error: 'Check failed' },
                employer: serviceHealthResults[1].status === 'fulfilled' ? serviceHealthResults[1].value : { healthy: false, latency: 0, error: 'Check failed' },
                issuer: serviceHealthResults[2].status === 'fulfilled' ? serviceHealthResults[2].value : { healthy: false, latency: 0, error: 'Check failed' },
                learner: serviceHealthResults[3].status === 'fulfilled' ? serviceHealthResults[3].value : { healthy: false, latency: 0, error: 'Check failed' },
                kyc: serviceHealthResults[4].status === 'fulfilled' ? serviceHealthResults[4].value : { healthy: false, latency: 0, error: 'Check failed' },
            });

            setHistory(prev => {
                const newHistory = [...prev, {
                    time: new Date().toLocaleTimeString(),
                    latency,
                    error: false
                }];
                return newHistory.slice(-50); // Keep last 50 points for better graphs
            });
            setLoading(false);
        } catch (e: any) {
            console.error('Server status check failed:', e);
            setServerDown(true);
            setLastErrorTime(new Date());
            setHealthStatus(null);
            setReadinessStatus(null);
            setLivenessStatus(null);
            const newErrors = consecutiveErrors + 1;
            setConsecutiveErrors(newErrors);
            
            // Exponential backoff: 30s, 60s, 120s, 300s (max 5 min)
            const backoffIntervals = [30000, 60000, 120000, 300000];
            setPollInterval(backoffIntervals[Math.min(newErrors - 1, backoffIntervals.length - 1)]);
            
            setHistory(prev => {
                const newHistory = [...prev, {
                    time: new Date().toLocaleTimeString(),
                    latency: Date.now() - start,
                    error: true
                }];
                return newHistory.slice(-50);
            });
            setLoading(false);
        } finally {
            if (isManualRefresh) setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(false), pollInterval);
        return () => clearInterval(interval);
    }, [pollInterval, isPaused]);

    if (loading && !healthStatus && !serverDown) {
        return <div className="flex justify-center py-12"><Loader size="lg" darkMode={darkMode} /></div>;
    }

    // Calculate error rate for the last 50 data points
    const errorRate = history.length > 0 
        ? (history.filter(h => h.error).length / history.length) * 100 
        : 0;
    
    // Latency distribution buckets
    const latencyBuckets = { fast: 0, medium: 0, slow: 0, verySlow: 0 };
    history.forEach(h => {
        if (h.latency < 200) latencyBuckets.fast++;
        else if (h.latency < 500) latencyBuckets.medium++;
        else if (h.latency < 1000) latencyBuckets.slow++;
        else latencyBuckets.verySlow++;
    });

    const latencyChartData = {
        labels: history.map(h => h.time),
        datasets: [
            {
                label: 'API Latency (ms)',
                data: history.map(h => h.latency),
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.5)',
                tension: 0.4,
                fill: true,
            }
        ]
    };

    const errorRateChartData = {
        labels: history.map(h => h.time),
        datasets: [
            {
                label: 'Error Rate (%)',
                data: history.map((h, i) => {
                    const window = history.slice(Math.max(0, i - 9), i + 1);
                    return window.length > 0 ? (window.filter(x => x.error).length / window.length) * 100 : 0;
                }),
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.5)',
                tension: 0.4,
                fill: true,
            }
        ]
    };

    const latencyDistributionData = {
        labels: ['Fast (<200ms)', 'Medium (200-500ms)', 'Slow (500-1000ms)', 'Very Slow (>1000ms)'],
        datasets: [{
            label: 'Response Time Distribution',
            data: [latencyBuckets.fast, latencyBuckets.medium, latencyBuckets.slow, latencyBuckets.verySlow],
            backgroundColor: [
                'rgba(34, 197, 94, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(251, 146, 60, 0.8)',
                'rgba(239, 68, 68, 0.8)',
            ],
            borderWidth: 0,
        }]
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { mode: 'index' as const, intersect: false },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: darkMode ? '#374151' : '#F3F4F6' },
                ticks: { color: darkMode ? '#9CA3AF' : '#6B7280' }
            },
            x: {
                grid: { display: false },
                ticks: { display: false }
            }
        },
        interaction: {
            mode: 'nearest' as const,
            axis: 'x' as const,
            intersect: false
        }
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: darkMode ? '#374151' : '#F3F4F6' },
                ticks: { color: darkMode ? '#9CA3AF' : '#6B7280' }
            },
            x: {
                grid: { display: false },
                ticks: { color: darkMode ? '#9CA3AF' : '#6B7280' }
            }
        }
    };

    const StatusCard = ({ title, status, code, icon: Icon, color, type, serverDown: isServerDown, lastErrorTime }: any) => {
        // If server is down, show server down message
        if (isServerDown || !code) {
            return (
                <div className={`p-6 rounded-2xl border transition-all ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl ${color.bg}`}>
                                <Icon size={24} className={color.text} />
                            </div>
                            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{title}</h3>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`}>
                            <WifiOff size={14} />
                            DOWN
                        </div>
                    </div>
                    <div className={`p-4 rounded-lg border-l-4 ${
                        darkMode 
                            ? 'bg-red-900/20 border-red-500' 
                            : 'bg-red-50 border-red-500'
                    }`}>
                        <div className="flex items-start gap-3">
                            <AlertTriangle size={20} className={`mt-0.5 flex-shrink-0 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                            <div>
                                <p className={`text-sm font-semibold mb-1 ${darkMode ? 'text-red-300' : 'text-red-800'}`}>Backend Server is Down</p>
                                <p className={`text-xs ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                                    The server is currently unavailable. Please check the backend connection and try again. We'll automatically reconnect when the server is back online.
                                </p>
                            </div>
                        </div>
                    </div>
                    {lastErrorTime && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <Clock size={14} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last Check</span>
                            </div>
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {lastErrorTime.toLocaleTimeString()}
                            </span>
                        </div>
                    )}
                </div>
            );
        }

        const isHealthy = status === 'ok' || status === 'ready' || status === 'alive';
        
        // Handle timestamp - could be in seconds (10 digits) or milliseconds (13 digits)
        const getTimestamp = () => {
            if (!code?.timestamp) return 'N/A';
            const ts = code.timestamp;
            // If timestamp is less than 13 digits, it's likely in seconds
            const timestampMs = ts.toString().length <= 10 ? ts * 1000 : ts;
            return new Date(timestampMs).toLocaleString();
        };
        const timestamp = getTimestamp();

        return (
            <div className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${color.bg}`}>
                            <Icon size={24} className={color.text} />
                        </div>
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{title}</h3>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                        isHealthy 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                        {isHealthy ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                        {status?.toUpperCase() || 'UNKNOWN'}
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Service Name */}
                    {code?.service && (
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <Server size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Service</span>
                            </div>
                            <span className={`text-sm font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{code.service}</span>
                        </div>
                    )}

                    {/* Type-specific fields */}
                    {type === 'health' && (
                        <>
                            {code?.version && (
                                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2">
                                        <Code size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Version</span>
                                    </div>
                                    <span className={`text-sm font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{code.version}</span>
                                </div>
                            )}
                            {code?.database && (
                                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2">
                                        <Database size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Database</span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                        code.database === 'connected' 
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                        {code.database === 'connected' ? 'Connected' : 'Disconnected'}
                                    </span>
                                </div>
                            )}
                        </>
                    )}

                    {type === 'readiness' && code?.dependencies && (
                        <>
                            <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <Database size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Database</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    code.dependencies.database === 'healthy' 
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                    {code.dependencies.database === 'healthy' ? 'Healthy' : 'Unhealthy'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <Server size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>API</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    code.dependencies.api === 'healthy' 
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                    {code.dependencies.api === 'healthy' ? 'Healthy' : 'Unhealthy'}
                                </span>
                            </div>
                        </>
                    )}

                    {/* Error message if present */}
                    {code?.error && (
                        <div className={`p-3 rounded-lg border-l-4 ${
                            darkMode 
                                ? 'bg-red-900/20 border-red-500 text-red-400' 
                                : 'bg-red-50 border-red-500 text-red-700'
                        }`}>
                            <div className="flex items-start gap-2">
                                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold mb-1">Error</p>
                                    <p className="text-xs">{code.error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Timestamp */}
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                            <Clock size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                            <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last Check</span>
                        </div>
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{timestamp}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Controls Bar */}
            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                isPaused
                                    ? darkMode
                                        ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                                    : darkMode
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {isPaused ? <Play size={16} /> : <Pause size={16} />}
                            {isPaused ? 'Resume Monitoring' : 'Pause Monitoring'}
                        </button>
                        <button
                            onClick={() => fetchData(true)}
                            disabled={isRefreshing}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                darkMode
                                    ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 disabled:opacity-50'
                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50'
                            }`}
                        >
                            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <span className="font-medium">Polling:</span> {isPaused ? 'Paused' : `Every ${pollInterval / 1000}s`}
                            {consecutiveErrors > 0 && (
                                <span className={`ml-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                                    (Backoff active due to errors)
                                </span>
                            )}
                        </div>
                        {!isPaused && !serverDown && (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Server Down Banner */}
            {serverDown && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border-l-4 bg-red-50 border-red-500 dark:bg-red-900/20 dark:border-red-500`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/40">
                                <WifiOff size={20} className="text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className={`font-semibold text-sm ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                    Backend Server is Unavailable
                                </h3>
                                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Unable to connect to the backend server. The system will automatically reconnect when the server is back online.
                                    {consecutiveErrors > 0 && ` (Using exponential backoff: checking every ${pollInterval / 1000}s)`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Offline</span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Service Health Cards */}
            {!serverDown && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                >
                    <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Service Health Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {Object.entries(serviceHealth).map(([service, status]) => (
                            <div
                                key={service}
                                className={`p-4 rounded-xl border ${
                                    status.healthy
                                        ? darkMode
                                            ? 'bg-green-900/20 border-green-700'
                                            : 'bg-green-50 border-green-200'
                                        : darkMode
                                            ? 'bg-red-900/20 border-red-700'
                                            : 'bg-red-50 border-red-200'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-sm font-semibold capitalize ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                        {service}
                                    </span>
                                    {status.healthy ? (
                                        <CheckCircle size={16} className="text-green-500" />
                                    ) : (
                                        <AlertCircle size={16} className="text-red-500" />
                                    )}
                                </div>
                                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {status.healthy ? (
                                        <>
                                            <div className="text-green-600 dark:text-green-400 font-medium">Operational</div>
                                            {status.latency > 0 && <div>Latency: {status.latency}ms</div>}
                                            {status.message && (
                                                <div className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                    {status.message.includes('inferred') && '✓ Inferred'}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-red-600 dark:text-red-400 font-medium">Unavailable</div>
                                            {(status.error || status.message) && (
                                                <div className="text-xs mt-1">{status.error || status.message}</div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Graphs Section */}
            {!serverDown && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Latency Graph */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>System Latency</h3>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Response time over time</p>
                            </div>
                            {history.length > 0 && (
                                <div className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Avg: {Math.round(history.reduce((sum, h) => sum + h.latency, 0) / history.length)}ms
                                </div>
                            )}
                        </div>
                        <div className="h-64">
                            {history.length > 0 ? (
                                <Line data={latencyChartData} options={lineChartOptions} />
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Collecting latency data...</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Error Rate Graph */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Error Rate</h3>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Percentage of failed requests</p>
                            </div>
                            {history.length > 0 && (
                                <div className={`text-sm font-semibold ${
                                    errorRate > 10 ? 'text-red-500' : errorRate > 5 ? 'text-yellow-500' : 'text-green-500'
                                }`}>
                                    {errorRate.toFixed(1)}%
                                </div>
                            )}
                        </div>
                        <div className="h-64">
                            {history.length > 0 ? (
                                <Line data={errorRateChartData} options={lineChartOptions} />
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Collecting error data...</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Response Time Distribution */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                    >
                        <h3 className={`text-lg font-bold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Response Time Distribution</h3>
                        <div className="h-64">
                            {history.length > 0 ? (
                                <Bar data={latencyDistributionData} options={barChartOptions} />
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Collecting distribution data...</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Summary Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                    >
                        <h3 className={`text-lg font-bold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Performance Summary</h3>
                        {history.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Checks</span>
                                    <span className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{history.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Success Rate</span>
                                    <span className={`text-lg font-bold text-green-500`}>
                                        {(100 - errorRate).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Latency</span>
                                    <span className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                        {Math.round(history.reduce((sum, h) => sum + h.latency, 0) / history.length)}ms
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Max Latency</span>
                                    <span className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                        {Math.max(...history.map(h => h.latency))}ms
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No data available</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}

            {/* Detailed Status Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <StatusCard
                        title="Health Check"
                        status={healthStatus?.status}
                        code={healthStatus}
                        icon={Activity}
                        type="health"
                        serverDown={serverDown}
                        lastErrorTime={lastErrorTime}
                        color={{ bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' }}
                    />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <StatusCard
                        title="Readiness"
                        status={readinessStatus?.status}
                        code={readinessStatus}
                        icon={CheckCircle2}
                        type="readiness"
                        serverDown={serverDown}
                        lastErrorTime={lastErrorTime}
                        color={{ bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' }}
                    />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <StatusCard
                        title="Liveness"
                        status={livenessStatus?.status}
                        code={livenessStatus}
                        icon={Zap}
                        type="liveness"
                        serverDown={serverDown}
                        lastErrorTime={lastErrorTime}
                        color={{ bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' }}
                    />
                </motion.div>
            </div>
        </div>
    );
};

// --- Verification Section (API) ---
const VerificationSection = ({ darkMode }: any) => {
    const [verifications, setVerifications] = useState<VerificationRequestType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        adminService.getVerificationRequests()
            .then(setVerifications)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        try {
            await adminService.handleVerificationAction(id, action);
            setVerifications((prev) => prev.filter((v) => v.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="flex justify-center py-8"><Loader size="md" darkMode={darkMode} /></div>;
    if (error) return <p className={`text-red-500 ${darkMode ? 'text-red-400' : ''}`}>Error: {error}</p>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Pending Verifications</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700'}`}>{verifications.length} Pending</span>
            </div>
            <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                    {verifications.map((item, i) => (
                        <motion.div layout key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }} className={`p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}><Building2 size={24} /></div>
                                <div>
                                    <h4 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{item.entity_name}</h4>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.entity_type} • Requested on {new Date(item.requested_date).toLocaleDateString()}</p>
                                    <div className="flex gap-2 mt-2">
                                        {item.documents.map((doc: string, j: number) => (
                                            <span key={j} className={`text-xs px-2 py-1 rounded-md border ${darkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>{doc}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                                <button onClick={() => handleAction(item.id, 'reject')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-colors font-medium text-sm ${darkMode ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}><XCircle size={18} />Reject</button>
                                <button onClick={() => handleAction(item.id, 'approve')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-colors font-medium text-sm ${darkMode ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}><CheckCircle2 size={18} />Approve</button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {verifications.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}><ShieldCheck size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />All verifications caught up!</motion.div>
                )}
            </div>
        </div>
    );
};

// --- Main Dashboard Component ---
export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [darkMode, setDarkMode] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);


    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <AnalyticsSection darkMode={darkMode} />;
            case 'system':
                return <SystemStatusSection darkMode={darkMode} />;
            case 'issuers':
                return <IssuersSection darkMode={darkMode} />;
            case 'learners':
                return <LearnersSection darkMode={darkMode} />;
            case 'employers':
                return <EmployersSection darkMode={darkMode} />;
            case 'verifications':
                return <VerificationSection darkMode={darkMode} />;
            case 'settings':
                return <SettingsSection darkMode={darkMode} />;
            default:
                return <AnalyticsSection darkMode={darkMode} />;
        }
    };

    return (
        <div className={`min-h-screen flex font-sans transition-colors duration-200 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-[#F8FAFC] text-gray-900'}`}>
            {/* Sidebar */}
            <motion.aside
                initial={{ x: -20, opacity: 0 }}
                animate={{
                    x: 0,
                    opacity: 1,
                    width: sidebarCollapsed ? '80px' : '256px'
                }}
                transition={{ duration: 0.3 }}
                className={`backdrop-blur-xl border-r fixed h-full z-10 hidden md:flex flex-col transition-colors duration-200 ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-100'}`}
            >
                <div className="p-6">
                    <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2'} mb-8`}>
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
                        {!sidebarCollapsed && <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">CredifyAdmin</span>}
                    </div>
                    <nav className="space-y-1">
                        <SidebarItem icon={BarChart3} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} darkMode={darkMode} collapsed={sidebarCollapsed} />
                        <SidebarItem icon={Activity} label="System Status" active={activeTab === 'system'} onClick={() => setActiveTab('system')} darkMode={darkMode} collapsed={sidebarCollapsed} />
                        <SidebarItem icon={Building2} label="Issuers" active={activeTab === 'issuers'} onClick={() => setActiveTab('issuers')} darkMode={darkMode} collapsed={sidebarCollapsed} />
                        <SidebarItem icon={Users} label="Learners" active={activeTab === 'learners'} onClick={() => setActiveTab('learners')} darkMode={darkMode} collapsed={sidebarCollapsed} />
                        <SidebarItem icon={Briefcase} label="Employers" active={activeTab === 'employers'} onClick={() => setActiveTab('employers')} darkMode={darkMode} collapsed={sidebarCollapsed} />
                        <SidebarItem icon={ShieldCheck} label="Verifications" active={activeTab === 'verifications'} onClick={() => setActiveTab('verifications')} darkMode={darkMode} collapsed={sidebarCollapsed} />
                    </nav>
                </div>
                <div className={`mt-auto p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-50'}`}>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} transition-colors w-full px-4 py-2 rounded-xl mb-3 ${activeTab === 'settings' ? (darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-blue-600') : (darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-900')}`}
                        title={sidebarCollapsed ? 'Settings' : ''}
                    >
                        <Settings size={20} />
                        {!sidebarCollapsed && <span className="font-medium text-sm">Settings</span>}
                    </button>
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className={`flex items-center justify-center transition-colors w-full px-4 py-2 rounded-xl ${darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
                        title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                    >
                        {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                        {!sidebarCollapsed && <span className="font-medium text-sm">Collapse</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <motion.main
                animate={{
                    marginLeft: sidebarCollapsed ? '80px' : '256px'
                }}
                transition={{ duration: 0.3 }}
                className="flex-1 p-8"
            >
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Welcome back, Administrator</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center">
                            <ThemeSwitch 
                                checked={darkMode} 
                                onChange={setDarkMode}
                                className="scale-[0.6]"
                            />
                        </div>
                        <button className={`p-2 rounded-full shadow-sm border transition-colors relative ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-blue-400' : 'bg-white border-gray-100 text-gray-500 hover:text-blue-600'}`}>
                            <Bell size={20} />
                            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className={`flex items-center gap-3 pl-4 border-l ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-0.5">
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" />
                                </div>
                            </div>
                            <div className="hidden lg:block">
                                <div className={`text-sm font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Admin User</div>
                                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Super Admin</div>
                            </div>
                        </div>
                    </div>
                </header>
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </motion.main>
        </div>
    );
}
