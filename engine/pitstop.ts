import { CarState, Circuit, Compound, RaceState } from '../types';
import {
    COMPOUNDS, CROSSOVER_JITTER, FROM_WET_WETNESS, LAP_SCALE, SC_FREE_STOP_AGE,
    TO_INTER_WETNESS, TO_SLICK_WETNESS, TO_WET_WETNESS,
} from '../data/constants';
import { isSlick } from './weather';
import { Rng } from './rng';

// La vida del neumático se basa SIEMPRE en la distancia de carrera completa
// del circuito (no en las vueltas de la sesión: un sprint no desgasta más).
export function compoundLife(compound: Compound, circuit: Circuit): number {
    return (COMPOUNDS[compound].lifeFrac * Math.round(circuit.laps * LAP_SCALE)) / circuit.tireStress;
}

// Elige compuesto según agua y, en seco, el más blando que llegue al final.
export function chooseCompound(lapsLeft: number, circuit: Circuit, wetness: number): Compound {
    if (wetness >= TO_WET_WETNESS) return 'wet';
    if (wetness >= TO_INTER_WETNESS) return 'inter';
    if (lapsLeft <= compoundLife('soft', circuit) * 1.1) return 'soft';
    if (lapsLeft <= compoundLife('medium', circuit) * 1.1) return 'medium';
    return 'hard';
}

// Decide las paradas de los coches IA (los del jugador solo paran por orden explícita).
export function aiDecidePits(state: RaceState, circuit: Circuit, playerTeamId: string, wetness: number, rng: Rng): void {
    const lapsLeft = state.totalLaps - state.lap;

    for (const car of state.cars) {
        if (car.status !== 'running' || car.teamId === playerTeamId || car.pendingPit) continue;

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
                car.pendingPit = chooseCompound(lapsLeft, circuit, 0);
                continue;
            }
        }
        if (car.compound === 'wet' && wetness <= FROM_WET_WETNESS - jitter && lapsLeft > 2) {
            car.pendingPit = wetness <= TO_SLICK_WETNESS
                ? chooseCompound(lapsLeft, circuit, 0)
                : 'inter';
            continue;
        }

        // --- Desgaste (lógica de seco de la v1) ---
        const life = compoundLife(car.compound, circuit);
        // En sprint no hay parada obligatoria.
        const mustTakeMandatory = state.kind !== 'sprint' && car.pitCount === 0 && lapsLeft <= 5;
        if (lapsLeft <= 2 && !mustTakeMandatory) continue;

        const wornOut = car.tireAge >= life * (0.9 + rng.next() * 0.25);
        const scFreeStop = state.phase === 'safetyCar' && car.tireAge >= life * SC_FREE_STOP_AGE && car.pitCount === 0;

        if (wornOut || scFreeStop || mustTakeMandatory) {
            car.pendingPit = chooseCompound(lapsLeft, circuit, wetness);
        }
    }
}
