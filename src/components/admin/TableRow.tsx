'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface TableRowProps {
    children: React.ReactNode;
    index: number;
    darkMode: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({ children, index, darkMode }) => {
    return (
        <motion.tr
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`border-b transition-all duration-200 ${
                darkMode
                    ? 'border-gray-700 hover:bg-gray-800/50'
                    : 'border-gray-50 hover:bg-gray-50'
            }`}
        >
            {children}
        </motion.tr>
    );
};


