import { CarState, Circuit, Compound, Driver, LapPlanEntry, RaceEvent, RaceLength, RaceState, Sector, SessionKind, Team } from '../types';
import {
    BASE_NOISE_SD, CLIFF_MULTIPLIER, COMPOUNDS, DEFAULT_SECTOR_SPLIT, DIRTY_AIR_PENALTY, DIRTY_AIR_RANGE,
    FUEL_EFFECT, PIT_LOSS, PIT_LOSS_SD, RACE_FORM_SD, RACE_LENGTH_SCALE, SC_CHANCE_ON_DNF, SC_COMPRESS_GAP,
    SC_LAP_FACTOR, SC_MAX_LAPS, SC_MIN_LAPS, SECTOR_INCIDENT_FRACTION, SECTOR_MICRO_SD,
} from '../data/constants';
import { perfDelta } from './performance';
import { QualiResult } from './qualifying';
import { rollIncidents } from './incidents';
import { aiDecidePits, compoundLife } from './pitstop';
import { resolveOvertakes } from './overtaking';
import { compoundWetPenalty, dryTrackDegMult, generateWeather, wetLapPenalty } from './weather';
import { collectRadio } from './radio';
import { DRS_LAP_GAIN, DRS_RANGE, PACE_MODES, TEAM_ORDER_CUSHION, TO_INTER_WETNESS, TO_WET_WETNESS, WET_NOISE_FACTOR } from '../data/constants';
import { Rng } from './rng';

export function scaledLaps(circuit: Circuit, raceLength: RaceLength = 'medium'): number {
    return Math.max(5, Math.round(circuit.laps * RACE_LENGTH_SCALE[raceLength]));
}

export const COMPOUND_NAMES: Record<Compound, string> = {
    soft: 'blandos', medium: 'medios', hard: 'duros', inter: 'intermedios', wet: 'de lluvia',
};

export interface RaceOptions {
    kind?: SessionKind;
    lapsOverride?: number;
    playerStartCompound?: Compound;
    mods?: RaceState['mods'];
    raceLength?: RaceLength;
}

export function createRaceState(
    grid: QualiResult[],
    circuit: Circuit,
    playerTeamId: string,
    seed: number,
    opts: RaceOptions = {},
): RaceState {
    const rng = new Rng(seed);
    const raceLength = opts.raceLength ?? 'medium';
    const totalLaps = opts.lapsOverride ?? scaledLaps(circuit, raceLength);
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
            lapAccum: 0,
            lastSector: 0,
            bestSectors: [0, 0, 0] as [number, number, number],
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
        sector: 0,
        totalLaps,
        cars,
        events: [{ lap: 0, type: 'info', message: startMsg }],
        phase: 'green',
        safetyCarLapsLeft: 0,
        vscLapsLeft: 0,
        yellowSector: null,
        fastestLap: null,
        rngState: rng.state,
        weather: { wetness },
        kind: opts.kind ?? 'race',
        raceLength,
        mods: opts.mods ?? {},
        lapPlan: {},
        drsDrivers: [],
        lapStart: { order: [], fastestId: null, penalty: {} },
    };
}

function raceLapTime(
    car: CarState,
    gapAhead: number | null,
    circuit: Circuit,
    totalLaps: number,
    lap: number,
    wetness: number,
    raceLength: RaceLength,
    mods: RaceState['mods'],
    teams: Record<string, Team>,
    drivers: Record<string, Driver>,
    rng: Rng,
): number {
    const team = teams[car.teamId];
    const driver = drivers[car.driverId];
    const comp = COMPOUNDS[car.compound];

    const life = compoundLife(car.compound, circuit, raceLength);
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
        + (mods[car.teamId]?.setupLapDelta ?? 0)
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

const orderRunning = (cars: CarState[]): CarState[] => {
    const running = cars.filter(c => c.status === 'running');
    const dnf = cars.filter(c => c.status !== 'running').sort((a, b) => (b.dnfLap ?? 0) - (a.dnfLap ?? 0));
    return [...running, ...dnf];
};

// Avanza UN SECTOR (1/3 de vuelta). El estado por sectores hace la carrera
// realista: los gaps, adelantamientos e incidentes evolucionan dentro de la vuelta.
// Puro y determinista dado el estado serializado (incl. rngState) → reanudar es
// bit-idéntico incluso a mitad de vuelta.
export function advanceSector(
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
        lapPlan: { ...prev.lapPlan },
        drsDrivers: [...prev.drsDrivers],
        lapStart: prev.lapStart,
    };
    const rng = new Rng(state.rngState);
    const s = prev.sector;                 // sector a correr
    const lap = prev.lap + 1;              // vuelta en curso
    const split = circuit.sectorSplit ?? DEFAULT_SECTOR_SPLIT;
    const wet = state.weather.wetness;
    const wetness = wet[Math.min(lap, wet.length - 1)];
    const newEvents: RaceEvent[] = [];

    // ===== SECTOR 0: abrir la vuelta =====
    if (s === 0) {
        for (const car of state.cars) car.lapAccum = 0;

        // Clima: eventos de transición (sin rng, igual que antes).
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

        // Decisiones de parada de la IA (una vez por vuelta).
        aiDecidePits(state, circuit, playerTeamId, wetness, rng);

        // Plan de la vuelta: ritmo + pérdida de parada por coche (ruido principal aquí).
        const running = state.cars.filter(c => c.status === 'running');
        const gaps: (number | null)[] = running.map((c, i) => i === 0 ? null : c.totalTime - running[i - 1].totalTime);
        const drs: string[] = [];
        if (state.phase === 'green' && lap >= 2 && wetness < TO_INTER_WETNESS) {
            running.forEach((car, i) => {
                if (gaps[i] !== null && (gaps[i] as number) < DRS_RANGE) drs.push(car.driverId);
            });
        }
        state.drsDrivers = drs;

        const plan: Record<string, LapPlanEntry> = {};
        running.forEach((car, i) => {
            const pace = raceLapTime(car, gaps[i], circuit, state.totalLaps, lap, wetness, state.raceLength, state.mods, teams, drivers, rng)
                - (drs.includes(car.driverId) ? DRS_LAP_GAIN : 0);
            const pitLoss = car.pendingPit !== null
                ? PIT_LOSS + (state.mods[car.teamId]?.pitLossDelta ?? 0) + rng.gaussian(0, PIT_LOSS_SD)
                : 0;
            plan[car.driverId] = { pace, pitLoss };
        });
        state.lapPlan = plan;
        state.yellowSector = null;
        state.lapStart = {
            order: running.map(c => c.driverId),
            fastestId: state.fastestLap?.driverId ?? null,
            penalty: Object.fromEntries(state.cars.map(c => [c.driverId, c.penaltySec])),
        };
    }

    // ===== CADA SECTOR: incidentes a tasa por sector (solo en verde) =====
    if (state.phase === 'green') {
        const { dnfs, events } = rollIncidents(state.cars, teams, drivers, lap, wetness, rng, SECTOR_INCIDENT_FRACTION);
        newEvents.push(...events);
        if (dnfs.length > 0 && rng.chance(SC_CHANCE_ON_DNF)) {
            state.phase = 'safetyCar';
            state.safetyCarLapsLeft = rng.int(SC_MIN_LAPS, SC_MAX_LAPS);
            newEvents.push({ lap, type: 'safetyCar', message: '🚨 SAFETY CAR en pista.' });
        }
    }

    // ===== Tiempos de este sector =====
    const running = state.cars.filter(c => c.status === 'running');
    const pittedThisSector = new Set<string>();
    const frac = split[s];

    for (const car of running) {
        const entry = state.lapPlan[car.driverId];
        const pace = entry ? entry.pace : circuit.baseLapSec; // fallback defensivo
        let base: number;
        if (state.phase === 'safetyCar') {
            base = circuit.baseLapSec * SC_LAP_FACTOR * frac + rng.gaussian(0, 0.1 * frac);
        } else {
            base = pace * frac;
        }
        // La pérdida de parada aterriza en el último sector (más barata bajo SC).
        if (s === 2 && car.pendingPit !== null && entry) {
            base += (state.phase === 'safetyCar' ? 0.6 : 1) * entry.pitLoss;
        }
        base += rng.gaussian(0, SECTOR_MICRO_SD);
        car.totalTime += base;
        car.lapAccum += base;
        car.lastSector = base;
        car.tireAge += (PACE_MODES[car.paceMode].degMult * dryTrackDegMult(car.compound, wetness)) / 3;
        if (car.bestSectors[s] === 0 || base < car.bestSectors[s]) car.bestSectors[s] = base;

        // Al cerrar la vuelta: fijar tiempo de vuelta y ejecutar la parada.
        if (s === 2) {
            car.lastLap = car.lapAccum;
            if (car.pendingPit !== null) {
                const compound = car.pendingPit;
                car.compound = compound;
                car.tireAge = 0;
                car.pitCount += 1;
                car.pendingPit = null;
                pittedThisSector.add(car.driverId);
                newEvents.push({
                    lap, type: 'pit',
                    message: `BOX: ${drivers[car.driverId].shortCode} para y monta ${COMPOUND_NAMES[compound]}.`,
                });
            }
        }
    }

    // ===== Adelantamientos: la compuerta se resuelve UNA VEZ por vuelta (sector 2),
    // como en v3; los sectores 0/1 solo acumulan tiempo. El mapa se mueve por gap. =====
    if (s === 2) {
        newEvents.push(...resolveOvertakes(running, pittedThisSector, new Set(state.drsDrivers), circuit, drivers, lap, rng));
    }
    state.cars = orderRunning(state.cars);

    // ===== SECTOR 2: cerrar la vuelta =====
    if (s === 2) {
        for (const car of state.cars) {
            if (car.status !== 'running') continue;
            if (state.phase === 'green' && !pittedThisSector.has(car.driverId)
                && (!state.fastestLap || car.lapAccum < state.fastestLap.time)) {
                state.fastestLap = { driverId: car.driverId, time: car.lapAccum };
            }
        }
        // Fin del safety car: comprimir el pelotón.
        if (state.phase === 'safetyCar') {
            state.safetyCarLapsLeft -= 1;
            if (state.safetyCarLapsLeft <= 0) {
                const run2 = state.cars.filter(c => c.status === 'running');
                for (let i = 1; i < run2.length; i++) {
                    const gap = run2[i].totalTime - run2[i - 1].totalTime;
                    run2[i].totalTime = run2[i - 1].totalTime + Math.min(gap, SC_COMPRESS_GAP);
                }
                state.phase = 'green';
                newEvents.push({ lap, type: 'safetyCarEnd', message: '🟢 Se reanuda la carrera.' });
            }
        }
        state.lap = lap;
        state.sector = 0;
        if (lap >= state.totalLaps) {
            state.phase = 'finished';
            newEvents.push({ lap, type: 'info', message: '🏁 ¡Bandera a cuadros!' });
        }
        state.events.push(...newEvents);
        // Radio del jugador (Rng propio: no toca el stream principal).
        state.events.push(...collectRadio(state.lapStart, state, circuit, playerTeamId, drivers));
    } else {
        state.sector = (s + 1) as Sector;
        state.events.push(...newEvents);
    }

    state.rngState = rng.state;
    return state;
}

// Avanza una vuelta completa = 3 sectores. Mantiene el harness de simulación
// y da un invariante gratis (advanceLap === advanceSector × 3).
export function advanceLap(
    prev: RaceState,
    circuit: Circuit,
    teams: Record<string, Team>,
    drivers: Record<string, Driver>,
    playerTeamId: string,
): RaceState {
    let s = prev;
    for (let i = 0; i < 3; i++) s = advanceSector(s, circuit, teams, drivers, playerTeamId);
    return s;
}
