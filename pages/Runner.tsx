import React, { useRef, useState, useEffect } from 'react';
import { Icon, Card, Button } from '../components/Shared';
import { useHarvest } from '../context/HarvestContext';

export const RunnerLogistics = () => {
    const { activeBin, updateActiveBin } = useHarvest();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [scanMode, setScanMode] = useState<'bin' | 'sticker' | null>(null);
    const [sunExposure, setSunExposure] = useState(0);

    // Sun Timer Logic
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const diffMs = now.getTime() - activeBin.startTime.getTime();
            setSunExposure(Math.floor(diffMs / 60000));
        }, 1000);
        return () => clearInterval(interval);
    }, [activeBin.startTime]);

    const handleScanClick = (mode: 'bin' | 'sticker') => {
        setScanMode(mode);
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        // Simulated NPU Scanning
        setTimeout(() => {
            if (scanMode === 'sticker') {
                updateActiveBin(1);
                // Haptic feedback simulation would go here
            }
            setScanMode(null);
        }, 300);
    };

    const percentage = Math.min(100, (activeBin.fillLevel / 72) * 100);
    const isFull = activeBin.fillLevel >= 72;

    return (
        <div className="bg-background-light h-screen flex flex-col overflow-hidden text-text-main relative select-none">
            <header className="flex-none bg-white shadow-sm z-10 px-4 py-3 flex justify-between items-center">
                <h2 className="text-xl font-bold leading-tight text-gray-900">Logistics Hub</h2>
                <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1 border ${sunExposure > 60 ? 'bg-red-100 text-red-600 border-red-200 animate-pulse' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                    <Icon name="wb_sunny" className="text-sm"/>
                    {sunExposure}m Exposed
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center pt-8 p-4 pb-48">
                {/* Active Bin Tracker */}
                <div className="text-center mb-6">
                    <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Active Bin</h3>
                    <p className="text-3xl font-black text-gray-900">#{activeBin.id}</p>
                </div>

                <div className="relative size-72">
                    {/* Background Circle */}
                    <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                        <path className="fill-none stroke-gray-100 stroke-[1.5]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path 
                            className={`fill-none stroke-[2] stroke-linecap-round transition-all duration-300 ${isFull ? 'stroke-success' : 'stroke-primary'}`}
                            strokeDasharray={`${percentage}, 100`} 
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                        />
                    </svg>
                    
                    {/* Inner Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-7xl font-black tracking-tighter text-gray-900 leading-none">
                            {percentage.toFixed(0)}<span className="text-3xl text-gray-400">%</span>
                        </div>
                        <div className="text-sm font-bold text-gray-400 uppercase mt-2 tracking-wide bg-gray-100 px-3 py-1 rounded-full">
                            {activeBin.fillLevel} / 72 Buckets
                        </div>
                    </div>
                </div>

                {isFull && (
                    <div className="mt-8 w-full max-w-xs bg-green-500 text-white p-4 rounded-2xl shadow-xl shadow-green-500/30 flex items-center justify-center gap-3 animate-bounce">
                        <Icon name="local_shipping" className="text-2xl" />
                        <span className="font-bold text-lg">READY FOR PICKUP</span>
                    </div>
                )}
            </main>

            {/* Hidden Input */}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />

            {/* Ergonomic Thumb Controls */}
            <div className="fixed bottom-24 left-4 z-20">
                <button 
                    onClick={() => handleScanClick('bin')}
                    className="size-24 rounded-[2rem] bg-gray-900 text-white shadow-2xl flex flex-col items-center justify-center active:scale-90 transition-transform border-4 border-white/10"
                >
                    <Icon name="qr_code_scanner" className="text-3xl mb-1"/>
                    <span className="text-[10px] font-bold uppercase tracking-wide">Scan Bin</span>
                </button>
            </div>

            <div className="fixed bottom-24 right-4 z-20">
                <button 
                    onClick={() => handleScanClick('sticker')}
                    className="size-24 rounded-[2rem] bg-primary text-white shadow-2xl shadow-primary/40 flex flex-col items-center justify-center active:scale-90 transition-transform border-4 border-white"
                >
                    <Icon name="center_focus_strong" className="text-4xl mb-1"/>
                    <span className="text-[10px] font-bold uppercase tracking-wide">Sticker</span>
                </button>
            </div>
        </div>
    );
};

export const RunnerWarehouse = () => {
    const { warehouse, updateWarehouse } = useHarvest();

    return (
        <div className="bg-background-light h-screen flex flex-col text-text-main">
             <header className="flex-none bg-white shadow-sm z-10 px-4 py-3">
                 <h2 className="text-xl font-bold leading-tight">Warehouse</h2>
            </header>
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                 
                 {/* Full Cherry Bins Counter */}
                 <div className="bg-primary text-white rounded-3xl p-6 shadow-xl shadow-primary/20 relative overflow-hidden group">
                     <div className="absolute right-0 top-0 p-6 opacity-10"><Icon name="inventory_2" className="text-8xl" /></div>
                     <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Harvested Stock</h3>
                     <div className="text-6xl font-black">{warehouse.fullCherryBins}</div>
                     <div className="text-sm font-medium opacity-90 mt-1">Full Bins Ready</div>
                     <div className="mt-4 pt-4 border-t border-white/20 flex gap-2">
                         <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold">Cold Storage A</span>
                     </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     {/* Empty Bins */}
                     <Card className="flex flex-col items-center py-6 active:border-primary transition-colors">
                        <span className="text-4xl font-black text-gray-900 mb-1">{warehouse.emptyBins}</span>
                        <span className="text-xs font-bold text-gray-400 uppercase text-center leading-tight">Empty Bins<br/>Available</span>
                        <div className="mt-4 flex gap-2">
                            <button onClick={() => updateWarehouse('emptyBins', -1)} className="bg-gray-100 p-2 rounded-lg"><Icon name="remove" className="text-sm"/></button>
                            <button onClick={() => updateWarehouse('emptyBins', 1)} className="bg-gray-100 p-2 rounded-lg"><Icon name="add" className="text-sm"/></button>
                        </div>
                     </Card>

                     {/* Bins with Buckets */}
                     <Card className="flex flex-col items-center py-6 active:border-blue-500 transition-colors">
                        <span className="text-4xl font-black text-blue-600 mb-1">{warehouse.binsWithEmptyBuckets}</span>
                        <span className="text-xs font-bold text-gray-400 uppercase text-center leading-tight">Bucket<br/>Supplies</span>
                        <div className="mt-4 flex gap-2">
                            <button onClick={() => updateWarehouse('binsWithEmptyBuckets', -1)} className="bg-blue-50 text-blue-600 p-2 rounded-lg"><Icon name="remove" className="text-sm"/></button>
                            <button onClick={() => updateWarehouse('binsWithEmptyBuckets', 1)} className="bg-blue-50 text-blue-600 p-2 rounded-lg"><Icon name="add" className="text-sm"/></button>
                        </div>
                     </Card>
                 </div>
                 
                 <div className="bg-gray-900 text-white p-4 rounded-xl flex items-center justify-between cursor-pointer active:scale-[0.98]">
                     <div>
                         <h4 className="font-bold">Transport Request</h4>
                         <p className="text-xs text-gray-400">Notify depot for pickup</p>
                     </div>
                     <Icon name="local_shipping" className="text-2xl" />
                 </div>
            </main>
        </div>
    );
}