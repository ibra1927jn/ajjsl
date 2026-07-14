import { CarState, Circuit, Compound, Driver, RaceEvent, RaceState, SessionKind, Team } from '../types';
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
import { compoundWetPenalty, dryTrackDegMult, generateWeather, wetLapPenalty } from './weather';
import { DRS_LAP_GAIN, DRS_RANGE, PACE_MODES, TEAM_ORDER_CUSHION, TO_INTER_WETNESS, TO_WET_WETNESS, WET_NOISE_FACTOR } from '../data/constants';
import { Rng } from './rng';

export function scaledLaps(circuit: Circuit): number {
    return Math.round(circuit.laps * LAP_SCALE);
}

export const COMPOUND_NAMES: Record<Compound, string> = {
    soft: 'blandos', medium: 'medios', hard: 'duros', inter: 'intermedios', wet: 'de lluvia',
};

export interface RaceOptions {
    kind?: SessionKind;
    lapsOverride?: number;
    playerStartCompound?: Compound;
}

export function createRaceState(
    grid: QualiResult[],
    circuit: Circuit,
    playerTeamId: string,
    seed: number,
    opts: RaceOptions = {},
): RaceState {
    const rng = new Rng(seed);
    const totalLaps = opts.lapsOverride ?? scaledLaps(circuit);
    // El clima se genera PRIMERO (orden de draws fijo para reproducibilidad).
    const wetness = generateWeather(circuit, totalLaps, rng);
    const w0 = wetness[0];

    const cars: CarState[] = grid.map((q, i) => {
        let compound: Compound = 'medium';
        if (w0 >= TO_WET_WETNESS) {
            compound = 'wet';
        } else if (w0 >= TO_INTER_WETNESS) {
            compound = 'inter';
        } else if (q.teamId !== playerTeamId) {
            const r = rng.next();
            compound = r < 0.35 ? 'soft' : r < 0.9 ? 'medium' : 'hard';
        } else if (opts.playerStartCompound) {
            compound = opts.playerStartCompound;
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
            paceMode: 'normal' as const,
            penaltySec: 0,
        };
    });
    const kindLabel = opts.kind === 'sprint' ? 'Sprint' : 'Carrera';
    const startMsg = w0 >= TO_INTER_WETNESS
        ? `🌧️ ¡${kindLabel} con salida en mojado en ${circuit.name}! ${totalLaps} vueltas.`
        : `${kindLabel}: luces apagadas en ${circuit.name}. ${totalLaps} vueltas.`;
    return {
        circuitId: circuit.id,
        lap: 0,
        totalLaps,
        cars,
        events: [{ lap: 0, type: 'info', message: startMsg }],
        phase: 'green',
        safetyCarLapsLeft: 0,
        fastestLap: null,
        rngState: rng.state,
        weather: { wetness },
        kind: opts.kind ?? 'race',
    };
}

function raceLapTime(
    car: CarState,
    gapAhead: number | null,
    circuit: Circuit,
    totalLaps: number,
    lap: number,
    wetness: number,
    teams: Record<string, Team>,
    drivers: Record<string, Driver>,
    rng: Rng,
): number {
    const team = teams[car.teamId];
    const driver = drivers[car.driverId];
    const comp = COMPOUNDS[car.compound];

    const life = compoundLife(car.compound, circuit);
    const degRate = comp.degPerLap * circuit.tireStress;
    const deg = car.tireAge <= life
        ? degRate * car.tireAge
        : degRate * life + degRate * CLIFF_MULTIPLIER * (car.tireAge - life);

    const noiseSd = BASE_NOISE_SD * (1.6 - driver.consistency / 100) * (1 + WET_NOISE_FACTOR * wetness);
    const dirtyAir = gapAhead !== null && gapAhead < DIRTY_AIR_RANGE ? DIRTY_AIR_PENALTY : 0;

    return circuit.baseLapSec
        + perfDelta(team, driver)
        + car.formOffset
        + comp.offset
        + PACE_MODES[car.paceMode].lapDelta
        + deg
        + wetLapPenalty(wetness, circuit.baseLapSec)
        + compoundWetPenalty(car.compound, wetness)
        + FUEL_EFFECT * (totalLaps - lap)
        + rng.gaussian(0, noiseSd)
        + dirtyAir;
}

// Orden de equipo: intercambia a los dos coches del jugador si van adyacentes en pista.
// Puro y sin rng (se llama entre ticks desde la UI sin romper la reproducibilidad).
export function applyTeamOrderSwap(prev: RaceState, playerTeamId: string): RaceState {
    const running = prev.cars.filter(c => c.status === 'running');
    const idxA = running.findIndex(c => c.teamId === playerTeamId);
    if (idxA < 0 || idxA + 1 >= running.length) return prev;
    if (running[idxA + 1].teamId !== playerTeamId) return prev;

    const cars = prev.cars.map(c => ({ ...c }));
    const runningCopy = cars.filter(c => c.status === 'running');
    const ahead = runningCopy[idxA];
    const behind = runningCopy[idxA + 1];
    const frontTime = ahead.totalTime;
    behind.totalTime = frontTime;
    ahead.totalTime = frontTime + TEAM_ORDER_CUSHION;

    const posA = cars.indexOf(ahead);
    const posB = cars.indexOf(behind);
    [cars[posA], cars[posB]] = [cars[posB], cars[posA]];
    return {
        ...prev,
        cars,
        events: [...prev.events, { lap: prev.lap, type: 'info', message: '📻 Orden de equipo: intercambio de posiciones.' }],
    };
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

    // 0. Clima de esta vuelta + eventos de transición.
    const wet = state.weather.wetness;
    const wetness = wet[Math.min(lap, wet.length - 1)];
    const prevWetness = wet[Math.min(lap - 1, wet.length - 1)];
    if (prevWetness < 0.05 && wetness >= 0.05) {
        newEvents.push({ lap, type: 'weather', message: '🌧️ Empieza a llover.' });
    } else if (prevWetness >= 0.05 && wetness < 0.05) {
        newEvents.push({ lap, type: 'weather', message: '☀️ La pista se ha secado.' });
    } else if (prevWetness < TO_WET_WETNESS && wetness >= TO_WET_WETNESS) {
        newEvents.push({ lap, type: 'weather', message: '⛈️ La lluvia arrecia: pista para neumáticos de lluvia.' });
    } else if (prevWetness >= 0.05 && wetness < prevWetness && Math.abs(wetness - TO_INTER_WETNESS) < 0.03) {
        newEvents.push({ lap, type: 'weather', message: '🌤️ Se abre una trazada seca...' });
    }

    // 1. Incidentes (solo con bandera verde).
    if (state.phase === 'green') {
        const { dnfs, events } = rollIncidents(state.cars, teams, drivers, lap, wetness, rng);
        newEvents.push(...events);
        if (dnfs.length > 0 && rng.chance(SC_CHANCE_ON_DNF)) {
            state.phase = 'safetyCar';
            state.safetyCarLapsLeft = rng.int(SC_MIN_LAPS, SC_MAX_LAPS);
            newEvents.push({ lap, type: 'safetyCar', message: '🚨 SAFETY CAR en pista.' });
        }
    }

    // 2. Decisiones de parada de la IA (las del jugador llegan encoladas en pendingPit).
    aiDecidePits(state, circuit, playerTeamId, wetness, rng);

    // 3. Tiempos de vuelta.
    const running = state.cars.filter(c => c.status === 'running');
    const dnfCars = state.cars.filter(c => c.status !== 'running');
    const gapsBefore: (number | null)[] = running.map((c, i) =>
        i === 0 ? null : c.totalTime - running[i - 1].totalTime);
    const pittedThisLap = new Set<string>();

    // DRS: a menos de 1s del de delante, en verde, seco y no en la primera vuelta.
    const drsSet = new Set<string>();
    if (state.phase === 'green' && lap >= 2 && wetness < TO_INTER_WETNESS) {
        running.forEach((car, i) => {
            const gap = gapsBefore[i];
            if (gap !== null && gap < DRS_RANGE) drsSet.add(car.driverId);
        });
    }

    running.forEach((car, i) => {
        const pitting = car.pendingPit !== null;
        let lapTime: number;
        if (state.phase === 'safetyCar') {
            lapTime = circuit.baseLapSec * SC_LAP_FACTOR + rng.gaussian(0, 0.1)
                + (pitting ? PIT_LOSS * 0.6 : 0); // parada "barata" bajo SC
        } else {
            lapTime = raceLapTime(car, gapsBefore[i], circuit, state.totalLaps, lap, wetness, teams, drivers, rng)
                - (drsSet.has(car.driverId) ? DRS_LAP_GAIN : 0)
                + (pitting ? PIT_LOSS + rng.gaussian(0, PIT_LOSS_SD) : 0);
        }
        car.totalTime += lapTime;
        car.lastLap = lapTime;
        car.tireAge += PACE_MODES[car.paceMode].degMult * dryTrackDegMult(car.compound, wetness);

        if (pitting) {
            const compound = car.pendingPit as Compound;
            car.compound = compound;
            car.tireAge = 0;
            car.pitCount += 1;
            car.pendingPit = null;
            pittedThisLap.add(car.driverId);
            newEvents.push({
                lap, type: 'pit',
                message: `BOX: ${drivers[car.driverId].shortCode} para y monta ${COMPOUND_NAMES[compound]}.`,
            });
        } else if (state.phase === 'green' && (!state.fastestLap || lapTime < state.fastestLap.time)) {
            state.fastestLap = { driverId: car.driverId, time: lapTime };
        }
    });

    // 4. Reordenar con compuerta de adelantamientos (con DRS y posibles contactos).
    newEvents.push(...resolveOvertakes(running, pittedThisLap, drsSet, circuit, drivers, lap, rng));

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
