import { Driver, DriverResult, RaceResultRecord, RaceState, Team } from '../types';
import { FASTEST_LAP_POINT, MANDATORY_PIT_PENALTY, POINTS_TABLE, PRIZE_OUTSIDE_TOP10, PRIZE_TABLE, WET_RACE_THRESHOLD } from '../data/constants';

// Clasificación final: aplica penalización por no parar, reparte puntos y vuelta rápida.
export function finalizeRace(
    state: RaceState,
    raceIndex: number,
    season: number,
    polesitterId: string,
): RaceResultRecord {
    const running = state.cars.filter(c => c.status === 'running').map(c => ({ ...c }));
    const dnfs = state.cars.filter(c => c.status !== 'running');

    // La parada obligatoria no aplica en carreras mojadas.
    const wetRace = Math.max(...state.weather.wetness) > WET_RACE_THRESHOLD;
    if (!wetRace) {
        for (const car of running) {
            if (car.pitCount === 0) car.totalTime += MANDATORY_PIT_PENALTY;
        }
    }
    running.sort((a, b) => a.totalTime - b.totalTime);

    const classification: DriverResult[] = running.map((car, i) => {
        const position = i + 1;
        const fastestLap = state.fastestLap?.driverId === car.driverId;
        let points = position <= POINTS_TABLE.length ? POINTS_TABLE[position - 1] : 0;
        if (fastestLap && position <= 10) points += FASTEST_LAP_POINT;
        return { driverId: car.driverId, teamId: car.teamId, position, points, fastestLap, dnf: false };
    });

    for (const car of dnfs) {
        classification.push({
            driverId: car.driverId, teamId: car.teamId,
            position: null, points: 0, fastestLap: false, dnf: true,
        });
    }

    return { raceIndex, circuitId: state.circuitId, season, classification, polesitterId };
}

// Premio en $M por resultado de un piloto.
export function prizeFor(position: number | null): number {
    if (position === null) return 0;
    return position <= PRIZE_TABLE.length ? PRIZE_TABLE[position - 1] : PRIZE_OUTSIDE_TOP10;
}
