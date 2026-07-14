import { Compound } from '../types';

// ============================================================
// TODAS las constantes de balance del juego viven aquí.
// Ajustar estos números es la forma de tunear el juego.
// ============================================================

// ----- Escala de carrera -----
export const LAP_SCALE = 0.5; // vueltas del juego = vueltas reales × escala

// ----- Rendimiento -----
export const CAR_WEIGHTS = { aero: 0.4, engine: 0.35, chassis: 0.25 };
export const CAR_SHARE = 0.75;            // peso del coche en el rating total (piloto = 0.25)
export const PERF_SEC_PER_POINT = 0.06;   // segundos/vuelta por punto de rating perdido

// ----- Neumáticos -----
export interface CompoundSpec {
    offset: number;    // s/vuelta vs medio
    degPerLap: number; // s/vuelta añadidos por cada vuelta de edad
    lifeFrac: number;  // fracción de la distancia de carrera antes del "cliff"
    color: string;
    label: string;
}
export const COMPOUNDS: Record<Compound, CompoundSpec> = {
    soft:   { offset: -0.6, degPerLap: 0.090, lifeFrac: 0.38, color: '#ff2d2d', label: 'S' },
    medium: { offset: 0,    degPerLap: 0.055, lifeFrac: 0.58, color: '#ffd12e', label: 'M' },
    hard:   { offset: 0.5,  degPerLap: 0.035, lifeFrac: 0.85, color: '#f0f0f0', label: 'H' },
};
export const CLIFF_MULTIPLIER = 3; // la degradación se multiplica al superar la vida

// ----- Vuelta de carrera -----
export const RACE_FORM_SD = 0.12;        // sd de la "forma" por piloto y fin de semana (s/vuelta)
export const FUEL_EFFECT = 0.035;        // s/vuelta por cada vuelta de combustible restante
export const BASE_NOISE_SD = 0.25;       // sd del ruido gaussiano, escalado por consistencia
export const DIRTY_AIR_PENALTY = 0.4;    // s/vuelta pegado al coche de delante
export const DIRTY_AIR_RANGE = 1.2;      // s de gap para sufrir aire sucio
export const PIT_LOSS = 22;              // s perdidos por parada
export const PIT_LOSS_SD = 0.8;
export const MANDATORY_PIT_PENALTY = 10; // s añadidos en meta si no se paró

// ----- Clasificación (quali) -----
export const QUALI_RUNS = 3;
export const QUALI_NOISE_BASE = 0.45; // sd por run, reducido por consistencia+experiencia

// ----- Adelantamientos -----
export const OVERTAKE_BASE = 0.5;        // probabilidad base de intento exitoso
export const OVERTAKE_STUCK_GAP = 0.4;   // s a los que se queda clavado si falla
export const OVERTAKE_PACE_FACTOR = 0.35;// bonus por cada segundo de delta de ritmo

// ----- Incidentes -----
export const BASE_MECH_DNF = 0.0018;     // prob. por coche y vuelta (× factor fiabilidad)
export const BASE_DRIVER_ERROR = 0.0012; // prob. por coche y vuelta (× factor consistencia)
export const SC_CHANCE_ON_DNF = 0.35;
export const SC_MIN_LAPS = 3;
export const SC_MAX_LAPS = 4;
export const SC_LAP_FACTOR = 1.25;       // las vueltas bajo SC son base × factor
export const SC_COMPRESS_GAP = 1.0;      // gap máximo entre coches al reanudar

// ----- Estrategia IA -----
export const AI_STINT_JITTER = 0.15;     // ±15% sobre el stint objetivo
export const SC_FREE_STOP_AGE = 0.6;     // la IA para bajo SC si su neumático supera este % de vida

// ----- Puntos y dinero (en $M) -----
export const POINTS_TABLE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
export const FASTEST_LAP_POINT = 1;      // solo si acaba en top 10
export const PRIZE_TABLE = [3.0, 2.4, 2.0, 1.7, 1.4, 1.2, 1.0, 0.8, 0.6, 0.5]; // P1-P10
export const PRIZE_OUTSIDE_TOP10 = 0.2;
export const SPONSOR_PER_RACE: Record<1 | 2 | 3, number> = { 1: 2.5, 2: 1.8, 3: 1.2 };
export const RACES_PER_SEASON = 24;      // los salarios se prorratean entre estas carreras

// ----- Desarrollo -----
export const UPGRADE_STEP = 2;                 // puntos de stat por compra
export const upgradeCostPerPoint = (level: number) => 2 + level / 25; // $M por punto
export const RELIABILITY_COST_FACTOR = 0.6;    // fiabilidad más barata
export const STAT_CAP = 99;
export const AI_DEV_SPEND_FRACTION = 0.55;     // % de sus ingresos que la IA invierte en coche

// ----- Mercado -----
export const SIGNING_FEE_FACTOR = 0.5; // prima de fichaje = salario × factor

// ----- UI -----
export const TICK_SPEEDS = [
    { label: '1x', ms: 1500 },
    { label: '2x', ms: 700 },
    { label: '4x', ms: 300 },
];
