"use client";

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface WalletConnectionProps {
    onConnect?: (address: string) => void;
    className?: string;
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({ onConnect, className = '' }) => {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [connectedAt, setConnectedAt] = useState<string | null>(null);

    // Check wallet status on component mount
    useEffect(() => {
        checkWalletStatus();
    }, []);

    const checkWalletStatus = async () => {
        try {
            const response = await fetch('/api/v1/wallet/status', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.is_connected) {
                    setWalletAddress(data.wallet_address);
                    setIsConnected(true);
                    setConnectedAt(data.connected_at);
                }
            }
        } catch (err) {
            console.error('Error checking wallet status:', err);
        }
    };

    const connectWallet = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Check if MetaMask is installed
            if (typeof window.ethereum === 'undefined') {
                throw new Error('MetaMask is not installed. Please install MetaMask to connect your wallet.');
            }

            // Request account access
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            const address = accounts[0];

            // Call backend to connect wallet
            const response = await fetch('/api/v1/wallet/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    wallet_address: address
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to connect wallet');
            }

            const data = await response.json();
            setWalletAddress(data.wallet_address);
            setIsConnected(true);
            setConnectedAt(data.connected_at);

            if (onConnect) {
                onConnect(data.wallet_address);
            }

        } catch (err: any) {
            setError(err.message || 'Failed to connect wallet');
        } finally {
            setIsLoading(false);
        }
    };

    const formatAddress = (address: string) => {
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    if (isConnected && walletAddress) {
        return (
            <div className={`bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 ${className}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-green-900 dark:text-green-100">
                                Wallet Connected
                            </h3>
                            <p className="text-sm text-green-700 dark:text-green-300 font-mono">
                                {formatAddress(walletAddress)}
                            </p>
                            {connectedAt && (
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                    Connected on {new Date(connectedAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100">
                        ✓ Connected
                    </span>
                </div>
                <p className="mt-3 text-xs text-green-600 dark:text-green-400">
                    🔒 Your wallet address is now permanently linked to your account and cannot be changed.
                </p>
            </div>
        );
    }

    return (
        <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 ${className}`}>
            <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900">
                    <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                    Connect Your Wallet
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Connect your Ethereum wallet to receive blockchain credentials. This wallet address will be permanently linked to your account.
                </p>

                {error && (
                    <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                    </div>
                )}

                <div className="mt-6">
                    <button
                        onClick={connectWallet}
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Connecting...
                            </>
                        ) : (
                            <>
                                <svg className="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" clipRule="evenodd" />
                                </svg>
                                Connect Wallet
                            </>
                        )}
                    </button>
                </div>

                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    Make sure MetaMask is installed and unlocked
                </p>
            </div>
        </div>
    );
};

export default WalletConnection;
