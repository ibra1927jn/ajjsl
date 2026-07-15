// Harness headless de balance: simula carreras/temporadas y saca agregados.
// Uso: npm run sim [-- --wet-sweep | --sprint | --resume-check | --seasons N]
import { createNewGame, gameReducer } from '../context/gameReducer';
import { CIRCUITS } from '../data/circuits';
import { GameState, RaceState } from '../types';
import { Rng } from '../engine/rng';
import { simulateQualifying } from '../engine/qualifying';
import { advanceLap, advanceSector, createRaceState } from '../engine/race';
import { finalizeRace, finalizeSprint } from '../engine/results';
import { compoundWetPenalty } from '../engine/weather';
import { COMPOUNDS, SPRINT_LAP_FRACTION } from '../data/constants';
import { scaledLaps } from '../engine/race';
import { parseSave } from '../services/persistence';

const PLAYER = 'williams';
const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const numArg = (name: string, def: number) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 && args[i + 1] ? Number(args[i + 1]) : def;
};

// El jugador no tiene UI en el harness: simulamos una parada real (un stop a un
// compuesto distinto) para representar a un mánager que sí para en boxes.
function strategizePlayer(race: RaceState): void {
    const mid = Math.floor(race.totalLaps * 0.5);
    if (race.lap !== mid) return;
    for (const car of race.cars) {
        if (car.teamId !== PLAYER || car.status !== 'running' || car.pendingPit || car.pitCount > 0) continue;
        car.pendingPit = car.compound === 'medium' ? 'hard' : 'medium';
    }
}

export function runRace(game: GameState, circuitId: string, seed: number, rainChanceOverride?: number) {
    const base = CIRCUITS.find(c => c.id === circuitId)!;
    const circuit = rainChanceOverride !== undefined ? { ...base, rainChance: rainChanceOverride } : base;
    const grid = simulateQualifying(game.teams, game.drivers, circuit, new Rng(seed));
    let race = createRaceState(grid, circuit, PLAYER, seed + 1);
    let guard = 0;
    while (race.phase !== 'finished' && guard++ < 1000) {
        strategizePlayer(race);
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
    const grid = simulateQualifying(game.teams, game.drivers, circuit, new Rng(3));
    const laps = Math.max(5, Math.round(scaledLaps(circuit) * SPRINT_LAP_FRACTION));
    let race = createRaceState(grid, circuit, PLAYER, 4, { kind: 'sprint', lapsOverride: laps });
    const maxWet = Math.max(...race.weather.wetness);
    let guard = 0;
    while (race.phase !== 'finished' && guard++ < 500) {
        race = advanceLap(race, circuit, game.teams, game.drivers, PLAYER);
    }
    const res = finalizeSprint(race);
    console.log(`\n=== Sprint China (${race.totalLaps} vueltas, maxWet=${maxWet.toFixed(2)}) ===`);
    for (const r of res.slice(0, 8)) {
        const car = race.cars.find(c => c.driverId === r.driverId)!;
        console.log(`P${r.position} ${r.driverId.padEnd(12)} pts=${r.points} pits=${car.pitCount}`);
    }
    const noPit = race.cars.filter(c => c.status === 'running' && c.pitCount === 0).length;
    console.log(`coches sin parar (${maxWet < 0.22 ? 'seco → esperado ~20' : 'mojado → normal parar'}): ${noPit}`);
}

// Reanudar = correr del tirón: serializa en la vuelta N y compara el final.
function resumeCheck() {
    const game = createNewGame(PLAYER);
    const circuit = CIRCUITS.find(c => c.id === 'britain')!;
    const grid = simulateQualifying(game.teams, game.drivers, circuit, new Rng(99));

    let full = createRaceState(grid, circuit, PLAYER, 100);
    const snapshots: string[] = [];
    while (full.phase !== 'finished') {
        full = advanceLap(full, circuit, game.teams, game.drivers, PLAYER);
        if (full.lap === 10) snapshots.push(JSON.stringify(full));
    }

    let resumed = JSON.parse(snapshots[0]) as ReturnType<typeof createRaceState>;
    while (resumed.phase !== 'finished') {
        resumed = advanceLap(resumed, circuit, game.teams, game.drivers, PLAYER);
    }

    const order = (s: typeof full) => s.cars.map(c => `${c.driverId}:${c.totalTime.toFixed(3)}:${c.status}`).join('|');
    const same = order(full) === order(resumed);
    console.log(`\nresume-equivalencia (serializado en vuelta 10): ${same ? 'OK ✓' : 'FALLO ✗'}`);
    if (!same) {
        console.log('full   :', order(full).slice(0, 200));
        console.log('resumed:', order(resumed).slice(0, 200));
        process.exit(1);
    }
    // Determinismo: mismo seed dos veces.
    let a = createRaceState(grid, circuit, PLAYER, 100);
    let b = createRaceState(grid, circuit, PLAYER, 100);
    while (a.phase !== 'finished') a = advanceLap(a, circuit, game.teams, game.drivers, PLAYER);
    while (b.phase !== 'finished') b = advanceLap(b, circuit, game.teams, game.drivers, PLAYER);
    console.log(`determinismo (mismo seed × 2): ${order(a) === order(b) ? 'OK ✓' : 'FALLO ✗'}`);
    if (order(a) !== order(b)) process.exit(1);

    // Resume a MITAD de vuelta (sector): serializa en vuelta 10 / sector 1.
    let secFull = createRaceState(grid, circuit, PLAYER, 100);
    let midSnap = '';
    while (secFull.phase !== 'finished') {
        secFull = advanceSector(secFull, circuit, game.teams, game.drivers, PLAYER);
        if (secFull.lap === 10 && secFull.sector === 1 && !midSnap) midSnap = JSON.stringify(secFull);
    }
    let secResumed = JSON.parse(midSnap) as typeof secFull;
    while (secResumed.phase !== 'finished') secResumed = advanceSector(secResumed, circuit, game.teams, game.drivers, PLAYER);
    const secSame = order(secFull) === order(secResumed);
    console.log(`resume a mitad de sector (V10/S1): ${secSame ? 'OK ✓' : 'FALLO ✗'}`);
    if (!secSame) process.exit(1);

    // Invariante: advanceLap === advanceSector × 3.
    let byLap = createRaceState(grid, circuit, PLAYER, 100);
    let bySec = createRaceState(grid, circuit, PLAYER, 100);
    for (let k = 0; k < 15; k++) {
        byLap = advanceLap(byLap, circuit, game.teams, game.drivers, PLAYER);
        for (let j = 0; j < 3; j++) bySec = advanceSector(bySec, circuit, game.teams, game.drivers, PLAYER);
    }
    console.log(`invariante advanceLap === 3×advanceSector: ${order(byLap) === order(bySec) ? 'OK ✓' : 'FALLO ✗'}`);
    if (order(byLap) !== order(bySec)) process.exit(1);
}

// ERS activo: reanudar debe seguir siendo bit-idéntico y la carga vivir en [0,1].
function ersCheck() {
    const game = createNewGame(PLAYER);
    const circuit = CIRCUITS.find(c => c.id === 'britain')!;
    const grid = simulateQualifying(game.teams, game.drivers, circuit, new Rng(99));
    // Modos de gasto en los coches del jugador para forzar dinámica de batería.
    const seed = (): RaceState => {
        const r = createRaceState(grid, circuit, PLAYER, 100);
        const modes = ['overtake', 'hotlap'] as const;
        let k = 0;
        for (const c of r.cars) if (c.teamId === PLAYER) c.ersMode = modes[k++ % 2];
        return r;
    };
    const ord = (s: RaceState) =>
        s.cars.map(c => `${c.driverId}:${c.totalTime.toFixed(3)}:${c.status}:${c.ers.toFixed(4)}`).join('|');

    let full = seed();
    let snap = '';
    let ersInRange = true;
    while (full.phase !== 'finished') {
        full = advanceLap(full, circuit, game.teams, game.drivers, PLAYER);
        for (const c of full.cars) if (c.ers < -1e-9 || c.ers > 1 + 1e-9) ersInRange = false;
        if (full.lap === 10 && !snap) snap = JSON.stringify(full);
    }
    let resumed = JSON.parse(snap) as RaceState;
    while (resumed.phase !== 'finished') resumed = advanceLap(resumed, circuit, game.teams, game.drivers, PLAYER);

    let a = seed(), b = seed();
    while (a.phase !== 'finished') a = advanceLap(a, circuit, game.teams, game.drivers, PLAYER);
    while (b.phase !== 'finished') b = advanceLap(b, circuit, game.teams, game.drivers, PLAYER);

    // Invariante lap === 3×sector con ERS activo.
    let byLap = seed(), bySec = seed();
    for (let k = 0; k < 15; k++) {
        byLap = advanceLap(byLap, circuit, game.teams, game.drivers, PLAYER);
        for (let j = 0; j < 3; j++) bySec = advanceSector(bySec, circuit, game.teams, game.drivers, PLAYER);
    }

    const okResume = ord(full) === ord(resumed);
    const okDet = ord(a) === ord(b);
    const okInv = ord(byLap) === ord(bySec);
    console.log(`\nERS resume-equivalencia (con batería): ${okResume ? 'OK ✓' : 'FALLO ✗'}`);
    console.log(`ERS determinismo (mismo seed × 2): ${okDet ? 'OK ✓' : 'FALLO ✗'}`);
    console.log(`ERS invariante lap === 3×sector: ${okInv ? 'OK ✓' : 'FALLO ✗'}`);
    console.log(`ERS carga en [0,1] toda la carrera: ${ersInRange ? 'OK ✓' : 'FALLO ✗'}`);
    if (!okResume || !okDet || !okInv || !ersInRange) process.exit(1);
}

// Migración v4→v5: un save viejo debe cargar con los campos nuevos rellenos.
function migrationCheck() {
    const g = createNewGame(PLAYER);
    const v4 = JSON.parse(JSON.stringify(g)) as Record<string, any>;
    for (const d of Object.values(v4.drivers as Record<string, any>)) delete d.traits;
    for (const t of Object.values(v4.teams as Record<string, any>)) delete t.facilities;
    v4.upgradeQueue = [{ stat: 'aero', points: 4, cost: 10, readyAtRace: 2 }];
    v4.saveVersion = 4;
    const migrated = parseSave(JSON.stringify({ version: 4, state: v4 }));
    const ok = !!migrated
        && Object.values(migrated.drivers).every(d => Array.isArray(d.traits))
        && Object.values(migrated.teams).every(t => t.facilities && t.facilities.windTunnel >= 1)
        && migrated.upgradeQueue.every(o => o.predicted === o.points && o.variance === 0);
    console.log(`migración v4→v5 (round-trip, sin pérdida): ${ok ? 'OK ✓' : 'FALLO ✗'}`);
    if (!ok) process.exit(1);
}

// Carrera profesional de N temporadas con el reducer completo: invariantes de
// economía, mercado, personal, junta y palmarés.
function careerCheck(seasons: number) {
    let g = createNewGame(PLAYER)!;
    let races = 0;
    for (let s = 0; s < seasons; s++) {
        while (g.phase === 'preRace') {
            const idx = g.raceIndex;
            const c = CIRCUITS[idx];
            const grid = simulateQualifying(g.teams, g.drivers, c, new Rng(3000 + races * 13));
            let race = createRaceState(grid, c, PLAYER, 4000 + races * 7);
            let guard = 0;
            while (race.phase !== 'finished' && guard++ < 1000) {
                strategizePlayer(race);
                race = advanceLap(race, c, g.teams, g.drivers, PLAYER);
            }
            g = gameReducer(g, { type: 'RACE_COMPLETED', record: finalizeRace(race, idx, g.season, grid[0].driverId) })!;
            races++;
            if (g.phase === 'gameOver') {
                console.log(`despedido en la temporada ${g.season} tras ${races} carreras (aceptable si el jugador es pasivo)`);
                return;
            }
        }
        const budgets = Object.values(g.teams).map(t => t.budget);
        const twoDrivers = Object.values(g.teams).every(t => t.driverIds.length === 2);
        console.log(`Temporada ${g.season}: presupuestos min=${Math.min(...budgets).toFixed(0)} max=${Math.max(...budgets).toFixed(0)} | 2 pilotos/equipo=${twoDrivers} | history=${g.history.length}`);
        if (Math.min(...budgets) < -20) { console.log('FALLO: colapso de presupuesto'); process.exit(1); }
        if (!twoDrivers) { console.log('FALLO: equipo sin 2 pilotos'); process.exit(1); }
        g = gameReducer(g, { type: 'ADVANCE_SEASON' })!;
        const staffed = Object.values(g.teams).filter(t => t.id !== PLAYER)
            .every(t => t.staffIds.td && t.staffIds.re && t.staffIds.pc);
        const spread = () => {
            const perfs = Object.values(g.teams).map(t => 0.4 * t.car.aero + 0.35 * t.car.engine + 0.25 * t.car.chassis);
            return (Math.max(...perfs) - Math.min(...perfs)).toFixed(1);
        };
        console.log(`  → ${g.season}: staff IA completo=${staffed} | dispersión de coches=${spread()} | noticias=${(g.news ?? []).length}`);
    }
    console.log('career OK ✓');
}

if (flag('career')) {
    careerCheck(numArg('career', 3));
} else if (flag('detail')) {
    detail(args[args.indexOf('--detail') + 1] ?? 'monza', numArg('seed', 42));
} else if (flag('resume-check')) {
    resumeCheck();
    ersCheck();
    migrationCheck();
} else if (flag('ers-check')) {
    ersCheck();
} else if (flag('migration-check')) {
    migrationCheck();
} else if (flag('wet-sweep')) {
    wetSweep();
    wetSeason();
} else if (flag('sprint')) {
    sprintCheck();
} else {
    detail('monza', 42);
    detail('monaco', 42);
    baseline();
}

export {};
