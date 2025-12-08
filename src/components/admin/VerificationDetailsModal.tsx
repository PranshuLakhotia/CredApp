'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XCircle, Building2, User, FileText, Shield, MapPin, Phone, Mail, Globe, Calendar, CheckCircle, XCircle as XCircleIcon, Clock } from 'lucide-react';
import { DetailedVerificationRequest } from '@/services/admin.service';
import { adminService } from '@/services/admin.service';
import { Loader } from './Loader';

interface VerificationDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    verificationId: string | null;
    darkMode: boolean;
    onActionComplete?: () => void;
}

export const VerificationDetailsModal: React.FC<VerificationDetailsModalProps> = ({
    isOpen,
    onClose,
    verificationId,
    darkMode,
    onActionComplete
}) => {
    const [verification, setVerification] = useState<DetailedVerificationRequest | null>(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    useEffect(() => {
        if (isOpen && verificationId) {
            fetchVerificationDetails();
        } else {
            setVerification(null);
            setShowRejectInput(false);
            setRejectionReason('');
        }
    }, [isOpen, verificationId]);

    const fetchVerificationDetails = async () => {
        if (!verificationId) return;
        
        setLoading(true);
        try {
            const data = await adminService.getVerificationDetails(verificationId);
            setVerification(data);
        } catch (error: any) {
            console.error('Error fetching verification details:', error);
            alert('Failed to load verification details: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!verificationId) return;
        
        if (!confirm('Are you sure you want to approve this verification request?')) {
            return;
        }

        setActionLoading(true);
        try {
            await adminService.handleVerificationAction(verificationId, 'approve');
            alert('Verification approved successfully!');
            onActionComplete?.();
            onClose();
        } catch (error: any) {
            alert('Failed to approve verification: ' + error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!verificationId) return;
        
        if (!rejectionReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        if (!confirm('Are you sure you want to reject this verification request?')) {
            return;
        }

        setActionLoading(true);
        try {
            await adminService.handleVerificationAction(verificationId, 'reject', rejectionReason);
            alert('Verification rejected successfully!');
            onActionComplete?.();
            onClose();
        } catch (error: any) {
            alert('Failed to reject verification: ' + error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handlePhysicalVerification = async () => {
        if (!verificationId) return;
        
        if (!confirm('Mark this verification request for physical verification? The issuer will be notified that our team will contact them.')) {
            return;
        }

        setActionLoading(true);
        try {
            await adminService.handleVerificationAction(verificationId, 'physical_verification', 'Marked for physical verification by admin');
            alert('Verification request marked for physical verification! The issuer will be notified.');
            onActionComplete?.();
            onClose();
        } catch (error: any) {
            alert('Failed to mark for physical verification: ' + error.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (!isOpen) return null;

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
                className={`w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                }`}
            >
                {/* Header */}
                <div className={`p-6 border-b flex-shrink-0 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center">
                        <h3 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            Verification Request Details
                        </h3>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-lg transition-colors ${
                                darkMode
                                    ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                            }`}
                        >
                            <XCircle size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader size="lg" darkMode={darkMode} />
                        </div>
                    ) : verification ? (
                        <div className="space-y-6">
                            {/* User Registration Information */}
                            <div
                                className={`p-6 rounded-xl border transition-all ${
                                    darkMode
                                        ? 'bg-gray-900/50 border-gray-700'
                                        : 'bg-blue-50 border-blue-200'
                                }`}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <User className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                    <h4 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                        User Registration Information
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Full Name
                                        </label>
                                        <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.user_full_name || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Email
                                        </label>
                                        <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.user_email || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Phone Number
                                        </label>
                                        <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.user_phone_number || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Date of Birth
                                        </label>
                                        <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.user_date_of_birth
                                                ? new Date(verification.user_date_of_birth).toLocaleDateString()
                                                : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Gender
                                        </label>
                                        <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.user_gender || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Account Created
                                        </label>
                                        <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.user_created_at
                                                ? new Date(verification.user_created_at).toLocaleString()
                                                : 'N/A'}
                                        </p>
                                    </div>
                                    {verification.user_address && (
                                        <div className="md:col-span-2">
                                            <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Address
                                            </label>
                                            <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                {typeof verification.user_address === 'object'
                                                    ? JSON.stringify(verification.user_address, null, 2)
                                                    : verification.user_address}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* KYC Verification */}
                            {verification.kyc_verification && (
                                <div
                                    className={`p-6 rounded-xl border transition-all ${
                                        darkMode
                                            ? 'bg-gray-900/50 border-gray-700'
                                            : 'bg-green-50 border-green-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <Shield className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                                        <h4 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                            KYC Verification Status
                                        </h4>
                                        {verification.kyc_verified && (
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                                            }`}>
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        {verification.kyc_verification.documentVerification && (
                                            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                                <h5 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                                    Document Verification
                                                </h5>
                                                <div className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    <p>Type: {verification.kyc_verification.documentVerification.type || 'N/A'}</p>
                                                    <p>Status: {verification.kyc_verification.documentVerification.data?.status || 'N/A'}</p>
                                                    {verification.kyc_verification.documentVerification.data?.pan && (
                                                        <p>PAN: {verification.kyc_verification.documentVerification.data.pan}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {verification.kyc_verification.faceVerification && (
                                            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                                <h5 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                                    Face Verification
                                                </h5>
                                                <div className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    <p>Status: {verification.kyc_verification.faceVerification.status || 'N/A'}</p>
                                                    {verification.kyc_verification.faceVerification.timestamp && (
                                                        <p>Timestamp: {new Date(verification.kyc_verification.faceVerification.timestamp).toLocaleString()}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {verification.kyc_verification.addressVerification && (
                                            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                                <h5 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                                    Address Verification
                                                </h5>
                                                <div className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    <p>Status: {verification.kyc_verification.addressVerification.status || 'N/A'}</p>
                                                    {verification.kyc_verification.addressVerification.address && (
                                                        <div>
                                                            <p>{verification.kyc_verification.addressVerification.address.house}, {verification.kyc_verification.addressVerification.address.street}</p>
                                                            <p>{verification.kyc_verification.addressVerification.address.city}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {verification.kyc_verification.emailVerification && (
                                            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                                <h5 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                                    Email Verification
                                                </h5>
                                                <div className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    <p>Status: {verification.kyc_verification.emailVerification.status || 'N/A'}</p>
                                                    <p>Email: {verification.kyc_verification.emailVerification.email || 'N/A'}</p>
                                                </div>
                                            </div>
                                        )}
                                        {verification.kyc_verification.mobileVerification && (
                                            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                                <h5 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                                    Mobile Verification
                                                </h5>
                                                <div className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    <p>Status: {verification.kyc_verification.mobileVerification.status || 'N/A'}</p>
                                                    <p>Phone: {verification.kyc_verification.mobileVerification.phone || 'N/A'}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Organization Details */}
                            <div
                                className={`p-6 rounded-xl border transition-all ${
                                    darkMode
                                        ? 'bg-gray-900/50 border-gray-700'
                                        : 'bg-purple-50 border-purple-200'
                                }`}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <Building2 className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                                    <h4 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                        Organization Details
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Organization Name
                                        </label>
                                        <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.organization_name || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Organization Type
                                        </label>
                                        <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.organization_type || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Registration Number
                                        </label>
                                        <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.registration_number || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Year Established
                                        </label>
                                        <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.year_established || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Website
                                        </label>
                                        <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.website ? (
                                                <a href={verification.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    {verification.website}
                                                </a>
                                            ) : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Government Documents */}
                            <div
                                className={`p-6 rounded-xl border transition-all ${
                                    darkMode
                                        ? 'bg-gray-900/50 border-gray-700'
                                        : 'bg-orange-50 border-orange-200'
                                }`}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <FileText className={`w-6 h-6 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                                    <h4 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                        Government Documents
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Government ID Type
                                        </label>
                                        <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.govt_id_type || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Government ID Number
                                        </label>
                                        <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.govt_id_number || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Tax ID / GSTIN
                                        </label>
                                        <p className={`mt-1 font-mono ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.tax_id || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Registration Certificate
                                        </label>
                                        <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.registration_certificate_url ? (
                                                <a href={verification.registration_certificate_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    View Document
                                                </a>
                                            ) : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div
                                className={`p-6 rounded-xl border transition-all ${
                                    darkMode
                                        ? 'bg-gray-900/50 border-gray-700'
                                        : 'bg-indigo-50 border-indigo-200'
                                }`}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <Phone className={`w-6 h-6 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                                    <h4 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                        Contact Information
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Official Email
                                        </label>
                                        <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.official_email || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Official Phone
                                        </label>
                                        <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.official_phone || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div
                                className={`p-6 rounded-xl border transition-all ${
                                    darkMode
                                        ? 'bg-gray-900/50 border-gray-700'
                                        : 'bg-teal-50 border-teal-200'
                                }`}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <MapPin className={`w-6 h-6 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`} />
                                    <h4 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                        Organization Address
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Address Line 1
                                        </label>
                                        <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.address_line1 || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Address Line 2
                                        </label>
                                        <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.address_line2 || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            City
                                        </label>
                                        <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.city || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            State
                                        </label>
                                        <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.state || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Postal Code
                                        </label>
                                        <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.postal_code || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Country
                                        </label>
                                        <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.country || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Authorized Representative */}
                            <div
                                className={`p-6 rounded-xl border transition-all ${
                                    darkMode
                                        ? 'bg-gray-900/50 border-gray-700'
                                        : 'bg-pink-50 border-pink-200'
                                }`}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <User className={`w-6 h-6 ${darkMode ? 'text-pink-400' : 'text-pink-600'}`} />
                                    <h4 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                        Authorized Representative
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Name
                                        </label>
                                        <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.representative_name || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Designation
                                        </label>
                                        <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.representative_designation || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Email
                                        </label>
                                        <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.representative_email || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Phone
                                        </label>
                                        <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.representative_phone || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            ID Proof
                                        </label>
                                        <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {verification.representative_id_proof_url ? (
                                                <a href={verification.representative_id_proof_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    View ID Proof
                                                </a>
                                            ) : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Rejection Reason Input */}
                            {showRejectInput && (
                                <div className={`p-4 rounded-lg border ${darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'}`}>
                                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                        Reason for Rejection *
                                    </label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Please provide a reason for rejecting this verification request..."
                                        className={`w-full p-3 rounded-lg border ${
                                            darkMode
                                                ? 'bg-gray-800 border-gray-600 text-gray-200'
                                                : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                        rows={3}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            No verification data available
                        </p>
                    )}
                </div>

                {/* Footer Actions */}
                {verification && (
                    <div className={`p-6 border-t flex-shrink-0 flex gap-3 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <button
                            onClick={() => setShowRejectInput(!showRejectInput)}
                            disabled={actionLoading}
                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                                darkMode
                                    ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                            } disabled:opacity-50`}
                        >
                            {showRejectInput ? 'Cancel Rejection' : 'Reject'}
                        </button>
                        <button
                            onClick={handlePhysicalVerification}
                            disabled={actionLoading}
                            className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                                darkMode
                                    ? 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50'
                                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            } disabled:opacity-50`}
                        >
                            {actionLoading ? (
                                <>
                                    <Loader size="sm" darkMode={darkMode} />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Clock size={18} />
                                    Physical Verification
                                </>
                            )}
                        </button>
                        <div className="flex-1" />
                        {showRejectInput ? (
                            <button
                                onClick={handleReject}
                                disabled={actionLoading || !rejectionReason.trim()}
                                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                                    darkMode
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'bg-red-600 text-white hover:bg-red-700'
                                } disabled:opacity-50`}
                            >
                                {actionLoading ? (
                                    <>
                                        <Loader size="sm" darkMode={darkMode} />
                                        Rejecting...
                                    </>
                                ) : (
                                    <>
                                        <XCircleIcon size={18} />
                                        Confirm Rejection
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleApprove}
                                disabled={actionLoading}
                                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                                    darkMode
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                } disabled:opacity-50`}
                            >
                                {actionLoading ? (
                                    <>
                                        <Loader size="sm" darkMode={darkMode} />
                                        Approving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={18} />
                                        Approve Verification
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
};
