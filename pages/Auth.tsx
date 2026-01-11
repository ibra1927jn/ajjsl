
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Role } from '../types';

// ... Registration, RoleSelection, PasswordRecovery same as previous ...
export const Registration = () => { /* ... code ... */ return <div>Registration</div> };
export const RoleSelection = () => { /* ... code ... */ return <div>RoleSelection</div> };
export const PasswordRecovery = () => { /* ... code ... */ return <div>PasswordRecovery</div> };

export const SuccessScreen = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem('userRole') as Role;
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        // Simulate data sync
        const timer = setTimeout(() => setIsLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleEnter = () => {
        if (role === Role.MANAGER) navigate('/manager/dashboard');
        else if (role === Role.TEAM_LEAD) navigate('/tl/home');
        else navigate('/runner/logistics');
    };

    return (
        <div className="bg-gray-50 dark:bg-background-dark text-gray-900 dark:text-gray-100 font-sans min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm mx-auto bg-white dark:bg-surface-white/5 shadow-2xl rounded-[2rem] overflow-hidden border border-gray-100 dark:border-white/10 relative flex flex-col h-[812px] max-h-[95vh]">
                <div className="bg-white dark:bg-transparent relative shrink-0 pt-8 px-6 pb-4 border-b border-gray-100 dark:border-white/10">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2 text-primary">
                            <span className="material-symbols-outlined text-3xl">eco</span>
                            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">HarvestPro NZ</h1>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full border border-green-100 dark:border-green-800">
                                <span className="material-symbols-outlined text-[14px] text-green-600 dark:text-green-400">lock</span>
                                <span className="text-[9px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">Secure</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 flex flex-col px-6 pt-10 pb-6 overflow-y-auto items-center text-center">
                    {isLoading ? (
                        <div className="w-full animate-pulse space-y-6">
                            <div className="h-24 w-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto"></div>
                            <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
                            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
                            <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                        </div>
                    ) : (
                        <>
                            <div className="relative mb-8">
                                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-red-200 dark:shadow-none animate-bounce-slow">
                                    <span className="material-symbols-outlined text-5xl text-white font-bold">check</span>
                                </div>
                                <div className="absolute inset-0 rounded-full border-4 border-red-100 dark:border-red-900/30 scale-125 -z-10"></div>
                            </div>
                            <div className="mb-10">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Success!</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed max-w-[260px] mx-auto">Your account is ready and your PIN has been secured.</p>
                            </div>
                            <div className="w-full bg-gray-50 dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/10 mb-8 text-left shadow-soft animate-fade-in-up">
                                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-white/10">
                                    <div className="bg-white dark:bg-white/10 p-2.5 rounded-full text-primary shadow-sm">
                                        <span className="material-symbols-outlined text-xl">groups</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Department</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{role?.replace('_', ' ') || 'User'}</p>
                                    </div>
                                    <div className="ml-auto"><span className="material-symbols-outlined text-green-500 text-xl">verified</span></div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-white dark:bg-white/10 p-2.5 rounded-full text-primary shadow-sm">
                                        <span className="material-symbols-outlined text-xl">shield</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Security Status</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">PIN Configured</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1"></div>
                            <button onClick={handleEnter} className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-red-200 dark:shadow-none transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mb-2 animate-fade-in-up" style={{animationDelay: '100ms'}}>
                                <span>Enter Workspace</span>
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </button>
                            <p className="text-xs text-gray-400 mt-2">Redirecting to dashboard securely...</p>
                        </>
                    )}
                </div>
                <div className="py-3 bg-gray-50 dark:bg-transparent border-t border-gray-100 dark:border-white/10 flex justify-center items-center gap-6 text-[10px] font-medium text-gray-400">
                    <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div><span>System Online</span></div>
                    <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[12px]">encrypted</span><span>End-to-End Encrypted</span></div>
                </div>
            </div>
        </div>
    );
};
