'use client';

import React from 'react';
import {
    Users,
    Award,
    Building2,
    Activity,
    TrendingUp,
    AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleDateString()}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value="12,345"
                    change="+12%"
                    icon={<Users className="text-blue-600" size={24} />}
                    color="bg-blue-50"
                />
                <StatCard
                    title="Active Institutions"
                    value="45"
                    change="+2"
                    icon={<Building2 className="text-purple-600" size={24} />}
                    color="bg-purple-50"
                />
                <StatCard
                    title="Credentials Issued"
                    value="8,921"
                    change="+24%"
                    icon={<Award className="text-green-600" size={24} />}
                    color="bg-green-50"
                />
                <StatCard
                    title="System Health"
                    value="99.9%"
                    change="Stable"
                    icon={<Activity className="text-emerald-600" size={24} />}
                    color="bg-emerald-50"
                />
            </div>

            {/* Recent Activity & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity Chart Placeholder */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-gray-500" />
                        Platform Activity
                    </h2>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                        Activity Chart Visualization
                    </div>
                </div>

                {/* System Alerts */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <AlertCircle size={20} className="text-gray-500" />
                        System Alerts
                    </h2>
                    <div className="space-y-4">
                        <AlertItem
                            title="High API Usage"
                            time="2 hours ago"
                            severity="warning"
                        />
                        <AlertItem
                            title="New Institution Registration"
                            time="5 hours ago"
                            severity="info"
                        />
                        <AlertItem
                            title="Backup Completed"
                            time="1 day ago"
                            severity="success"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, change, icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${color}`}>
                    {icon}
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${change.includes('+') ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {change}
                </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
    );
}

function AlertItem({ title, time, severity }: any) {
    const colors = {
        warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        info: 'bg-blue-50 text-blue-700 border-blue-200',
        success: 'bg-green-50 text-green-700 border-green-200',
        error: 'bg-red-50 text-red-700 border-red-200',
    };

    return (
        <div className={`p-3 rounded-lg border ${colors[severity as keyof typeof colors]} flex justify-between items-center`}>
            <span className="font-medium text-sm">{title}</span>
            <span className="text-xs opacity-75">{time}</span>
        </div>
    );
}
