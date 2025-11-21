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
    User,
    Moon,
    Sun,
    Loader2,
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
    Issuer as IssuerType,
    Learner as LearnerType,
    Employer as EmployerType,
    VerificationRequest as VerificationRequestType,
} from '@/services/admin.service';

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

// --- Components (unchanged) ---
const SidebarItem = ({ icon: Icon, label, active, onClick, darkMode }: any) => (
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
    >
        <Icon size={20} className={active ? (darkMode ? 'text-blue-400' : 'text-blue-600') : (darkMode ? 'text-gray-500' : 'text-gray-400')} />
        <span className="font-medium text-sm">{label}</span>
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

// --- Analytics Section (now uses API) ---
const AnalyticsSection = ({ darkMode }: any) => {
    const [analytics, setAnalytics] = useState<AnalyticsType | null>(null);
    const [detailed, setDetailed] = useState<DetailedAnalyticsType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [a, d] = await Promise.all([adminService.getAnalytics(), adminService.getDetailedAnalytics()]);
                setAnalytics(a);
                setDetailed(d);
                setLoading(false);
            } catch (e: any) {
                setError(e.message || 'Failed to load analytics');
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }
    if (error) {
        return <p className={`text-center text-red-500 ${darkMode ? 'text-red-400' : ''}`}>Error: {error}</p>;
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

    return (
        <div className="space-y-6">
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

// --- List Section (generic) ---
const ListSection = ({ title, data, columns, darkMode }: any) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl shadow-sm border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className={`p-6 border-b flex justify-between items-center ${darkMode ? 'border-gray-700' : 'border-gray-50'}`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{title}</h3>
            <div className="flex gap-2">
                <button className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}><Search size={20} /></button>
                <button className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}><Filter size={20} /></button>
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className={darkMode ? 'bg-gray-900/50' : 'bg-gray-50/50'}>
                    <tr>
                        {columns.map((col: any, i: number) => (
                            <th key={i} className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{col.header}</th>
                        ))}
                        <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Actions</th>
                    </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-50'}`}>
                    {data.map((item: any, i: number) => (
                        <TableRow key={item.id} index={i} darkMode={darkMode}>
                            {columns.map((col: any, j: number) => (
                                <td key={j} className="px-6 py-4 whitespace-nowrap">
                                    {col.render ? col.render(item, darkMode) : <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item[col.key]}</span>}
                                </td>
                            ))}
                            <td className="px-6 py-4 whitespace-nowrap text-right"><button className={darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}><MoreVertical size={18} /></button></td>
                        </TableRow>
                    ))}
                </tbody>
            </table>
        </div>
    </motion.div>
);

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

    if (loading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
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

    // Data fetching for lists
    const [issuers, setIssuers] = useState<IssuerType[]>([]);
    const [learners, setLearners] = useState<LearnerType[]>([]);
    const [employers, setEmployers] = useState<EmployerType[]>([]);
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLists = async () => {
            try {
                const [i, l, e] = await Promise.all([
                    adminService.getIssuers(),
                    adminService.getLearners(),
                    adminService.getEmployers(),
                ]);
                setIssuers(i);
                setLearners(l);
                setEmployers(e);
                setListLoading(false);
            } catch (e: any) {
                setListError(e.message || 'Failed to load lists');
                setListLoading(false);
            }
        };
        fetchLists();
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <AnalyticsSection darkMode={darkMode} />;
            case 'issuers':
                return listLoading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-600" size={40} /></div> : (
                    <ListSection title="Registered Issuers" data={issuers} darkMode={darkMode} columns={[
                        { header: 'Name', key: 'name', render: (item: any, dark: boolean) => (<div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${dark ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>{item.logo?.charAt(0) ?? 'I'}</div><span className={`font-medium ${dark ? 'text-gray-100' : 'text-gray-900'}`}>{item.name}</span></div>) },
                        { header: 'Type', key: 'type' },
                        { header: 'Credentials', key: 'credentials_issued' },
                        { header: 'Status', key: 'status', render: (item: any, dark: boolean) => <StatusBadge status={item.status} darkMode={dark} /> }
                    ]} />
                );
            case 'learners':
                return listLoading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-600" size={40} /></div> : (
                    <ListSection title="Learner Directory" data={learners} darkMode={darkMode} columns={[
                        { header: 'Name', key: 'name', render: (item: any, dark: boolean) => (<div><div className={`font-medium ${dark ? 'text-gray-100' : 'text-gray-900'}`}>{item.name}</div><div className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{item.email}</div></div>) },
                        { header: 'Credentials Held', key: 'credentials_held' },
                        { header: 'Status', key: 'status', render: (item: any, dark: boolean) => <StatusBadge status={item.status} darkMode={dark} /> }
                    ]} />
                );
            case 'employers':
                return listLoading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-600" size={40} /></div> : (
                    <ListSection title="Employer Partners" data={employers} darkMode={darkMode} columns={[
                        { header: 'Company', key: 'name', render: (item: any, dark: boolean) => <span className={`font-medium ${dark ? 'text-gray-100' : 'text-gray-900'}`}>{item.name}</span> },
                        { header: 'Industry', key: 'industry' },
                        { header: 'Active Jobs', key: 'active_jobs' },
                        { header: 'Status', key: 'status', render: (item: any, dark: boolean) => <StatusBadge status={item.status} darkMode={dark} /> }
                    ]} />
                );
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
            <motion.aside initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className={`w-64 backdrop-blur-xl border-r fixed h-full z-10 hidden md:flex flex-col transition-colors duration-200 ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-100'}`}>
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">CredAdmin</span>
                    </div>
                    <nav className="space-y-1">
                        <SidebarItem icon={BarChart3} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} darkMode={darkMode} />
                        <SidebarItem icon={Building2} label="Issuers" active={activeTab === 'issuers'} onClick={() => setActiveTab('issuers')} darkMode={darkMode} />
                        <SidebarItem icon={Users} label="Learners" active={activeTab === 'learners'} onClick={() => setActiveTab('learners')} darkMode={darkMode} />
                        <SidebarItem icon={Briefcase} label="Employers" active={activeTab === 'employers'} onClick={() => setActiveTab('employers')} darkMode={darkMode} />
                        <SidebarItem icon={ShieldCheck} label="Verifications" active={activeTab === 'verifications'} onClick={() => setActiveTab('verifications')} darkMode={darkMode} />
                    </nav>
                </div>
                <div className={`mt-auto p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-50'}`}>
                    <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 transition-colors w-full px-4 py-2 rounded-xl mb-3 ${activeTab === 'settings' ? (darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-blue-600') : (darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-900')}`}>
                        <Settings size={20} />
                        <span className="font-medium text-sm">Settings</span>
                    </button>
                    <button onClick={() => setDarkMode(!darkMode)} className={`flex items-center gap-3 transition-colors w-full px-4 py-2 rounded-xl ${darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        <span className="font-medium text-sm">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Welcome back, Administrator</p>
                    </div>
                    <div className="flex items-center gap-4">
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
            </main>
        </div>
    );
}
