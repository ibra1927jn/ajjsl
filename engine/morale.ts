import { Driver, RaceResultRecord } from '../types';
import {
    MORALE_DNF, MORALE_LAP_COEF, MORALE_NOPOINTS, MORALE_PODIUM,
    MORALE_POINTS, MORALE_TEAMMATE, MORALE_WIN,
} from '../data/constants';

// Delta de tiempo por vuelta según la moral (moral alta = más rápido).
export function moraleLapDelta(morale: number): number {
    return -MORALE_LAP_COEF * (morale - 50) / 50;
}

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

// Actualiza la moral de todos los pilotos tras una carrera. Muta `drivers` (copias).
export function applyRaceMorale(drivers: Record<string, Driver>, record: RaceResultRecord): void {
    const byPos = new Map<string, number | null>();
    const teamOf = new Map<string, string>();
    for (const r of record.classification) {
        byPos.set(r.driverId, r.position);
        teamOf.set(r.driverId, r.teamId);
    }

    for (const r of record.classification) {
        const d = drivers[r.driverId];
        if (!d) continue;
        let delta = 0;
        if (r.dnf) delta += MORALE_DNF;
        else if (r.position === 1) delta += MORALE_WIN;
        else if (r.position !== null && r.position <= 3) delta += MORALE_PODIUM;
        else if (r.position !== null && r.position <= 10) delta += MORALE_POINTS;
        else delta += MORALE_NOPOINTS;

        // Rivalidad con el compañero: quien acaba delante gana moral.
        const mate = record.classification.find(o => o.teamId === r.teamId && o.driverId !== r.driverId);
        if (mate) {
            const myPos = r.position ?? 99;
            const matePos = mate.position ?? 99;
            if (myPos < matePos) delta += MORALE_TEAMMATE;
            else if (myPos > matePos) delta -= MORALE_TEAMMATE;
        }

        d.morale = clamp(d.morale + delta);
    }
}
