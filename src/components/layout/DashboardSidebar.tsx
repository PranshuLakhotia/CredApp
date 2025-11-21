'use client';

import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { toast } from 'react-hot-toast';
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
import ShareProfileModal from '@/components/modals/ShareProfileModal';
import { LearnerService } from '@/services/learner.service';
import { useTranslations } from '@/hooks/useTranslations';

interface DashboardSidebarProps {
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
  userRole: UserRole;
  onMobileClose?: () => void;
}

export default function DashboardSidebar({
  sidebarExpanded,
  setSidebarExpanded,
  userRole,
  onMobileClose
}: DashboardSidebarProps) {
  const [openDashboards, setOpenDashboards] = useState(true);
  const [openPages, setOpenPages] = useState(false);
  const [openCredentials, setOpenCredentials] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('dashboard');

  const handleNavigation = (path: string) => {
    // Append role query parameter for shared pages (profile, help)
    // This ensures the sidebar persists the correct role when navigating to these pages
    if ((path.includes('/dashboard/profile') || path.includes('/dashboard/help')) && userRole && userRole !== 'learner') {
      const separator = path.includes('?') ? '&' : '?';
      path = `${path}${separator}role=${userRole}`;
    }

    router.push(path);
    // Close mobile sidebar if it's open
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const handleDownloadPortfolio = async () => {
    try {
      const blob = await LearnerService.downloadPortfolio();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'portfolio.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(t('portfolioDownloadSuccess') || 'Portfolio downloaded successfully');
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading portfolio:', error);
      toast.error(t('portfolioDownloadError') || 'Failed to download portfolio');
    }
  };

  const handleShareProfile = () => {
    setShareModalOpen(true);
  };

  return (
    <div className={`${sidebarExpanded ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-full`}>
      {/* Logo & User */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          {sidebarExpanded ? (
            <svg width="100" height="50" viewBox="0 0 388 106" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M87.3006 25.5C87.3671 25.2868 87.4336 25.0743 87.5 24.8623C88.6384 20.8014 88.3406 18.7631 85 15.8623L66 1.8623C61.0271 -1.00737 58.8635 -0.600929 56 3.3623L43.5 24.8623H6C2.68629 24.8623 0 27.5486 0 30.8623V99.8623C0 103.176 2.68629 105.862 6 105.862H57C61.4057 99.4154 56.1561 95.8321 45.3873 88.4814C39.7427 84.6284 32.5817 79.7403 24.5 72.8623C24.5 72.8623 23.8567 72.2839 23.5 71.8623C20.7252 68.5829 21.0542 65.2012 23.5 60.8623L43.1457 25.5H87.3006ZM58.9336 105.862H58.5C58.6427 105.883 58.7872 105.882 58.9336 105.862Z" fill="#0279F2" />
              <path d="M87.5 24.8623C87.4336 25.0743 87.3671 25.2868 87.3006 25.5C84.6983 33.8392 82.0368 43.0725 79.3996 52.2216C71.6681 79.0444 64.1453 105.143 58.9336 105.862H102C105.314 105.862 108 103.176 108 99.8623V30.8623C108 27.5486 105.314 24.8623 102 24.8623H87.5Z" fill="#014B99" />
              <path d="M165.29 58.2866H150.326C149.638 53.2986 147.058 51.7506 143.962 51.7506C138.974 51.7506 136.308 56.2226 136.308 64.5646C136.308 72.8206 139.06 77.2926 144.392 77.2926C147.574 77.2926 149.81 75.4006 150.67 71.7026H165.548C163.57 83.3986 155.056 89.3326 144.048 89.3326C129.858 89.3326 121 79.7866 121 64.5646C121 48.7406 130.116 39.7106 143.962 39.7106C154.884 39.7106 163.656 45.8166 165.29 58.2866Z" fill="#014B99" />
              <path d="M167.911 87.7846V41.2586H182.789V47.6226C185.627 42.1186 190.013 39.7106 194.485 39.7106C196.463 39.7106 198.269 40.2266 199.129 41.2586V53.8146C197.495 53.4706 195.947 53.2986 193.797 53.2986C186.315 53.2986 182.789 57.4266 182.789 64.3926V87.7846H167.911Z" fill="#014B99" />
              <path d="M244.638 72.4766C242.23 83.1406 233.372 89.3326 221.59 89.3326C206.97 89.3326 197.768 79.8726 197.768 64.5646C197.768 48.7406 207.056 39.7106 221.074 39.7106C235.35 39.7106 244.294 49.0846 244.294 64.3926V67.6606H213.162C213.85 74.1106 216.774 77.5506 221.59 77.5506C225.374 77.5506 227.696 76.0026 228.986 72.4766H244.638ZM221.074 51.4926C216.946 51.4926 214.366 54.2446 213.42 59.4906H228.814C227.868 54.2446 225.202 51.4926 221.074 51.4926Z" fill="#014B99" />
              <path d="M264.575 89.3326C252.707 89.3326 245.139 79.8726 245.139 64.5646C245.139 48.7406 252.879 39.7106 264.575 39.7106C269.305 39.7106 273.089 41.6886 275.841 45.5586V25.8646H290.719V87.7846H275.841V83.2266C273.089 87.1826 269.219 89.3326 264.575 89.3326ZM268.101 77.2926C273.175 77.2926 275.841 72.8206 275.841 64.5646C275.841 56.2226 273.175 51.7506 268.101 51.7506C263.113 51.7506 260.447 56.2226 260.447 64.5646C260.447 72.8206 263.113 77.2926 268.101 77.2926Z" fill="#014B99" />
              <path d="M310.951 52.6106V41.2586H316.369C316.455 30.1646 321.873 24.3166 330.989 24.3166C334.859 24.3166 337.611 25.0906 338.987 25.7786V34.9806H337.955C332.451 34.9806 331.247 37.3886 331.247 41.2586H338.987V52.6106H331.247V87.7846H316.369V52.6106H310.951Z" fill="#014B99" />
              <path d="M352 63C352 63 348.681 55 341.181 41.2583H350.234C353.363 41.3138 355 41 357.5 46.5L358.5 48.5C366.201 28.6023 372.39 22.1827 386 23L387.5 23.5C361 62 366 89.5 341 88L351.5 67C352.337 65.1285 352.957 64.6244 352 63Z" fill="#014B99" />
              <path d="M293.622 87.7843V41.2583H308.5V87.7843H293.622Z" fill="#014B99" />
              <circle cx="301" cy="28" r="8" fill="#0279F2" />
            </svg>
          ) : (
            <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center mx-auto">
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

        {sidebarExpanded && userRole == 'learner' && (
          <>
            <button
              onClick={handleDownloadPortfolio}
              className="w-full text-left text-sm text-gray-600 hover:text-gray-900 py-2 flex items-center gap-2 hover:bg-gray-50 rounded-md px-2 transition-colors"
            >
              <Download size={16} />
              {t('downloadPortfolio')}
            </button>
            <button
              onClick={handleShareProfile}
              className="w-full text-left text-sm text-gray-600 hover:text-gray-900 py-2 flex items-center gap-2 hover:bg-gray-50 rounded-md px-2 transition-colors"
            >
              <Share2 size={16} />
              {t('shareProfile')}
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
              className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors ${pathname === `/dashboard/${userRole}`
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              <PieChart size={16} className={pathname === `/dashboard/${userRole}` ? 'text-blue-600' : 'text-gray-600'} />
              {sidebarExpanded && <span>{t('overview')}</span>}
            </button>

          </div>

          {/* CREDENTIALS Section - Only for Institution */}
          {userRole === 'institution' && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                {sidebarExpanded ? 'CREDENTIALS' : ''}
              </h3>

              <button
                onClick={() => setOpenCredentials(!openCredentials)}
                className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                {openCredentials ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <Badge size={16} className="text-gray-600" />
                {sidebarExpanded && <span className="font-medium">Credentials</span>}
              </button>

              {openCredentials && sidebarExpanded && (
                <div className="mt-2 space-y-1">
                  <button
                    onClick={() => handleNavigation('/dashboard/institution/credentials')}
                    className={`w-full flex items-center gap-2 px-6 py-2 text-sm rounded-md transition-colors ${pathname === '/dashboard/institution/credentials'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    Issue Single Credential
                  </button>
                  <button
                    onClick={() => handleNavigation('/dashboard/institution/bulk-credentials')}
                    className={`w-full flex items-center gap-2 px-6 py-2 text-sm rounded-md transition-colors ${pathname === '/dashboard/institution/bulk-credentials'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    Issue Bulk Credentials
                  </button>
                </div>
              )}
            </div>
          )}

          {/* API KEYS Section - Only for Institution */}
          {userRole === 'institution' && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                {sidebarExpanded ? 'API KEYS' : ''}
              </h3>

              <button
                onClick={() => handleNavigation('/dashboard/institution/api-keys')}
                className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors ${pathname === '/dashboard/institution/api-keys'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Key size={16} className={pathname === '/dashboard/institution/api-keys' ? 'text-blue-600' : 'text-gray-600'} />
                {sidebarExpanded && <span>API Keys</span>}
              </button>
            </div>
          )}

          <div className="mt-8" />
          {sidebarExpanded && <p className="text-sm text-gray-500 mb-4 ml-2 font-medium">PAGES</p>}


          <button
            onClick={() => setOpenPages(!openPages)}
            className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          >
            {openPages ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <Folder size={16} className="text-gray-600" />
            {sidebarExpanded && <span className="font-medium">{t('userProfile')}</span>}
          </button>

          {openPages && sidebarExpanded && (
            <div className="mt-2 space-y-1">
              <button
                onClick={() => handleNavigation('/dashboard/profile')}
                className={`w-full flex items-center gap-2 px-6 py-2 text-sm rounded-md transition-colors ${pathname === '/dashboard/profile'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                Overview
              </button>
              <button
                onClick={() => handleNavigation('/dashboard/profile/credentials')}
                className={`w-full flex items-center gap-2 px-6 py-2 text-sm rounded-md transition-colors ${pathname === '/dashboard/profile/credentials'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                Credentials
              </button>
              <button
                onClick={() => handleNavigation('/dashboard/profile/pathways')}
                className={`w-full flex items-center gap-2 px-6 py-2 text-sm rounded-md transition-colors ${pathname === '/dashboard/profile/pathways'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                Pathways
              </button>
            </div>
          )}

          {/* Additional sections based on user role */}
          {userRole === 'learner' && (
            <>
              <div className="mt-6" />
              <button
                onClick={() => handleNavigation('/dashboard/learner/recommendations')}
                className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors ${pathname === '/dashboard/learner/recommendations'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <TrendingUp size={16} className={pathname === '/dashboard/learner/recommendations' ? 'text-blue-600' : 'text-gray-600'} />
                {sidebarExpanded && <span>Recommendations</span>}
              </button>
            </>
          )}

          {userRole === 'employer' && (
            <>
              <div className="mt-6" />
              <button
                onClick={() => handleNavigation('/dashboard/employer')}
                className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors ${pathname === '/dashboard/employer'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <PieChart size={16} className={pathname === '/dashboard/employer' ? 'text-blue-600' : 'text-gray-600'} />
                {sidebarExpanded && <span>Overview</span>}
              </button>

              <button
                onClick={() => handleNavigation('/dashboard/employer/verify-credentials')}
                className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors ${pathname === '/dashboard/employer/verify-credentials'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Badge size={16} className={pathname === '/dashboard/employer/verify-credentials' ? 'text-blue-600' : 'text-gray-600'} />
                {sidebarExpanded && <span>Verify Credentials</span>}
              </button>

              <button
                onClick={() => handleNavigation('/dashboard/employer/verified-credentials')}
                className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors ${pathname === '/dashboard/employer/verified-credentials'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <FileText size={16} className={pathname === '/dashboard/employer/verified-credentials' ? 'text-blue-600' : 'text-gray-600'} />
                {sidebarExpanded && <span>Verified Credentials</span>}
              </button>

              <button
                onClick={() => handleNavigation('/dashboard/employer/candidate-directory')}
                className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors ${pathname === '/dashboard/employer/candidate-directory'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Users size={16} className={pathname === '/dashboard/employer/candidate-directory' ? 'text-blue-600' : 'text-gray-600'} />
                {sidebarExpanded && <span>Candidate Directory</span>}
              </button>

              <button
                onClick={() => handleNavigation('/dashboard/employer/search-learners')}
                className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors ${pathname === '/dashboard/employer/search-learners'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <TrendingUp size={16} className={pathname === '/dashboard/employer/search-learners' ? 'text-blue-600' : 'text-gray-600'} />
                {sidebarExpanded && <span>Search Learners</span>}
              </button>
            </>
          )}

        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={() => handleNavigation('/dashboard/help')}
          className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors ${pathname === '/dashboard/help'
            ? 'bg-blue-50 text-blue-700 font-medium'
            : 'text-gray-700 hover:bg-gray-50'
            }`}
        >
          <HelpCircle size={16} className={pathname === '/dashboard/help' ? 'text-blue-600' : 'text-gray-600'} />
          {sidebarExpanded && <span>Help & Support</span>}
        </button>
      </div>

      {/* Share Profile Modal */}
      <ShareProfileModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  );
}
