import { Driver, Team } from '../types';
import {
    AI_SETUP_MEAN, AI_SETUP_SD, PRACTICE_RUNS, SETUP_MAX, SETUP_MIN,
    SETUP_OK_TOLERANCE, SETUP_SLIDERS,
} from '../data/constants';
import { Rng } from './rng';

export type SetupValues = number[]; // uno por slider, SETUP_MIN..SETUP_MAX
export type SliderFeedback = 'up' | 'down' | 'ok';

export interface SetupContext {
    ideal: SetupValues;              // oculto para el jugador
    aiQuality: Record<string, number>; // teamId → calidad 0-1
    feedbackSeeds: number[];         // un seed por tanda de libres
}

// Contexto del fin de semana: ideal oculto + calidades de la IA.
// Stream propio (seed+3) con orden de draws fijo → no toca el rng de carrera.
export function generateSetupContext(
    seed: number,
    teams: Record<string, Team>,
    drivers: Record<string, Driver>,
    playerTeamId: string,
): SetupContext {
    const rng = new Rng(seed + 3);
    const ideal = SETUP_SLIDERS.map(() => rng.int(SETUP_MIN + 1, SETUP_MAX - 1));
    const aiQuality: Record<string, number> = {};
    for (const team of Object.values(teams)) {
        if (team.id === playerTeamId) continue;
        const lead = drivers[team.driverIds[0]];
        const bias = ((lead?.experience ?? 50) - 50) / 500; // ±0.1
        aiQuality[team.id] = Math.max(0.2, Math.min(1, rng.gaussian(AI_SETUP_MEAN + bias, AI_SETUP_SD)));
    }
    const feedbackSeeds = Array.from({ length: PRACTICE_RUNS }, () => rng.int(1, 2 ** 30));
    return { ideal, aiQuality, feedbackSeeds };
}

// Feedback de los pilotos tras una tanda: por slider, subir/bajar/ok.
// Con poco skill del ingeniero el feedback puede ser impreciso cerca del ideal.
export function feedbackFor(values: SetupValues, ideal: SetupValues, reSkill: number, runSeed: number): SliderFeedback[] {
    const rng = new Rng(runSeed);
    const fuzz = Math.max(0, 1.8 - (reSkill / 100) * 1.8); // 0 (crack) .. 1.8 (sin ingeniero)
    return values.map((v, i) => {
        const noisyIdeal = ideal[i] + rng.gaussian(0, fuzz * 0.6);
        const delta = noisyIdeal - v;
        if (Math.abs(delta) <= SETUP_OK_TOLERANCE) return 'ok';
        return delta > 0 ? 'up' : 'down';
    });
}

// Calidad 0-1 del setup respecto al ideal.
export function qualityOf(values: SetupValues, ideal: SetupValues): number {
    const maxDist = SETUP_SLIDERS.length * (SETUP_MAX - SETUP_MIN);
    const dist = values.reduce((s, v, i) => s + Math.abs(v - ideal[i]), 0);
    return Math.max(0, Math.min(1, 1 - (dist / maxDist) * 2.2));
}
