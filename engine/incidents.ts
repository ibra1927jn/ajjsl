import { CarState, Driver, RaceEvent, Team } from '../types';
import { BASE_DRIVER_ERROR, BASE_MECH_DNF, PACE_MODES } from '../data/constants';
import { wetErrorMult } from './weather';
import { Rng } from './rng';

const MECH_REASONS = ['problema hidráulico', 'fallo de motor', 'sobrecalentamiento de frenos', 'fallo en la caja de cambios', 'pérdida de potencia', 'fallo eléctrico'];
const ERROR_REASONS = ['se va contra el muro', 'trompo y se queda en la grava', 'pasado de frenada, rompe el ala', 'toque con otro coche, suspensión rota'];

// Tira los dados de avería/error por coche. Devuelve los coches que abandonan.
// rateMult escala las probabilidades (1 = por vuelta; 1/3 = por sector).
export function rollIncidents(
    cars: CarState[],
    teams: Record<string, Team>,
    drivers: Record<string, Driver>,
    lap: number,
    wetness: number,
    rng: Rng,
    rateMult: number = 1,
): { dnfs: CarState[]; events: RaceEvent[] } {
    const dnfs: CarState[] = [];
    const events: RaceEvent[] = [];

    for (const car of cars) {
        if (car.status !== 'running') continue;
        const team = teams[car.teamId];
        const driver = drivers[car.driverId];

        const pMech = BASE_MECH_DNF * (2.2 - team.car.reliability / 100) * rateMult;
        const pError = BASE_DRIVER_ERROR * (1.8 - driver.consistency / 100)
            * wetErrorMult(car.compound, wetness)
            * PACE_MODES[car.paceMode].errMult * rateMult;

        if (rng.chance(pMech)) {
            car.status = 'dnf';
            car.dnfLap = lap;
            dnfs.push(car);
            events.push({ lap, type: 'dnf', message: `¡${driver.name} abandona! ${rng.pick(MECH_REASONS)}.` });
        } else if (rng.chance(pError)) {
            car.status = 'dnf';
            car.dnfLap = lap;
            dnfs.push(car);
            events.push({ lap, type: 'dnf', message: `¡Error de ${driver.name}! ${rng.pick(ERROR_REASONS)}.` });
        }
    }
    return { dnfs, events };
}
