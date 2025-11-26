'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Activity,
    FileText,
    BarChart3,
    Search,
    Filter,
    GraduationCap,
    MapPin,
    Calendar,
    User,
    Award,
    TrendingUp,
    Mail,
    Phone,
    Globe,
    Linkedin,
    Github,
    Twitter,
} from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    adminService,
    LearnerAnalytics as LearnerAnalyticsType,
    Learner as LearnerType,
} from '@/services/admin.service';
import { StatCard } from './StatCard';
import { StatusBadge } from './StatusBadge';
import { KYCModal } from './KYCModal';
import { Loader } from './Loader';

interface LearnersSectionProps {
    darkMode: boolean;
}

export const LearnersSection: React.FC<LearnersSectionProps> = ({ darkMode }) => {
    const [analytics, setAnalytics] = useState<LearnerAnalyticsType | null>(null);
    const [learners, setLearners] = useState<LearnerType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLearner, setSelectedLearner] = useState<LearnerType | null>(null);
    const [showKYCModal, setShowKYCModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

    const fetchData = async () => {
        try {
            const [analyticsData, learnersData] = await Promise.all([
                adminService.getLearnerAnalytics(),
                adminService.getLearners(),
            ]);
            setAnalytics(analyticsData);
            setLearners(learnersData);
            setError(null);
        } catch (e: any) {
            setError(e.message || 'Failed to load learner data');
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

    const filteredLearners = learners.filter((learner) => {
        const query = searchQuery.toLowerCase();
        return (
            learner.name.toLowerCase().includes(query) ||
            learner.email.toLowerCase().includes(query) ||
            learner.skills?.some((skill) => skill.toLowerCase().includes(query))
        );
    });

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
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
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
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderRadius: 4,
            },
        ],
    };

    const statusData = {
        labels: ['Active', 'Inactive'],
        datasets: [
            {
                data: [
                    analytics.status_distribution.active || 0,
                    analytics.status_distribution.inactive || 0,
                ],
                backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(107, 114, 128, 0.8)'],
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
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(147, 51, 234, 0.8)',
                    'rgba(251, 146, 60, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                ],
                borderWidth: 0,
            },
        ],
    };

    const getSocialIcon = (platform: string) => {
        const lower = platform.toLowerCase();
        if (lower.includes('linkedin')) return Linkedin;
        if (lower.includes('github')) return Github;
        if (lower.includes('twitter') || lower.includes('x')) return Twitter;
        return Globe;
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Learners"
                    value={analytics.total_count}
                    change={analytics.growth.percentage}
                    icon={Users}
                    color="bg-green-500 text-green-500"
                    darkMode={darkMode}
                />
                <StatCard
                    title="Active Learners"
                    value={analytics.active_count}
                    change={0}
                    icon={Activity}
                    color="bg-blue-500 text-blue-500"
                    darkMode={darkMode}
                />
                <StatCard
                    title="Credentials Held"
                    value={analytics.total_credentials_held}
                    change={0}
                    icon={FileText}
                    color="bg-purple-500 text-purple-500"
                    darkMode={darkMode}
                />
                <StatCard
                    title="Avg per Learner"
                    value={analytics.average_credentials_per_learner}
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
                    Top Learners by Credentials
                </h3>
                <div className="space-y-4">
                    {analytics.top_performers.map((learner, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between p-3 rounded-lg transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                        darkMode
                                            ? 'bg-green-900/30 text-green-400'
                                            : 'bg-green-50 text-green-600'
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
                                        {learner.name}
                                    </span>
                                    <span
                                        className={`text-xs ml-2 ${
                                            darkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}
                                    >
                                        {learner.email}
                                    </span>
                                </div>
                            </div>
                            <span
                                className={`font-bold ${
                                    darkMode ? 'text-gray-100' : 'text-gray-900'
                                }`}
                            >
                                {learner.credentials_held} credentials
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Learners Grid/List */}
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
                        All Learners ({filteredLearners.length})
                    </h3>
                    <div className="flex gap-2 items-center">
                        <div className="relative">
                            <Search
                                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                                    darkMode ? 'text-gray-400' : 'text-gray-400'
                                }`}
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder="Search learners..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                                    darkMode
                                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-green-500'
                                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-500'
                                }`}
                            />
                        </div>
                        <div className="flex gap-1 rounded-lg border overflow-hidden">
                            <button
                                onClick={() => setViewMode('cards')}
                                className={`px-3 py-2 text-sm transition-colors ${
                                    viewMode === 'cards'
                                        ? darkMode
                                            ? 'bg-green-600 text-white'
                                            : 'bg-green-500 text-white'
                                        : darkMode
                                        ? 'text-gray-400 hover:bg-gray-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                Cards
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-2 text-sm transition-colors ${
                                    viewMode === 'list'
                                        ? darkMode
                                            ? 'bg-green-600 text-white'
                                            : 'bg-green-500 text-white'
                                        : darkMode
                                        ? 'text-gray-400 hover:bg-gray-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                List
                            </button>
                        </div>
                    </div>
                </div>

                {viewMode === 'cards' ? (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredLearners.map((learner, i) => (
                            <motion.div
                                key={learner.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className={`rounded-xl border overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 ${
                                    darkMode
                                        ? 'bg-gray-800/50 border-gray-700 hover:border-green-500/50'
                                        : 'bg-white border-gray-200 hover:border-green-500/50'
                                }`}
                            >
                                {/* Card Header */}
                                <div
                                    className={`p-4 border-b ${
                                        darkMode ? 'border-gray-700 bg-gray-900/30' : 'border-gray-100 bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4
                                                className={`font-semibold text-lg mb-1 ${
                                                    darkMode ? 'text-gray-100' : 'text-gray-900'
                                                }`}
                                            >
                                                {learner.name}
                                            </h4>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Mail size={12} />
                                                <span className="truncate">{learner.email}</span>
                                            </div>
                                        </div>
                                        <StatusBadge status={learner.status} darkMode={darkMode} />
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-4 space-y-4">
                                    {/* Profile Completion */}
                                    {learner.profile_completion !== undefined && (
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <span
                                                    className={`text-xs font-medium ${
                                                        darkMode ? 'text-gray-400' : 'text-gray-600'
                                                    }`}
                                                >
                                                    Profile Completion
                                                </span>
                                                <span
                                                    className={`text-xs font-bold ${
                                                        darkMode ? 'text-gray-300' : 'text-gray-700'
                                                    }`}
                                                >
                                                    {learner.profile_completion}%
                                                </span>
                                            </div>
                                            <div
                                                className={`h-2 rounded-full overflow-hidden ${
                                                    darkMode ? 'bg-gray-700' : 'bg-gray-200'
                                                }`}
                                            >
                                                <div
                                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                                                    style={{ width: `${learner.profile_completion}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Skills */}
                                    {learner.skills && learner.skills.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Award
                                                    size={14}
                                                    className={darkMode ? 'text-gray-400' : 'text-gray-500'}
                                                />
                                                <span
                                                    className={`text-xs font-medium ${
                                                        darkMode ? 'text-gray-400' : 'text-gray-600'
                                                    }`}
                                                >
                                                    Skills
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {learner.skills.slice(0, 4).map((skill, idx) => (
                                                    <span
                                                        key={idx}
                                                        className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                                                            darkMode
                                                                ? 'bg-blue-900/30 text-blue-400'
                                                                : 'bg-blue-50 text-blue-700'
                                                        }`}
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                                {learner.skills.length > 4 && (
                                                    <span
                                                        className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                                                            darkMode
                                                                ? 'bg-gray-700 text-gray-400'
                                                                : 'bg-gray-100 text-gray-600'
                                                        }`}
                                                    >
                                                        +{learner.skills.length - 4}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div
                                            className={`p-2 rounded-lg ${
                                                darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                                            }`}
                                        >
                                            <div
                                                className={`text-xs ${
                                                    darkMode ? 'text-gray-400' : 'text-gray-600'
                                                }`}
                                            >
                                                Credentials
                                            </div>
                                            <div
                                                className={`text-lg font-bold ${
                                                    darkMode ? 'text-gray-100' : 'text-gray-900'
                                                }`}
                                            >
                                                {learner.credentials_held}
                                            </div>
                                        </div>
                                        <div
                                            className={`p-2 rounded-lg ${
                                                darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                                            }`}
                                        >
                                            <div
                                                className={`text-xs ${
                                                    darkMode ? 'text-gray-400' : 'text-gray-600'
                                                }`}
                                            >
                                                KYC Status
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedLearner(learner);
                                                    setShowKYCModal(true);
                                                }}
                                                className={`text-xs font-medium px-2 py-0.5 rounded-full transition-all hover:scale-105 ${
                                                    learner.kyc_verified
                                                        ? darkMode
                                                            ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                                                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : darkMode
                                                        ? 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50'
                                                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                }`}
                                            >
                                                {learner.kyc_verified ? 'Verified' : 'Pending'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    <div className="space-y-1.5 pt-2 border-t border-gray-200 dark:border-gray-700">
                                        {learner.date_of_birth && (
                                            <div className="flex items-center gap-2 text-xs">
                                                <Calendar
                                                    size={12}
                                                    className={darkMode ? 'text-gray-500' : 'text-gray-400'}
                                                />
                                                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                                    DOB: {formatDate(learner.date_of_birth)}
                                                </span>
                                            </div>
                                        )}
                                        {learner.location && (
                                            <div className="flex items-center gap-2 text-xs">
                                                <MapPin
                                                    size={12}
                                                    className={darkMode ? 'text-gray-500' : 'text-gray-400'}
                                                />
                                                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                                    {Object.values(learner.location).filter(Boolean).join(', ') || 'Not specified'}
                                                </span>
                                            </div>
                                        )}
                                        {learner.education && Object.keys(learner.education).length > 0 && (
                                            <div className="flex items-center gap-2 text-xs">
                                                <GraduationCap
                                                    size={12}
                                                    className={darkMode ? 'text-gray-500' : 'text-gray-400'}
                                                />
                                                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                                    Education: {Object.keys(learner.education).length} entry/ies
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Social Links */}
                                    {learner.social_links && Object.keys(learner.social_links).length > 0 && (
                                        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                            <span
                                                className={`text-xs font-medium ${
                                                    darkMode ? 'text-gray-400' : 'text-gray-600'
                                                }`}
                                            >
                                                Social:
                                            </span>
                                            <div className="flex gap-2">
                                                {Object.entries(learner.social_links).slice(0, 3).map(([platform, url]) => {
                                                    const Icon = getSocialIcon(platform);
                                                    return (
                                                        <a
                                                            key={platform}
                                                            href={url as string}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`p-1.5 rounded transition-colors ${
                                                                darkMode
                                                                    ? 'text-gray-400 hover:text-green-400 hover:bg-gray-700'
                                                                    : 'text-gray-500 hover:text-green-600 hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            <Icon size={14} />
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700 text-xs">
                                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                                            Joined {formatDate(learner.created_at)}
                                        </span>
                                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                                            {learner.last_login ? `Last: ${formatDate(learner.last_login)}` : 'Never logged in'}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
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
                                        Skills
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
                                        Profile
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
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-50'}`}>
                                {filteredLearners.map((learner, i) => (
                                    <tr
                                        key={learner.id}
                                        className={`transition-colors ${
                                            darkMode
                                                ? 'hover:bg-gray-700/50'
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div
                                                    className={`font-medium ${
                                                        darkMode ? 'text-gray-100' : 'text-gray-900'
                                                    }`}
                                                >
                                                    {learner.name}
                                                </div>
                                                <div
                                                    className={`text-xs ${
                                                        darkMode ? 'text-gray-400' : 'text-gray-500'
                                                    }`}
                                                >
                                                    {learner.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1 max-w-xs">
                                                {learner.skills?.slice(0, 3).map((skill, idx) => (
                                                    <span
                                                        key={idx}
                                                        className={`px-2 py-0.5 rounded text-xs ${
                                                            darkMode
                                                                ? 'bg-blue-900/30 text-blue-400'
                                                                : 'bg-blue-50 text-blue-700'
                                                        }`}
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                                {learner.skills && learner.skills.length > 3 && (
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-xs ${
                                                            darkMode
                                                                ? 'text-gray-400'
                                                                : 'text-gray-500'
                                                        }`}
                                                    >
                                                        +{learner.skills.length - 3}
                                                    </span>
                                                )}
                                                {(!learner.skills || learner.skills.length === 0) && (
                                                    <span
                                                        className={`text-xs ${
                                                            darkMode ? 'text-gray-500' : 'text-gray-400'
                                                        }`}
                                                    >
                                                        No skills
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`text-sm font-medium ${
                                                    darkMode ? 'text-gray-300' : 'text-gray-700'
                                                }`}
                                            >
                                                {learner.credentials_held}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {learner.profile_completion !== undefined ? (
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`w-16 h-2 rounded-full overflow-hidden ${
                                                            darkMode ? 'bg-gray-700' : 'bg-gray-200'
                                                        }`}
                                                    >
                                                        <div
                                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                                            style={{ width: `${learner.profile_completion}%` }}
                                                        />
                                                    </div>
                                                    <span
                                                        className={`text-xs font-medium ${
                                                            darkMode ? 'text-gray-400' : 'text-gray-600'
                                                        }`}
                                                    >
                                                        {learner.profile_completion}%
                                                    </span>
                                                </div>
                                            ) : (
                                                <span
                                                    className={`text-xs ${
                                                        darkMode ? 'text-gray-500' : 'text-gray-400'
                                                    }`}
                                                >
                                                    N/A
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={learner.status} darkMode={darkMode} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => {
                                                    setSelectedLearner(learner);
                                                    setShowKYCModal(true);
                                                }}
                                                className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all hover:scale-105 ${
                                                    learner.kyc_verified
                                                        ? darkMode
                                                            ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                                                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : darkMode
                                                        ? 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50'
                                                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                }`}
                                            >
                                                {learner.kyc_verified ? 'Verified' : 'Pending'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div
                                                className={`text-xs ${
                                                    darkMode ? 'text-gray-400' : 'text-gray-500'
                                                }`}
                                            >
                                                {formatDate(learner.created_at)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            <KYCModal
                isOpen={showKYCModal}
                onClose={() => setShowKYCModal(false)}
                entity={selectedLearner}
                darkMode={darkMode}
            />
        </div>
    );
};
