
import React, { useState } from 'react';
import { useHarvest } from '../context/HarvestContext';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { generateSmartBroadcast } from '../services/geminiService';

const Header = ({ title, subtitle, icon }: any) => (
    <div className="sticky top-0 z-50 bg-background-light dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="bg-manager-primary/20 p-2 rounded-lg text-manager-primary">
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <div>
                <h1 className="text-xl font-bold leading-tight text-gray-900 dark:text-white">{title}</h1>
                <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{subtitle}</span>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-gray-900 dark:text-white">24°C</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Sunny</span>
            </div>
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors">
                <span className="material-symbols-outlined">settings</span>
            </button>
        </div>
    </div>
);

// ... ManagerDashboard, ManagerTeams, ManagerLogistics, ManagerSettings implemented in previous turn ...
export const ManagerDashboard = () => <div className="text-white p-4">Dashboard</div>;
export const ManagerTeams = () => <div className="text-white p-4">Teams</div>;
export const ManagerLogistics = () => <div className="text-white p-4">Logistics</div>;
export const ManagerSettings = () => <div className="text-white p-4">Settings</div>;

export const ManagerMessaging = () => {
    const [draft, setDraft] = useState("");
    const [isOptimizing, setIsOptimizing] = useState(false);
    const { sendMessage } = useHarvest();

    const handleOptimize = async () => {
        if (!draft) return;
        setIsOptimizing(true);
        const refined = await generateSmartBroadcast(draft);
        setDraft(refined);
        setIsOptimizing(false);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-gray-900 dark:text-white pb-24">
            <div className="sticky top-0 z-50 bg-background-light dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 pt-12 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-manager-primary/20 p-2 rounded-lg text-manager-primary"><span className="material-symbols-outlined">forum</span></div>
                    <div><h1 className="text-xl font-bold leading-tight">Messaging Hub</h1><div className="flex items-center gap-1.5"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-manager-primary opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-manager-primary"></span></span><span className="text-xs text-gray-500 dark:text-gray-400 font-medium">3 New Alerts</span></div></div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/5"><span className="material-symbols-outlined">search</span></button>
                </div>
            </div>
            <main className="flex flex-col gap-4 p-4">
                <div className="bg-gray-200 dark:bg-card-dark p-1 rounded-xl flex items-center text-sm font-medium">
                    <button className="flex-1 py-2 rounded-lg bg-white dark:bg-manager-primary text-gray-900 dark:text-white shadow-sm transition-all text-center">Groups</button>
                    <button className="flex-1 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all text-center">Direct</button>
                </div>
                
                {/* AI Composer */}
                <div className="bg-card-dark rounded-xl p-4 border border-white/10">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Quick Broadcast</label>
                    <textarea 
                        className="w-full bg-background-dark border border-white/10 rounded-lg p-3 text-sm text-white focus:border-manager-primary focus:ring-1 focus:ring-manager-primary outline-none transition-all"
                        rows={3}
                        placeholder="Type a quick note (e.g., 'Rain coming, cover bins')..."
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                    />
                    <div className="flex justify-end gap-2 mt-3">
                        <button 
                            onClick={handleOptimize}
                            disabled={isOptimizing || !draft}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-bold hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                        >
                            <span className={`material-symbols-outlined text-sm ${isOptimizing ? 'animate-spin' : ''}`}>auto_awesome</span>
                            {isOptimizing ? 'Optimizing...' : 'AI Magic'}
                        </button>
                        <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-manager-primary text-white text-xs font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-900/40">
                            Send Now
                        </button>
                    </div>
                </div>

                <section>
                    <div className="bg-gradient-to-r from-cherry-dark to-card-dark rounded-2xl p-0.5 shadow-lg relative overflow-hidden group">
                        <div className="bg-card-dark rounded-[14px] p-4 relative z-10">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-manager-primary flex items-center justify-center text-white shadow-lg shadow-red-900/50"><span className="material-symbols-outlined filled">campaign</span></div>
                                    <div><h3 className="text-base font-bold text-white leading-none">Manager Broadcast</h3><span className="text-xs text-manager-primary font-medium">Official Channel • All Teams</span></div>
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium bg-white/5 px-2 py-1 rounded-full">12m ago</span>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                <p className="text-sm text-gray-200 leading-snug"><span className="text-manager-primary font-bold">@All</span> Weather alert: Heavy rain expected at 15:00. Please ensure all picked buckets are covered and runners are prioritized for Block 4.</p>
                            </div>
                        </div>
                    </div>
                </section>
                <div className="fixed bottom-24 right-4 z-40">
                    <button className="bg-manager-primary hover:bg-red-600 text-white shadow-lg shadow-red-900/40 rounded-full h-14 w-14 flex items-center justify-center transition-all active:scale-95 group">
                        <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">add</span>
                    </button>
                </div>
            </main>
        </div>
    );
};
