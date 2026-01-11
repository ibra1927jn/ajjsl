import React, { useState } from 'react';
import { Icon, Avatar, Card, Button } from '../components/Shared';
import { useHarvest } from '../context/HarvestContext';
import { Picker } from '../types';

// QC Dot Component
const QCDot = ({ active, color, label }: { active: boolean, color: string, label: string }) => (
    <div className="flex flex-col items-center gap-1">
        <div className={`size-3 rounded-full border border-gray-300 transition-colors ${active ? color : 'bg-transparent'}`}></div>
        <span className="text-[9px] text-gray-400 uppercase font-bold">{label}</span>
    </div>
);

export const TLHome = () => {
    const { pickers, updatePickerStats, getWageCalculation, settings, toggleDefect } = useHarvest();
    const [showSessionSetup, setShowSessionSetup] = useState(false);

    if (showSessionSetup) {
        return (
            <div className="bg-background-light min-h-screen p-6 pt-12 animate-in slide-in-from-bottom duration-300">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold">Session Setup</h1>
                    <button onClick={() => setShowSessionSetup(false)} className="bg-gray-200 p-2 rounded-full"><Icon name="close"/></button>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Block ID</label>
                        <input type="text" defaultValue={settings.orchardName} className="w-full mt-2 p-4 rounded-xl border border-gray-200 font-bold text-lg" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Variety</label>
                        <div className="flex gap-3 mt-2">
                            {['Santina', 'Lapin', 'Stella'].map(v => (
                                <button key={v} className={`px-4 py-3 rounded-xl font-bold text-sm ${settings.variety === v ? 'bg-primary text-white' : 'bg-white border border-gray-200'}`}>
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Target Specs</label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <span className="text-xs text-gray-400 block mb-1">Calibre</span>
                                <span className="text-xl font-bold">28mm+</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <span className="text-xs text-gray-400 block mb-1">Color</span>
                                <span className="text-xl font-bold text-primary-dark">Dark Red</span>
                            </div>
                        </div>
                    </div>
                    <Button fullWidth onClick={() => setShowSessionSetup(false)}>Confirm & Start</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-light min-h-screen pb-24 text-text-main font-sans">
             <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-border-light pb-3 pt-safe-top shadow-sm px-4 py-3">
                 <div className="flex justify-between items-center mb-4">
                     <div>
                        <h1 className="text-xl font-bold text-gray-900">Crew Alpha</h1>
                        <p className="text-xs text-gray-500 font-medium">Row 12A • {settings.variety}</p>
                     </div>
                     <button onClick={() => setShowSessionSetup(true)} className="bg-gray-100 p-2 rounded-lg text-gray-600">
                         <Icon name="tune" />
                     </button>
                 </div>
                 
                 {/* Métricas de Cabecera */}
                 <div className="grid grid-cols-3 gap-3">
                     <div className="bg-primary/5 rounded-lg p-2 text-center border border-primary/10">
                         <span className="block text-xl font-bold text-primary">1,240</span>
                         <span className="text-[10px] text-gray-500 uppercase font-bold">Buckets</span>
                     </div>
                     <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                         <span className="block text-xl font-bold text-gray-900">$4.2k</span>
                         <span className="text-[10px] text-gray-500 uppercase font-bold">Est. Pay</span>
                     </div>
                     <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                         <span className="block text-xl font-bold text-gray-900">45</span>
                         <span className="text-[10px] text-gray-500 uppercase font-bold">Avg Rate</span>
                     </div>
                 </div>
             </header>

             <main className="p-4 flex flex-col gap-4">
                 <div className="flex justify-between items-center">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Crew Management</h2>
                    <span className="text-xs font-bold text-gray-400">{pickers.length} Active</span>
                 </div>

                 {pickers.map(picker => {
                     const { isMinWage } = getWageCalculation(picker);

                     return (
                        <Card key={picker.id} className={`relative overflow-hidden transition-all ${picker.status === 'coaching_needed' ? 'ring-2 ring-red-500 ring-offset-2' : ''}`}>
                             {picker.status === 'coaching_needed' && (
                                 <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                                     COACHING NEEDED
                                 </div>
                             )}

                             <div className="flex justify-between items-start mb-4">
                                 <div className="flex items-center gap-3">
                                     <Avatar initials={picker.name.substring(0,2)} className="bg-gray-100 text-gray-700 font-bold size-12" />
                                     <div>
                                         <h3 className="font-bold text-base">{picker.name}</h3>
                                         <p className="text-xs text-gray-400 font-mono">{picker.harnessId}</p>
                                     </div>
                                 </div>
                                 <div className="text-right">
                                     <span className={`text-2xl font-bold font-mono ${isMinWage ? 'text-red-500' : 'text-gray-800'}`}>
                                         {picker.buckets}
                                     </span>
                                     <span className="text-[10px] text-gray-400 block uppercase">Buckets</span>
                                 </div>
                             </div>

                             {/* QC Score Dots */}
                             <div className="bg-gray-50 rounded-lg p-2 mb-4 flex justify-between items-center px-4">
                                 <div onClick={() => toggleDefect(picker.id, 'spurs')} className="cursor-pointer">
                                    <QCDot active={picker.defects.spurs} color="bg-red-500" label="Spurs" />
                                 </div>
                                 <div onClick={() => toggleDefect(picker.id, 'damage')} className="cursor-pointer">
                                    <QCDot active={picker.defects.damage} color="bg-orange-500" label="Damage" />
                                 </div>
                                 <div onClick={() => toggleDefect(picker.id, 'small')} className="cursor-pointer">
                                    <QCDot active={picker.defects.small} color="bg-blue-500" label="Small" />
                                 </div>
                                 <div onClick={() => toggleDefect(picker.id, 'color')} className="cursor-pointer">
                                    <QCDot active={picker.defects.color} color="bg-green-500" label="Color" />
                                 </div>
                             </div>
                             
                             {/* Quick Actions */}
                             <div className="flex gap-2 h-12">
                                 <button 
                                    onClick={() => updatePickerStats(picker.id, -1)}
                                    className="w-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 active:bg-gray-200"
                                 >
                                     <Icon name="remove" />
                                 </button>
                                 <button 
                                    onClick={() => updatePickerStats(picker.id, 1)}
                                    className="flex-1 rounded-lg bg-primary text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-red-200 active:scale-[0.98] transition-transform"
                                 >
                                     <Icon name="add" /> Add Bucket
                                 </button>
                             </div>

                             {isMinWage && (
                                 <div className="mt-3 flex items-center gap-2 text-[10px] text-red-600 font-bold bg-red-50 p-1.5 rounded border border-red-100">
                                     <Icon name="shield" className="text-sm" />
                                     <span>Min Wage Shield Active (Underperforming)</span>
                                 </div>
                             )}
                        </Card>
                     );
                 })}
             </main>
        </div>
    );
};

export const TLStats = () => (
    <div className="p-6 pt-12">
        <h1 className="text-2xl font-bold mb-6">Motivation Center</h1>
        <Card>
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Daily Goal Pacing</h3>
            <div className="h-64 flex items-end justify-between gap-2">
                {[40, 60, 55, 80, 70, 90, 85].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                         <div className="w-full bg-gray-100 rounded-t-md relative overflow-hidden h-full">
                             <div className="absolute bottom-0 w-full bg-primary transition-all duration-500 group-hover:bg-primary-dark" style={{ height: `${val}%` }}></div>
                         </div>
                         <span className="text-[10px] text-gray-400 font-mono">{i+7}am</span>
                    </div>
                ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-gray-500">
                <span className="size-2 rounded-full bg-primary"></span> Actual
                <span className="size-2 rounded-full bg-gray-200 ml-2"></span> Gap
            </div>
        </Card>
    </div>
); // Placeholder

export const TLProfile = () => <div/>; // Placeholder
