'use client';

import React, { useEffect } from 'react';

interface LoaderProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    darkMode?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ 
    size = 'md', 
    className = '',
    darkMode = false 
}) => {
    useEffect(() => {
        // Inject CSS for animations if not already present
        if (typeof document !== 'undefined' && !document.getElementById('loader-styles')) {
            const style = document.createElement('style');
            style.id = 'loader-styles';
            style.textContent = `
                .admin-loader {
                    position: relative;
                    transform: rotate(165deg);
                }
                .admin-loader::before,
                .admin-loader::after {
                    content: "";
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    display: block;
                    border-radius: 0.25em;
                    transform: translate(-50%, -50%);
                }
                .admin-loader::before {
                    width: 0.5em;
                    height: 0.5em;
                    animation: loader-before8 2s infinite;
                }
                .admin-loader::after {
                    width: 0.5em;
                    height: 0.5em;
                    animation: loader-after6 2s infinite;
                }
                @keyframes loader-before8 {
                    0% {
                        width: 0.5em;
                        box-shadow: 1em -0.5em rgba(225, 20, 98, 0.75), -1em 0.5em rgba(111, 202, 220, 0.75);
                    }
                    35% {
                        width: 2.5em;
                        box-shadow: 0 -0.5em rgba(225, 20, 98, 0.75), 0 0.5em rgba(111, 202, 220, 0.75);
                    }
                    70% {
                        width: 0.5em;
                        box-shadow: -1em -0.5em rgba(225, 20, 98, 0.75), 1em 0.5em rgba(111, 202, 220, 0.75);
                    }
                    100% {
                        box-shadow: 1em -0.5em rgba(225, 20, 98, 0.75), -1em 0.5em rgba(111, 202, 220, 0.75);
                    }
                }
                @keyframes loader-after6 {
                    0% {
                        height: 0.5em;
                        box-shadow: 0.5em 1em rgba(61, 184, 143, 0.75), -0.5em -1em rgba(233, 169, 32, 0.75);
                    }
                    35% {
                        height: 2.5em;
                        box-shadow: 0.5em 0 rgba(61, 184, 143, 0.75), -0.5em 0 rgba(233, 169, 32, 0.75);
                    }
                    70% {
                        height: 0.5em;
                        box-shadow: 0.5em -1em rgba(61, 184, 143, 0.75), -0.5em 1em rgba(233, 169, 32, 0.75);
                    }
                    100% {
                        box-shadow: 0.5em 1em rgba(61, 184, 143, 0.75), -0.5em -1em rgba(233, 169, 32, 0.75);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }, []);

    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16'
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className={`admin-loader ${sizeClasses[size]}`} />
        </div>
    );
};

export default Loader;

