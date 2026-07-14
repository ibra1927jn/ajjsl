import { CarState, Circuit, Compound, Driver, RaceEvent, RaceState, Team } from '../types';
import {
    BASE_NOISE_SD, CLIFF_MULTIPLIER, COMPOUNDS, DIRTY_AIR_PENALTY, DIRTY_AIR_RANGE,
    FUEL_EFFECT, LAP_SCALE, PIT_LOSS, PIT_LOSS_SD, RACE_FORM_SD, SC_CHANCE_ON_DNF, SC_COMPRESS_GAP,
    SC_LAP_FACTOR, SC_MAX_LAPS, SC_MIN_LAPS,
} from '../data/constants';
import { perfDelta } from './performance';
import { QualiResult } from './qualifying';
import { rollIncidents } from './incidents';
import { aiDecidePits, compoundLife } from './pitstop';
import { resolveOvertakes } from './overtaking';
import { Rng } from './rng';

export function scaledLaps(circuit: Circuit): number {
    return Math.round(circuit.laps * LAP_SCALE);
}

export function createRaceState(
    grid: QualiResult[],
    circuit: Circuit,
    playerTeamId: string,
    seed: number,
): RaceState {
    const rng = new Rng(seed);
    const cars: CarState[] = grid.map((q, i) => {
        let compound: Compound = 'medium';
        if (q.teamId !== playerTeamId) {
            const r = rng.next();
            compound = r < 0.35 ? 'soft' : r < 0.9 ? 'medium' : 'hard';
        }
        return {
            driverId: q.driverId,
            teamId: q.teamId,
            gridPos: i + 1,
            totalTime: i * 0.3, // escalonado de salida
            lastLap: 0,
            compound,
            tireAge: 0,
            formOffset: rng.gaussian(0, RACE_FORM_SD),
            pitCount: 0,
            status: 'running' as const,
            pendingPit: null,
        };
    });
    return {
        circuitId: circuit.id,
        lap: 0,
        totalLaps: scaledLaps(circuit),
        cars,
        events: [{ lap: 0, type: 'info', message: `Luces apagadas en ${circuit.name}. ${scaledLaps(circuit)} vueltas.` }],
        phase: 'green',
        safetyCarLapsLeft: 0,
        fastestLap: null,
        rngState: rng.state,
    };
}

function raceLapTime(
    car: CarState,
    gapAhead: number | null,
    circuit: Circuit,
    totalLaps: number,
    lap: number,
    teams: Record<string, Team>,
    drivers: Record<string, Driver>,
    rng: Rng,
): number {
    const team = teams[car.teamId];
    const driver = drivers[car.driverId];
    const comp = COMPOUNDS[car.compound];

    const life = compoundLife(car.compound, totalLaps, circuit);
    const degRate = comp.degPerLap * circuit.tireStress;
    const deg = car.tireAge <= life
        ? degRate * car.tireAge
        : degRate * life + degRate * CLIFF_MULTIPLIER * (car.tireAge - life);

    const noiseSd = BASE_NOISE_SD * (1.6 - driver.consistency / 100);
    const dirtyAir = gapAhead !== null && gapAhead < DIRTY_AIR_RANGE ? DIRTY_AIR_PENALTY : 0;

    return circuit.baseLapSec
        + perfDelta(team, driver)
        + car.formOffset
        + comp.offset
        + deg
        + FUEL_EFFECT * (totalLaps - lap)
        + rng.gaussian(0, noiseSd)
        + dirtyAir;
}

// Avanza una vuelta completa. Devuelve un nuevo RaceState (no muta el anterior).
export function advanceLap(
    prev: RaceState,
    circuit: Circuit,
    teams: Record<string, Team>,
    drivers: Record<string, Driver>,
    playerTeamId: string,
): RaceState {
    if (prev.phase === 'finished') return prev;

    const state: RaceState = {
        ...prev,
        cars: prev.cars.map(c => ({ ...c })),
        events: [...prev.events],
        fastestLap: prev.fastestLap ? { ...prev.fastestLap } : null,
    };
    const rng = new Rng(state.rngState);
    const lap = state.lap + 1;
    const newEvents: RaceEvent[] = [];

    // 1. Incidentes (solo con bandera verde).
    if (state.phase === 'green') {
        const { dnfs, events } = rollIncidents(state.cars, teams, drivers, lap, rng);
        newEvents.push(...events);
        if (dnfs.length > 0 && rng.chance(SC_CHANCE_ON_DNF)) {
            state.phase = 'safetyCar';
            state.safetyCarLapsLeft = rng.int(SC_MIN_LAPS, SC_MAX_LAPS);
            newEvents.push({ lap, type: 'safetyCar', message: '🚨 SAFETY CAR en pista.' });
        }
    }

    // 2. Decisiones de parada de la IA (las del jugador llegan encoladas en pendingPit).
    aiDecidePits(state, circuit, playerTeamId, rng);

    // 3. Tiempos de vuelta.
    const running = state.cars.filter(c => c.status === 'running');
    const dnfCars = state.cars.filter(c => c.status !== 'running');
    const gapsBefore: (number | null)[] = running.map((c, i) =>
        i === 0 ? null : c.totalTime - running[i - 1].totalTime);
    const pittedThisLap = new Set<string>();

    running.forEach((car, i) => {
        const pitting = car.pendingPit !== null;
        let lapTime: number;
        if (state.phase === 'safetyCar') {
            lapTime = circuit.baseLapSec * SC_LAP_FACTOR + rng.gaussian(0, 0.1)
                + (pitting ? PIT_LOSS * 0.6 : 0); // parada "barata" bajo SC
        } else {
            lapTime = raceLapTime(car, gapsBefore[i], circuit, state.totalLaps, lap, teams, drivers, rng)
                + (pitting ? PIT_LOSS + rng.gaussian(0, PIT_LOSS_SD) : 0);
        }
        car.totalTime += lapTime;
        car.lastLap = lapTime;
        car.tireAge += 1;

        if (pitting) {
            const compound = car.pendingPit as Compound;
            car.compound = compound;
            car.tireAge = 0;
            car.pitCount += 1;
            car.pendingPit = null;
            pittedThisLap.add(car.driverId);
            newEvents.push({
                lap, type: 'pit',
                message: `BOX: ${drivers[car.driverId].shortCode} para y monta ${COMPOUNDS[compound].label === 'S' ? 'blandos' : COMPOUNDS[compound].label === 'M' ? 'medios' : 'duros'}.`,
            });
        } else if (state.phase === 'green' && (!state.fastestLap || lapTime < state.fastestLap.time)) {
            state.fastestLap = { driverId: car.driverId, time: lapTime };
        }
    });

    // 4. Reordenar con compuerta de adelantamientos.
    newEvents.push(...resolveOvertakes(running, pittedThisLap, circuit, drivers, lap, rng));

    // 5. Fin del safety car: comprimir el pelotón.
    if (state.phase === 'safetyCar') {
        state.safetyCarLapsLeft -= 1;
        if (state.safetyCarLapsLeft <= 0) {
            for (let i = 1; i < running.length; i++) {
                const gap = running[i].totalTime - running[i - 1].totalTime;
                running[i].totalTime = running[i - 1].totalTime + Math.min(gap, SC_COMPRESS_GAP);
            }
            state.phase = 'green';
            newEvents.push({ lap, type: 'safetyCarEnd', message: '🟢 Se reanuda la carrera.' });
        }
    }

    state.cars = [...running, ...dnfCars.sort((a, b) => (b.dnfLap ?? 0) - (a.dnfLap ?? 0))];
    state.lap = lap;
    if (lap >= state.totalLaps) {
        state.phase = 'finished';
        newEvents.push({ lap, type: 'info', message: '🏁 ¡Bandera a cuadros!' });
    }
    state.events.push(...newEvents);
    state.rngState = rng.state;
    return state;
}
