import { Driver, DriverResult, RaceResultRecord, RaceState, Team } from '../types';
import { FASTEST_LAP_POINT, POINTS_TABLE, PRIZE_OUTSIDE_TOP10, PRIZE_TABLE, SLICKS, SPRINT_POINTS_TABLE, TO_INTER_WETNESS, TWO_COMPOUND_PENALTY } from '../data/constants';

// Clasificación final: aplica penalización por no parar, reparte puntos y vuelta rápida.
export function finalizeRace(
    state: RaceState,
    raceIndex: number,
    season: number,
    polesitterId: string,
): RaceResultRecord {
    const running = state.cars.filter(c => c.status === 'running').map(c => ({ ...c }));
    const dnfs = state.cars.filter(c => c.status !== 'running');

    // Regla de dos compuestos: en seco hay que usar 2 slicks distintos. Subsume la
    // parada obligatoria (un coche sin parar solo usa 1 compuesto → penalizado igual),
    // así que no se acumulan dos penalizaciones por el mismo hecho. Se anula en mojado
    // (umbral alineado con el crossover a intermedios, TO_INTER_WETNESS).
    const wetRace = Math.max(...state.weather.wetness) >= TO_INTER_WETNESS;
    for (const car of running) {
        if (!wetRace) {
            const distinctSlicks = new Set(car.compoundsUsed.filter(c => SLICKS.includes(c)));
            if (distinctSlicks.size < 2) car.totalTime += TWO_COMPOUND_PENALTY;
        }
        car.totalTime += car.penaltySec; // sanciones por contactos
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

    const totalSectors = Math.max(1, state.totalLaps * 3);
    const engineStress: Record<string, number> = {};
    for (const car of state.cars) engineStress[car.driverId] = car.attackSectors / totalSectors;

    return {
        raceIndex, circuitId: state.circuitId, season, classification, polesitterId,
        fastestLapTime: state.fastestLap?.time,
        fastestLapDriverId: state.fastestLap?.driverId,
        ledLapsDriverId: classification[0]?.driverId, // aprox.: el ganador lideró
        engineStress,
    };
}

// Clasificación del sprint: puntos 8-7-...-1, sin vuelta rápida ni parada obligatoria.
export function finalizeSprint(state: RaceState): DriverResult[] {
    const running = state.cars.filter(c => c.status === 'running')
        .map(c => ({ ...c, totalTime: c.totalTime + c.penaltySec }))
        .sort((a, b) => a.totalTime - b.totalTime);
    const dnfs = state.cars.filter(c => c.status !== 'running');
    const classification: DriverResult[] = running.map((car, i) => ({
        driverId: car.driverId,
        teamId: car.teamId,
        position: i + 1,
        points: i < SPRINT_POINTS_TABLE.length ? SPRINT_POINTS_TABLE[i] : 0,
        fastestLap: false,
        dnf: false,
    }));
    for (const car of dnfs) {
        classification.push({ driverId: car.driverId, teamId: car.teamId, position: null, points: 0, fastestLap: false, dnf: true });
    }
    return classification;
}

// Premio en $M por resultado de un piloto.
export function prizeFor(position: number | null): number {
    if (position === null) return 0;
    return position <= PRIZE_TABLE.length ? PRIZE_TABLE[position - 1] : PRIZE_OUTSIDE_TOP10;
}
