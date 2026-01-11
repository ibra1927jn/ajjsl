import React, { useState } from 'react';
import { useHarvest } from '../context/HarvestContext';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

const Header = ({ title, subtitle, icon }: any) => (
    <div className="sticky top-0 z-50 bg-background-light dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg text-primary">
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <div>
                <h1 className="text-xl font-bold leading-tight">{title}</h1>
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
                <span className="text-sm font-bold">24°C</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Sunny</span>
            </div>
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors">
                <span className="material-symbols-outlined">settings</span>
            </button>
        </div>
    </div>
);

export const ManagerDashboard = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-gray-900 dark:text-white pb-20 overflow-x-hidden">
            <Header title="Command Center" subtitle="Live Sync • Central Otago" icon="agriculture" />
            <main className="flex flex-col gap-6 p-4">
                <section className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold tracking-tight">Velocity Monitor</h2>
                        <button className="text-xs text-primary font-medium hover:text-primary/80 transition-colors">View Report</button>
                    </div>
                    <div className="bg-white dark:bg-card-dark rounded-xl p-5 shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Picking vs Collection</p>
                                <h3 className="text-2xl font-bold tracking-tight">Bottleneck Warning</h3>
                            </div>
                            <div className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-2.5 py-1 rounded-full text-xs font-bold border border-yellow-500/20 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">warning</span>
                                +30 Surplus
                            </div>
                        </div>
                        <div className="flex items-center gap-6 mb-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-primary"></span><span className="text-xs text-gray-500 dark:text-gray-400">Picking</span></div>
                                <p className="text-2xl font-bold">450 <span className="text-sm font-normal text-gray-500">bkt/hr</span></p>
                                <p className="text-xs text-green-500 font-medium mt-1 flex items-center"><span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span> +5% Last hr</p>
                            </div>
                            <div className="w-px h-12 bg-gray-200 dark:bg-white/10"></div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span><span className="text-xs text-gray-500 dark:text-gray-400">Collection</span></div>
                                <p className="text-2xl font-bold">420 <span className="text-sm font-normal text-gray-500">bkt/hr</span></p>
                                <p className="text-xs text-primary font-medium mt-1 flex items-center"><span className="material-symbols-outlined text-[14px] mr-0.5">trending_down</span> -2% Last hr</p>
                            </div>
                        </div>
                        <div className="h-[140px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[{t:'10am', p:300, c:280},{t:'11am', p:450, c:400},{t:'12pm', p:480, c:460},{t:'1pm', p:450, c:420}]}>
                                    <defs>
                                        <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ec1337" stopOpacity={0.3}/><stop offset="100%" stopColor="#ec1337" stopOpacity={0}/></linearGradient>
                                        <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="p" stroke="#ec1337" fill="url(#gp)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="c" stroke="#3b82f6" fill="url(#gc)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </section>
                <section className="flex flex-col gap-3">
                    <h2 className="text-lg font-bold tracking-tight">Orchard Forecast</h2>
                    <div className="col-span-2 bg-white dark:bg-card-dark rounded-xl p-5 shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between relative overflow-hidden">
                        <div className="z-10 flex flex-col gap-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Daily Target (Tons)</p>
                            <div className="flex items-baseline gap-2"><span className="text-3xl font-bold dark:text-white text-gray-900">12.5</span><span className="text-sm text-gray-500 dark:text-gray-400">/ 16.0</span></div>
                            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold w-fit">78% Complete</div>
                        </div>
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <path className="text-gray-200 dark:text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                                <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="78, 100" strokeLinecap="round" strokeWidth="3"></path>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-[10px] text-gray-400 font-semibold uppercase">Rem</span><span className="text-sm font-bold">3h</span></div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export const ManagerTeams = () => {
    const teams = [
        { name: "Sarah Jenkins", role: "Team Alpha", yield: "1.8", qc: "98% A+", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAg9gZI0u556YlRK6io0AAuAT8eornF9RIRKls55OZojf0oeJUa3i8PMuNAmTZaNJsUmqTGcpNWbAeTg2s9VZ1PnaX4zGXGvSa3--J3ibE67kzzO3lrV-rAoIa1by6DbAunOi4S6SLyau_Umx2RINb6fmwMJGPlSU9tecMfDk5b9RxJLs6hdOBNaHvJzDUVtUkaV3-gz62zD3ZX_E7E5h0iC-j4gO2z0fwYFYaBUww-_4cDI6s3ufxYbF4I6Hv5GpadyRgWfs4VjhA" },
        { name: "Emily Clark", role: "Team Charlie", yield: "1.6", qc: "95% A", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBOIfODOQYCVSFj0GLMixOoIfSxloH_gNEYgYJuGk0UVf0sLTKb02tg-lXFvXgVT3fY_Zegg_9O2YtOTjBa-8HlIE-40AEidbJMm7orS8O89R0Pro7rh8Rvj_n3g0uNKBLa_1QHp8ZayU9sBvvH8PTHLsoPwJwMyRJvFOJvRtMHa9UI6zidXrjxBC-u545Nx7qhQb3r-uqxvdEASeQa3-KE4oXZMBRkwwuUgeTHhCWM0thwshmHM0XY8EL3GoVkK6VOPZITQUhVc_I" }
    ];
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-gray-900 dark:text-white pb-24">
            <Header title="Teams Overview" subtitle="12 Active Crews" icon="groups" />
            <main className="flex flex-col gap-6 p-4">
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500 dark:text-gray-400">search</span>
                    <input className="w-full bg-white dark:bg-card-dark border border-gray-200 dark:border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-gray-500 dark:placeholder-gray-500 dark:text-white shadow-sm transition-all" placeholder="Search team or leader..." type="text"/>
                </div>
                <section className="flex flex-col gap-3">
                    <h2 className="text-lg font-bold tracking-tight">Average Picking Rate</h2>
                    <div className="bg-white dark:bg-card-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="flex justify-between items-end mb-4">
                            <div><p className="text-3xl font-bold">485 <span className="text-sm font-normal text-gray-500">bkt/hr</span></p></div>
                            <div className="flex items-center text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-full"><span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> +8% vs Yesterday</div>
                        </div>
                        <div className="h-[120px] w-full relative">
                             <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[{t:'7am', v:20},{t:'8am', v:35},{t:'9am', v:45},{t:'10am', v:40},{t:'11am', v:48}]}>
                                    <defs><linearGradient id="gradientRate" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ec1337" stopOpacity={0.25}/><stop offset="100%" stopColor="#ec1337" stopOpacity={0}/></linearGradient></defs>
                                    <Area type="monotone" dataKey="v" stroke="#ec1337" fill="url(#gradientRate)" strokeWidth={2.5} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </section>
                <section className="flex flex-col gap-4">
                    <h2 className="text-lg font-bold tracking-tight">Leaderboard</h2>
                    <div className="flex flex-col gap-3">
                        {teams.map((t, i) => (
                            <div key={i} className="bg-white dark:bg-card-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 flex gap-4 items-center">
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-full bg-cover bg-center border-2 border-green-500" style={{backgroundImage: `url(${t.img})`}}></div>
                                    <div className="absolute -bottom-1 -right-1 bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-gray-700">#{i+1}</div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div><h3 className="text-base font-bold text-gray-900 dark:text-white truncate">{t.name}</h3><p className="text-xs font-medium text-primary mb-1">{t.role}</p></div>
                                        <div className="text-right"><p className="text-lg font-bold leading-none dark:text-white">{t.yield} <span className="text-xs font-normal text-gray-500">T</span></p></div>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span> Block 2C</div>
                                        <div className="bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 px-2 py-0.5 rounded text-[11px] font-bold">{t.qc}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export const ManagerLogistics = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-gray-900 dark:text-white pb-24">
            <Header title="Logistics" subtitle="Ops Live • Block 4" icon="local_shipping" />
            <main className="flex flex-col gap-6 p-4">
                <section className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-card-dark rounded-xl p-4 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><span className="material-symbols-outlined text-6xl text-primary">inventory_2</span></div>
                        <div className="relative z-10">
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">Awaiting Pickup</p>
                            <div className="flex items-end gap-2"><h3 className="text-3xl font-bold text-gray-900 dark:text-white">18</h3><span className="text-xs font-bold text-primary mb-1.5">Full Bins</span></div>
                            <div className="mt-2 text-xs text-gray-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> High Priority</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-card-dark rounded-xl p-4 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><span className="material-symbols-outlined text-6xl text-green-500">check_box_outline_blank</span></div>
                        <div className="relative z-10">
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">Empty Supply</p>
                            <div className="flex items-end gap-2"><h3 className="text-3xl font-bold text-gray-900 dark:text-white">124</h3><span className="text-xs font-bold text-green-500 mb-1.5">Bins</span></div>
                            <div className="mt-2 text-xs text-gray-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Sufficient</div>
                        </div>
                    </div>
                    <div className="col-span-2 bg-white dark:bg-card-dark rounded-xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-bold tracking-tight flex items-center gap-2"><span className="material-symbols-outlined text-gray-400 text-lg">agriculture</span> Tractor Fleet Status</h2>
                            <span className="text-xs bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-gray-500 dark:text-gray-300">5 Total</span>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-green-500/10 border border-green-500/20 rounded-lg p-2 flex flex-col items-center justify-center text-center"><span className="text-xl font-bold text-green-600 dark:text-green-400">3</span><span className="text-[10px] uppercase font-bold text-green-600/70 dark:text-green-400/70">Active</span></div>
                            <div className="flex-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 flex flex-col items-center justify-center text-center"><span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">1</span><span className="text-[10px] uppercase font-bold text-yellow-600/70 dark:text-yellow-400/70">Idle</span></div>
                            <div className="flex-1 bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 flex flex-col items-center justify-center text-center"><span className="text-xl font-bold text-blue-600 dark:text-blue-400">1</span><span className="text-[10px] uppercase font-bold text-blue-600/70 dark:text-blue-400/70">Empty</span></div>
                        </div>
                    </div>
                </section>
                <div className="fixed bottom-24 right-4 z-40">
                    <button className="bg-primary hover:bg-red-600 text-white shadow-lg shadow-red-900/40 rounded-full h-14 px-6 flex items-center justify-center gap-2 transition-all active:scale-95">
                        <span className="material-symbols-outlined">campaign</span>
                        <span className="font-bold tracking-wide">Broadcast</span>
                    </button>
                </div>
            </main>
        </div>
    );
};

export const ManagerMessaging = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-gray-900 dark:text-white pb-24">
            <div className="sticky top-0 z-50 bg-background-light dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 pt-12 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-lg text-primary"><span className="material-symbols-outlined">forum</span></div>
                    <div><h1 className="text-xl font-bold leading-tight">Messaging Hub</h1><div className="flex items-center gap-1.5"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span></span><span className="text-xs text-gray-500 dark:text-gray-400 font-medium">3 New Alerts</span></div></div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/5"><span className="material-symbols-outlined">search</span></button>
                </div>
            </div>
            <main className="flex flex-col gap-4 p-4">
                <div className="bg-gray-200 dark:bg-card-dark p-1 rounded-xl flex items-center text-sm font-medium">
                    <button className="flex-1 py-2 rounded-lg bg-white dark:bg-primary text-gray-900 dark:text-white shadow-sm transition-all text-center">Groups</button>
                    <button className="flex-1 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all text-center">Direct</button>
                </div>
                <section>
                    <div className="bg-gradient-to-r from-cherry-dark to-card-dark rounded-2xl p-0.5 shadow-lg relative overflow-hidden group">
                        <div className="bg-card-dark rounded-[14px] p-4 relative z-10">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-red-900/50"><span className="material-symbols-outlined filled">campaign</span></div>
                                    <div><h3 className="text-base font-bold text-white leading-none">Manager Broadcast</h3><span className="text-xs text-primary font-medium">Official Channel • All Teams</span></div>
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium bg-white/5 px-2 py-1 rounded-full">12m ago</span>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                <p className="text-sm text-gray-200 leading-snug"><span className="text-primary font-bold">@All</span> Weather alert: Heavy rain expected at 15:00. Please ensure all picked buckets are covered and runners are prioritized for Block 4.</p>
                            </div>
                        </div>
                    </div>
                </section>
                <div className="fixed bottom-24 right-4 z-40">
                    <button className="bg-primary hover:bg-red-600 text-white shadow-lg shadow-red-900/40 rounded-full h-14 w-14 flex items-center justify-center transition-all active:scale-95 group">
                        <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">add</span>
                    </button>
                </div>
            </main>
        </div>
    );
};

export const ManagerSettings = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-gray-900 dark:text-white pb-24">
            <div className="sticky top-0 z-50 bg-background-light dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 pt-12 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"><span className="material-symbols-outlined">arrow_back</span></button>
                    <div><h1 className="text-xl font-bold leading-tight">Day Setup</h1><p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Orchard Configuration</p></div>
                </div>
            </div>
            <main className="flex flex-col gap-6 p-4 pb-40">
                <section className="flex flex-col gap-3">
                    <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Harvesting Variables</h2>
                    <div className="bg-white dark:bg-card-dark rounded-xl p-5 shadow-sm border border-gray-100 dark:border-white/5 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1.5">Variety</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">eco</span>
                                    <select className="w-full bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-white/10 rounded-lg py-3 pl-10 pr-10 text-sm focus:border-primary focus:ring-primary dark:text-white appearance-none transition-shadow font-medium">
                                        <option>Lapin</option><option>Santina</option><option>Sweetheart</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1.5">Bucket Rate</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">$</span>
                                    <input className="w-full bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-white/10 rounded-lg py-3 pl-7 pr-3 text-sm focus:border-primary focus:ring-primary dark:text-white font-medium" step="0.5" type="number" defaultValue="7.00"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <div className="fixed bottom-24 left-0 w-full px-4 z-40 pointer-events-none">
                    <button className="pointer-events-auto w-full bg-primary hover:bg-red-600 text-white shadow-xl shadow-red-900/30 rounded-xl h-14 font-bold text-base tracking-wide transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">broadcast_on_personal</span>
                        Save & Broadcast
                    </button>
                </div>
            </main>
        </div>
    );
};