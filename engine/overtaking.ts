import { CarState, Circuit, Driver, RaceEvent } from '../types';
import {
    CONTACT_ATTACKER_LOSS, CONTACT_DEFENDER_CHANCE, CONTACT_DEFENDER_LOSS, CONTACT_PENALTY_SEC,
    DAMAGE_CHANCE_ON_CONTACT, DRS_OVERTAKE_ADD, DUEL_CONTACT_CHANCE, ERS_OVERTAKE_ADD, FRONT_WING_PENALTY,
    OVERTAKE_BASE, OVERTAKE_COOLDOWN_LAPS, OVERTAKE_PACE_FACTOR, OVERTAKE_STUCK_GAP, TRAIT_AGGRO_OVERTAKE_ADD, TRAIT_HOTHEAD_CONTACT_ADD,
} from '../data/constants';
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
    drsSet: Set<string>,
    ersSet: Set<string>,
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

            // Histéresis: un coche recién adelantado no re-ataca en seguida (evita el
            // ping-pong de posiciones por ruido de vuelta). Se queda en aire sucio.
            if (lap - behind.lastPassedLap <= OVERTAKE_COOLDOWN_LAPS) {
                behind.totalTime = ahead.totalTime + OVERTAKE_STUCK_GAP;
                continue;
            }

            const attacker = drivers[behind.driverId];
            const paceDelta = Math.max(0, ahead.lastLap - behind.lastLap);
            const racecraftFactor = 0.6 + (attacker.racecraft / 100) * 0.8;
            // El DRS es aditivo TRAS la compuerta: importa más donde menos se adelanta.
            const p = Math.min(0.95,
                OVERTAKE_BASE
                    * (1 - circuit.overtakingDifficulty)
                    * racecraftFactor
                    * (1 + OVERTAKE_PACE_FACTOR * Math.min(paceDelta, 2))
                + (drsSet.has(behind.driverId) ? DRS_OVERTAKE_ADD : 0)
                + (ersSet.has(behind.driverId) ? ERS_OVERTAKE_ADD : 0)
                + (attacker.traits.includes('aggressive') ? TRAIT_AGGRO_OVERTAKE_ADD : 0));

            if (rng.chance(p)) {
                order[i - 1] = behind;
                order[i] = ahead;
                swapped = true;
                ahead.lastPassedLap = lap; // el adelantado entra en cooldown
                const defender = drivers[ahead.driverId];
                events.push({
                    lap,
                    type: 'overtake',
                    message: `¡${attacker.shortCode} adelanta a ${defender.shortCode} por la P${i}!`,
                });
            } else {
                // Falla el intento: se queda pegado detrás.
                behind.totalTime = ahead.totalTime + OVERTAKE_STUCK_GAP;
                // Duelo que acaba mal: contacto con pérdida de tiempo y sanción al causante.
                // Los cabezas calientes (atacante o defensor) elevan el riesgo.
                const hotHead = attacker.traits.includes('hotHead') || drivers[ahead.driverId].traits.includes('hotHead');
                if (rng.chance(DUEL_CONTACT_CHANCE + (hotHead ? TRAIT_HOTHEAD_CONTACT_ADD : 0))) {
                    const defender = drivers[ahead.driverId];
                    const attackerLoss = CONTACT_ATTACKER_LOSS[0]
                        + rng.next() * (CONTACT_ATTACKER_LOSS[1] - CONTACT_ATTACKER_LOSS[0]);
                    behind.totalTime += attackerLoss;
                    behind.penaltySec += CONTACT_PENALTY_SEC;
                    if (rng.chance(CONTACT_DEFENDER_CHANCE)) {
                        ahead.totalTime += CONTACT_DEFENDER_LOSS[0]
                            + rng.next() * (CONTACT_DEFENDER_LOSS[1] - CONTACT_DEFENDER_LOSS[0]);
                    }
                    // Daño de ala: el atacante (y a veces el defensor) rompe el ala.
                    let damaged = '';
                    if (rng.chance(DAMAGE_CHANCE_ON_CONTACT)) {
                        behind.damage = Math.max(behind.damage, FRONT_WING_PENALTY);
                        damaged = ` ${attacker.shortCode} daña el ala.`;
                    }
                    if (rng.chance(DAMAGE_CHANCE_ON_CONTACT * 0.5)) {
                        ahead.damage = Math.max(ahead.damage, FRONT_WING_PENALTY);
                        damaged += ` ${defender.shortCode} daña el ala.`;
                    }
                    events.push({
                        lap,
                        type: 'incident',
                        message: `💥 ¡Contacto entre ${attacker.shortCode} y ${defender.shortCode}! ${CONTACT_PENALTY_SEC}s de sanción para ${attacker.shortCode}.${damaged}`,
                    });
                }
            }
        }
        if (!swapped) break;
    }
    return events;
}
