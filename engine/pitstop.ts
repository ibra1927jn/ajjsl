import { CarState, Circuit, Compound, RaceLength, RaceState } from '../types';
import {
    COMPOUNDS, CROSSOVER_JITTER, FROM_WET_WETNESS, RACE_LENGTH_SCALE, SC_FREE_STOP_AGE, SLICKS,
    TO_INTER_WETNESS, TO_SLICK_WETNESS, TO_WET_WETNESS,
    UNDERCUT_AGE_OFFSET, UNDERCUT_CHANCE, UNDERCUT_GAP, UNDERCUT_LIFE_FRAC,
} from '../data/constants';
import { isSlick } from './weather';
import { Rng } from './rng';

// Empuja a la IA a cumplir la regla de dos compuestos: si en seco el compuesto
// natural repetiría el único slick usado, elige otro slick distinto.
function twoCompoundNudge(car: CarState, natural: Compound, wetness: number): Compound {
    if (wetness >= TO_INTER_WETNESS) return natural; // mojado: la regla no aplica
    const used = new Set(car.compoundsUsed.filter(c => SLICKS.includes(c)));
    if (used.size >= 2 || !used.has(natural)) return natural;
    for (const alt of ['medium', 'hard', 'soft'] as Compound[]) if (!used.has(alt)) return alt;
    return natural;
}

// La vida del neumático se basa en la distancia del GRAN PREMIO a la duración
// elegida (no en las vueltas de la sesión: un sprint no desgasta más).
export function compoundLife(compound: Compound, circuit: Circuit, raceLength: RaceLength): number {
    const raceLaps = Math.max(5, Math.round(circuit.laps * RACE_LENGTH_SCALE[raceLength]));
    return (COMPOUNDS[compound].lifeFrac * raceLaps) / circuit.tireStress;
}

// Elige compuesto según agua y, en seco, el más blando que llegue al final.
export function chooseCompound(lapsLeft: number, circuit: Circuit, wetness: number, raceLength: RaceLength): Compound {
    if (wetness >= TO_WET_WETNESS) return 'wet';
    if (wetness >= TO_INTER_WETNESS) return 'inter';
    if (lapsLeft <= compoundLife('soft', circuit, raceLength) * 1.1) return 'soft';
    if (lapsLeft <= compoundLife('medium', circuit, raceLength) * 1.1) return 'medium';
    return 'hard';
}

// Decide las paradas de los coches IA (los del jugador solo paran por orden explícita).
export function aiDecidePits(state: RaceState, circuit: Circuit, playerTeamId: string, wetness: number, rng: Rng): void {
    const lapsLeft = state.totalLaps - state.lap;
    // Rng dedicado para el undercut: no perturba el flujo principal de incidentes.
    const und = new Rng((state.rngState ^ ((state.lap + 1) * 2654435761)) >>> 0);
    const running = state.cars.filter(c => c.status === 'running');
    const isSlickDry = wetness < TO_INTER_WETNESS;

    for (const car of state.cars) {
        if (car.status !== 'running' || car.teamId === playerTeamId || car.pendingPit) continue;

        // --- Undercut / overcut reactivo (solo en seco, coche en ventana de parada) ---
        // Reacciona a un rival cercano que va a parar o que rueda con neumático más
        // viejo → parar ahora para saltarle con gomas frescas.
        const life0 = compoundLife(car.compound, circuit, state.raceLength);
        if (state.kind !== 'sprint' && isSlickDry && state.phase === 'green' && lapsLeft > 4 && car.tireAge >= life0 * UNDERCUT_LIFE_FRAC) {
            const idx = running.indexOf(car);
            const neighbours = [running[idx - 1], running[idx + 1]].filter(Boolean) as CarState[];
            const rival = neighbours.find(r =>
                r.teamId !== car.teamId
                && Math.abs(r.totalTime - car.totalTime) < UNDERCUT_GAP
                && (r.pendingPit !== null || r.tireAge >= car.tireAge + UNDERCUT_AGE_OFFSET));
            if (rival && und.chance(UNDERCUT_CHANCE)) {
                car.pendingPit = twoCompoundNudge(car, chooseCompound(lapsLeft, circuit, wetness, state.raceLength), wetness);
                continue;
            }
        }

        // --- Crossovers de clima (con histéresis + jitter por coche) ---
        const jitter = rng.next() * CROSSOVER_JITTER;
        if (isSlick(car.compound) && wetness >= TO_INTER_WETNESS + jitter) {
            car.pendingPit = wetness >= TO_WET_WETNESS ? 'wet' : 'inter';
            continue;
        }
        if (car.compound === 'inter') {
            if (wetness >= TO_WET_WETNESS + jitter) {
                car.pendingPit = 'wet';
                continue;
            }
            if (wetness <= TO_SLICK_WETNESS - jitter && lapsLeft > 2) {
                car.pendingPit = chooseCompound(lapsLeft, circuit, 0, state.raceLength);
                continue;
            }
        }
        if (car.compound === 'wet' && wetness <= FROM_WET_WETNESS - jitter && lapsLeft > 2) {
            car.pendingPit = wetness <= TO_SLICK_WETNESS
                ? chooseCompound(lapsLeft, circuit, 0, state.raceLength)
                : 'inter';
            continue;
        }

        // En sprint no se para por desgaste (la vida se mide sobre la distancia de GP,
        // no del sprint): solo cuentan los crossovers de clima, ya resueltos arriba.
        if (state.kind === 'sprint') continue;

        // --- Desgaste (lógica de seco de la v1) ---
        const life = compoundLife(car.compound, circuit, state.raceLength);
        // Parada obligatoria de fondo (los sprints ya salieron arriba).
        const mustTakeMandatory = car.pitCount === 0 && lapsLeft <= 5;
        if (lapsLeft <= 2 && !mustTakeMandatory) continue;

        const wornOut = car.tireAge >= life * (0.9 + rng.next() * 0.25);
        const scFreeStop = state.phase === 'safetyCar' && car.tireAge >= life * SC_FREE_STOP_AGE && car.pitCount === 0;

        if (wornOut || scFreeStop || mustTakeMandatory) {
            car.pendingPit = twoCompoundNudge(car, chooseCompound(lapsLeft, circuit, wetness, state.raceLength), wetness);
        }
    }
}
