import { Circuit, Driver, Team } from '../types';
import { QUALI_NOISE_BASE, QUALI_RUNS, SETUP_BASE_QUALITY, SETUP_LAP_BONUS_MAX, SETUP_QUALI_NOISE_REDUCTION, TRAIT_QUALI_NOISE_MULT } from '../data/constants';
import { perfDelta } from './performance';
import { moraleLapDelta } from './morale';
import { Rng } from './rng';

export interface QualiResult {
    driverId: string;
    teamId: string;
    time: number;
}

// Simula la clasificación: N runs por piloto, cuenta el mejor.
// setups: calidad de setup 0-1 por equipo (bonus de tiempo + menos ruido).
// only: si se pasa, solo corren esos pilotos (segmentos de eliminación).
export function simulateQualifying(
    teams: Record<string, Team>,
    drivers: Record<string, Driver>,
    circuit: Circuit,
    rng: Rng,
    setups?: Record<string, number>,
    qualiNoiseMults?: Record<string, number>, // efecto del ingeniero de carrera
    only?: Set<string>,
): QualiResult[] {
    const results: QualiResult[] = [];
    for (const team of Object.values(teams)) {
        const setupQ = setups?.[team.id] ?? SETUP_BASE_QUALITY;
        for (const driverId of team.driverIds) {
            if (only && !only.has(driverId)) continue;
            const driver = drivers[driverId];
            const delta = perfDelta(team, driver) + moraleLapDelta(driver.morale) - SETUP_LAP_BONUS_MAX * setupQ;
            const noiseSd = QUALI_NOISE_BASE
                * (1.5 - (driver.consistency * 0.5 + driver.experience * 0.5) / 100)
                * (1 - SETUP_QUALI_NOISE_REDUCTION * setupQ)
                * (qualiNoiseMults?.[team.id] ?? 1)
                * (driver.traits.includes('qualiSpecialist') ? TRAIT_QUALI_NOISE_MULT : 1);
            let best = Infinity;
            for (let run = 0; run < QUALI_RUNS; run++) {
                const t = circuit.baseLapSec - 1.5 + delta + Math.abs(rng.gaussian(0, noiseSd));
                if (t < best) best = t;
            }
            results.push({ driverId, teamId: team.id, time: best });
        }
    }
    return results.sort((a, b) => a.time - b.time);
}

// Segmento en el que un piloto quedó fijado en la parrilla (para la UI).
export type QualiSegment = 'Q1' | 'Q2' | 'Q3';

export interface QualiKnockout {
    grid: QualiResult[];                    // parrilla final combinada (contrato intacto)
    segmentOf: Record<string, QualiSegment>; // driverId → segmento donde quedó
    cuts: [number, number];                // posiciones de corte (p.ej. 15 y 10)
}

// Clasificación por eliminación Q1/Q2/Q3: reusa simulateQualifying sobre los
// supervivientes. Devuelve la MISMA parrilla ordenada (contrato intacto) más el
// desglose por segmento para la UI.
export function simulateKnockout(
    teams: Record<string, Team>,
    drivers: Record<string, Driver>,
    circuit: Circuit,
    rng: Rng,
    setups?: Record<string, number>,
    qualiNoiseMults?: Record<string, number>,
    cuts: [number, number] = [15, 10],
): QualiKnockout {
    const q1 = simulateQualifying(teams, drivers, circuit, rng, setups, qualiNoiseMults);
    const adv1 = new Set(q1.slice(0, cuts[0]).map(r => r.driverId));
    const q2 = simulateQualifying(teams, drivers, circuit, rng, setups, qualiNoiseMults, adv1);
    const adv2 = new Set(q2.slice(0, cuts[1]).map(r => r.driverId));
    const q3 = simulateQualifying(teams, drivers, circuit, rng, setups, qualiNoiseMults, adv2);

    // Parrilla: top-10 por Q3, 11-15 por Q2, 16+ por Q1.
    const grid: QualiResult[] = [...q3, ...q2.slice(cuts[1]), ...q1.slice(cuts[0])];
    const segmentOf: Record<string, QualiSegment> = {};
    for (const r of q1.slice(cuts[0])) segmentOf[r.driverId] = 'Q1';
    for (const r of q2.slice(cuts[1])) segmentOf[r.driverId] = 'Q2';
    for (const r of q3) segmentOf[r.driverId] = 'Q3';
    return { grid, segmentOf, cuts };
}
