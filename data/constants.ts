import { Compound } from '../types';

// ============================================================
// TODAS las constantes de balance del juego viven aquí.
// Ajustar estos números es la forma de tunear el juego.
// ============================================================

// ----- Escala de carrera -----
export const LAP_SCALE = 0.5; // escala por defecto (medium) — usada como referencia
export const RACE_LENGTH_SCALE: Record<import('../types').RaceLength, number> = {
    short: 0.25,   // ~25% de las vueltas reales
    medium: 0.5,   // ~50% (por defecto, como v1-v3)
    full: 1.0,     // 100% — carrera realista completa
};

// ----- Rendimiento -----
export const CAR_WEIGHTS = { aero: 0.4, engine: 0.35, chassis: 0.25 };
export const CAR_SHARE = 0.70;            // peso del coche en el rating total (piloto = 0.30)
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
export const TWO_COMPOUND_PENALTY = 15;  // s en meta si en seco no se usan 2 compuestos slick

// ----- Práctica libre y setup -----
export const SETUP_SLIDERS = [
    { key: 'aero', label: 'Alerones' },
    { key: 'susp', label: 'Suspensión' },
    { key: 'gear', label: 'Marchas' },
] as const;
export const SETUP_MIN = 1;
export const SETUP_MAX = 10;
export const PRACTICE_RUNS = 3;              // tandas de libres disponibles
export const SETUP_LAP_BONUS_MAX = 0.25;     // s/vuelta con setup perfecto (todo el finde)
export const SETUP_QUALI_NOISE_REDUCTION = 0.2;
export const SETUP_BASE_QUALITY = 0.5;       // calidad del "setup base" (saltarse los libres)
export const SETUP_OK_TOLERANCE = 1.0;       // a esta distancia del ideal el feedback dice "ok"
export const AI_SETUP_MEAN = 0.62;           // calidad media de setup de la IA
export const AI_SETUP_SD = 0.18;             // (sesgada por experiencia del primer piloto)

// ----- Clasificación (quali) -----
export const QUALI_RUNS = 3;
export const QUALI_NOISE_BASE = 0.45; // sd por run, reducido por consistencia+experiencia

// ----- DRS y duelos -----
export const DRS_RANGE = 1.0;             // s de gap para tener DRS
export const DRS_LAP_GAIN = 0.15;         // s/vuelta que gana el coche con DRS
export const DRS_OVERTAKE_ADD = 0.10;     // prob. extra de adelantamiento (aditiva, tras la compuerta)
export const DUEL_CONTACT_CHANCE = 0.05;  // prob. de contacto al fallar un intento
export const CONTACT_ATTACKER_LOSS: [number, number] = [1, 3]; // s perdidos
export const CONTACT_DEFENDER_CHANCE = 0.4;
export const CONTACT_DEFENDER_LOSS: [number, number] = [1, 2];
export const CONTACT_PENALTY_SEC = 5;     // penalización del causante en meta
export const FRONT_WING_PENALTY = 1.2;    // s/vuelta con el ala dañada
export const DAMAGE_REPAIR_PIT_LOSS = 8;  // s extra en la parada para reparar
export const DAMAGE_CHANCE_ON_CONTACT = 0.5; // prob. de romper ala en un contacto

// ----- Adelantamientos -----
export const OVERTAKE_BASE = 0.35;       // probabilidad base de intento exitoso
export const OVERTAKE_STUCK_GAP = 0.9;   // s a los que se queda clavado si falla (zona de aire sucio)
export const OVERTAKE_PACE_FACTOR = 0.35;// bonus por cada segundo de delta de ritmo
export const OVERTAKE_COOLDOWN_LAPS = 2; // tras perder la posición no re-ataca durante N vueltas

// ----- Sectores -----
export const DEFAULT_SECTOR_SPLIT: [number, number, number] = [0.34, 0.33, 0.33];
export const SECTOR_INCIDENT_FRACTION = 1 / 3; // los incidentes se tiran cada sector a base/3
export const SECTOR_MICRO_SD = 0.04;           // micro-ruido gaussiano por sector

// ----- Incidentes -----
export const BASE_MECH_DNF = 0.0018;     // prob. por coche y vuelta (× factor fiabilidad)
export const BASE_DRIVER_ERROR = 0.0012; // prob. por coche y vuelta (× factor consistencia)
export const SC_CHANCE_ON_DNF = 0.35;
export const SC_MIN_LAPS = 3;
export const SC_MAX_LAPS = 4;
export const SC_LAP_FACTOR = 1.25;       // las vueltas bajo SC son base × factor
export const SC_COMPRESS_GAP = 1.0;      // gap máximo entre coches al reanudar

// ----- VSC y banderas amarillas -----
export const MINOR_INCIDENT_RATE = 0.010; // prob. por sector de un incidente menor (coche parado/restos)
export const VSC_CHANCE = 0.45;          // de un incidente menor, prob. de VSC (si no, amarilla local)
export const VSC_MIN_LAPS = 1;
export const VSC_MAX_LAPS = 2;
export const VSC_SLOWDOWN = 1.35;        // vueltas bajo VSC × factor (sin agrupar el pelotón)
export const YELLOW_SLOWDOWN = 1.15;     // sector con amarilla local × factor

// ----- Ritmo (dial del jugador) -----
export interface PaceSpec { lapDelta: number; degMult: number; errMult: number; label: string }
export const PACE_MODES: Record<import('../types').PaceMode, PaceSpec> = {
    attack:   { lapDelta: -0.18, degMult: 1.45, errMult: 1.7, label: 'Atacar' },
    normal:   { lapDelta: 0,     degMult: 1,    errMult: 1,   label: 'Normal' },
    conserve: { lapDelta: 0.22,  degMult: 0.65, errMult: 0.7, label: 'Conservar' },
};
export const TEAM_ORDER_CUSHION = 0.3; // s de colchón al intercambiar posiciones

// ----- Rasgos de piloto (magnitudes) -----
export const TRAIT_TYRE_DEG_MULT = 0.85;     // cuida-ruedas: ×deg
export const TRAIT_WET_NOISE_MULT = 0.6;     // mago de la lluvia: ×ruido en mojado
export const TRAIT_WET_ERROR_MULT = 0.6;     // mago de la lluvia: ×error en mojado
export const TRAIT_AGGRO_OVERTAKE_ADD = 0.06;// agresivo: +prob. de adelantar
export const TRAIT_HOTHEAD_CONTACT_ADD = 0.04;// cabeza caliente: +prob. de contacto
export const TRAIT_IRON_ERROR_MULT = 0.7;    // nervios de acero: ×error
export const TRAIT_QUALI_NOISE_MULT = 0.72;  // especialista a una vuelta: ×ruido en quali

// ----- ERS / energía (dial del jugador + política IA) -----
// lapDelta = bonus/penalización de ritmo (− = más rápido); charge = Δ carga por
// vuelta (+ recarga, − gasta). La carga vive en CarState.ers (0-1) y avanza en
// tercios por sector → reanudar a mitad de vuelta es bit-idéntico.
export interface ErsSpec { lapDelta: number; charge: number; label: string }
export const ERS_MODES: Record<import('../types').ErsMode, ErsSpec> = {
    hotlap:   { lapDelta: -0.20, charge: -0.45, label: 'Vuelta rápida' },
    balanced: { lapDelta: 0,     charge: +0.10, label: 'Equilibrado' },
    harvest:  { lapDelta: +0.12, charge: +0.35, label: 'Recargar' },
    overtake: { lapDelta: -0.34, charge: -0.60, label: 'Adelantar' },
};
export const ERS_MIN_DEPLOY = 0.08;   // carga mínima para que un modo de gasto dé bonus
export const ERS_ATTACK_GAP = 1.0;    // la IA despliega 'overtake' dentro de este gap
export const ERS_LOW_CHARGE = 0.25;   // por debajo, la IA prioriza recargar
export const ERS_OVERTAKE_ADD = 0.08; // prob. extra de adelantamiento (aditiva, como el DRS)

// ----- Estrategia IA -----
export const AI_STINT_JITTER = 0.15;     // ±15% sobre el stint objetivo
export const SC_FREE_STOP_AGE = 0.6;     // la IA para bajo SC si su neumático supera este % de vida
// Ritmo reactivo de la IA (puro, sin rng): ataca en pelea, conserva en aire limpio.
export const AI_THREAT_GAP = 0.6;        // le aprietan por detrás dentro de este gap → defiende (attack)
export const AI_CHASE_GAP = 0.8;         // caza al de delante dentro de este gap → attack
export const AI_CLEAN_AIR_GAP = 2.5;     // sin nadie cerca → puede conservar
export const AI_CONSERVE_LIFE = 0.6;     // conserva solo si el neumático supera este % de vida
// Undercut/overcut de la IA (aleatoriedad en Rng dedicado, no toca el flujo principal).
export const UNDERCUT_GAP = 2.5;         // reacciona a rivales dentro de este gap
export const UNDERCUT_AGE_OFFSET = 4;    // rival con neumático así de más viejo → oportunidad de overcut
export const UNDERCUT_LIFE_FRAC = 0.7;   // solo si el propio neumático supera este % de vida
export const UNDERCUT_CHANCE = 0.5;      // prob. de morder el anzuelo cuando se dan las condiciones

// ----- Sprint -----
export const SPRINT_LAP_FRACTION = 1 / 3;  // vueltas del sprint vs carrera
export const SPRINT_POINTS_TABLE = [8, 7, 6, 5, 4, 3, 2, 1];

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
export const UPGRADE_LEAD_RACES = 2;           // carreras que tarda una mejora en fabricarse
export const DEV_COST_CAP = 60;                // $M máximos de desarrollo por temporada (todos)

// ----- I+D con riesgo de correlación -----
// Los proyectos entregan puntos con varianza (± una fracción de lo previsto).
// El túnel de viento reduce esa varianza; a nivel 5 la entrega es casi exacta.
export const UPGRADE_VARIANCE_BASE = 0.4;      // ±40% de lo previsto a túnel nivel 1
export const WIND_TUNNEL_VARIANCE_CUT = 0.07;  // −7% de varianza por nivel de túnel

// ----- Instalaciones -----
export const FACILITY_MAX = 5;
export const FACILITY_COST = [0, 8, 16, 28, 44]; // coste $M para subir A nivel i+1 (índice = nivel actual)
export const SIM_QUALI_NOISE_CUT = 0.03;       // −3% de ruido en quali por nivel de simulador
export const FACTORY_PIT_DELTA = 0.15;         // −0.15s por parada por nivel de fábrica
export const FACTORY_LEAD_L5 = 1;              // a fábrica nivel 5, una mejora tarda 1 carrera menos

// ----- Motores -----
export const ENGINE_POOL = 3;            // unidades de potencia por temporada sin penalización
export const GRID_PENALTY_BACK = 20;     // exceder el pool = salir del fondo
export const BASE_ENGINE_WEAR_PER_RACE = 0.12; // desgaste base por carrera (~8 carreras/motor)
export const ENGINE_ATTACK_WEAR = 0.10;  // desgaste extra si corres toda la carrera en 'attack'

// ----- Dificultad -----
export interface DifficultySpec {
    label: string;
    budgetMult: number;       // presupuesto inicial del jugador
    patienceLossMult: number; // castigo de la junta
    patienceGainMult: number; // recuperación de paciencia
    aiDevFraction: number;    // % de ingresos que la IA invierte en desarrollo
}
export const DIFFICULTY: Record<import('../types').Difficulty, DifficultySpec> = {
    easy:   { label: 'Fácil',   budgetMult: 1.3, patienceLossMult: 0.7, patienceGainMult: 1.3, aiDevFraction: 0.45 },
    normal: { label: 'Normal',  budgetMult: 1.0, patienceLossMult: 1.0, patienceGainMult: 1.0, aiDevFraction: 0.55 },
    hard:   { label: 'Difícil', budgetMult: 0.8, patienceLossMult: 1.3, patienceGainMult: 0.8, aiDevFraction: 0.70 },
};

// ----- Personal (staff) -----
export const STAFF_SIGNING_FEE_FACTOR = 0.5; // prima = salario × factor
export const STAFF_TD_DEV_DISCOUNT_MAX = 0.20;  // TD: hasta −20% coste de desarrollo
export const STAFF_RE_QUALI_NOISE_MAX = 0.15;   // RE: hasta −15% ruido en quali
export const STAFF_PC_PIT_DELTA_MAX = 2.0;      // PC: hasta −2.0s por parada

// ----- Junta directiva -----
export const BOARD_START_PATIENCE = 70;
export const BOARD_TARGET_SLACK = 1;           // objetivo = rango del coche + margen
export const BOARD_GRACE_RACES = 4;            // sin castigo en las primeras carreras (standings ruidosos)
export const PATIENCE_GAIN_PER_RACE = 3;       // si cumples el objetivo
export const PATIENCE_LOSS_PER_RACE = 3;       // × déficit de posiciones (cap abajo)
export const PATIENCE_LOSS_CAP = 9;
export const BOARD_SEASON_BONUS_PATIENCE = 20; // al cumplir el objetivo de temporada
export const BOARD_MET_BUDGET_BONUS = 15;      // $M extra al cumplir el objetivo

// ----- Cambios de reglamento -----
export const REGULATION_PERIOD = 3;   // cada N temporadas hay reglamento nuevo
export const REG_BASE_SEASON = 2025;  // la primera sacudida llega en 2028
export const REG_KEEP = 0.5;          // cuánto del coche viejo sobrevive al reset
export const REG_SHAKE_SD = 6;        // sacudida aleatoria (puntos de stat)

// ----- Moral -----
export const MORALE_LAP_COEF = 0.08;   // s/vuelta a moral extrema (100 = −0.08, 0 = +0.08)
export const MORALE_WIN = 8;
export const MORALE_PODIUM = 5;
export const MORALE_POINTS = 2;
export const MORALE_NOPOINTS = -2;
export const MORALE_DNF = -5;
export const MORALE_TEAMMATE = 3;      // batir al compañero ±
export const MORALE_RENEW = 10;        // renovar contrato sube la moral

// ----- Progresión y edad de pilotos -----
export const PROG_YOUNG_AGE = 23;        // hasta esta edad, los pilotos crecen
export const PROG_PEAK_END = 31;         // a partir de aquí empiezan a declinar
export const RETIRE_AGE = 37;            // edad a la que empieza el riesgo de retiro
export const RETIRE_HARD_AGE = 42;       // retiro seguro

// ----- Mercado -----
export const SIGNING_FEE_FACTOR = 0.5;   // prima de fichaje = salario × factor
export const BUYOUT_FACTOR = 0.6;        // cláusula = prima + años restantes × salario × factor
export const POACH_SALARY_BUMP = 1.2;    // el robado pide más sueldo
export const ROOKIES_PER_SEASON = 2;     // rookies procedurales que entran al pool por año
export const FA_POOL_CAP = 10;           // tamaño máximo del pool de agentes libres

// ----- UI -----
// Milisegundos por SECTOR (3 sectores = 1 vuelta). A 1x una vuelta dura ~6s.
export const TICK_SPEEDS = [
    { label: '1x', ms: 2000 },
    { label: '2x', ms: 1000 },
    { label: '4x', ms: 500 },
    { label: '8x', ms: 250 },
];
