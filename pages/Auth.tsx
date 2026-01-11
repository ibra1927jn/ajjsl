import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Role } from '../types';

export const Registration = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 text-gray-900 font-sans">
            <div className="w-full max-w-sm mx-auto bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-gray-100 relative flex flex-col h-[812px] max-h-[95vh]">
                <div className="pt-12 px-8 pb-6 bg-white border-b border-gray-50 shrink-0">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-2 text-primary">
                            <span className="material-symbols-outlined text-3xl">eco</span>
                            <span className="text-xl font-extrabold tracking-tight text-gray-900">HarvestPro <span className="text-primary">NZ</span></span>
                        </div>
                        <div className="bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Step 01</span>
                        </div>
                    </div>
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl relative">
                        <div className="w-1/2 py-2.5 text-center text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">Login</div>
                        <div className="w-1/2 bg-white shadow-sm rounded-xl py-2.5 text-center text-sm font-bold text-primary transition-all">Register</div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-8 pt-8 pb-6">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                        <p className="text-sm text-gray-500 mt-2">Join the HarvestPro workforce today.</p>
                    </div>
                    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); navigate('/role-select'); }}>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">person</span>
                                <input className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3.5 pl-12 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="Enter your full name" required type="text"/>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Work Email</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">mail</span>
                                <input className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3.5 pl-12 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="email@harvestpro.co.nz" required type="email"/>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">lock</span>
                                <input className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3.5 pl-12 pr-12 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="Min. 8 characters" required type="password"/>
                                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors" type="button">
                                    <span className="material-symbols-outlined text-xl">visibility</span>
                                </button>
                            </div>
                        </div>
                        <div className="pt-4">
                            <button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-[0_10px_30px_-5px_rgba(210,4,45,0.15)] active:scale-[0.98] transition-all flex items-center justify-center gap-2" type="submit">
                                <span>Create Account</span>
                                <span className="material-symbols-outlined text-xl">arrow_forward</span>
                            </button>
                        </div>
                    </form>
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Already have an account? <Link className="text-primary font-bold hover:underline" to="/role-select">Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const RoleSelection = () => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [pin, setPin] = useState("");

    const handleNum = (num: string) => {
        if (pin.length < 4) setPin(prev => prev + num);
    };
    
    const handleEnter = () => {
        if (!selectedRole || pin.length < 4) return;
        localStorage.setItem('userRole', selectedRole);
        navigate('/success');
    };

    return (
        <div className="bg-gray-50 dark:bg-background-dark text-gray-900 dark:text-gray-100 font-sans min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm mx-auto bg-white dark:bg-surface-white/5 shadow-2xl rounded-[2rem] overflow-hidden border border-gray-100 dark:border-white/10 relative flex flex-col h-[812px] max-h-[95vh]">
                <div className="bg-white dark:bg-transparent relative shrink-0 pt-8 px-6 pb-2 border-b border-gray-100 dark:border-white/10">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2 text-primary">
                            <span className="material-symbols-outlined text-3xl">eco</span>
                            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">HarvestPro NZ</h1>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full border border-red-100 dark:border-red-800">
                                <span className="text-[9px] font-bold text-primary dark:text-red-400 uppercase tracking-wider">Step 02</span>
                            </div>
                        </div>
                    </div>
                    <div className="mb-4 relative">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Finalize Setup</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Select role and set security PIN.</p>
                    </div>
                </div>
                <div className="flex-1 flex flex-col px-6 pt-4 pb-0 overflow-y-auto">
                    <div className="text-center mb-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 text-left">Department Selection</p>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: Role.MANAGER, label: 'Manager', icon: 'admin_panel_settings' },
                                { id: Role.TEAM_LEAD, label: 'Team Lead', icon: 'groups' },
                                { id: Role.RUNNER, label: 'Runner', icon: 'shopping_basket' }
                            ].map(role => (
                                <button 
                                    key={role.id}
                                    onClick={() => setSelectedRole(role.id)}
                                    className={`relative flex flex-col items-center justify-center py-4 px-2 rounded-2xl transition-all ${selectedRole === role.id ? 'bg-primary text-white shadow-lg ring-2 ring-offset-2 ring-primary' : 'bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50'}`}
                                >
                                    <div className={`p-2 rounded-full mb-2 backdrop-blur-sm ${selectedRole === role.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-white/10'}`}>
                                        <span className="material-symbols-outlined text-xl">{role.icon}</span>
                                    </div>
                                    <span className="text-[11px] font-bold">{role.label}</span>
                                    {selectedRole === role.id && (
                                        <div className="absolute -top-2 -right-2 bg-white text-primary rounded-full p-0.5 shadow-sm border border-gray-100">
                                            <span className="material-symbols-outlined text-[14px] block">check</span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-end w-full">
                        <div className="flex flex-col items-center mb-6 w-full">
                            <div className="flex justify-between items-center w-full mb-4">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Create Your Security PIN</span>
                            </div>
                            <div className="flex gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 mb-6">
                                {[0, 1, 2, 3].map(i => (
                                    <div key={i} className={`w-4 h-4 rounded-full ${i < pin.length ? 'bg-primary shadow-sm' : 'bg-gray-200 dark:bg-gray-600'}`}></div>
                                ))}
                            </div>
                            <div className="grid grid-cols-3 gap-x-6 gap-y-4 w-full max-w-[280px]">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                    <button key={n} onClick={() => handleNum(n.toString())} className="h-14 w-14 mx-auto rounded-full bg-white dark:bg-white/10 text-xl font-semibold text-gray-900 dark:text-white shadow-soft hover:shadow-md border border-gray-100 dark:border-white/10 active:bg-gray-50 active:scale-95 transition-all flex items-center justify-center">{n}</button>
                                ))}
                                <div/>
                                <button onClick={() => handleNum("0")} className="h-14 w-14 mx-auto rounded-full bg-white dark:bg-white/10 text-xl font-semibold text-gray-900 dark:text-white shadow-soft hover:shadow-md border border-gray-100 dark:border-white/10 active:bg-gray-50 active:scale-95 transition-all flex items-center justify-center">0</button>
                                <button onClick={() => setPin(prev => prev.slice(0, -1))} className="h-14 w-14 mx-auto rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 active:scale-95 transition-transform hover:bg-gray-50/50">
                                    <span className="material-symbols-outlined text-[24px]">backspace</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-6 pb-6 pt-2 bg-white dark:bg-transparent border-t border-gray-50 dark:border-white/10">
                    <button onClick={handleEnter} disabled={pin.length < 4 || !selectedRole} className="w-full bg-primary disabled:opacity-50 hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-red-200 dark:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                        <span>Finish & Access Workspace</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export const PasswordRecovery = () => (
    <div className="flex flex-col items-center justify-center p-4 min-h-screen bg-gray-50">
        <div className="w-full max-w-[390px] h-[812px] bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-xl relative flex flex-col">
            <div className="pt-16 px-8 pb-8 flex flex-col items-center">
                <div className="mb-10 flex items-center gap-2">
                    <span className="material-symbols-outlined text-4xl text-primary">eco</span>
                    <span className="text-xl font-bold tracking-tight text-gray-900">HarvestPro NZ</span>
                </div>
                <div className="w-full text-left">
                    <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Reset Password</h1>
                    <p className="text-gray-500 leading-relaxed text-[15px]">Enter your email address and we will send you a link to reset your password.</p>
                </div>
            </div>
            <div className="flex-1 px-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-gray-400 text-[20px]">mail</span>
                            </div>
                            <input className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary transition-all duration-200" placeholder="name@harvestpro.co.nz" type="email"/>
                        </div>
                    </div>
                    <button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                        <span>Send Reset Link</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                </div>
            </div>
            <div className="p-8 pb-12 flex flex-col items-center">
                <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium">
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    <span>Back to Login</span>
                </Link>
                <div className="w-32 h-1.5 bg-gray-200 rounded-full mt-10"></div>
            </div>
        </div>
    </div>
);

export const SuccessScreen = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem('userRole') as Role;
    
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
                    <div className="w-full bg-gray-50 dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/10 mb-8 text-left shadow-soft">
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
                    <button onClick={handleEnter} className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-red-200 dark:shadow-none transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mb-2">
                        <span>Enter Workspace</span>
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                    <p className="text-xs text-gray-400 mt-2">Redirecting to dashboard securely...</p>
                </div>
                <div className="py-3 bg-gray-50 dark:bg-transparent border-t border-gray-100 dark:border-white/10 flex justify-center items-center gap-6 text-[10px] font-medium text-gray-400">
                    <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div><span>System Online</span></div>
                    <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[12px]">encrypted</span><span>End-to-End Encrypted</span></div>
                </div>
            </div>
        </div>
    );
};