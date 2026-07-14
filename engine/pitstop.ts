import { CarState, Circuit, Compound, RaceState } from '../types';
import { COMPOUNDS, SC_FREE_STOP_AGE } from '../data/constants';
import { Rng } from './rng';

export function compoundLife(compound: Compound, totalLaps: number, circuit: Circuit): number {
    return (COMPOUNDS[compound].lifeFrac * totalLaps) / circuit.tireStress;
}

// Elige compuesto para las vueltas restantes: el más blando que llegue al final.
export function chooseCompound(lapsLeft: number, totalLaps: number, circuit: Circuit): Compound {
    if (lapsLeft <= compoundLife('soft', totalLaps, circuit) * 1.1) return 'soft';
    if (lapsLeft <= compoundLife('medium', totalLaps, circuit) * 1.1) return 'medium';
    return 'hard';
}

// Decide las paradas de los coches IA (los del jugador solo paran por orden explícita).
export function aiDecidePits(state: RaceState, circuit: Circuit, playerTeamId: string, rng: Rng): void {
    const lapsLeft = state.totalLaps - state.lap;

    for (const car of state.cars) {
        if (car.status !== 'running' || car.teamId === playerTeamId || car.pendingPit) continue;

        const life = compoundLife(car.compound, state.totalLaps, circuit);
        // No parar en las últimas 2 vueltas salvo obligación.
        const mustTakeMandatory = car.pitCount === 0 && lapsLeft <= 5;
        if (lapsLeft <= 2 && !mustTakeMandatory) continue;

        const wornOut = car.tireAge >= life * (0.9 + rng.next() * 0.25);
        const scFreeStop = state.phase === 'safetyCar' && car.tireAge >= life * SC_FREE_STOP_AGE && car.pitCount === 0;

        if (wornOut || scFreeStop || mustTakeMandatory) {
            car.pendingPit = chooseCompound(lapsLeft, state.totalLaps, circuit);
        }
    }
}
