'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';
import { Issuer, Learner, Employer } from '@/services/admin.service';

interface KYCModalProps {
    isOpen: boolean;
    onClose: () => void;
    entity: Issuer | Learner | Employer | null;
    darkMode: boolean;
}

export const KYCModal: React.FC<KYCModalProps> = ({ isOpen, onClose, entity, darkMode }) => {
    if (!isOpen || !entity) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-2xl rounded-2xl shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
                <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center">
                        <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            KYC Verification Details - {entity.name}
                        </h3>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-lg transition-colors ${
                                darkMode
                                    ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                            }`}
                        >
                            <XCircle size={20} />
                        </button>
                    </div>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {entity.kyc_verification ? (
                        <div className="space-y-4">
                            {entity.kyc_verification.documentVerification && (
                                <div
                                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                                        darkMode
                                            ? 'bg-gray-900/50 border-gray-700'
                                            : 'bg-gray-50 border-gray-200'
                                    }`}
                                >
                                    <h4
                                        className={`font-semibold mb-2 ${
                                            darkMode ? 'text-gray-200' : 'text-gray-800'
                                        }`}
                                    >
                                        Document Verification
                                    </h4>
                                    <div
                                        className={`text-sm space-y-1 ${
                                            darkMode ? 'text-gray-300' : 'text-gray-600'
                                        }`}
                                    >
                                        <p>
                                            Type:{' '}
                                            {entity.kyc_verification.documentVerification.type || 'N/A'}
                                        </p>
                                        <p>
                                            Status:{' '}
                                            {entity.kyc_verification.documentVerification.data?.status ||
                                                'N/A'}
                                        </p>
                                        {entity.kyc_verification.documentVerification.data?.pan && (
                                            <p>
                                                PAN:{' '}
                                                {entity.kyc_verification.documentVerification.data.pan}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                            {entity.kyc_verification.faceVerification && (
                                <div
                                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                                        darkMode
                                            ? 'bg-gray-900/50 border-gray-700'
                                            : 'bg-gray-50 border-gray-200'
                                    }`}
                                >
                                    <h4
                                        className={`font-semibold mb-2 ${
                                            darkMode ? 'text-gray-200' : 'text-gray-800'
                                        }`}
                                    >
                                        Face Verification
                                    </h4>
                                    <div
                                        className={`text-sm space-y-1 ${
                                            darkMode ? 'text-gray-300' : 'text-gray-600'
                                        }`}
                                    >
                                        <p>
                                            Status:{' '}
                                            {entity.kyc_verification.faceVerification.status || 'N/A'}
                                        </p>
                                        {entity.kyc_verification.faceVerification.timestamp && (
                                            <p>
                                                Timestamp:{' '}
                                                {new Date(
                                                    entity.kyc_verification.faceVerification.timestamp
                                                ).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                            {entity.kyc_verification.addressVerification && (
                                <div
                                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                                        darkMode
                                            ? 'bg-gray-900/50 border-gray-700'
                                            : 'bg-gray-50 border-gray-200'
                                    }`}
                                >
                                    <h4
                                        className={`font-semibold mb-2 ${
                                            darkMode ? 'text-gray-200' : 'text-gray-800'
                                        }`}
                                    >
                                        Address Verification
                                    </h4>
                                    <div
                                        className={`text-sm space-y-1 ${
                                            darkMode ? 'text-gray-300' : 'text-gray-600'
                                        }`}
                                    >
                                        <p>
                                            Status:{' '}
                                            {entity.kyc_verification.addressVerification.status || 'N/A'}
                                        </p>
                                        {entity.kyc_verification.addressVerification.address && (
                                            <div>
                                                <p>
                                                    {entity.kyc_verification.addressVerification.address
                                                        .house},{' '}
                                                    {entity.kyc_verification.addressVerification.address
                                                        .street}
                                                </p>
                                                <p>
                                                    {
                                                        entity.kyc_verification.addressVerification
                                                            .address.city
                                                    }
                                                </p>
                                            </div>
                                        )}
                                        {entity.kyc_verification.addressVerification.timestamp && (
                                            <p>
                                                Timestamp:{' '}
                                                {new Date(
                                                    entity.kyc_verification.addressVerification.timestamp
                                                ).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                            {entity.kyc_verification.emailVerification && (
                                <div
                                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                                        darkMode
                                            ? 'bg-gray-900/50 border-gray-700'
                                            : 'bg-gray-50 border-gray-200'
                                    }`}
                                >
                                    <h4
                                        className={`font-semibold mb-2 ${
                                            darkMode ? 'text-gray-200' : 'text-gray-800'
                                        }`}
                                    >
                                        Email Verification
                                    </h4>
                                    <div
                                        className={`text-sm space-y-1 ${
                                            darkMode ? 'text-gray-300' : 'text-gray-600'
                                        }`}
                                    >
                                        <p>
                                            Status:{' '}
                                            {entity.kyc_verification.emailVerification.status || 'N/A'}
                                        </p>
                                        <p>
                                            Email:{' '}
                                            {entity.kyc_verification.emailVerification.email || 'N/A'}
                                        </p>
                                        {entity.kyc_verification.emailVerification.timestamp && (
                                            <p>
                                                Timestamp:{' '}
                                                {new Date(
                                                    entity.kyc_verification.emailVerification.timestamp
                                                ).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                            {entity.kyc_verification.mobileVerification && (
                                <div
                                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                                        darkMode
                                            ? 'bg-gray-900/50 border-gray-700'
                                            : 'bg-gray-50 border-gray-200'
                                    }`}
                                >
                                    <h4
                                        className={`font-semibold mb-2 ${
                                            darkMode ? 'text-gray-200' : 'text-gray-800'
                                        }`}
                                    >
                                        Mobile Verification
                                    </h4>
                                    <div
                                        className={`text-sm space-y-1 ${
                                            darkMode ? 'text-gray-300' : 'text-gray-600'
                                        }`}
                                    >
                                        <p>
                                            Status:{' '}
                                            {entity.kyc_verification.mobileVerification.status || 'N/A'}
                                        </p>
                                        <p>
                                            Phone:{' '}
                                            {entity.kyc_verification.mobileVerification.phone || 'N/A'}
                                        </p>
                                        {entity.kyc_verification.mobileVerification.timestamp && (
                                            <p>
                                                Timestamp:{' '}
                                                {new Date(
                                                    entity.kyc_verification.mobileVerification.timestamp
                                                ).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p
                            className={`text-center py-8 ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}
                        >
                            No KYC verification data available
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};


