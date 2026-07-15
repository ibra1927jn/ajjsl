import { Driver, EngineAllocation } from '../types';
import { BASE_ENGINE_WEAR_PER_RACE, ENGINE_ATTACK_WEAR, GRID_PENALTY_BACK } from '../data/constants';
import { QualiResult } from './qualifying';

// Aplica el desgaste de motor de una carrera. Muta la asignación (copia) y
// devuelve un titular si hay que cambiar de motor / sanción de parrilla.
export function wearEngine(engine: EngineAllocation, stress: number, driverName: string): string | null {
    engine.wear += BASE_ENGINE_WEAR_PER_RACE + ENGINE_ATTACK_WEAR * stress;
    if (engine.wear < 1) return null;
    // El motor se agota: se monta uno nuevo.
    engine.wear -= 1;
    engine.used += 1;
    if (engine.used > engine.poolSize) {
        engine.gridPenaltyPending = GRID_PENALTY_BACK;
        return `${driverName}: motor nuevo fuera de asignación → sanción de parrilla en la próxima carrera.`;
    }
    return `${driverName} monta un motor nuevo (${engine.used}/${engine.poolSize}).`;
}

// Coger un motor nuevo de forma preventiva (elige dónde llevarte la sanción).
export function fitNewEngine(engine: EngineAllocation): EngineAllocation {
    const next = { ...engine, used: engine.used + 1, wear: 0 };
    if (next.used > next.poolSize) next.gridPenaltyPending = GRID_PENALTY_BACK;
    return next;
}

// Reordena la parrilla: los pilotos con sanción pendiente al fondo.
export function applyGridPenalties(grid: QualiResult[], drivers: Record<string, Driver>): QualiResult[] {
    const penalised = grid.filter(q => (drivers[q.driverId]?.engine.gridPenaltyPending ?? 0) > 0);
    const clean = grid.filter(q => (drivers[q.driverId]?.engine.gridPenaltyPending ?? 0) === 0);
    return [...clean, ...penalised];
}

export function engineStatusLabel(e: EngineAllocation): string {
    return `Motor ${e.used}/${e.poolSize} · desgaste ${Math.round(e.wear * 100)}%`;
}
