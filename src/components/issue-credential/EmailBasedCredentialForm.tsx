"use client";

import React, { useState } from 'react';

interface LearnerInfo {
    learner_id: string;
    email: string;
    wallet_address: string | null;
    is_connected: boolean;
}

interface EmailBasedCredentialFormProps {
    credentialId: string;
    onSuccess?: (result: any) => void;
    className?: string;
}

export const EmailBasedCredentialForm: React.FC<EmailBasedCredentialFormProps> = ({
    credentialId,
    onSuccess,
    className = ''
}) => {
    const [learnerEmail, setLearnerEmail] = useState('');
    const [learnerInfo, setLearnerInfo] = useState<LearnerInfo | null>(null);
    const [isLookingUp, setIsLookingUp] = useState(false);
    const [isIssuing, setIsIssuing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const lookupLearner = async () => {
        if (!learnerEmail || !learnerEmail.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLookingUp(true);
        setError(null);
        setLearnerInfo(null);

        try {
            const response = await fetch(`/api/v1/wallet/lookup/${encodeURIComponent(learnerEmail)}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Learner not found');
            }

            const data = await response.json();
            setLearnerInfo(data);

        } catch (err: any) {
            setError(err.message || 'Failed to lookup learner');
        } finally {
            setIsLookingUp(false);
        }
    };

    const issueCredential = async () => {
        if (!learnerInfo) return;

        setIsIssuing(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await fetch('/api/v1/blockchain/credentials/issue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    credential_id: credentialId,
                    learner_email: learnerEmail,
                    generate_qr: true,
                    wait_for_confirmation: false
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to issue credential');
            }

            const result = await response.json();
            setSuccessMessage('Credential issued successfully! Async verification in progress...');

            if (onSuccess) {
                onSuccess(result);
            }

        } catch (err: any) {
            setError(err.message || 'Failed to issue credential');
        } finally {
            setIsIssuing(false);
        }
    };

    const reset = () => {
        setLearnerEmail('');
        setLearnerInfo(null);
        setError(null);
        setSuccessMessage(null);
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Issue Credential by Email
            </h2>

            {/* Email Input Section */}
            {!learnerInfo && (
                <div className="space-y-4">
                    <div>
                        <label htmlFor="learner-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Learner Email Address
                        </label>
                        <div className="flex gap-2">
                            <input
                                id="learner-email"
                                type="email"
                                value={learnerEmail}
                                onChange={(e) => setLearnerEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && lookupLearner()}
                                placeholder="learner@example.com"
                                className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isLookingUp}
                            />
                            <button
                                onClick={lookupLearner}
                                disabled={isLookingUp || !learnerEmail}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLookingUp ? 'Looking up...' : 'Lookup'}
                            </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Enter the learner's email to verify their account and wallet status
                        </p>
                    </div>
                </div>
            )}

            {/* Learner Information Display */}
            {learnerInfo && (
                <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    Learner Details
                                </h3>
                            </div>
                            <button
                                onClick={reset}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            >
                                Change
                            </button>
                        </div>

                        <dl className="space-y-2">
                            <div>
                                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</dt>
                                <dd className="text-sm text-gray-900 dark:text-gray-100">{learnerInfo.email}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Learner ID</dt>
                                <dd className="text-sm font-mono text-gray-900 dark:text-gray-100">{learnerInfo.learner_id}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Wallet Status</dt>
                                <dd className="flex items-center space-x-2 mt-1">
                                    {learnerInfo.is_connected ? (
                                        <>
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100">
                                                ✓ Connected
                                            </span>
                                            {learnerInfo.wallet_address && (
                                                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                                                    {` ${learnerInfo.wallet_address.substring(0, 6)}...${learnerInfo.wallet_address.slice(-4)}`}
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100">
                                            ✗ Not Connected
                                        </span>
                                    )}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Wallet Not Connected Warning */}
                    {!learnerInfo.is_connected && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
                            <div className="flex">
                                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0  -2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                        Wallet Not Connected
                                    </h3>
                                    <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                                        The learner needs to connect their wallet before you can issue credentials. Please ask them to log in and connect their wallet.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Issue Button */}
                    <div className="pt-2">
                        <button
                            onClick={issueCredential}
                            disabled={isIssuing || !learnerInfo.is_connected}
                            className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isIssuing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Issuing Credential...
                                </>
                            ) : (
                                'Issue Credential on Blockchain'
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
            )}

            {/* Success Message */}
            {successMessage && (
                <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                    <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
                </div>
            )}
        </div>
    );
};

export default EmailBasedCredentialForm;
