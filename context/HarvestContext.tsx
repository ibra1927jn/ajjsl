
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Picker, OrchardSettings, WarehouseState, Bin, MapPin, Message, Role, Team } from '../types';

interface HarvestContextType {
    settings: OrchardSettings;
    updateSettings: (newSettings: Partial<OrchardSettings>) => void;
    pickers: Picker[];
    teams: Team[];
    addPicker: (picker: Picker) => void;
    removePicker: (id: string) => void;
    updatePickerStats: (id: string, bucketsChange: number) => void;
    toggleDefect: (id: string, defect: keyof Picker['defects']) => void;
    warehouse: WarehouseState;
    updateWarehouse: (type: Exclude<keyof WarehouseState, 'managerName'>, change: number) => void;
    activeBin: Bin;
    updateActiveBin: (buckets: number) => void;
    scanNewBin: () => void;
    mapPins: MapPin[];
    messages: Message[];
    sendMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
    getWageCalculation: (picker: Picker) => { revenue: number, rateStatus: 'red' | 'orange' | 'green' };
    isOffline: boolean;
    toggleOffline: () => void;
}

const HarvestContext = createContext<HarvestContextType | undefined>(undefined);

export const HarvestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // --- STATE INITIALIZATION WITH PERSISTENCE ---
    const [settings, setSettings] = useState<OrchardSettings>(() => {
        const saved = localStorage.getItem('harvest_settings');
        return saved ? JSON.parse(saved) : {
            minWage: 23.50,
            bucketRate: 7.00,
            targetRate: 45,
            variety: 'Santina',
            orchardName: 'Block 4B',
            dailyGoal: 16000,
            harvestedTotal: 12500
        };
    });

    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    const [teams] = useState<Team[]>([
        { id: 'T01', leaderName: 'Sarah Jenkins', block: '2C', tons: 1.8, avgQuality: 98 },
        { id: 'T02', leaderName: 'Emily Clark', block: '1B', tons: 1.6, avgQuality: 95 },
        { id: 'T03', leaderName: 'Mike Ross', block: '4A', tons: 1.4, avgQuality: 85 },
    ]);

    const [pickers, setPickers] = useState<Picker[]>(() => {
        const saved = localStorage.getItem('harvest_pickers');
        return saved ? JSON.parse(saved) : [
            { 
                id: '402', name: 'Liam O.', harnessId: 'HN-402', buckets: 45, hours: 4, qualityScore: 98, qcPerformed: 12, currentRow: '12', treesDone: 45,
                defects: { spurs: false, damage: false, small: false, color: false }, 
                status: 'active', rateStatus: 'green', lastActive: new Date(), teamId: 'T01'
            },
            { 
                id: '399', name: 'Sarah J.', harnessId: 'HN-399', buckets: 38, hours: 4, qualityScore: 95, qcPerformed: 8, currentRow: '12', treesDone: 38,
                defects: { spurs: true, damage: true, small: false, color: false }, 
                status: 'active', rateStatus: 'green', lastActive: new Date(), teamId: 'T01'
            },
            { 
                id: '410', name: 'Mike T.', harnessId: 'HN-410', buckets: 12, hours: 3.5, qualityScore: 82, qcPerformed: 5, currentRow: '14', treesDone: 10,
                defects: { spurs: false, damage: false, small: false, color: true }, 
                status: 'active', rateStatus: 'red', lastActive: new Date(), teamId: 'T01'
            },
        ];
    });

    const [warehouse, setWarehouse] = useState<WarehouseState>({
        emptyBins: 15,
        binsWithEmptyBuckets: 8,
        fullCherryBins: 28,
        managerName: "Dave S."
    });

    const [activeBin, setActiveBin] = useState<Bin>({
        id: '4092',
        fillLevel: 45,
        status: 'collecting',
        type: 'standard',
        location: { x: 0, y: 0 },
        startTime: new Date(Date.now() - 1000 * 60 * 75)
    });

    const [mapPins] = useState<MapPin[]>([
        { id: 'b1', type: 'bin_full', x: 20, y: 30, alert: true, minutesWaiting: 22, label: '#40901' }, 
        { id: 't1', type: 'tractor', x: 45, y: 50, label: 'T-01' },
        { id: 'tl1', type: 'picker_group', x: 60, y: 25, label: 'Crew A' },
    ]);

    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: 'Manager', role: Role.MANAGER, content: 'Weather alert: Heavy rain expected at 15:00. Cover bins.', type: 'broadcast', timestamp: new Date(Date.now() - 1000 * 60 * 12) },
        { id: '2', sender: 'Sarah', role: Role.TEAM_LEAD, content: 'Truck #4 is arriving at North Gate.', type: 'text', timestamp: new Date(Date.now()) }
    ]);

    // --- EFFECTS FOR PERSISTENCE ---
    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (isOffline) {
            localStorage.setItem('harvest_pickers', JSON.stringify(pickers));
            localStorage.setItem('harvest_settings', JSON.stringify(settings));
            // In a real app, we would queue changes here
        }
    }, [pickers, settings, isOffline]);

    // --- BUSINESS LOGIC ---

    // Wage Shield Calculation
    const getWageCalculation = (picker: Picker) => {
        const pieceRevenue = picker.buckets * settings.bucketRate;
        const guaranteedRevenue = picker.hours * settings.minWage;
        
        // Red: Earning less than min wage (Top-up required)
        const isMinWage = guaranteedRevenue > pieceRevenue;
        
        // Orange: Close to min wage (within 10%)
        const isClose = !isMinWage && pieceRevenue < (guaranteedRevenue * 1.1);

        const rateStatus: 'red' | 'orange' | 'green' = isMinWage ? 'red' : (isClose ? 'orange' : 'green');
        const revenue = Math.max(pieceRevenue, guaranteedRevenue);

        return { revenue, rateStatus };
    };

    const playAlertSound = () => {
        // Mock audio play
        console.log("🔊 AUDIO ALERT: Productivity dropped below threshold");
        // const audio = new Audio('/assets/ping-click.mp3');
        // audio.play().catch(e => console.log(e));
    };

    const updatePickerStats = (id: string, bucketsChange: number) => {
        setPickers(prev => prev.map(p => {
            if (p.id !== id) return p;
            
            const newBuckets = Math.max(0, p.buckets + bucketsChange);
            const updatedPicker = { ...p, buckets: newBuckets };
            
            const { rateStatus } = getWageCalculation(updatedPicker);
            
            // Alert if dropping into red
            if (rateStatus === 'red' && p.rateStatus !== 'red') {
                playAlertSound();
            }

            return { ...updatedPicker, rateStatus, lastActive: new Date() };
        }));
    };

    const addPicker = (picker: Picker) => {
        setPickers(prev => [...prev, picker]);
    };

    const removePicker = (id: string) => {
        setPickers(prev => prev.filter(p => p.id !== id));
    };

    const toggleDefect = (id: string, defect: keyof Picker['defects']) => {
        setPickers(prev => prev.map(p => {
            if (p.id !== id) return p;
            const newDefects = { ...p.defects, [defect]: !p.defects[defect] };
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

    const scanNewBin = () => {
        const newId = Math.floor(4000 + Math.random() * 1000).toString();
        setActiveBin({
            id: newId,
            fillLevel: 0,
            status: 'collecting',
            type: 'standard',
            location: { x: 0, y: 0 },
            startTime: new Date()
        });
        // Logic to add previous bin to warehouse would go here
        updateWarehouse('emptyBins', -1);
    };

    const updateWarehouse = (type: Exclude<keyof WarehouseState, 'managerName'>, change: number) => {
        setWarehouse(prev => ({ ...prev, [type]: prev[type] + change }));
    };

    const updateSettings = (newSettings: Partial<OrchardSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const sendMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
        const newMessage = { ...msg, id: Date.now().toString(), timestamp: new Date() };
        setMessages(prev => [newMessage, ...prev]);
    };

    const toggleOffline = () => setIsOffline(!isOffline);

    return (
        <HarvestContext.Provider value={{
            settings, updateSettings,
            pickers, teams, addPicker, removePicker,
            updatePickerStats, toggleDefect,
            warehouse, updateWarehouse,
            activeBin, updateActiveBin, scanNewBin,
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
