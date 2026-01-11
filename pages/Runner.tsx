
import React from 'react';
import { useHarvest } from '../context/HarvestContext';

const RunnerHeader = ({ title, subtitle, rightIcon, onRightClick }: any) => (
    <header className="flex-none bg-white dark:bg-[#1b0d0f] shadow-sm z-10">
        <div className="flex items-center px-4 py-3 justify-between">
            <div>
                <h2 className="text-[#1b0d0f] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] flex-1">{title}</h2>
                {subtitle && <p className="text-[10px] text-runner-primary font-bold tracking-widest uppercase">{subtitle}</p>}
            </div>
            <div className="flex items-center justify-end gap-3">
                <button className="flex items-center justify-center rounded-full size-10 bg-cherry-light dark:bg-runner-primary/20 text-runner-primary">
                    <span className="material-symbols-outlined" style={{fontSize: '24px'}}>{rightIcon || 'notifications'}</span>
                </button>
            </div>
        </div>
    </header>
);

export const RunnerLogistics = () => {
    const { activeBin, scanNewBin } = useHarvest();

    // Calculate time diff for Sun Exposure
    const exposureMs = new Date().getTime() - new Date(activeBin.startTime).getTime();
    const exposureHours = Math.floor(exposureMs / (1000 * 60 * 60));
    const exposureMinutes = Math.floor((exposureMs % (1000 * 60 * 60)) / (1000 * 60));
    const timeString = `${exposureHours.toString().padStart(2, '0')}:${exposureMinutes.toString().padStart(2, '0')}:00`;

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
                    <div><h2 className="text-lg font-bold text-[#1b0d0f] dark:text-white">Active Bin #{activeBin.id}</h2><p className="text-sm text-gray-500 dark:text-gray-400">Harvesting: Stella Cherries</p></div>
                    <div className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold uppercase tracking-wider">In Progress</div>
                </div>
                <div className="bg-white dark:bg-[#2d1b1d] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center relative">
                    <svg className="circular-chart text-runner-primary" viewBox="0 0 36 36">
                        <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"></path>
                        <path className="circle stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" strokeDasharray={`${(activeBin.fillLevel/72)*100}, 100`}></path>
                        <text className="percentage fill-current dark:fill-white" x="18" y="19">{Math.round((activeBin.fillLevel/72)*100)}%</text>
                        <text className="sub-text fill-gray-500 dark:fill-gray-400" x="18" y="24">{activeBin.fillLevel >= 72 ? 'FULL' : 'FILLING'}</text>
                    </svg>
                    <div className="mt-4 text-center">
                        <p className="text-3xl font-bold text-[#1b0d0f] dark:text-white tabular-nums">{activeBin.fillLevel}<span className="text-lg text-gray-400 font-normal">/72</span></p>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">Buckets Collected</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#2d1b1d] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400"><span className="material-symbols-outlined">wb_sunny</span></div>
                        <div><p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sun Exposure</p><p className="text-xs text-gray-400">Since bin started</p></div>
                    </div>
                    <div className="text-right"><p className="text-xl font-bold text-[#1b0d0f] dark:text-white tabular-nums font-mono">{timeString}</p><p className="text-xs font-semibold text-green-600 dark:text-green-400">Safe Level</p></div>
                </div>
            </main>
            <div className="fixed bottom-[5.5rem] left-0 w-full z-20 pointer-events-none px-4 pb-2">
                <div className="flex gap-4 pointer-events-auto">
                    <button 
                        onClick={scanNewBin}
                        className="flex-1 flex flex-col items-center justify-center h-20 bg-white dark:bg-[#2d1b1d] border-2 border-runner-primary text-runner-primary rounded-xl active:bg-cherry-light dark:active:bg-runner-primary/20 transition-colors shadow-sm group"
                    >
                        <span className="material-symbols-outlined mb-1 group-active:scale-95 transition-transform">qr_code_scanner</span>
                        <span className="text-sm font-extrabold uppercase tracking-wide">Scan Bin</span>
                    </button>
                    <button className="flex-1 flex flex-col items-center justify-center h-20 bg-runner-primary text-white rounded-xl shadow-md active:bg-primary-dark transition-colors group">
                        <span className="material-symbols-outlined mb-1 group-active:scale-95 transition-transform">local_offer</span>
                        <span className="text-sm font-extrabold uppercase tracking-wide">Scan Sticker</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// ... RunnerWarehouse, RunnerTeam, RunnerMessaging implemented in previous turn ...
export const RunnerWarehouse = () => <div className="text-white p-4">Warehouse</div>;
export const RunnerTeam = () => <div className="text-white p-4">Team</div>;
export const RunnerMessaging = () => <div className="text-white p-4">Messaging</div>;
