import { Circuit, Driver, RaceEvent, RaceState } from '../types';
import { RADIO_TEMPLATES, RadioTrigger } from '../data/radio';
import { COMPOUNDS } from '../data/constants';
import { compoundLife } from './pitstop';
import { Rng } from './rng';

function hashId(id: string): number {
    let h = 5381;
    for (let i = 0; i < id.length; i++) h = ((h << 5) + h + id.charCodeAt(i)) >>> 0;
    return h;
}

// Elige variante con un Rng propio (vuelta + piloto): determinista, sin tocar
// el stream principal → la resume-equivalencia no se ve afectada.
function pick(trigger: RadioTrigger, driverId: string, lap: number): string {
    const rng = new Rng((hashId(driverId) ^ Math.imul(lap, 0x9E3779B9)) >>> 0);
    const variants = RADIO_TEMPLATES[trigger];
    return variants[Math.floor(rng.next() * variants.length)];
}

// Mensajes de radio de los coches del JUGADOR tras una vuelta (máx. 2, por prioridad).
export function collectRadio(
    before: RaceState,
    after: RaceState,
    circuit: Circuit,
    playerTeamId: string,
    drivers: Record<string, Driver>,
): RaceEvent[] {
    const msgs: { priority: number; event: RaceEvent }[] = [];
    const lap = after.lap;
    const runningAfter = after.cars.filter(c => c.status === 'running');
    const runningBefore = before.cars.filter(c => c.status === 'running');

    const wet = after.weather.wetness;
    const wetness = wet[Math.min(lap, wet.length - 1)];
    const prevWetness = wet[Math.min(lap - 1, wet.length - 1)];

    for (const car of runningAfter) {
        if (car.teamId !== playerTeamId) continue;
        const driver = drivers[car.driverId];
        const posAfter = runningAfter.indexOf(car);
        const carBefore = runningBefore.find(c => c.driverId === car.driverId);
        const posBefore = carBefore ? runningBefore.indexOf(carBefore) : posAfter;
        const say = (trigger: RadioTrigger, priority: number) =>
            msgs.push({ priority, event: { lap, type: 'radio', message: `📻 ${driver.shortCode}: «${pick(trigger, car.driverId, lap)}»` } });

        if (lap === after.totalLaps - 1) say('finalLap', 4);
        if (prevWetness < 0.05 && wetness >= 0.05) say('rainStart', 1);
        // Cliff: neumático pasado de vida y sin parada pedida.
        const life = compoundLife(car.compound, circuit);
        if (COMPOUNDS[car.compound] && car.tireAge > life * 1.05 && !car.pendingPit && lap % 3 === 0) say('tireCliff', 2);
        if (carBefore && car.penaltySec > carBefore.penaltySec) say('contact', 1);
        else if (posAfter < posBefore && lap % 2 === 0) say('posGain', 3);
        else if (posAfter > posBefore && !carBefore?.pendingPit && lap % 2 === 0) say('posLoss', 3);
        if (after.fastestLap?.driverId === car.driverId && before.fastestLap?.driverId !== car.driverId && lap > 3) say('fastestLap', 3);
    }

    return msgs.sort((a, b) => a.priority - b.priority).slice(0, 1).map(m => m.event);
}
