import { Circuit, Compound } from '../types';
import {
    DRY_DEG_FACTOR, DRY_RATE_PER_LAP, INTER_DRY_COEF, INTER_DRY_LIMIT, INTER_WET_COEF,
    INTER_WET_LIMIT, RAIN_ACCUM_PER_LAP, RAIN_CHANCE_DEFAULT, SECOND_BURST_CHANCE,
    SLICK_WET_COEF, SLICKS, WET_BELOW_COEF, WET_ERROR_BASE, WET_LAP_FRAC,
    WET_START_CHANCE, WET_WRONG_TIRE_ERROR,
} from '../data/constants';
import { Rng } from './rng';

// Timeline de wetness (0 = seco, 1 = diluvio) por vuelta, determinista desde el seed.
// Índice 0 = parrilla de salida; índice L = vuelta L.
export function generateWeather(circuit: Circuit, totalLaps: number, rng: Rng): number[] {
    const w = new Array<number>(totalLaps + 1).fill(0);
    if (!rng.chance(circuit.rainChance ?? RAIN_CHANCE_DEFAULT)) return w;

    let wetness = rng.chance(WET_START_CHANCE) ? 0.3 + rng.next() * 0.5 : 0;
    const bursts = 1 + (rng.chance(SECOND_BURST_CHANCE) ? 1 : 0);
    const events: { start: number; end: number; intensity: number }[] = [];
    for (let b = 0; b < bursts; b++) {
        const start = rng.int(1, Math.max(2, totalLaps - 5));
        const duration = rng.int(3, Math.max(4, Math.floor(totalLaps * 0.35)));
        events.push({ start, end: start + duration, intensity: 0.4 + rng.next() * 0.6 });
    }

    w[0] = wetness;
    for (let lap = 1; lap <= totalLaps; lap++) {
        const active = events.filter(e => lap >= e.start && lap < e.end);
        if (active.length > 0) {
            const intensity = Math.max(...active.map(e => e.intensity));
            wetness = Math.min(1, wetness + RAIN_ACCUM_PER_LAP * intensity);
        } else {
            wetness = Math.max(0, wetness - DRY_RATE_PER_LAP);
        }
        w[lap] = wetness;
    }
    return w;
}

export const isSlick = (c: Compound) => SLICKS.includes(c);

// Pérdida de agarre de la pista para todos (s/vuelta).
export function wetLapPenalty(wetness: number, baseLapSec: number): number {
    return baseLapSec * WET_LAP_FRAC * wetness;
}

// Penalización por llevar el compuesto equivocado para el agua que hay (s/vuelta).
// Crossovers objetivo: slick↔inter ≈ 0.18, inter↔wet ≈ 0.6 de wetness.
export function compoundWetPenalty(compound: Compound, wetness: number): number {
    if (isSlick(compound)) return SLICK_WET_COEF * wetness * wetness;
    if (compound === 'inter') {
        return INTER_DRY_COEF * Math.max(0, INTER_DRY_LIMIT - wetness)
            + INTER_WET_COEF * Math.max(0, wetness - INTER_WET_LIMIT);
    }
    return WET_BELOW_COEF * Math.max(0, INTER_WET_LIMIT - wetness);
}

// Multiplicador de la probabilidad de error del piloto.
export function wetErrorMult(compound: Compound, wetness: number): number {
    let mult = 1 + WET_ERROR_BASE * wetness;
    if (isSlick(compound)) mult += WET_WRONG_TIRE_ERROR * Math.max(0, wetness - INTER_DRY_LIMIT);
    return mult;
}

// Inter/wet se sobrecalientan en pista secándose: multiplica el avance de tireAge.
export function dryTrackDegMult(compound: Compound, wetness: number): number {
    if (isSlick(compound)) return 1;
    const threshold = compound === 'inter' ? INTER_DRY_LIMIT : INTER_WET_LIMIT;
    return 1 + DRY_DEG_FACTOR * Math.max(0, (threshold - wetness) / threshold);
}
