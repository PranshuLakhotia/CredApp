'use client';

import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  Share2,
  PieChart,
  Badge,
  Key,
  Folder,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  FileText,
  MessageCircle,
  TrendingUp,
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { UserRole } from '@/types/auth';

interface DashboardSidebarProps {
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
  userRole: UserRole;
}

export default function DashboardSidebar({ 
  sidebarExpanded, 
  setSidebarExpanded, 
  userRole 
}: DashboardSidebarProps) {
  const [openDashboards, setOpenDashboards] = useState(true);
  const [openPages, setOpenPages] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className={`${sidebarExpanded ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
      {/* Logo & User */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          {sidebarExpanded ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="font-semibold text-gray-900">Credify</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">C</span>
            </div>
          )}
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            {sidebarExpanded ? (
              <ChevronLeft size={16} className="text-gray-600" />
            ) : (
              <ChevronRight size={16} className="text-gray-600" />
            )}
          </button>
        </div>
        
        {sidebarExpanded && (
          <>
            <button className="w-full text-left text-sm text-gray-600 hover:text-gray-900 py-2 flex items-center gap-2 hover:bg-gray-50 rounded-md px-2 transition-colors">
              <Download size={16} />
              Download Portfolio
            </button>
            <button className="w-full text-left text-sm text-gray-600 hover:text-gray-900 py-2 flex items-center gap-2 hover:bg-gray-50 rounded-md px-2 transition-colors">
              <Share2 size={16} />
              Share Profile
            </button>
          </>
        )}
      </div>

      {/* Navigation - GitHub-like tree */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4">
          {/* DASHBOARDS Section */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
              {sidebarExpanded ? 'DASHBOARDS' : ''}
            </h3>
            
            <button
              onClick={() => handleNavigation(`/dashboard/${userRole}`)}
              className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors ${
                pathname === `/dashboard/${userRole}` 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <PieChart size={16} className={pathname === `/dashboard/${userRole}` ? 'text-blue-600' : 'text-gray-600'} />
              {sidebarExpanded && <span>Overview</span>}
            </button>

            <button
              onClick={() => handleNavigation(`/dashboard/${userRole}/analytics`)}
              className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors ${
                pathname === `/dashboard/${userRole}/analytics` 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BarChart3 size={16} className={pathname === `/dashboard/${userRole}/analytics` ? 'text-blue-600' : 'text-gray-600'} />
              {sidebarExpanded && <span>Analytics</span>}
            </button>

            <button
              onClick={() => handleNavigation(`/dashboard/${userRole}/credentials`)}
              className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors ${
                pathname === `/dashboard/${userRole}/credentials` 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Badge size={16} className={pathname === `/dashboard/${userRole}/credentials` ? 'text-blue-600' : 'text-gray-600'} />
              {sidebarExpanded && <span>Credentials</span>}
            </button>

            {userRole === 'learner' && (
              <button
                onClick={() => handleNavigation(`/dashboard/learner/recommendations`)}
                className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors ${
                  pathname === `/dashboard/learner/recommendations`
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <TrendingUp size={16} className={pathname === `/dashboard/learner/recommendations` ? 'text-blue-600' : 'text-gray-600'} />
                {sidebarExpanded && <span>Recommendations</span>}
              </button>
            )}
          </div>
          <div className="mt-8" />
          {sidebarExpanded && <p className="text-sm text-gray-500 mb-4 ml-2 font-medium">PAGES</p>}
          
          <button
            onClick={() => setOpenPages(!openPages)}
            className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          >
            {openPages ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <Folder size={16} className="text-gray-600" />
            {sidebarExpanded && <span className="font-medium">User Profile</span>}
          </button>
          
          {openPages && sidebarExpanded && (
            <div className="mt-2 space-y-1">
              <button 
                onClick={() => handleNavigation('/dashboard/profile')}
                className={`w-full flex items-center gap-2 px-6 py-2 text-sm rounded-md transition-colors ${
                  pathname === '/dashboard/profile' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Overview
              </button>
              <button 
                onClick={() => handleNavigation('/dashboard/profile/credentials')}
                className={`w-full flex items-center gap-2 px-6 py-2 text-sm rounded-md transition-colors ${
                  pathname === '/dashboard/profile/credentials' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Credentials
              </button>
              <button 
                onClick={() => handleNavigation('/dashboard/profile/pathways')}
                className={`w-full flex items-center gap-2 px-6 py-2 text-sm rounded-md transition-colors ${
                  pathname === '/dashboard/profile/pathways' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Pathways
              </button>
            </div>
          )}

          {/* Additional sections based on user role */}
          {/* {userRole === 'learner' && (
            <>
              <div className="mt-6" />
              <button
                onClick={() => handleNavigation('/dashboard/skills')}
                className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors ${
                  pathname === '/dashboard/skills' 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Key size={16} className={pathname === '/dashboard/skills' ? 'text-blue-600' : 'text-gray-600'} />
                {sidebarExpanded && <span>Skills</span>}
              </button>
            </>
          )} */}

          {userRole === 'employer' && (
            <>
              <div className="mt-6" />
              <button
                onClick={() => handleNavigation('/dashboard/candidates')}
                className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors ${
                  pathname === '/dashboard/candidates' 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Users size={16} className={pathname === '/dashboard/candidates' ? 'text-blue-600' : 'text-gray-600'} />
                {sidebarExpanded && <span>Candidates</span>}
              </button>
            </>
          )}

          {/* Additional Navigation Items */}
          <div className="mt-6" />
          
          <button
            onClick={() => handleNavigation('/dashboard/settings')}
            className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors ${
              pathname === '/dashboard/settings' 
                ? 'bg-blue-50 text-blue-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ChevronRight size={16} />
            <Settings size={16} className={pathname === '/dashboard/settings' ? 'text-blue-600' : 'text-gray-600'} />
            {sidebarExpanded && <span>Settings</span>}
          </button>

          <button
            onClick={() => handleNavigation('/dashboard/blog')}
            className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors ${
              pathname === '/dashboard/blog' 
                ? 'bg-blue-50 text-blue-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ChevronRight size={16} />
            <FileText size={16} className={pathname === '/dashboard/blog' ? 'text-blue-600' : 'text-gray-600'} />
            {sidebarExpanded && <span>Blog</span>}
          </button>

          <button
            onClick={() => handleNavigation('/dashboard/social')}
            className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors ${
              pathname === '/dashboard/social' 
                ? 'bg-blue-50 text-blue-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ChevronRight size={16} />
            <MessageCircle size={16} className={pathname === '/dashboard/social' ? 'text-blue-600' : 'text-gray-600'} />
            {sidebarExpanded && <span>Social</span>}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">        
        <button
          onClick={() => handleNavigation('/dashboard/help')}
          className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors ${
            pathname === '/dashboard/help' 
              ? 'bg-blue-50 text-blue-700 font-medium' 
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <HelpCircle size={16} className={pathname === '/dashboard/help' ? 'text-blue-600' : 'text-gray-600'} />
          {sidebarExpanded && <span>Help & Support</span>}
        </button>
      </div>
    </div>
  );
}
