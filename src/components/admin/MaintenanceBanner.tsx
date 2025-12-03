'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { adminService } from '@/services/admin.service';

interface MaintenanceBannerProps {
    onClose?: () => void;
}

export const MaintenanceBanner: React.FC<MaintenanceBannerProps> = ({ onClose }) => {
    const [maintenanceStatus, setMaintenanceStatus] = useState<{ enabled: boolean; message?: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkMaintenance = async () => {
            try {
                // First check localStorage
                const stored = localStorage.getItem('maintenanceMode');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setMaintenanceStatus(parsed);
                }

                // Then check API for latest status
                const status = await adminService.getMaintenanceStatus();
                setMaintenanceStatus({
                    enabled: status.maintenance_mode,
                    message: status.message
                });

                // Update localStorage
                localStorage.setItem('maintenanceMode', JSON.stringify({
                    enabled: status.maintenance_mode,
                    message: status.message
                }));
            } catch (error) {
                console.error('Failed to check maintenance status:', error);
                // Fallback to localStorage if API fails
                const stored = localStorage.getItem('maintenanceMode');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setMaintenanceStatus(parsed);
                }
            } finally {
                setLoading(false);
            }
        };

        checkMaintenance();
        
        // Check every 30 seconds
        const interval = setInterval(checkMaintenance, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading || !maintenanceStatus?.enabled) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 shadow-lg">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={20} className="flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-sm">System Maintenance</p>
                            <p className="text-xs">{maintenanceStatus.message || 'System is currently under maintenance. Please check back later.'}</p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-1 rounded hover:bg-yellow-600/20 transition-colors"
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

