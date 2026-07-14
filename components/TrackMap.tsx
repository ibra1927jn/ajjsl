import React, { useEffect, useRef } from 'react';
import { RaceState, Team } from '../types';
import { trackPath } from '../engine/trackShape';

// Mapa 2D del circuito: un punto por coche sobre el trazado. El loop de rAF es
// imperativo (escribe transforms directamente, cero estado React por frame) e
// interpola el progreso entre ticks de vuelta para que el movimiento sea fluido.
export const TrackMap = ({ race, teams, playerTeamId, tickMs, paused, avgLapSec }: {
    race: RaceState;
    teams: Record<string, Team>;
    playerTeamId: string;
    tickMs: number;
    paused: boolean;
    avgLapSec: number;
}) => {
    const pathRef = useRef<SVGPathElement>(null);
    const dotRefs = useRef(new Map<string, SVGGElement>());
    const prevRaceRef = useRef<RaceState>(race);
    const currRaceRef = useRef<RaceState>(race);
    const tickStartRef = useRef(performance.now());
    const tickMsRef = useRef(tickMs);
    const pausedRef = useRef(paused);

    tickMsRef.current = tickMs;
    pausedRef.current = paused;

    useEffect(() => {
        prevRaceRef.current = currRaceRef.current;
        currRaceRef.current = race;
        tickStartRef.current = performance.now();
    }, [race]);

    useEffect(() => {
        let raf = 0;
        const path = pathRef.current;
        if (!path) return;
        const totalLen = path.getTotalLength();

        // Progreso en vueltas de un coche dentro de un estado dado.
        const progressOf = (state: RaceState, driverId: string): { p: number; dnf: boolean } => {
            const running = state.cars.filter(c => c.status === 'running');
            const car = state.cars.find(c => c.driverId === driverId);
            if (!car) return { p: 0, dnf: true };
            if (car.status !== 'running' || running.length === 0) {
                return { p: (car.dnfLap ?? 0) - 0.5, dnf: true };
            }
            const leader = running[0];
            return { p: state.lap - (car.totalTime - leader.totalTime) / avgLapSec, dnf: false };
        };

        const frame = () => {
            raf = requestAnimationFrame(frame);
            if (document.hidden) return;
            const prev = prevRaceRef.current;
            const curr = currRaceRef.current;
            const t = pausedRef.current || curr.phase === 'finished'
                ? 1
                : Math.min(1, (performance.now() - tickStartRef.current) / tickMsRef.current);

            for (const car of curr.cars) {
                const el = dotRefs.current.get(car.driverId);
                if (!el) continue;
                const a = progressOf(prev, car.driverId);
                const b = progressOf(curr, car.driverId);
                const p = a.p + (b.p - a.p) * t;
                const frac = ((p / curr.totalLaps) % 1 + 1) % 1;
                const pt = path.getPointAtLength(frac * totalLen);
                el.setAttribute('transform', `translate(${pt.x.toFixed(2)} ${pt.y.toFixed(2)})`);
                el.setAttribute('opacity', b.dnf ? '0.15' : '1');
            }
        };
        raf = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(raf);
        // avgLapSec y el trazado no cambian durante la sesión
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const d = trackPath(race.circuitId);

    return (
        <div className="bg-card-darker rounded-2xl border border-border-dark p-2">
            <svg viewBox="0 0 100 100" className="w-full h-40 lg:h-52" aria-label="Mapa del circuito">
                <path d={d} fill="none" stroke="#2a2a35" strokeWidth="5" strokeLinejoin="round" />
                <path ref={pathRef} d={d} fill="none" stroke="#4a4a58" strokeWidth="1" strokeDasharray="2 2" />
                {[...race.cars].reverse().map(car => {
                    const isPlayer = car.teamId === playerTeamId;
                    return (
                        <g
                            key={car.driverId}
                            ref={el => {
                                if (el) dotRefs.current.set(car.driverId, el);
                                else dotRefs.current.delete(car.driverId);
                            }}
                        >
                            {isPlayer && <circle r="2.6" fill="none" stroke="#ffffff" strokeWidth="0.7" />}
                            <circle r="1.8" fill={teams[car.teamId].color} />
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};
