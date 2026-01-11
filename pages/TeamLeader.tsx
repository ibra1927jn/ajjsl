import React from 'react';
import { useHarvest } from '../context/HarvestContext';

const Header = ({ title, subtitle, icon, color = "text-primary-vibrant" }: any) => (
    <div className="sticky top-0 z-30 bg-surface-white/95 backdrop-blur-sm border-b border-border-light pb-3 pt-safe-top shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center size-10 rounded-full bg-white border border-primary-vibrant/20 ${color} shadow-sm`}>
                <span className="material-symbols-outlined text-[24px]">{icon}</span>
            </div>
            <div>
                <h1 className="text-text-main text-lg font-bold leading-tight tracking-tight">{title}</h1>
                <p className="text-xs text-text-sub font-medium">{subtitle}</p>
            </div>
        </div>
        <button className="size-10 flex items-center justify-center rounded-full text-text-sub hover:bg-gray-100 active:bg-gray-200 transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 size-2 bg-primary-vibrant rounded-full border border-white"></span>
        </button>
    </div>
);

export const TLHome = () => {
    return (
        <div className="bg-background-light font-display min-h-screen flex flex-col antialiased text-text-main pb-24">
            <Header title="HarvestPro NZ" subtitle="Team Alpha • Block 4B" icon="agriculture" />
            <div className="grid grid-cols-3 gap-3 px-4 mt-1">
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-border-light shadow-sm">
                    <span className="text-[10px] text-text-sub uppercase tracking-wider font-semibold">Buckets</span>
                    <span className="text-primary-vibrant text-xl font-bold font-mono tracking-tight">1,240</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-border-light shadow-sm">
                    <span className="text-[10px] text-text-sub uppercase tracking-wider font-semibold">Pay Est.</span>
                    <span className="text-text-main text-xl font-bold font-mono tracking-tight">$4.2k</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-border-light shadow-sm">
                    <span className="text-[10px] text-text-sub uppercase tracking-wider font-semibold">Tons</span>
                    <span className="text-text-main text-xl font-bold font-mono tracking-tight">8.5</span>
                </div>
            </div>
            <main className="flex-1 flex flex-col w-full pb-24 overflow-x-hidden p-4 gap-6">
                <section>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-primary text-lg font-bold flex items-center gap-2"><span className="material-symbols-outlined text-primary-vibrant">health_and_safety</span> Breaks & Safety</h2>
                        <span className="bg-red-50 text-primary-vibrant text-[10px] px-2 py-1 rounded-full font-bold border border-red-100 animate-pulse">1 Action Required</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-xl p-4 border border-border-light shadow-sm relative overflow-hidden group">
                            <div className="absolute right-2 top-2 p-1 opacity-10 group-hover:opacity-20 transition-opacity"><span className="material-symbols-outlined text-4xl text-black">timer</span></div>
                            <div className="relative z-10">
                                <span className="text-[10px] text-text-sub uppercase font-bold tracking-wide">Active Shift</span>
                                <div className="text-2xl font-mono font-bold text-text-main mt-1">3h 45m</div>
                                <div className="mt-2 text-[10px] text-text-sub flex items-center gap-1"><span className="size-1.5 rounded-full bg-green-500"></span> Next break in 15m</div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-primary-vibrant/20 shadow-sm relative overflow-hidden bg-gradient-to-br from-white to-red-50">
                            <div className="flex justify-between items-start mb-2"><span className="text-[10px] text-primary-vibrant uppercase font-bold tracking-wide">Hydration Alert</span><span className="material-symbols-outlined text-primary-vibrant text-base">warning</span></div>
                            <div className="mb-3"><div className="text-sm font-bold text-text-main">Mike T.</div><div className="text-[10px] text-red-500 font-medium">Overdue by 10m</div></div>
                            <button className="w-full bg-primary-vibrant hover:bg-primary-dim text-white text-[10px] font-bold py-1.5 px-2 rounded transition-colors shadow-md shadow-red-200">Log Break</button>
                        </div>
                    </div>
                </section>
                <section>
                    <div className="flex justify-between items-end mb-4">
                        <div><h2 className="text-primary text-lg font-bold">Performance Analytics</h2><p className="text-sm text-text-sub">Team Velocity vs Goal</p></div>
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md text-text-main text-xs font-bold border border-border-light shadow-sm"><span className="material-symbols-outlined text-[14px] text-green-600">trending_up</span><span>+12%</span></div>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-border-light shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 bottom-0 left-[60%] border-l border-dashed border-gray-300 z-10 pointer-events-none"><div className="absolute -top-1 left-1 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Goal</div></div>
                        <div className="flex flex-col gap-5 relative z-0 mt-3">
                            <div className="grid grid-cols-[70px_1fr_40px] items-center gap-3">
                                <div className="flex flex-col"><span className="text-text-main text-sm font-semibold truncate">Liam O.</span><span className="text-[10px] text-text-sub">ID: 402</span></div>
                                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden relative"><div className="h-full bg-gradient-to-r from-primary-vibrant to-primary-dim rounded-full shadow-sm" style={{width: '88%'}}><div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white/50 animate-pulse"></div></div></div>
                                <span className="text-right text-text-main font-mono text-sm font-bold">45</span>
                            </div>
                        </div>
                    </div>
                </section>
                <div className="fixed bottom-24 right-4 flex flex-col items-end gap-3 z-40">
                    <button className="size-14 rounded-full bg-primary-vibrant text-white shadow-[0_4px_14px_rgba(255,31,61,0.4)] flex items-center justify-center hover:bg-primary-dim transition-transform active:scale-95"><span className="material-symbols-outlined text-[28px]">bar_chart</span></button>
                </div>
            </main>
        </div>
    );
};

export const TLCrew = () => {
    return (
        <div className="bg-background-light font-display min-h-screen flex flex-col antialiased text-text-main pb-24">
            <div className="sticky top-0 z-30 bg-surface-white/95 backdrop-blur-sm border-b border-border-light pb-3 pt-safe-top shadow-sm flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                    <button className="flex items-center justify-center size-10 rounded-full bg-background-light border border-transparent text-text-main hover:bg-gray-200 active:scale-95 transition-all"><span className="material-symbols-outlined text-[24px]">arrow_back</span></button>
                    <div><h1 className="text-text-main text-lg font-bold leading-tight tracking-tight">Crew Setup</h1><p className="text-xs text-text-sub font-medium">Harness & ID Assignment</p></div>
                </div>
                <button className="size-10 flex items-center justify-center rounded-full text-primary-vibrant hover:bg-primary-vibrant/5 active:bg-primary-vibrant/10 transition-colors relative"><span className="material-symbols-outlined">save</span></button>
            </div>
            <main className="flex-1 flex flex-col w-full pb-40 overflow-x-hidden p-4 gap-3">
                <div className="bg-white rounded-xl p-4 border border-border-light shadow-sm relative overflow-hidden group focus-within:ring-1 focus-within:ring-primary-vibrant/50 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="size-12 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-gray-500">LO</div>
                            <div>
                                <div className="flex items-center gap-1.5"><h3 className="text-text-main font-bold text-base">Liam O'Connor</h3></div>
                                <p className="text-xs text-text-sub font-medium flex items-center gap-1.5 mt-0.5"><span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase">Onboarded</span></p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 bg-background-light/50 p-3 rounded-lg border border-border-light/50">
                        <div><label className="text-[10px] uppercase font-bold text-text-sub tracking-wide block mb-1.5">Picker ID</label><div className="relative"><input className="w-full bg-white border-border-light rounded-lg px-3 py-2 text-sm font-mono font-bold text-text-main shadow-sm" type="number" defaultValue="402"/></div></div>
                        <div><label className="text-[10px] uppercase font-bold text-primary-dim tracking-wide block mb-1.5">Harness No.</label><div className="relative"><input className="w-full bg-white border-border-light rounded-lg px-3 py-2 text-sm font-mono font-bold text-primary-vibrant shadow-sm uppercase" type="text" defaultValue="HN-402"/></div></div>
                    </div>
                </div>
            </main>
            <div className="fixed bottom-[5.5rem] left-0 w-full px-4 pb-2 z-40 pointer-events-none"><div className="pointer-events-auto"><button className="w-full bg-primary-vibrant hover:bg-primary-dim text-white text-lg font-bold py-3.5 rounded-xl shadow-[0_8px_20px_rgba(255,31,61,0.4)] flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all border border-white/10"><span className="material-symbols-outlined text-[24px]">person_add</span> Add New Picker</button></div></div>
        </div>
    );
};

export const TLRows = () => {
    return (
        <div className="bg-background-light font-display min-h-screen flex flex-col antialiased text-text-main pb-24">
            <Header title="Row Logistics" subtitle="Block 5B • Gala Apples" icon="grid_view" />
            <main className="flex-1 flex flex-col w-full pb-32 overflow-x-hidden p-4 gap-6">
                <section>
                    <div className="flex justify-between items-end mb-4">
                        <div><h2 className="text-primary text-lg font-bold">Row Assignments</h2><p className="text-xs text-text-sub">Current active team location</p></div>
                        <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full text-primary-vibrant text-[11px] font-bold border border-primary-vibrant/20 shadow-sm"><span>Block 5B</span><span className="material-symbols-outlined text-[14px]">location_on</span></div>
                    </div>
                    <div className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-border-light flex justify-between items-center"><span className="text-sm font-bold text-text-main">Rows 12 - 18</span></div>
                        <div className="divide-y divide-border-light">
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-2"><div className="flex items-center gap-2"><span className="size-6 bg-primary text-white rounded flex items-center justify-center text-xs font-bold">12</span><span className="text-sm font-semibold text-text-main">South Side</span></div><span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span></div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden"><div className="bg-green-500 h-1.5 rounded-full" style={{width: '80%'}}></div></div>
                            </div>
                        </div>
                    </div>
                </section>
                <section>
                    <h2 className="text-primary text-lg font-bold mb-4">Picker Targets</h2>
                    <div className="bg-gradient-to-br from-primary to-primary-dim rounded-2xl p-5 text-white shadow-glow relative overflow-hidden">
                        <div className="flex justify-between items-start relative z-10">
                            <div><div className="flex items-center gap-1 text-white/80 text-xs font-medium uppercase tracking-wider mb-1">Min Wage Guarantee</div><div className="text-2xl font-bold">$23.50<span className="text-sm font-normal text-white/70"> / hr</span></div></div>
                            <div className="text-right"><div className="text-xs text-white/80 font-medium uppercase tracking-wider mb-1">Piece Rate</div><div className="text-lg font-bold">$6.50<span className="text-sm font-normal text-white/70"> / bkt</span></div></div>
                        </div>
                        <div className="mt-6 pt-5 border-t border-white/20 relative z-10">
                            <div className="flex justify-between items-center"><div><p className="text-sm font-medium text-white/90">Minimum Goal</p></div><div className="text-right"><span className="text-3xl font-extrabold text-white">3.6</span> <span className="text-sm font-medium text-white/80 ml-1">buckets/hr</span></div></div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export const TLProfile = () => {
    return (
        <div className="bg-background-light font-display min-h-screen flex flex-col antialiased text-text-main pb-24">
            <div className="sticky top-0 z-30 bg-surface-white/95 backdrop-blur-sm border-b border-border-light pb-3 pt-safe-top shadow-sm px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button className="flex items-center justify-center size-10 rounded-full text-text-sub hover:bg-gray-100 active:bg-gray-200 transition-colors"><span className="material-symbols-outlined text-[24px]">arrow_back</span></button>
                    <div><h1 className="text-text-main text-lg font-bold leading-tight tracking-tight">Session Setup</h1><p className="text-xs text-text-sub font-medium">Profile & Config</p></div>
                </div>
            </div>
            <main className="flex-1 flex flex-col w-full pb-32 overflow-x-hidden p-4 gap-6">
                <section>
                    <div className="bg-white rounded-xl p-5 border border-border-light shadow-sm flex items-start gap-4">
                        <div className="relative">
                            <div className="size-16 rounded-full bg-gray-100 flex items-center justify-center text-primary-vibrant text-2xl font-bold border border-gray-200">JS</div>
                            <div className="absolute bottom-0 right-0 size-5 bg-primary-vibrant border-2 border-white rounded-full flex items-center justify-center text-white"><span className="material-symbols-outlined text-[12px]">star</span></div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-text-main font-bold text-lg leading-tight">James Smith</h2>
                            <p className="text-sm text-text-sub font-medium">Team Leader • ID: TL-882</p>
                        </div>
                    </div>
                </section>
                <section>
                    <div className="bg-white rounded-xl border border-border-light shadow-sm overflow-hidden p-5 space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-text-sub uppercase tracking-wider mb-1.5">Orchard Block</label>
                            <select className="block w-full rounded-lg border-border-light text-text-main font-medium shadow-sm py-2.5 pl-3 pr-10"><option>El Pedregal - Block 4B</option></select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-text-sub uppercase tracking-wider mb-1.5">Variety</label>
                            <select className="block w-full rounded-lg border-border-light text-text-main font-medium shadow-sm py-2.5 pl-3 pr-10"><option>Lapin</option></select>
                        </div>
                        <div className="bg-gray-50 px-5 py-3 border-t border-border-light flex justify-between items-center -mx-5 -mb-5 mt-2">
                            <span className="text-xs text-text-sub">Last updated: Today 6:15 AM</span>
                            <button className="text-primary-vibrant text-sm font-bold hover:text-primary-dim transition-colors">Save Preset</button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};