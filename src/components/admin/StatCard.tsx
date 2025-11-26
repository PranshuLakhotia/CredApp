'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: number;
    change: number;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
    darkMode: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    change,
    icon: Icon,
    color,
    darkMode,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`p-6 rounded-2xl shadow-sm border transition-all hover:shadow-md cursor-pointer ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                    <Icon size={24} className={color.replace('bg-', 'text-')} />
                </div>
                <span
                    className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                        change >= 0
                            ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                >
                    {change >= 0 ? (
                        <ArrowUpRight size={14} className="mr-1" />
                    ) : (
                        <ArrowDownRight size={14} className="mr-1" />
                    )}
                    {Math.abs(change)}%
                </span>
            </div>
            <h3
                className={`text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
            >
                {title}
            </h3>
            <p className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {value?.toLocaleString() ?? '-'}
            </p>
        </motion.div>
    );
};


