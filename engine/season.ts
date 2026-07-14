import { Driver, RaceResultRecord, Team } from '../types';

export interface DriverStanding {
    driverId: string;
    teamId: string;
    points: number;
    wins: number;
    podiums: number;
}

export interface TeamStanding {
    teamId: string;
    points: number;
    wins: number;
}

// Las clasificaciones se derivan siempre de los resultados (nunca se almacenan).
export function computeDriverStandings(results: RaceResultRecord[]): DriverStanding[] {
    const map = new Map<string, DriverStanding>();
    for (const race of results) {
        for (const r of race.classification) {
            const s = map.get(r.driverId) ?? { driverId: r.driverId, teamId: r.teamId, points: 0, wins: 0, podiums: 0 };
            s.points += r.points;
            s.teamId = r.teamId; // último equipo con el que corrió
            if (r.position === 1) s.wins += 1;
            if (r.position !== null && r.position <= 3) s.podiums += 1;
            map.set(r.driverId, s);
        }
        for (const r of race.sprintClassification ?? []) {
            const s = map.get(r.driverId) ?? { driverId: r.driverId, teamId: r.teamId, points: 0, wins: 0, podiums: 0 };
            s.points += r.points; // el sprint suma puntos, no victorias ni podios
            map.set(r.driverId, s);
        }
    }
    return [...map.values()].sort((a, b) => b.points - a.points || b.wins - a.wins);
}

export function computeTeamStandings(results: RaceResultRecord[]): TeamStanding[] {
    const map = new Map<string, TeamStanding>();
    for (const race of results) {
        for (const r of race.classification) {
            const s = map.get(r.teamId) ?? { teamId: r.teamId, points: 0, wins: 0 };
            s.points += r.points;
            if (r.position === 1) s.wins += 1;
            map.set(r.teamId, s);
        }
        for (const r of race.sprintClassification ?? []) {
            const s = map.get(r.teamId) ?? { teamId: r.teamId, points: 0, wins: 0 };
            s.points += r.points;
            map.set(r.teamId, s);
        }
    }
    return [...map.values()].sort((a, b) => b.points - a.points || b.wins - a.wins);
}

// Serie de puntos acumulados por carrera (para las gráficas de progresión).
export function pointsProgression(results: RaceResultRecord[], ids: string[], by: 'driver' | 'team') {
    const totals: Record<string, number> = Object.fromEntries(ids.map(id => [id, 0]));
    return results.map(race => {
        for (const r of [...race.classification, ...(race.sprintClassification ?? [])]) {
            const key = by === 'driver' ? r.driverId : r.teamId;
            if (key in totals) totals[key] += r.points;
        }
        return { raceIndex: race.raceIndex, ...totals } as Record<string, number>;
    });
}
