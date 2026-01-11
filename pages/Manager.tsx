import React from 'react';
import { Icon, Avatar, Card, Button } from '../components/Shared';
import { useHarvest } from '../context/HarvestContext';

export const ManagerDashboard = () => {
    const { settings, mapPins } = useHarvest();
    const yieldPercentage = Math.min(100, (settings.harvestedTotal / settings.dailyGoal) * 100);

    return (
        <div className="bg-background-dark min-h-screen pb-24 text-white font-sans selection:bg-primary selection:text-white">
             {/* Header */}
             <div className="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-xl border-b border-white/5 px-4 pt-12 pb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold leading-tight tracking-tight">Operations Center</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-xs text-gray-400 font-medium">Live • {settings.orchardName}</span>
                    </div>
                </div>
                <button className="bg-white/5 p-2 rounded-full border border-white/10">
                    <Icon name="settings" className="text-gray-400" />
                </button>
            </div>

            <main className="p-4 flex flex-col gap-6">
                {/* 1. Yield Card (Forecast vs Real-time) */}
                <div className="bg-gradient-to-br from-card-dark to-[#1a0508] rounded-2xl p-5 border border-white/10 shadow-glow relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Daily Harvest Goal</p>
                            <h2 className="text-3xl font-black tracking-tight text-white">{settings.harvestedTotal.toLocaleString()} <span className="text-lg font-medium text-gray-500">kg</span></h2>
                        </div>
                        <div className="text-right">
                             <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Target</p>
                             <p className="text-lg font-bold text-gray-400">{settings.dailyGoal.toLocaleString()} kg</p>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-4 w-full bg-gray-800 rounded-full overflow-hidden relative z-10">
                        <div 
                            className="h-full bg-gradient-to-r from-primary to-primary-vibrant shadow-[0_0_15px_rgba(210,4,45,0.6)]" 
                            style={{ width: `${yieldPercentage}%` }}
                        ></div>
                    </div>
                    <div className="mt-2 flex justify-between text-[10px] text-gray-500 font-mono relative z-10">
                        <span>0%</span>
                        <span>{yieldPercentage.toFixed(1)}% Complete</span>
                        <span>100%</span>
                    </div>
                    {/* Decorative Blur */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
                </div>

                {/* 2. Speed Comparison Graph */}
                <div className="bg-card-dark rounded-2xl p-5 border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-white">Velocity Match</h3>
                        <span className="text-xs text-green-400 font-bold bg-green-500/10 px-2 py-1 rounded">+12% Surplus</span>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">Picking Speed (TLs)</span>
                                <span className="text-white font-bold">450 bkt/hr</span>
                            </div>
                            <div className="h-2 w-full bg-gray-800 rounded-full">
                                <div className="h-full bg-primary rounded-full" style={{ width: '85%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">Collection Speed (Runners)</span>
                                <span className="text-blue-400 font-bold">420 bkt/hr</span>
                            </div>
                            <div className="h-2 w-full bg-gray-800 rounded-full">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: '78%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Historical Velocity (Simulated Bar Chart) */}
                <div className="bg-card-dark rounded-2xl p-5 border border-white/5">
                     <h3 className="text-sm font-bold text-white mb-4">Historical Velocity (4h)</h3>
                     <div className="flex items-end justify-between h-32 gap-2">
                        {[65, 80, 55, 90].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-end gap-1 group">
                                <div className="w-full bg-gray-800 rounded-t-sm relative overflow-hidden transition-all group-hover:bg-gray-700" style={{ height: `${h}%` }}>
                                    <div className="absolute bottom-0 w-full bg-primary/20 h-full border-t-2 border-primary"></div>
                                </div>
                                <span className="text-[10px] text-gray-500 text-center">{12 + i}:00</span>
                            </div>
                        ))}
                     </div>
                </div>

                {/* 4. Orchard Logistics Map */}
                <div className="relative rounded-2xl overflow-hidden border border-white/10 h-[300px] shadow-2xl">
                     <img src="https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?q=80&w=800&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale" />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#1a0508] via-transparent to-transparent"></div>
                     
                     {/* Map Pins */}
                     {mapPins.map(pin => (
                        <div 
                            key={pin.id} 
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                        >
                            {/* Pulse effect for alerts */}
                            {pin.alert && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>}
                            
                            <div className={`
                                size-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg transition-transform hover:scale-110
                                ${pin.type === 'bin_full' ? (pin.alert ? 'bg-red-600' : 'bg-green-600') : ''}
                                ${pin.type === 'tractor' ? 'bg-yellow-400 text-black' : ''}
                                ${pin.type === 'picker_group' ? 'bg-blue-500 text-white' : ''}
                            `}>
                                <Icon 
                                    name={pin.type === 'bin_full' ? 'inventory_2' : pin.type === 'tractor' ? 'agriculture' : 'groups'} 
                                    className="text-xs font-bold"
                                />
                            </div>
                            {pin.type === 'bin_full' && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded mt-1 font-bold shadow-sm whitespace-nowrap ${pin.alert ? 'bg-red-600 text-white animate-pulse' : 'bg-black/60 text-white'}`}>
                                    {pin.minutesWaiting}m
                                </span>
                            )}
                        </div>
                    ))}

                    <div className="absolute bottom-4 right-4">
                        <button className="bg-primary hover:bg-primary-vibrant text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-colors">
                            <Icon name="route" className="text-sm" /> Optimize Logistics
                        </button>
                    </div>
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-2 py-1 rounded text-[10px] text-gray-300 border border-white/10">
                        Block 4B • Live Tracking
                    </div>
                </div>
            </main>
        </div>
    );
};

export const ManagerTeams = () => <div/>; // Placeholder for routing compliance
export const ManagerSettings = () => <div/>; // Placeholder for routing compliance
