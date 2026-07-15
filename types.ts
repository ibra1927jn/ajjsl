// ===== Entidades base =====

export interface CarStats {
    aero: number;        // 0-100
    engine: number;      // 0-100
    chassis: number;     // 0-100
    reliability: number; // 0-100
}

export type CarStatKey = keyof CarStats;

export type Difficulty = 'easy' | 'normal' | 'hard';

// td = director técnico, re = ingeniero de carrera, pc = jefe de mecánicos
export type StaffRole = 'td' | 're' | 'pc';

export interface StaffMember {
    id: string;
    name: string;
    role: StaffRole;
    skill: number;          // 0-100
    salary: number;         // $M por temporada
    contractYears: number;
    teamId: string | null;  // null = libre
}

export interface Team {
    id: string;
    name: string;
    shortName: string;
    color: string;          // color hex del equipo (se usa inline)
    car: CarStats;
    budget: number;         // $M
    sponsorTier: 1 | 2 | 3; // 1 = mejor patrocinio
    driverIds: string[];    // exactamente 2
    devSpendSeason: number; // $M gastados en desarrollo esta temporada (cost cap)
    staffIds: Record<StaffRole, string | null>;
}

export interface EngineAllocation {
    used: number;               // unidades de potencia usadas esta temporada
    poolSize: number;           // permitidas sin penalización (3)
    gridPenaltyPending: number; // posiciones de sanción para la próxima carrera
    wear: number;               // desgaste del motor actual (0-1; a 1 se cambia)
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
    age: number;            // edad en años
    morale: number;         // 0-100
    engine: EngineAllocation;
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
    sectorSplit?: [number, number, number]; // fracción de vuelta por sector (suma 1)
}

export type Compound = 'soft' | 'medium' | 'hard' | 'inter' | 'wet';
export type PaceMode = 'attack' | 'normal' | 'conserve';
export type SessionKind = 'race' | 'sprint';

// ===== Carrera en vivo (estado efímero, no se persiste) =====

export type RacePhase = 'green' | 'safetyCar' | 'vsc' | 'finished';
export type CarStatus = 'running' | 'dnf';
export type Sector = 0 | 1 | 2;

export interface CarState {
    driverId: string;
    teamId: string;
    gridPos: number;
    totalTime: number;      // tiempo acumulado de carrera (s)
    lastLap: number;        // último tiempo de vuelta completado (s)
    lapAccum: number;       // tiempo acumulado de la vuelta en curso (s)
    lastSector: number;     // último sector completado (s)
    bestSectors: [number, number, number]; // mejores tiempos personales por sector
    compound: Compound;
    tireAge: number;        // vueltas del juego con este juego de neumáticos
    formOffset: number;     // forma del fin de semana en s/vuelta (+ = más lento)
    pitCount: number;
    status: CarStatus;
    dnfLap?: number;
    pendingPit: Compound | null; // parada encolada para la próxima vuelta
    paceMode: PaceMode;
    penaltySec: number;          // penalizaciones acumuladas, se suman en meta
    damage: number;              // daño de ala: s/vuelta hasta reparar en boxes
    attackSectors: number;       // sectores corridos en 'attack' (desgaste de motor)
}

// Plan de la vuelta calculado en el sector 0 (transitorio, se reparte por sectores).
export interface LapPlanEntry {
    pace: number;    // tiempo total de la vuelta (s)
    pitLoss: number; // pérdida por parada si va a boxes esta vuelta
}

// Posiciones al inicio de la vuelta, para la radio (ligero, sin snapshot completo).
export interface LapStartInfo {
    order: string[];               // driverIds en carrera, orden de posición
    fastestId: string | null;
    penalty: Record<string, number>; // driverId → penaltySec al inicio de la vuelta
}

export type RaceEventType = 'overtake' | 'pit' | 'dnf' | 'safetyCar' | 'safetyCarEnd' | 'fastestLap' | 'info' | 'weather' | 'incident' | 'radio' | 'damage';

export interface RaceEvent {
    lap: number;
    type: RaceEventType;
    message: string;
}

export interface RaceState {
    circuitId: string;
    lap: number;            // vuelta actual completada
    sector: Sector;         // sector a punto de correrse (de la vuelta lap+1)
    totalLaps: number;      // vueltas escaladas del juego
    cars: CarState[];       // orden = posición actual en carrera
    events: RaceEvent[];
    phase: RacePhase;
    safetyCarLapsLeft: number;
    vscLapsLeft: number;    // vueltas restantes de VSC
    yellowSector: Sector | null; // sector con bandera amarilla local (esta vuelta)
    fastestLap: { driverId: string; time: number } | null; // tiempo de vuelta REAL
    rngState: number;       // estado del RNG con seed para reproducibilidad
    weather: { wetness: number[] }; // timeline 0-1 por vuelta, precomputada con el seed
    kind: SessionKind;
    raceLength: RaceLength; // duración del gran premio (referencia para la vida de neumáticos)
    // Modificadores por equipo del fin de semana (setup, staff). Serializados
    // dentro del RaceState → reanudar es idéntico gratis.
    mods: Record<string, { setupLapDelta: number; pitLossDelta: number }>;
    lapPlan: Record<string, LapPlanEntry>; // transitorio, se recalcula en cada sector 0
    drsDrivers: string[];                  // coches con DRS, fijado en el sector 0
    lapStart: LapStartInfo;                // posiciones al inicio de la vuelta (radio)
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
    fastestLapTime?: number;
    fastestLapDriverId?: string;
    ledLapsDriverId?: string; // piloto que lideró (aprox. ganador) — para misiones
    engineStress?: Record<string, number>; // driverId → fracción de sectores en attack
}

export interface LedgerEntry {
    raceIndex: number;
    label: string;
    amount: number; // $M, negativo = gasto
}

// ===== Estado global de partida =====

export type GamePhase = 'preRace' | 'postSeason' | 'gameOver';
export type RaceLength = 'short' | 'medium' | 'full';

// Record de vuelta rápida por circuito (nombres denormalizados: persiste retiradas).
export interface CircuitRecord {
    driverName: string;
    teamName: string;
    time: number;
    season: number;
}

// Estadísticas de carrera de un piloto (denormalizado, sobrevive a retiradas).
export interface DriverCareer {
    name: string;
    wins: number;
    poles: number;
    podiums: number;
    fastestLaps: number;
    races: number;
}

export interface UpgradeOrder {
    stat: CarStatKey;
    points: number;
    cost: number;
    readyAtRace: number; // raceIndex en el que la mejora llega al coche
}

export interface BoardState {
    targetPos: number; // objetivo de posición en constructores
    patience: number;  // 0-100; a 0 la junta te despide
}

// Registro de una temporada terminada (nombres denormalizados: los pilotos
// retirados desaparecen del estado, el palmarés debe sobrevivirlos).
export interface SeasonRecord {
    season: number;
    wdc: { driverId: string; name: string; teamId: string; teamName: string; color: string };
    wcc: { teamId: string; name: string; color: string };
    playerPos: number;
    playerPoints: number;
    playerWins: number;
    playerPodiums: number;
    playerPoles: number;
}

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
    board: BoardState;
    upgradeQueue: UpgradeOrder[]; // mejoras del jugador en fabricación
    news?: string[];              // titulares del último mercado (silly season)
    difficulty: Difficulty;
    staff: Record<string, StaffMember>;
    history: SeasonRecord[];      // palmarés de temporadas terminadas
    raceLength: RaceLength;
    records: Record<string, CircuitRecord>;      // circuitId → record de vuelta
    driverRecords: Record<string, DriverCareer>; // driverId → estadísticas de carrera
}

export type GameAction =
    | { type: 'NEW_GAME'; playerTeamId: string; difficulty?: Difficulty; raceLength?: RaceLength }
    | { type: 'LOAD_GAME'; state: GameState }
    | { type: 'RACE_COMPLETED'; record: RaceResultRecord }
    | { type: 'APPLY_UPGRADE'; stat: CarStatKey; points: number; cost: number }
    | { type: 'SWAP_DRIVER'; outDriverId: string; inDriverId: string; signingFee: number }
    | { type: 'POACH_DRIVER'; outDriverId: string; inDriverId: string; fee: number }
    | { type: 'RENEW_DRIVER'; driverId: string; fee: number }
    | { type: 'HIRE_STAFF'; staffId: string; fee: number }
    | { type: 'TAKE_ENGINE'; driverId: string }
    | { type: 'ADVANCE_SEASON' }
    | { type: 'RESET' };
