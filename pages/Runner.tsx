import React from 'react';

const RunnerHeader = ({ title, subtitle, rightIcon, onRightClick }: any) => (
    <header className="flex-none bg-white dark:bg-[#1b0d0f] shadow-sm z-10">
        <div className="flex items-center px-4 py-3 justify-between">
            <div>
                <h2 className="text-[#1b0d0f] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] flex-1">{title}</h2>
                {subtitle && <p className="text-[10px] text-primary font-bold tracking-widest uppercase">{subtitle}</p>}
            </div>
            <div className="flex items-center justify-end gap-3">
                <button className="flex items-center justify-center rounded-full size-10 bg-cherry-light dark:bg-primary/20 text-primary">
                    <span className="material-symbols-outlined" style={{fontSize: '24px'}}>{rightIcon || 'notifications'}</span>
                </button>
            </div>
        </div>
    </header>
);

export const RunnerLogistics = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark text-[#1b0d0f] dark:text-white h-screen flex flex-col overflow-hidden">
            <RunnerHeader title="Logistics Hub" />
            <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800/30 px-4 py-2 flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-500" style={{fontSize: '20px'}}>cloud_off</span>
                <p className="text-amber-800 dark:text-amber-200 text-sm font-medium flex-1">Offline Sync Pending</p>
                <div className="flex items-center gap-1"><span className="material-symbols-outlined text-amber-600 dark:text-amber-500 animate-spin" style={{fontSize: '18px'}}>sync</span><span className="text-xs font-semibold text-amber-700 dark:text-amber-300">14 Items</span></div>
            </div>
            <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark pb-32 p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div><h2 className="text-lg font-bold text-[#1b0d0f] dark:text-white">Active Bin #4092</h2><p className="text-sm text-gray-500 dark:text-gray-400">Harvesting: Stella Cherries</p></div>
                    <div className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold uppercase tracking-wider">In Progress</div>
                </div>
                <div className="bg-white dark:bg-[#2d1b1d] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center relative">
                    <svg className="circular-chart text-primary" viewBox="0 0 36 36">
                        <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"></path>
                        <path className="circle stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" strokeDasharray="63, 100"></path>
                        <text className="percentage fill-current dark:fill-white" x="18" y="19">63%</text>
                        <text className="sub-text fill-gray-500 dark:fill-gray-400" x="18" y="24">FULL</text>
                    </svg>
                    <div className="mt-4 text-center">
                        <p className="text-3xl font-bold text-[#1b0d0f] dark:text-white tabular-nums">45<span className="text-lg text-gray-400 font-normal">/72</span></p>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">Buckets Collected</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#2d1b1d] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400"><span className="material-symbols-outlined">wb_sunny</span></div>
                        <div><p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sun Exposure</p><p className="text-xs text-gray-400">Since bin started</p></div>
                    </div>
                    <div className="text-right"><p className="text-xl font-bold text-[#1b0d0f] dark:text-white tabular-nums font-mono">01:15:00</p><p className="text-xs font-semibold text-green-600 dark:text-green-400">Safe Level</p></div>
                </div>
            </main>
            <div className="fixed bottom-[5.5rem] left-0 w-full z-20 pointer-events-none px-4 pb-2">
                <div className="flex gap-4 pointer-events-auto">
                    <button className="flex-1 flex flex-col items-center justify-center h-20 bg-white dark:bg-[#2d1b1d] border-2 border-primary text-primary rounded-xl active:bg-cherry-light dark:active:bg-primary/20 transition-colors shadow-sm group">
                        <span className="material-symbols-outlined mb-1 group-active:scale-95 transition-transform">qr_code_scanner</span>
                        <span className="text-sm font-extrabold uppercase tracking-wide">Scan Bin</span>
                    </button>
                    <button className="flex-1 flex flex-col items-center justify-center h-20 bg-primary text-white rounded-xl shadow-md active:bg-primary-dark transition-colors group">
                        <span className="material-symbols-outlined mb-1 group-active:scale-95 transition-transform">local_offer</span>
                        <span className="text-sm font-extrabold uppercase tracking-wide">Scan Sticker</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export const RunnerWarehouse = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark text-[#1b0d0f] dark:text-white h-screen flex flex-col overflow-hidden">
            <RunnerHeader title="Warehouse Inventory" />
            <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark pb-36 p-4 space-y-5">
                <div className="bg-white dark:bg-[#2d1b1d] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-primary group-hover:w-3 transition-all"></div>
                    <div className="flex items-start justify-between">
                        <div><h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Harvested Stock</h3><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Full Cherry Bins</h2></div>
                        <div className="size-14 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-primary border border-red-100 dark:border-red-800/30"><span className="material-symbols-outlined text-3xl">inventory_2</span></div>
                    </div>
                    <div className="mt-6 flex items-baseline gap-3"><span className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter">28</span><span className="text-lg font-medium text-gray-500 dark:text-gray-400">filled</span></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-[#2d1b1d] rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col h-full hover:border-orange-200 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                            <div className="size-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 border border-orange-100 dark:border-orange-800/30"><span className="material-symbols-outlined">grid_view</span></div>
                            <span className="px-2 py-1 rounded text-[10px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 uppercase">Low</span>
                        </div>
                        <div className="flex-1 flex flex-col justify-end"><span className="text-5xl font-bold text-gray-900 dark:text-white block mb-1 tracking-tight">15</span><span className="text-sm font-bold text-gray-600 dark:text-gray-300 leading-tight block">Empty Bins Available</span></div>
                    </div>
                    <div className="bg-white dark:bg-[#2d1b1d] rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col h-full hover:border-blue-200 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                            <div className="size-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 border border-blue-100 dark:border-blue-800/30"><span className="material-symbols-outlined">shopping_basket</span></div>
                            <span className="px-2 py-1 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 uppercase">OK</span>
                        </div>
                        <div className="flex-1 flex flex-col justify-end"><span className="text-5xl font-bold text-gray-900 dark:text-white block mb-1 tracking-tight">8</span><span className="text-sm font-bold text-gray-600 dark:text-gray-300 leading-tight block">Bins with Empty Buckets</span></div>
                    </div>
                </div>
            </main>
            <div className="fixed bottom-[5.5rem] left-0 w-full z-20 p-4 pb-2 pointer-events-none"><div className="pointer-events-auto"><button className="w-full h-16 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all group"><span className="material-symbols-outlined text-3xl group-active:scale-90 transition-transform">local_shipping</span><span className="text-lg font-extrabold uppercase tracking-wide">Request Transport</span></button></div></div>
        </div>
    );
};

export const RunnerTeam = () => {
    return (
        <div className="bg-background-light text-slate-800 h-screen flex flex-col overflow-hidden relative">
            <RunnerHeader title="Orchard Runners" subtitle="Team Coordination" rightIcon="add" />
            <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4 z-10 pb-32">
                <div className="flex items-center justify-between px-1 mb-2">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Logistics Team</h2>
                    <div className="flex items-center gap-2"><span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span></span><span className="text-primary font-bold text-xs uppercase tracking-wider">4 Active</span></div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col gap-4 animate-fade-in-up">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="size-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200"><span className="material-symbols-outlined text-3xl">person</span></div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-xl leading-tight">Liam O'Connor</h3>
                                <div className="flex items-center gap-1.5 mt-1"><span className="material-symbols-outlined text-sm text-primary filled">location_on</span><span className="text-sm font-medium text-gray-600">Row 04 <span className="text-gray-300 mx-1">|</span> Block B</span></div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1"><div className="size-3 rounded-full bg-green-500 shadow-[0_0_0_4px_rgba(34,197,94,0.15)]"></div></div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center justify-between">
                        <div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Current Task</p><p className="text-sm font-semibold text-slate-800">Transporting Bin #4092</p></div>
                        <span className="material-symbols-outlined text-gray-400">local_shipping</span>
                    </div>
                    <button className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-primary text-white font-bold text-sm shadow-md shadow-red-500/20 active:bg-primary-dark transition-colors"><span>View Tasks</span><span className="material-symbols-outlined text-lg">arrow_forward</span></button>
                </div>
            </main>
        </div>
    );
};

export const RunnerMessaging = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark text-[#1b0d0f] dark:text-white h-screen flex flex-col overflow-hidden">
            <header className="flex-none bg-white dark:bg-[#1b0d0f] shadow-sm z-30">
                <div className="flex items-center px-4 py-3 justify-between">
                    <h2 className="text-[#1b0d0f] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] flex-1">Messaging Hub</h2>
                    <div className="flex items-center justify-end gap-3">
                        <button className="flex items-center justify-center rounded-full size-10 bg-cherry-light dark:bg-primary/20 text-primary relative">
                            <span className="material-symbols-outlined" style={{fontSize: '24px'}}>notifications</span>
                            <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border-2 border-white dark:border-[#1b0d0f]"></span>
                        </button>
                    </div>
                </div>
                <div className="bg-primary text-white px-4 py-3 flex items-start gap-3 shadow-md relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 text-white/10"><span className="material-symbols-outlined" style={{fontSize: '80px'}}>campaign</span></div>
                    <span className="material-symbols-outlined flex-none mt-0.5 filled" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
                    <div className="relative z-10"><p className="text-xs font-bold uppercase opacity-90 mb-0.5 tracking-wider">Manager Broadcast</p><p className="text-sm font-semibold leading-tight">Harvest paused for Block 4 due to incoming rain. Cover bins immediately.</p></div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark pb-24 relative p-4 space-y-3">
                <div className="bg-white dark:bg-[#2d1b1d] rounded-xl p-4 shadow-sm border-l-4 border-primary active:scale-[0.99] transition-transform">
                    <div className="flex justify-between items-start mb-2"><div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>groups</span><h3 className="font-bold text-[#1b0d0f] dark:text-white">Logistics Team</h3></div><span className="text-[10px] font-medium text-gray-400">Just now</span></div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2"><span className="font-bold text-[#1b0d0f] dark:text-white">Sarah:</span> Truck #4 is arriving at the North Gate. We need 3 loaders ready.</p>
                </div>
            </main>
        </div>
    );
};