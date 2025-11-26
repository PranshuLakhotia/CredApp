'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    ShieldCheck,
    FileText,
    BarChart3,
    Search,
    Filter,
} from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    adminService,
    IssuerAnalytics as IssuerAnalyticsType,
    Issuer as IssuerType,
} from '@/services/admin.service';
import { StatCard } from './StatCard';
import { TableRow } from './TableRow';
import { StatusBadge } from './StatusBadge';
import { IssuerActionsMenu } from './IssuerActionsMenu';
import { KYCModal } from './KYCModal';
import { Loader } from './Loader';

interface IssuersSectionProps {
    darkMode: boolean;
}

export const IssuersSection: React.FC<IssuersSectionProps> = ({ darkMode }) => {
    const [analytics, setAnalytics] = useState<IssuerAnalyticsType | null>(null);
    const [issuers, setIssuers] = useState<IssuerType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedIssuer, setSelectedIssuer] = useState<IssuerType | null>(null);
    const [showKYCModal, setShowKYCModal] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const [analyticsData, issuersData] = await Promise.all([
                adminService.getIssuerAnalytics(),
                adminService.getIssuers(),
            ]);
            setAnalytics(analyticsData);
            setIssuers(issuersData);
            setError(null);
        } catch (e: any) {
            setError(e.message || 'Failed to load issuer data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        if (isMounted) {
            fetchData();
        }

        return () => {
            isMounted = false;
        };
    }, []);

    const handleIssuerAction = async (
        issuerId: string,
        action: 'suspend' | 'revoke_permissions' | 'disable_credentials' | 'restore'
    ) => {
        const actionLabels: Record<string, string> = {
            suspend: 'suspend',
            revoke_permissions: 'revoke permissions',
            disable_credentials: 'disable credentials',
            restore: 'restore',
        };

        if (
            !confirm(
                `Are you sure you want to ${actionLabels[action]} this issuer? This action will take effect immediately.`
            )
        ) {
            return;
        }

        setActionLoading(issuerId);
        try {
            await adminService.issuerAdminAction(issuerId, action, `Admin action: ${action}`);
            // Refresh the data
            await fetchData();
        } catch (e: any) {
            alert(`Failed to ${actionLabels[action]}: ${e.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader size="lg" darkMode={darkMode} />
            </div>
        );
    }
    if (error) {
        return (
            <p className={`text-red-500 ${darkMode ? 'text-red-400' : ''}`}>Error: {error}</p>
        );
    }
    if (!analytics) return null;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: { color: darkMode ? '#9CA3AF' : '#6B7280' },
            },
        },
        scales: {
            y: {
                grid: {
                    display: false,
                    color: darkMode ? '#374151' : '#F3F4F6',
                },
                ticks: { color: darkMode ? '#9CA3AF' : '#6B7280' },
            },
            x: {
                grid: {
                    display: false,
                    color: darkMode ? '#374151' : '#F3F4F6',
                },
                ticks: { color: darkMode ? '#9CA3AF' : '#6B7280' },
            },
        },
    };

    const dailyData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'New Registrations',
                data: analytics.registration_trends.daily,
                borderColor: 'rgb(79, 70, 229)',
                backgroundColor: 'rgba(79, 70, 229, 0.5)',
                tension: 0.4,
            },
        ],
    };

    const monthlyData = {
        labels: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ],
        datasets: [
            {
                label: 'Monthly Registrations',
                data: analytics.registration_trends.monthly,
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderRadius: 4,
            },
        ],
    };

    const statusData = {
        labels: ['Verified', 'Pending'],
        datasets: [
            {
                data: [
                    analytics.status_distribution.verified || 0,
                    analytics.status_distribution.pending || 0,
                ],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(251, 146, 60, 0.8)',
                ],
                borderWidth: 0,
            },
        ],
    };

    const credentialsByTypeData = {
        labels: analytics.credentials_by_type.slice(0, 5).map((c) => c.type),
        datasets: [
            {
                data: analytics.credentials_by_type.slice(0, 5).map((c) => c.count),
                backgroundColor: [
                    'rgba(79, 70, 229, 0.8)',
                    'rgba(147, 51, 234, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                ],
                borderWidth: 0,
            },
        ],
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Issuers"
                    value={analytics.total_count}
                    change={analytics.growth.percentage}
                    icon={Building2}
                    color="bg-blue-500 text-blue-500"
                    darkMode={darkMode}
                />
                <StatCard
                    title="Verified Issuers"
                    value={analytics.verified_count}
                    change={0}
                    icon={ShieldCheck}
                    color="bg-green-500 text-green-500"
                    darkMode={darkMode}
                />
                <StatCard
                    title="Credentials Issued"
                    value={analytics.total_credentials_issued}
                    change={0}
                    icon={FileText}
                    color="bg-purple-500 text-purple-500"
                    darkMode={darkMode}
                />
                <StatCard
                    title="Avg per Issuer"
                    value={analytics.average_credentials_per_issuer}
                    change={0}
                    icon={BarChart3}
                    color="bg-orange-500 text-orange-500"
                    darkMode={darkMode}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-2xl shadow-sm border transition-all hover:shadow-md ${
                        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                    }`}
                >
                    <h3
                        className={`text-lg font-semibold mb-4 ${
                            darkMode ? 'text-gray-100' : 'text-gray-800'
                        }`}
                    >
                        Daily Registrations (Last 7 Days)
                    </h3>
                    <div className="h-64">
                        <Line data={dailyData} options={chartOptions} />
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-2xl shadow-sm border transition-all hover:shadow-md ${
                        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                    }`}
                >
                    <h3
                        className={`text-lg font-semibold mb-4 ${
                            darkMode ? 'text-gray-100' : 'text-gray-800'
                        }`}
                    >
                        Status Distribution
                    </h3>
                    <div className="h-64 flex items-center justify-center">
                        <Doughnut
                            data={statusData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: { color: darkMode ? '#9CA3AF' : '#6B7280' },
                                    },
                                },
                                cutout: '70%',
                            }}
                        />
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-2xl shadow-sm border transition-all hover:shadow-md ${
                        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                    }`}
                >
                    <h3
                        className={`text-lg font-semibold mb-4 ${
                            darkMode ? 'text-gray-100' : 'text-gray-800'
                        }`}
                    >
                        Monthly Registrations
                    </h3>
                    <div className="h-64">
                        <Bar data={monthlyData} options={chartOptions} />
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-2xl shadow-sm border transition-all hover:shadow-md ${
                        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                    }`}
                >
                    <h3
                        className={`text-lg font-semibold mb-4 ${
                            darkMode ? 'text-gray-100' : 'text-gray-800'
                        }`}
                    >
                        Credentials by Type
                    </h3>
                    <div className="h-64 flex items-center justify-center">
                        <Doughnut
                            data={credentialsByTypeData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: { color: darkMode ? '#9CA3AF' : '#6B7280' },
                                    },
                                },
                                cutout: '70%',
                            }}
                        />
                    </div>
                </motion.div>
            </div>

            {/* Top Performers */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-2xl shadow-sm border transition-all hover:shadow-md ${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                }`}
            >
                <h3
                    className={`text-lg font-bold mb-4 ${
                        darkMode ? 'text-gray-100' : 'text-gray-800'
                    }`}
                >
                    Top Performing Issuers
                </h3>
                <div className="space-y-4">
                    {analytics.top_performers.map((issuer, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between p-3 rounded-lg transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                        darkMode
                                            ? 'bg-indigo-900/30 text-indigo-400'
                                            : 'bg-indigo-50 text-indigo-600'
                                    }`}
                                >
                                    {i + 1}
                                </div>
                                <div>
                                    <span
                                        className={`font-medium ${
                                            darkMode ? 'text-gray-200' : 'text-gray-700'
                                        }`}
                                    >
                                        {issuer.name}
                                    </span>
                                    <span
                                        className={`text-xs ml-2 ${
                                            darkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}
                                    >
                                        {issuer.type}
                                    </span>
                                </div>
                            </div>
                            <span
                                className={`font-bold ${
                                    darkMode ? 'text-gray-100' : 'text-gray-900'
                                }`}
                            >
                                {issuer.credentials_issued} credentials
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Full List Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                }`}
            >
                <div
                    className={`p-6 border-b flex justify-between items-center ${
                        darkMode ? 'border-gray-700' : 'border-gray-50'
                    }`}
                >
                    <h3
                        className={`text-lg font-semibold ${
                            darkMode ? 'text-gray-100' : 'text-gray-800'
                        }`}
                    >
                        All Issuers
                    </h3>
                    <div className="flex gap-2">
                        <button
                            className={`p-2 rounded-lg transition-colors ${
                                darkMode
                                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Search size={20} />
                        </button>
                        <button
                            className={`p-2 rounded-lg transition-colors ${
                                darkMode
                                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Filter size={20} />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className={darkMode ? 'bg-gray-900/50' : 'bg-gray-50/50'}>
                            <tr>
                                <th
                                    className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                                        darkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}
                                >
                                    Name
                                </th>
                                <th
                                    className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                                        darkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}
                                >
                                    Type
                                </th>
                                <th
                                    className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                                        darkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}
                                >
                                    Credentials
                                </th>
                                <th
                                    className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                                        darkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}
                                >
                                    Status
                                </th>
                                <th
                                    className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                                        darkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}
                                >
                                    KYC
                                </th>
                                <th
                                    className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                                        darkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}
                                >
                                    Created
                                </th>
                                <th
                                    className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                                        darkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}
                                >
                                    Last Login
                                </th>
                                <th
                                    className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                                        darkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-50'}`}>
                            {issuers.map((item, i) => (
                                <TableRow key={item.id} index={i} darkMode={darkMode}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all hover:scale-110 ${
                                                    darkMode
                                                        ? 'bg-indigo-900/30 text-indigo-400'
                                                        : 'bg-indigo-50 text-indigo-600'
                                                }`}
                                            >
                                                {item.name?.charAt(0) ?? 'I'}
                                            </div>
                                            <div>
                                                <div
                                                    className={`font-medium ${
                                                        darkMode ? 'text-gray-100' : 'text-gray-900'
                                                    }`}
                                                >
                                                    {item.name}
                                                </div>
                                                <div
                                                    className={`text-xs ${
                                                        darkMode ? 'text-gray-400' : 'text-gray-500'
                                                    }`}
                                                >
                                                    {item.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`text-sm ${
                                                darkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}
                                        >
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`text-sm font-medium ${
                                                darkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}
                                        >
                                            {item.credentials_issued}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={item.status} darkMode={darkMode} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => {
                                                setSelectedIssuer(item);
                                                setShowKYCModal(true);
                                            }}
                                            className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all hover:scale-105 ${
                                                item.kyc_verified
                                                    ? darkMode
                                                        ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : darkMode
                                                    ? 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50'
                                                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                            }`}
                                        >
                                            {item.kyc_verified ? 'Verified' : 'Pending'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div
                                            className={`text-xs ${
                                                darkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}
                                        >
                                            {item.created_at
                                                ? new Date(item.created_at).toLocaleDateString()
                                                : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div
                                            className={`text-xs ${
                                                darkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}
                                        >
                                            {item.last_login
                                                ? new Date(item.last_login).toLocaleDateString()
                                                : 'Never'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {actionLoading === item.id ? (
                                                <Loader
                                                    size="sm"
                                                    darkMode={darkMode}
                                                />
                                            ) : (
                                                <IssuerActionsMenu
                                                    issuerId={item.id}
                                                    isActive={item.is_active}
                                                    onAction={handleIssuerAction}
                                                    darkMode={darkMode}
                                                />
                                            )}
                                        </div>
                                    </td>
                                </TableRow>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            <KYCModal
                isOpen={showKYCModal}
                onClose={() => setShowKYCModal(false)}
                entity={selectedIssuer}
                darkMode={darkMode}
            />
        </div>
    );
};


