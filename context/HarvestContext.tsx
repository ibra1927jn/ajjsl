import React, { createContext, useContext, useState, useEffect } from 'react';
import { Picker, OrchardSettings, WarehouseState, Bin, MapPin, Message, Role } from '../types';

interface HarvestContextType {
    settings: OrchardSettings;
    updateSettings: (newSettings: Partial<OrchardSettings>) => void;
    pickers: Picker[];
    updatePickerStats: (id: string, bucketsChange: number) => void;
    toggleDefect: (id: string, defect: keyof Picker['defects']) => void;
    warehouse: WarehouseState;
    updateWarehouse: (type: keyof WarehouseState, change: number) => void;
    activeBin: Bin;
    updateActiveBin: (buckets: number) => void;
    mapPins: MapPin[];
    messages: Message[];
    sendMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
    getWageCalculation: (picker: Picker) => { revenue: number, isMinWage: boolean, wageGap: number };
    isOffline: boolean;
    toggleOffline: () => void;
}

const HarvestContext = createContext<HarvestContextType | undefined>(undefined);

export const HarvestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // 1. Configuración Global
    const [settings, setSettings] = useState<OrchardSettings>({
        minWage: 23.50,
        bucketRate: 8.50,
        targetRate: 45,
        variety: 'Santina',
        orchardName: 'Block 4B',
        dailyGoal: 15000,
        harvestedTotal: 12450
    });

    const [isOffline, setIsOffline] = useState(false);

    // 2. Pickers con estado de QC
    const [pickers, setPickers] = useState<Picker[]>([
        { 
            id: 'P01', name: 'Liam O.', harnessId: 'H-402', buckets: 45, hours: 4, qualityScore: 98, 
            defects: { spurs: false, damage: false, small: false, color: false }, 
            status: 'active', row: '12A', lastActive: new Date() 
        },
        { 
            id: 'P02', name: 'Sarah J.', harnessId: 'H-399', buckets: 12, hours: 4, qualityScore: 75, 
            defects: { spurs: true, damage: true, small: false, color: false }, 
            status: 'coaching_needed', row: '12A', lastActive: new Date() 
        },
        { 
            id: 'P03', name: 'Mike T.', harnessId: 'H-410', buckets: 60, hours: 4, qualityScore: 92, 
            defects: { spurs: false, damage: false, small: false, color: true }, 
            status: 'active', row: '12B', lastActive: new Date() 
        },
    ]);

    // 3. Inventario Crítico
    const [warehouse, setWarehouse] = useState<WarehouseState>({
        emptyBins: 15,
        binsWithEmptyBuckets: 4,
        fullCherryBins: 28
    });

    // 4. Bin Activa (Runner)
    const [activeBin, setActiveBin] = useState<Bin>({
        id: '40925',
        fillLevel: 45,
        status: 'collecting',
        type: 'standard',
        location: { x: 0, y: 0 },
        startTime: new Date(Date.now() - 1000 * 60 * 45) // 45 min ago
    });

    // 5. Mapa Logístico
    const [mapPins] = useState<MapPin[]>([
        { id: 'b1', type: 'bin_full', x: 20, y: 30, alert: true, minutesWaiting: 22, label: '#40901' }, 
        { id: 't1', type: 'tractor', x: 45, y: 50, label: 'T-01' },
        { id: 'tl1', type: 'picker_group', x: 60, y: 25, label: 'Crew A' },
        { id: 'b2', type: 'bin_full', x: 80, y: 70, alert: false, minutesWaiting: 5, label: '#40905' },
    ]);

    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: 'Mike (Runner)', role: Role.RUNNER, content: 'Truck arriving at zone B', type: 'text', timestamp: new Date(Date.now() - 1000 * 60 * 5) }
    ]);

    // LÓGICA DE NEGOCIO: Escudo de Cumplimiento 2025
    const getWageCalculation = (picker: Picker) => {
        const pieceRevenue = picker.buckets * settings.bucketRate;
        const timeRevenue = picker.hours * settings.minWage;
        
        const isMinWage = timeRevenue > pieceRevenue;
        const revenue = Math.max(pieceRevenue, timeRevenue);
        const wageGap = isMinWage ? timeRevenue - pieceRevenue : 0;

        return { revenue, isMinWage, wageGap };
    };

    const updatePickerStats = (id: string, bucketsChange: number) => {
        setPickers(prev => prev.map(p => {
            if (p.id !== id) return p;
            return { ...p, buckets: Math.max(0, p.buckets + bucketsChange), lastActive: new Date() };
        }));
    };

    const toggleDefect = (id: string, defect: keyof Picker['defects']) => {
        setPickers(prev => prev.map(p => {
            if (p.id !== id) return p;
            const newDefects = { ...p.defects, [defect]: !p.defects[defect] };
            // Simple logic: More defects = lower status
            const hasDefects = Object.values(newDefects).some(v => v);
            return { 
                ...p, 
                defects: newDefects,
                status: hasDefects ? 'coaching_needed' : 'active'
            };
        }));
    };

    const updateActiveBin = (buckets: number) => {
        setActiveBin(prev => {
            const newVal = Math.min(72, prev.fillLevel + buckets);
            return { ...prev, fillLevel: newVal };
        });
    };

    const updateWarehouse = (type: keyof WarehouseState, change: number) => {
        setWarehouse(prev => ({ ...prev, [type]: prev[type] + change }));
    };

    const updateSettings = (newSettings: Partial<OrchardSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const sendMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
        const newMessage = { ...msg, id: Date.now().toString(), timestamp: new Date() };
        setMessages(prev => [...prev, newMessage]);
    };

    const toggleOffline = () => setIsOffline(!isOffline);

    return (
        <HarvestContext.Provider value={{
            settings, updateSettings,
            pickers, updatePickerStats, toggleDefect,
            warehouse, updateWarehouse,
            activeBin, updateActiveBin,
            mapPins,
            messages, sendMessage,
            getWageCalculation,
            isOffline, toggleOffline
        }}>
            {children}
        </HarvestContext.Provider>
    );
};

export const useHarvest = () => {
    const context = useContext(HarvestContext);
    if (!context) throw new Error("useHarvest must be used within a HarvestProvider");
    return context;
};