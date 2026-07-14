// Harness headless de balance: simula carreras/temporadas y saca agregados.
// Uso: npm run sim [-- --wet-sweep | --sprint | --resume-check | --seasons N]
import { createNewGame } from '../context/gameReducer';
import { CIRCUITS } from '../data/circuits';
import { GameState, RaceState } from '../types';
import { Rng } from '../engine/rng';
import { simulateQualifying } from '../engine/qualifying';
import { advanceLap, createRaceState } from '../engine/race';
import { finalizeRace, finalizeSprint } from '../engine/results';
import { compoundWetPenalty } from '../engine/weather';
import { COMPOUNDS, SPRINT_LAP_FRACTION } from '../data/constants';
import { scaledLaps } from '../engine/race';

const PLAYER = 'williams';
const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const numArg = (name: string, def: number) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 && args[i + 1] ? Number(args[i + 1]) : def;
};

export function runRace(game: GameState, circuitId: string, seed: number, rainChanceOverride?: number) {
    const base = CIRCUITS.find(c => c.id === circuitId)!;
    const circuit = rainChanceOverride !== undefined ? { ...base, rainChance: rainChanceOverride } : base;
    const grid = simulateQualifying(game.teams, game.drivers, circuit, new Rng(seed));
    let race = createRaceState(grid, circuit, PLAYER, seed + 1);
    let guard = 0;
    while (race.phase !== 'finished' && guard++ < 1000) {
        race = advanceLap(race, circuit, game.teams, game.drivers, PLAYER);
    }
    const rec = finalizeRace(race, 0, 2025, grid[0].driverId);
    return { circuit, grid, race, rec };
}

function stats(race: RaceState) {
    const running = race.cars.filter(c => c.status === 'running');
    return {
        overtakes: race.events.filter(e => e.type === 'overtake').length,
        dnfs: race.events.filter(e => e.type === 'dnf').length,
        sc: race.events.filter(e => e.type === 'safetyCar').length,
        stopsPerCar: running.reduce((s, c) => s + c.pitCount, 0) / Math.max(running.length, 1),
        maxWet: Math.max(...race.weather.wetness),
    };
}

function baseline() {
    const game = createNewGame(PLAYER);
    let totDnf = 0, totOt = 0, totPits = 0, totSc = 0, wetRaces = 0;
    const wins: Record<string, number> = {};
    for (let i = 0; i < CIRCUITS.length; i++) {
        const { race, rec } = runRace(game, CIRCUITS[i].id, 1000 + i * 17);
        const s = stats(race);
        totDnf += s.dnfs; totOt += s.overtakes; totSc += s.sc; totPits += s.stopsPerCar;
        if (s.maxWet > 0.05) wetRaces++;
        const w = rec.classification[0].driverId;
        wins[w] = (wins[w] ?? 0) + 1;
    }
    const n = CIRCUITS.length;
    console.log(`\n=== Temporada (${n} carreras) ===`);
    console.log(`DNFs/carrera=${(totDnf / n).toFixed(2)} adelantamientos/carrera=${(totOt / n).toFixed(1)} paradas/coche=${(totPits / n).toFixed(2)} SC=${totSc} carreras con lluvia=${wetRaces}`);
    console.log('victorias:', Object.entries(wins).sort((a, b) => b[1] - a[1]).map(([d, c]) => `${d}:${c}`).join(' '));
}

function detail(circuitId: string, seed: number) {
    const game = createNewGame(PLAYER);
    const { circuit, race, rec } = runRace(game, circuitId, seed);
    const s = stats(race);
    console.log(`\n=== ${circuit.name} (${race.totalLaps}v, wetMax=${s.maxWet.toFixed(2)}) ===`);
    const leader = race.cars.find(c => c.status === 'running');
    for (const r of rec.classification.slice(0, 10)) {
        const car = race.cars.find(c => c.driverId === r.driverId)!;
        const gap = car.status === 'running' && leader ? (car.totalTime - leader.totalTime).toFixed(1) : 'DNF';
        console.log(`P${String(r.position ?? '--').padEnd(2)} ${r.driverId.padEnd(12)} pits=${car.pitCount} ${car.compound.padEnd(6)} gap=${gap}${r.fastestLap ? ' VR' : ''}`);
    }
    console.log(`adelantamientos=${s.overtakes} dnfs=${s.dnfs} SC=${s.sc}`);
}

// Coste por vuelta de cada compuesto a wetness fija: verifica los crossovers.
function wetSweep() {
    console.log('\nwetness | medium | inter | wet | mejor');
    for (let w = 0; w <= 1.001; w += 0.05) {
        const cost = (c: 'medium' | 'inter' | 'wet') => COMPOUNDS[c].offset + compoundWetPenalty(c, w) + 4 * w; // 4s ≈ pérdida de pista común
        const m = cost('medium'), i = cost('inter'), we = cost('wet');
        const best = m <= i && m <= we ? 'SLICK' : i <= we ? 'inter' : 'WET';
        console.log(`${w.toFixed(2)}    | ${m.toFixed(2).padStart(6)} | ${i.toFixed(2).padStart(5)} | ${we.toFixed(2).padStart(4)} | ${best}`);
    }
}

// Temporada entera con lluvia garantizada.
function wetSeason() {
    const game = createNewGame(PLAYER);
    let totDnf = 0, totPits = 0, thrash = 0;
    const wins: Record<string, number> = {};
    for (let i = 0; i < CIRCUITS.length; i++) {
        const { race, rec } = runRace(game, CIRCUITS[i].id, 2000 + i * 31, 1);
        const s = stats(race);
        totDnf += s.dnfs; totPits += s.stopsPerCar;
        const running = race.cars.filter(c => c.status === 'running');
        thrash += running.filter(c => c.pitCount >= 5).length;
        const w = rec.classification[0].driverId;
        wins[w] = (wins[w] ?? 0) + 1;
    }
    const n = CIRCUITS.length;
    console.log(`\n=== Temporada 100% lluvia ===`);
    console.log(`DNFs/carrera=${(totDnf / n).toFixed(2)} paradas/coche=${(totPits / n).toFixed(2)} coches con 5+ paradas=${thrash}`);
    console.log('victorias:', Object.entries(wins).sort((a, b) => b[1] - a[1]).map(([d, c]) => `${d}:${c}`).join(' '));
}

// Sprint en China: 1/3 de vueltas, puntos 8..1, sin parada obligatoria.
function sprintCheck() {
    const game = createNewGame(PLAYER);
    const circuit = CIRCUITS.find(c => c.id === 'china')!;
    const grid = simulateQualifying(game.teams, game.drivers, circuit, new Rng(7));
    const laps = Math.max(5, Math.round(scaledLaps(circuit) * SPRINT_LAP_FRACTION));
    let race = createRaceState(grid, circuit, PLAYER, 8, { kind: 'sprint', lapsOverride: laps });
    let guard = 0;
    while (race.phase !== 'finished' && guard++ < 500) {
        race = advanceLap(race, circuit, game.teams, game.drivers, PLAYER);
    }
    const res = finalizeSprint(race);
    console.log(`\n=== Sprint China (${race.totalLaps} vueltas) ===`);
    for (const r of res.slice(0, 8)) {
        const car = race.cars.find(c => c.driverId === r.driverId)!;
        console.log(`P${r.position} ${r.driverId.padEnd(12)} pts=${r.points} pits=${car.pitCount}`);
    }
    const noPit = race.cars.filter(c => c.status === 'running' && c.pitCount === 0).length;
    console.log(`coches sin parar (esperado ~20 en seco): ${noPit}`);
}

if (flag('detail')) {
    detail(args[args.indexOf('--detail') + 1] ?? 'monza', numArg('seed', 42));
} else if (flag('wet-sweep')) {
    wetSweep();
    wetSeason();
} else if (flag('sprint')) {
    sprintCheck();
} else if (!flag('resume-check')) {
    detail('monza', 42);
    detail('monaco', 42);
    baseline();
}

// El flag --resume-check se implementa junto al guardado de carrera en curso.
export {};
