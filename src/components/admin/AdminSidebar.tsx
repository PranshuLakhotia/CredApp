'use client';

import React, { useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Users,
    Settings,
    BarChart3,
    Shield,
    LogOut,
    LayoutDashboard
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface AdminSidebarProps {
    sidebarExpanded: boolean;
    setSidebarExpanded: (expanded: boolean) => void;
}

export default function AdminSidebar({
    sidebarExpanded,
    setSidebarExpanded
}: AdminSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { logout } = useAuth();

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/auth/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <div className={`${sidebarExpanded ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col h-full`}>
            {/* Logo */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                {sidebarExpanded ? (
                    <div className="font-bold text-xl tracking-wider text-blue-400">ADMIN</div>
                ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
                        <span className="text-white font-bold text-sm">A</span>
                    </div>
                )}
                <button
                    onClick={() => setSidebarExpanded(!sidebarExpanded)}
                    className="p-1 rounded-md hover:bg-slate-800 transition-colors"
                >
                    {sidebarExpanded ? (
                        <ChevronLeft size={16} className="text-slate-400" />
                    ) : (
                        <ChevronRight size={16} className="text-slate-400" />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
                <div className="px-2 space-y-1">
                    <button
                        onClick={() => handleNavigation('/admin')}
                        className={`w-full flex items-center gap-3 px-3 py-3 text-sm rounded-md transition-colors ${pathname === '/admin'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <LayoutDashboard size={20} />
                        {sidebarExpanded && <span>Dashboard</span>}
                    </button>

                    <button
                        onClick={() => handleNavigation('/admin/users')}
                        className={`w-full flex items-center gap-3 px-3 py-3 text-sm rounded-md transition-colors ${pathname === '/admin/users'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <Users size={20} />
                        {sidebarExpanded && <span>User Management</span>}
                    </button>

                    <button
                        onClick={() => handleNavigation('/admin/analytics')}
                        className={`w-full flex items-center gap-3 px-3 py-3 text-sm rounded-md transition-colors ${pathname === '/admin/analytics'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <BarChart3 size={20} />
                        {sidebarExpanded && <span>Analytics</span>}
                    </button>

                    <button
                        onClick={() => handleNavigation('/admin/settings')}
                        className={`w-full flex items-center gap-3 px-3 py-3 text-sm rounded-md transition-colors ${pathname === '/admin/settings'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <Settings size={20} />
                        {sidebarExpanded && <span>Settings</span>}
                    </button>

                    <button
                        onClick={() => handleNavigation('/admin/security')}
                        className={`w-full flex items-center gap-3 px-3 py-3 text-sm rounded-md transition-colors ${pathname === '/admin/security'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <Shield size={20} />
                        {sidebarExpanded && <span>Security</span>}
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 text-sm rounded-md text-red-400 hover:bg-slate-800 transition-colors"
                >
                    <LogOut size={20} />
                    {sidebarExpanded && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
}
