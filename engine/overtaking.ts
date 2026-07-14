import { CarState, Circuit, Driver, RaceEvent } from '../types';
import { OVERTAKE_BASE, OVERTAKE_PACE_FACTOR, OVERTAKE_STUCK_GAP } from '../data/constants';
import { Rng } from './rng';

// Margen a partir del cual el paso es automático (rejoin de pits, coche roto...).
const CONTEST_MARGIN = 1.5;

/**
 * Reordena los coches en pista tras sumar los tiempos de vuelta.
 * Un cambio de posición con margen pequeño se disputa como intento de
 * adelantamiento; si falla, el atacante queda clavado detrás (+gap fijo).
 * `order` debe contener solo coches en carrera, en orden de posición previo.
 */
export function resolveOvertakes(
    order: CarState[],
    pittedThisLap: Set<string>,
    circuit: Circuit,
    drivers: Record<string, Driver>,
    lap: number,
    rng: Rng,
): RaceEvent[] {
    const events: RaceEvent[] = [];
    const maxPasses = order.length;

    for (let pass = 0; pass < maxPasses; pass++) {
        let swapped = false;
        for (let i = 1; i < order.length; i++) {
            const ahead = order[i - 1];
            const behind = order[i];
            if (behind.totalTime >= ahead.totalTime) continue;

            const margin = ahead.totalTime - behind.totalTime;
            const pitInvolved = pittedThisLap.has(ahead.driverId) || pittedThisLap.has(behind.driverId);

            if (pitInvolved || margin >= CONTEST_MARGIN) {
                // Paso sin disputa (rejoin de parada o diferencia enorme).
                order[i - 1] = behind;
                order[i] = ahead;
                swapped = true;
                continue;
            }

            const attacker = drivers[behind.driverId];
            const paceDelta = Math.max(0, ahead.lastLap - behind.lastLap);
            const racecraftFactor = 0.6 + (attacker.racecraft / 100) * 0.8;
            const p = OVERTAKE_BASE
                * (1 - circuit.overtakingDifficulty)
                * racecraftFactor
                * (1 + OVERTAKE_PACE_FACTOR * Math.min(paceDelta, 2));

            if (rng.chance(p)) {
                order[i - 1] = behind;
                order[i] = ahead;
                swapped = true;
                const defender = drivers[ahead.driverId];
                events.push({
                    lap,
                    type: 'overtake',
                    message: `¡${attacker.shortCode} adelanta a ${defender.shortCode} por la P${i}!`,
                });
            } else {
                // Falla el intento: se queda pegado detrás.
                behind.totalTime = ahead.totalTime + OVERTAKE_STUCK_GAP;
            }
        }
        if (!swapped) break;
    }
    return events;
}
