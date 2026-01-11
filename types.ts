export enum Role {
    MANAGER = 'manager',
    TEAM_LEAD = 'tl',
    RUNNER = 'runner'
}

export interface OrchardSettings {
    minWage: number; // 23.50
    bucketRate: number; // Piece Rate
    targetRate: number; // Target buckets/hr
    variety: string;
    orchardName: string;
    dailyGoal: number; // Tons
    harvestedTotal: number; // Tons
}

export interface Picker {
    id: string;
    name: string;
    harnessId: string; // Physical gear link
    buckets: number;
    hours: number;
    qcPerformed: number; 
    qualityScore: number; // 0-100
    currentRow: string;
    treesDone: number;
    defects: {
        spurs: boolean;
        damage: boolean;
        small: boolean;
        color: boolean;
    };
    status: 'active' | 'break' | 'coaching_needed';
    rateStatus: 'green' | 'orange' | 'red'; // Wage Shield Status
    lastActive: Date;
    teamId: string;
}

export interface Team {
    id: string;
    leaderName: string;
    leaderAvatar?: string;
    block: string;
    tons: number;
    avgQuality: number;
}

export interface Bin {
    id: string;
    fillLevel: number; // 0-72 buckets
    status: 'collecting' | 'full' | 'transit';
    type: 'standard' | 'export';
    location: { x: number; y: number };
    startTime: Date; // For Sun Exposure
}

export interface WarehouseState {
    emptyBins: number; 
    binsWithEmptyBuckets: number;
    fullCherryBins: number;
    managerName: string;
}

export interface MapPin {
    id: string;
    type: 'bin_full' | 'tractor' | 'team_lead' | 'picker_group';
    x: number; // % left
    y: number; // % top
    alert?: boolean; // >20 min waiting
    label?: string;
    minutesWaiting?: number;
}

export interface Message {
    id: string;
    sender: string;
    role: Role;
    content: string; 
    imageUrl?: string; // Photo reports
    type: 'text' | 'image' | 'broadcast';
    timestamp: Date;
}