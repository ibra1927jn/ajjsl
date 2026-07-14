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
    inter:  { offset: 0.3,  degPerLap: 0.050, lifeFrac: 0.60, color: '#43b02a', label: 'I' },
    wet:    { offset: 0.8,  degPerLap: 0.040, lifeFrac: 0.75, color: '#4aa8ff', label: 'W' },
};
export const SLICKS: Compound[] = ['soft', 'medium', 'hard'];
export const CLIFF_MULTIPLIER = 3; // la degradación se multiplica al superar la vida

// ----- Clima -----
export const RAIN_CHANCE_DEFAULT = 0.22;  // prob. de que llueva en la carrera (override por circuito)
export const WET_START_CHANCE = 0.25;     // si llueve, prob. de que la pista ya esté mojada en la salida
export const SECOND_BURST_CHANCE = 0.35;  // prob. de una segunda ráfaga de lluvia
export const RAIN_ACCUM_PER_LAP = 0.18;   // wetness que suma una ráfaga de intensidad 1 por vuelta
export const DRY_RATE_PER_LAP = 0.06;     // wetness que se seca por vuelta sin lluvia
export const WET_LAP_FRAC = 0.05;         // pérdida de vuelta a wetness 1 (fracción de baseLapSec)
export const WET_NOISE_FACTOR = 1.0;      // el ruido gaussiano crece ×(1 + factor × wetness)
export const SLICK_WET_COEF = 10;         // s/vuelta que paga un slick: coef × wetness²
export const INTER_DRY_LIMIT = 0.15;      // por debajo, el inter se sobrecalienta
export const INTER_DRY_COEF = 8;          // s/vuelta × (límite − wetness) en seco
export const INTER_WET_LIMIT = 0.55;      // por encima, el inter aquaplanea
export const INTER_WET_COEF = 10;         // s/vuelta × (wetness − límite)
export const WET_BELOW_COEF = 6;          // s/vuelta que paga el wet por pista seca: coef × (0.55 − wetness)
export const DRY_DEG_FACTOR = 3;          // deg extra de inter/wet en pista secándose (hasta ×4)
export const TO_INTER_WETNESS = 0.22;     // la IA monta inters por encima
export const TO_SLICK_WETNESS = 0.12;     // la IA vuelve a slicks por debajo (histéresis)
export const TO_WET_WETNESS = 0.62;       // la IA monta wets por encima
export const FROM_WET_WETNESS = 0.50;     // la IA baja de wets a inters por debajo
export const CROSSOVER_JITTER = 0.05;     // jitter por coche para que no paren todos a la vez
export const WET_ERROR_BASE = 2.0;        // errores ×(1 + base × wetness)
export const WET_WRONG_TIRE_ERROR = 6.0;  // extra por llevar slicks en mojado
export const WET_RACE_THRESHOLD = 0.25;   // wetness máx. que anula la parada obligatoria

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

// ----- Ritmo (dial del jugador) -----
export interface PaceSpec { lapDelta: number; degMult: number; errMult: number; label: string }
export const PACE_MODES: Record<import('../types').PaceMode, PaceSpec> = {
    attack:   { lapDelta: -0.18, degMult: 1.45, errMult: 1.7, label: 'Atacar' },
    normal:   { lapDelta: 0,     degMult: 1,    errMult: 1,   label: 'Normal' },
    conserve: { lapDelta: 0.22,  degMult: 0.65, errMult: 0.7, label: 'Conservar' },
};
export const TEAM_ORDER_CUSHION = 0.3; // s de colchón al intercambiar posiciones

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
