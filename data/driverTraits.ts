import { CarStats, DriverTrait, Facilities } from '../types';
import { carPerformance } from '../engine/performance';

// Rasgos de los pilotos reales de la parrilla 2025. Los que no aparecen no
// tienen rasgo (o lo reciben los rookies procedurales al generarse).
export const DRIVER_TRAITS: Record<string, DriverTrait[]> = {
    verstappen: ['aggressive', 'ironNerve'],
    hamilton: ['wetMaster', 'tyreWhisperer'],
    norris: ['qualiSpecialist'],
    leclerc: ['qualiSpecialist', 'aggressive'],
    russell: ['qualiSpecialist'],
    alonso: ['wetMaster', 'ironNerve'],
    piastri: ['tyreWhisperer'],
    sainz: ['tyreWhisperer'],
    gasly: ['hotHead'],
    hulkenberg: ['ironNerve'],
    stroll: ['hotHead'],
    albon: ['tyreWhisperer'],
    tsunoda: ['hotHead', 'aggressive'],
    antonelli: ['aggressive'],
    hadjar: ['aggressive'],
    lawson: ['hotHead'],
    bortoleto: ['qualiSpecialist'],
    doohan: ['aggressive'],
    bearman: ['aggressive'],
    ocon: ['ironNerve'],
    colapinto: ['aggressive'],
};

// Todos los rasgos posibles (para asignar a rookies).
export const ALL_TRAITS: DriverTrait[] = [
    'wetMaster', 'tyreWhisperer', 'aggressive', 'hotHead', 'ironNerve', 'qualiSpecialist',
];

// Instalaciones por defecto según la fuerza del coche (los equipos punteros
// arrancan con mejores instalaciones). Nivel 1-5.
export function defaultFacilities(car: CarStats): Facilities {
    const perf = carPerformance(car);
    const lvl = Math.max(1, Math.min(5, Math.round((perf - 55) / 10) + 2));
    return { windTunnel: lvl, simulator: lvl, factory: lvl };
}
