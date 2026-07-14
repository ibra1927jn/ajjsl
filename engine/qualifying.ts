import { Circuit, Driver, Team } from '../types';
import { QUALI_NOISE_BASE, QUALI_RUNS, SETUP_BASE_QUALITY, SETUP_LAP_BONUS_MAX, SETUP_QUALI_NOISE_REDUCTION } from '../data/constants';
import { perfDelta } from './performance';
import { Rng } from './rng';

export interface QualiResult {
    driverId: string;
    teamId: string;
    time: number;
}

// Simula la clasificación: N runs por piloto, cuenta el mejor.
// setups: calidad de setup 0-1 por equipo (bonus de tiempo + menos ruido).
export function simulateQualifying(
    teams: Record<string, Team>,
    drivers: Record<string, Driver>,
    circuit: Circuit,
    rng: Rng,
    setups?: Record<string, number>,
): QualiResult[] {
    const results: QualiResult[] = [];
    for (const team of Object.values(teams)) {
        const setupQ = setups?.[team.id] ?? SETUP_BASE_QUALITY;
        for (const driverId of team.driverIds) {
            const driver = drivers[driverId];
            const delta = perfDelta(team, driver) - SETUP_LAP_BONUS_MAX * setupQ;
            const noiseSd = QUALI_NOISE_BASE
                * (1.5 - (driver.consistency * 0.5 + driver.experience * 0.5) / 100)
                * (1 - SETUP_QUALI_NOISE_REDUCTION * setupQ);
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
