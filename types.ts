// ===== Entidades base =====

export interface CarStats {
    aero: number;        // 0-100
    engine: number;      // 0-100
    chassis: number;     // 0-100
    reliability: number; // 0-100
}

export type CarStatKey = keyof CarStats;

export interface Team {
    id: string;
    name: string;
    shortName: string;
    color: string;          // color hex del equipo (se usa inline)
    car: CarStats;
    budget: number;         // $M
    sponsorTier: 1 | 2 | 3; // 1 = mejor patrocinio
    driverIds: string[];    // exactamente 2
}

export interface Driver {
    id: string;
    name: string;
    shortCode: string;      // VER, HAM...
    teamId: string | null;  // null = agente libre
    pace: number;           // 0-100 velocidad pura
    racecraft: number;      // 0-100 habilidad en pelea
    consistency: number;    // 0-100 menos errores/ruido
    experience: number;     // 0-100
    salary: number;         // $M por temporada
    contractYears: number;
}

export interface Circuit {
    id: string;
    name: string;
    country: string;
    laps: number;                  // vueltas reales (el motor las escala)
    baseLapSec: number;            // vuelta base en segundos
    overtakingDifficulty: number;  // 0-1 (Mónaco ~0.9, Monza ~0.2)
    tireStress: number;            // multiplicador de degradación 0.8-1.3
    rainChance?: number;           // 0-1, default RAIN_CHANCE_DEFAULT
    sprint?: boolean;              // fin de semana con carrera sprint
}

export type Compound = 'soft' | 'medium' | 'hard' | 'inter' | 'wet';
export type PaceMode = 'attack' | 'normal' | 'conserve';
export type SessionKind = 'race' | 'sprint';

// ===== Carrera en vivo (estado efímero, no se persiste) =====

export type RacePhase = 'green' | 'safetyCar' | 'finished';
export type CarStatus = 'running' | 'dnf';

export interface CarState {
    driverId: string;
    teamId: string;
    gridPos: number;
    totalTime: number;      // tiempo acumulado de carrera (s)
    lastLap: number;        // último tiempo de vuelta (s)
    compound: Compound;
    tireAge: number;        // vueltas del juego con este juego de neumáticos
    formOffset: number;     // forma del fin de semana en s/vuelta (+ = más lento)
    pitCount: number;
    status: CarStatus;
    dnfLap?: number;
    pendingPit: Compound | null; // parada encolada para la próxima vuelta
    paceMode: PaceMode;
}

export type RaceEventType = 'overtake' | 'pit' | 'dnf' | 'safetyCar' | 'safetyCarEnd' | 'fastestLap' | 'info' | 'weather';

export interface RaceEvent {
    lap: number;
    type: RaceEventType;
    message: string;
}

export interface RaceState {
    circuitId: string;
    lap: number;            // vuelta actual completada
    totalLaps: number;      // vueltas escaladas del juego
    cars: CarState[];       // orden = posición actual en carrera
    events: RaceEvent[];
    phase: RacePhase;
    safetyCarLapsLeft: number;
    fastestLap: { driverId: string; time: number } | null;
    rngState: number;       // estado del RNG con seed para reproducibilidad
    weather: { wetness: number[] }; // timeline 0-1 por vuelta, precomputada con el seed
    kind: SessionKind;
}

// ===== Resultados persistentes =====

export interface DriverResult {
    driverId: string;
    teamId: string;
    position: number | null; // null = DNF
    points: number;
    fastestLap: boolean;
    dnf: boolean;
}

export interface RaceResultRecord {
    raceIndex: number;
    circuitId: string;
    season: number;
    classification: DriverResult[]; // ordenado: clasificados primero, luego DNFs
    polesitterId: string;
    sprintClassification?: DriverResult[]; // solo en fines de semana sprint
}

export interface LedgerEntry {
    raceIndex: number;
    label: string;
    amount: number; // $M, negativo = gasto
}

// ===== Estado global de partida =====

export type GamePhase = 'preRace' | 'postSeason';

export interface GameState {
    saveVersion: number;
    playerTeamId: string;
    season: number;     // año, ej. 2025
    raceIndex: number;  // 0-23, próxima carrera a disputar
    teams: Record<string, Team>;
    drivers: Record<string, Driver>;
    results: RaceResultRecord[];
    ledger: LedgerEntry[];
    phase: GamePhase;
}

export type GameAction =
    | { type: 'NEW_GAME'; playerTeamId: string }
    | { type: 'LOAD_GAME'; state: GameState }
    | { type: 'RACE_COMPLETED'; record: RaceResultRecord }
    | { type: 'APPLY_UPGRADE'; stat: CarStatKey; points: number; cost: number }
    | { type: 'SWAP_DRIVER'; outDriverId: string; inDriverId: string; signingFee: number }
    | { type: 'ADVANCE_SEASON' }
    | { type: 'RESET' };
