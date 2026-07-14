import { Circuit, Driver, Team } from '../types';
import { QUALI_NOISE_BASE, QUALI_RUNS } from '../data/constants';
import { perfDelta } from './performance';
import { Rng } from './rng';

export interface QualiResult {
    driverId: string;
    teamId: string;
    time: number;
}

// Simula la clasificación: N runs por piloto, cuenta el mejor.
export function simulateQualifying(
    teams: Record<string, Team>,
    drivers: Record<string, Driver>,
    circuit: Circuit,
    rng: Rng,
): QualiResult[] {
    const results: QualiResult[] = [];
    for (const team of Object.values(teams)) {
        for (const driverId of team.driverIds) {
            const driver = drivers[driverId];
            const delta = perfDelta(team, driver);
            const noiseSd = QUALI_NOISE_BASE * (1.5 - (driver.consistency * 0.5 + driver.experience * 0.5) / 100);
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
