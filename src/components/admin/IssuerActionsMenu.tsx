'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Ban, ShieldOff, FileX, RotateCcw } from 'lucide-react';

interface IssuerActionsMenuProps {
    issuerId: string;
    isActive: boolean;
    onAction: (issuerId: string, action: 'suspend' | 'revoke_permissions' | 'disable_credentials' | 'restore') => void;
    darkMode: boolean;
}

export const IssuerActionsMenu: React.FC<IssuerActionsMenuProps> = ({
    issuerId,
    isActive,
    onAction,
    darkMode
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
            // Close on scroll
            const handleScroll = () => setIsOpen(false);
            window.addEventListener('scroll', handleScroll, true);
            
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                document.removeEventListener('keydown', handleEscape);
                window.removeEventListener('scroll', handleScroll, true);
            };
        }
    }, [isOpen]);

    const actions = isActive
        ? [
              {
                  id: 'suspend',
                  label: 'Suspend Issuer',
                  icon: Ban,
                  color: 'text-red-600 dark:text-red-400',
                  bgColor: 'hover:bg-red-50 dark:hover:bg-red-900/20'
              },
              {
                  id: 'disable_credentials',
                  label: 'Disable Credentials',
                  icon: FileX,
                  color: 'text-orange-600 dark:text-orange-400',
                  bgColor: 'hover:bg-orange-50 dark:hover:bg-orange-900/20'
              },
              {
                  id: 'revoke_permissions',
                  label: 'Revoke Permissions',
                  icon: ShieldOff,
                  color: 'text-purple-600 dark:text-purple-400',
                  bgColor: 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
              }
          ]
        : [
              {
                  id: 'restore',
                  label: 'Restore Issuer',
                  icon: RotateCcw,
                  color: 'text-green-600 dark:text-green-400',
                  bgColor: 'hover:bg-green-50 dark:hover:bg-green-900/20'
              }
          ];

    const handleAction = (actionId: string) => {
        setIsOpen(false);
        onAction(issuerId, actionId as any);
    };

    return (
        <div className="relative inline-block" ref={menuContainerRef}>
            <button
                ref={buttonRef}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className={`p-2 rounded-lg transition-all duration-200 ${
                    isOpen
                        ? darkMode
                            ? 'bg-gray-700 text-gray-200'
                            : 'bg-gray-100 text-gray-700'
                        : darkMode
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                aria-label="More actions"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <MoreVertical size={18} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop for mobile */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-[9998] md:hidden bg-black/20"
                        />
                        
                        <motion.div
                            ref={menuRef}
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ 
                                duration: 0.2,
                                type: "spring",
                                stiffness: 300,
                                damping: 30
                            }}
                            className={`absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl border z-[9999] ${
                                darkMode
                                    ? 'bg-gray-800 border-gray-700'
                                    : 'bg-white border-gray-200'
                            }`}
                            style={{
                                minWidth: '200px',
                                maxWidth: 'min(calc(100vw - 2rem), 224px)'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-1.5">
                                {actions.map((action, index) => {
                                    const Icon = action.icon;
                                    return (
                                        <motion.button
                                            key={action.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAction(action.id);
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-150 ${action.bgColor} ${action.color} ${
                                                darkMode 
                                                    ? 'hover:bg-gray-700' 
                                                    : 'hover:bg-gray-50'
                                            } active:scale-[0.98]`}
                                        >
                                            <Icon size={18} className="flex-shrink-0" />
                                            <span className="font-medium text-sm whitespace-nowrap">{action.label}</span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};


