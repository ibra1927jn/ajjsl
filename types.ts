export enum Role {
    MANAGER = 'manager',
    TEAM_LEAD = 'tl',
    RUNNER = 'runner'
}

export interface OrchardSettings {
    minWage: number; // 23.50
    bucketRate: number; // Precio por cubo
    targetRate: number; // Objetivo
    variety: string;
    orchardName: string;
    dailyGoal: number; // Kg
    harvestedTotal: number; // Kg
}

export interface Picker {
    id: string;
    name: string;
    harnessId: string;
    buckets: number;
    hours: number;
    qualityScore: number; // 0-100
    defects: {
        spurs: boolean;
        damage: boolean;
        small: boolean;
        color: boolean;
    };
    status: 'active' | 'break' | 'coaching_needed';
    row: string;
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
    id: string; // 5 digit code
    fillLevel: number; // 0-72 buckets
    status: 'collecting' | 'full' | 'transit';
    type: 'standard' | 'export';
    location: { x: number; y: number }; // Coordenadas mapa 0-100
    startTime: Date; // Para Sun Exposure Timer
}

export interface WarehouseState {
    emptyBins: number; // Contenedores grandes
    binsWithEmptyBuckets: number; // Bins con cubos vacíos
    fullCherryBins: number;
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
    content: string; // Texto
    imageUrl?: string; // URL de imagen
    type: 'text' | 'image';
    timestamp: Date;
}