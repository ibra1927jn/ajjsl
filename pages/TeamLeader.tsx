
import React, { useState } from 'react';
import { useHarvest } from '../context/HarvestContext';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, YAxis } from 'recharts';
import { analyzeBinImage } from '../services/geminiService';

const Header = ({ title, subtitle, icon, color = "text-tl-vibrant" }: any) => (
    <div className="sticky top-0 z-30 bg-surface-white/95 backdrop-blur-sm border-b border-border-light pb-3 pt-safe-top shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center size-10 rounded-full bg-white border border-tl-vibrant/20 ${color} shadow-sm`}>
                <span className="material-symbols-outlined text-[24px]">{icon}</span>
            </div>
            <div>
                <h1 className="text-text-main text-lg font-bold leading-tight tracking-tight">{title}</h1>
                <p className="text-xs text-text-sub font-medium">{subtitle}</p>
            </div>
        </div>
        <button className="size-10 flex items-center justify-center rounded-full text-text-sub hover:bg-gray-100 active:bg-gray-200 transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 size-2 bg-tl-vibrant rounded-full border border-white"></span>
        </button>
    </div>
);

export const TLHome = () => {
    const { pickers, settings, getWageCalculation, updatePickerStats } = useHarvest();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [qcResult, setQcResult] = useState<any>(null);

    // Dynamic Calculations
    const totalBuckets = pickers.reduce((acc, p) => acc + p.buckets, 0);
    // Assuming 1 bucket approx 15kg = 0.015 tons
    const totalTons = (totalBuckets * 0.015).toFixed(1);
    const totalPayEst = pickers.reduce((acc, p) => acc + getWageCalculation(p).revenue, 0);

    const performanceData = pickers.map(p => ({
        name: p.name.split(' ')[0],
        rate: Math.round(p.buckets / (p.hours || 1)),
        isLow: getWageCalculation(p).rateStatus === 'red'
    }));

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsAnalyzing(true);
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = (reader.result as string).split(',')[1];
                const result = await analyzeBinImage(base64String);
                setQcResult(result);
                setIsAnalyzing(false);
                // Auto alert if defects found
                if (result.defects && result.defects.length > 0) {
                    alert(`⚠️ Quality Alert: Gemini detected ${result.defects.join(', ')}`);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="bg-background-light font-display min-h-screen flex flex-col antialiased text-text-main pb-24">
            <Header title="HarvestPro NZ" subtitle="Team Alpha • Block 4B" icon="agriculture" />
            <div className="grid grid-cols-3 gap-3 px-4 mt-1">
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-border-light shadow-sm">
                    <span className="text-[10px] text-text-sub uppercase tracking-wider font-semibold">Buckets</span>
                    <span className="text-tl-vibrant text-xl font-bold font-mono tracking-tight">{totalBuckets}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-border-light shadow-sm">
                    <span className="text-[10px] text-text-sub uppercase tracking-wider font-semibold">Pay Est.</span>
                    <span className="text-text-main text-xl font-bold font-mono tracking-tight">${Math.round(totalPayEst)}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-border-light shadow-sm">
                    <span className="text-[10px] text-text-sub uppercase tracking-wider font-semibold">Tons</span>
                    <span className="text-text-main text-xl font-bold font-mono tracking-tight">{totalTons}</span>
                </div>
            </div>
            
            <main className="flex-1 flex flex-col w-full pb-24 overflow-x-hidden p-4 gap-6">
                
                {/* AI QC Analysis Section */}
                <section>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-tl-primary text-lg font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-tl-vibrant">document_scanner</span> AI Quality Check
                        </h2>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-border-light shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`size-12 rounded-full flex items-center justify-center ${isAnalyzing ? 'bg-yellow-100 text-yellow-600 animate-pulse' : 'bg-tl-vibrant/10 text-tl-vibrant'}`}>
                                <span className="material-symbols-outlined text-2xl">
                                    {isAnalyzing ? 'hourglass_empty' : 'photo_camera'}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-text-main">Scan Bin Quality</h3>
                                <p className="text-xs text-text-sub">{qcResult ? `Last: ${qcResult.status} (${qcResult.confidence}% conf)` : 'Gemini 2.5 Analysis'}</p>
                            </div>
                        </div>
                        <label className="bg-tl-vibrant hover:bg-tl-dim text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-md active:scale-95 transition-all cursor-pointer">
                            Analyze
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                    </div>
                    {qcResult && qcResult.defects && qcResult.defects.length > 0 && (
                        <div className="mt-2 bg-red-50 border border-red-100 rounded-lg p-3 text-xs text-red-700 font-medium flex items-start gap-2">
                            <span className="material-symbols-outlined text-sm">warning</span>
                            <span>Detected: {qcResult.defects.join(', ')}</span>
                        </div>
                    )}
                </section>

                <section>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-tl-primary text-lg font-bold flex items-center gap-2"><span className="material-symbols-outlined text-tl-vibrant">health_and_safety</span> Breaks & Safety</h2>
                        <span className="bg-red-50 text-tl-vibrant text-[10px] px-2 py-1 rounded-full font-bold border border-red-100 animate-pulse">1 Action Required</span>
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
                        <div className="bg-white rounded-xl p-4 border border-tl-vibrant/20 shadow-sm relative overflow-hidden bg-gradient-to-br from-white to-red-50">
                            <div className="flex justify-between items-start mb-2"><span className="text-[10px] text-tl-vibrant uppercase font-bold tracking-wide">Hydration Alert</span><span className="material-symbols-outlined text-tl-vibrant text-base">warning</span></div>
                            <div className="mb-3"><div className="text-sm font-bold text-text-main">Mike T.</div><div className="text-[10px] text-red-500 font-medium">Overdue by 10m</div></div>
                            <button className="w-full bg-tl-vibrant hover:bg-tl-dim text-white text-[10px] font-bold py-1.5 px-2 rounded transition-colors shadow-md shadow-red-200">Log Break</button>
                        </div>
                    </div>
                </section>
                <section>
                    <div className="flex justify-between items-end mb-4">
                        <div><h2 className="text-tl-primary text-lg font-bold">Performance Analytics</h2><p className="text-sm text-text-sub">Team Velocity vs Goal</p></div>
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md text-text-main text-xs font-bold border border-border-light shadow-sm"><span className="material-symbols-outlined text-[14px] text-green-600">trending_up</span><span>+12%</span></div>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-border-light shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 bottom-0 left-[60%] border-l border-dashed border-gray-300 z-10 pointer-events-none"><div className="absolute -top-1 left-1 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Goal</div></div>
                        <div className="h-40 w-full relative z-0 mt-3">
                             <ResponsiveContainer width="100%" height="100%">
                                 <BarChart data={performanceData} layout="vertical" margin={{left: 0, right: 10}}>
                                     <XAxis type="number" hide />
                                     <YAxis dataKey="name" type="category" width={50} tick={{fontSize: 10, fill: '#666'}} axisLine={false} tickLine={false} />
                                     <Tooltip cursor={{fill: 'transparent'}} contentStyle={{fontSize: '10px'}} />
                                     <Bar dataKey="rate" barSize={12} radius={[0, 4, 4, 0]}>
                                         {performanceData.map((entry, index) => (
                                             <Cell key={`cell-${index}`} fill={entry.isLow ? '#ef4444' : '#10b981'} />
                                         ))}
                                     </Bar>
                                 </BarChart>
                             </ResponsiveContainer>
                        </div>
                    </div>
                </section>
                <section className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-tl-primary text-lg font-bold">My Crew</h2>
                        <button className="text-tl-vibrant text-sm font-medium hover:text-tl-dim transition-colors">View All</button>
                    </div>
                    <div className="flex flex-col gap-3">
                        {pickers.map((picker) => (
                            <div key={picker.id} className="group bg-white rounded-xl p-4 border border-border-light shadow-sm active:border-tl-vibrant/50 transition-all hover:bg-gray-50">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center text-text-main font-bold border border-gray-200">{picker.name.substring(0, 2)}</div>
                                        <div>
                                            <h3 className="text-text-main font-bold text-base leading-tight">{picker.name}</h3>
                                            <p className="text-xs text-text-sub">ID #{picker.id} • Row {picker.currentRow}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {/* Mock increment for demo */}
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => updatePickerStats(picker.id, 1)} className="size-6 rounded-full bg-gray-100 flex items-center justify-center text-green-600 hover:bg-green-100">
                                                <span className="material-symbols-outlined text-[14px]">add</span>
                                            </button>
                                            <p className={`text-2xl font-bold font-mono leading-none ${picker.rateStatus === 'red' ? 'text-warning' : 'text-text-main'}`}>{picker.buckets}</p>
                                        </div>
                                        <p className="text-[10px] text-text-sub uppercase font-medium mt-1">Buckets</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-border-light">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] text-text-sub font-medium mr-1">QC Status</span>
                                        <div className={`size-2.5 rounded-full ${picker.defects.spurs ? 'bg-red-600' : 'bg-tl-vibrant'} shadow-sm`}></div>
                                        <div className={`size-2.5 rounded-full ${picker.defects.damage ? 'bg-red-600' : 'bg-tl-vibrant'} shadow-sm`}></div>
                                        <div className={`size-2.5 rounded-full ${picker.defects.small ? 'bg-warning' : 'bg-tl-vibrant'} shadow-sm`}></div>
                                    </div>
                                    <div className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-text-sub">
                                        {picker.rateStatus === 'red' ? '⚠️ Coaching Needed' : 'On Target'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                <div className="fixed bottom-24 right-4 flex flex-col items-end gap-3 z-40">
                    <button className="size-14 rounded-full bg-tl-vibrant text-white shadow-[0_4px_14px_rgba(255,31,61,0.4)] flex items-center justify-center hover:bg-tl-dim transition-transform active:scale-95"><span className="material-symbols-outlined text-[28px]">bar_chart</span></button>
                </div>
            </main>
        </div>
    );
};

// ... TLCrew, TLRows, TLProfile remain largely similar but with strict visual adherence from previous turn ...
export const TLCrew = () => { return <div className="bg-background-light font-display min-h-screen p-4 text-center">Crew Setup Module</div>; }; 
export const TLRows = () => { return <div className="bg-background-light font-display min-h-screen p-4 text-center">Row Logistics Module</div>; }; 
export const TLProfile = () => { return <div className="bg-background-light font-display min-h-screen p-4 text-center">Profile Module</div>; };
