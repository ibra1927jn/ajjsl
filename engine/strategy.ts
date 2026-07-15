import { Circuit, Compound, RaceState } from '../types';
import { SC_FREE_STOP_AGE } from '../data/constants';
import { compoundLife } from './pitstop';

// Consejo de estrategia por coche del jugador (puro, solo lectura — cero rng,
// cero mutación del estado → nunca afecta al determinismo de la simulación).
export interface StratAdvice {
    driverId: string;
    compound: Compound;
    tireAge: number;
    life: number;
    lapsToCliff: number;                 // vueltas hasta el "cliff" (− = ya pasado)
    windowOpen: boolean;                 // en ventana de parada
    boxNow: boolean;                     // recomendación de parar ya
    headline: string;                    // resumen accionable
    tone: 'green' | 'yellow' | 'red';    // color del consejo
    threat: string | null;              // rival cercano en gomas más frescas
    opportunity: string | null;         // rival cercano en gomas más viejas / parando
}

const GAP_NEAR = 3.0;      // s para considerar a un rival "cercano"
const AGE_SIGNIF = 3;      // diferencia de vueltas de neumático relevante

export function strategyAdvice(
    race: RaceState,
    circuit: Circuit,
    playerTeamId: string,
    driverCode: (driverId: string) => string,
): StratAdvice[] {
    const running = race.cars.filter(c => c.status === 'running');
    const lapsLeft = race.totalLaps - race.lap;

    return race.cars
        .filter(c => c.teamId === playerTeamId && c.status === 'running')
        .map(car => {
            const life = compoundLife(car.compound, circuit, race.raceLength);
            const lapsToCliff = life - car.tireAge;
            const windowOpen = car.tireAge >= life * 0.7 && lapsLeft > 3;
            const pastCliff = car.tireAge > life;
            const scFree = race.phase === 'safetyCar' && car.tireAge >= life * SC_FREE_STOP_AGE;

            const boxNow = !!car.pendingPit ? false : (scFree || (pastCliff && lapsLeft > 2));

            // Rivales adyacentes en pista.
            const idx = running.indexOf(car);
            const neigh = [running[idx - 1], running[idx + 1]].filter(Boolean);
            let threat: string | null = null;
            let opportunity: string | null = null;
            for (const r of neigh) {
                if (r.teamId === playerTeamId) continue;
                if (Math.abs(r.totalTime - car.totalTime) > GAP_NEAR) continue;
                if (r.pendingPit) opportunity = `${driverCode(r.driverId)} entra a boxes`;
                else if (r.tireAge <= car.tireAge - AGE_SIGNIF) threat = `${driverCode(r.driverId)} con gomas más frescas`;
                else if (r.tireAge >= car.tireAge + AGE_SIGNIF) opportunity = opportunity ?? `${driverCode(r.driverId)} con gomas gastadas`;
            }

            let headline: string;
            let tone: StratAdvice['tone'];
            if (car.pendingPit) { headline = 'Parada encolada'; tone = 'yellow'; }
            else if (scFree) { headline = 'Safety Car: parada barata, ¡entra!'; tone = 'green'; }
            else if (pastCliff) { headline = 'Neumático pasado de vida — para ya'; tone = 'red'; }
            else if (windowOpen) { headline = `Ventana abierta · ~${Math.max(0, Math.round(lapsToCliff))} v al cliff`; tone = 'yellow'; }
            else { headline = `Neumático OK · ~${Math.round(lapsToCliff)} v de margen`; tone = 'green'; }

            return { driverId: car.driverId, compound: car.compound, tireAge: car.tireAge, life, lapsToCliff, windowOpen, boxNow, headline, tone, threat, opportunity };
        });
}
