'use client';

import React from 'react';

interface StatusBadgeProps {
    status: string;
    darkMode: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, darkMode }) => {
    const styles = {
        Verified: darkMode
            ? 'bg-green-900/30 text-green-400'
            : 'bg-green-100 text-green-700',
        Active: darkMode
            ? 'bg-green-900/30 text-green-400'
            : 'bg-green-100 text-green-700',
        Pending: darkMode
            ? 'bg-yellow-900/30 text-yellow-400'
            : 'bg-yellow-100 text-yellow-700',
        Inactive: darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-700',
    };
    const style =
        styles[status as keyof typeof styles] || styles.Inactive;
    return (
        <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-all hover:scale-105 ${style}`}
        >
            {status}
        </span>
    );
};


