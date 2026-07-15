import React, { useEffect, useRef, useState } from 'react';
import { Driver, RaceState, Team } from '../types';
import { trackPath } from '../engine/trackShape';

// Línea de meta: tick perpendicular al trazado en el punto de salida (length 0).
const FinishLine = ({ pathD }: { pathD: string }) => {
    const ref = useRef<SVGPathElement>(null);
    const [line, setLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const p0 = el.getPointAtLength(0);
        const p1 = el.getPointAtLength(Math.min(1.5, el.getTotalLength()));
        // Normal perpendicular a la tangente de salida.
        const dx = p1.x - p0.x, dy = p1.y - p0.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len, ny = dx / len;
        const HALF = 3.2;
        setLine({ x1: p0.x - nx * HALF, y1: p0.y - ny * HALF, x2: p0.x + nx * HALF, y2: p0.y + ny * HALF });
    }, [pathD]);

    return (
        <>
            <path ref={ref} d={pathD} fill="none" stroke="none" />
            {line && (
                <>
                    <line {...line} stroke="#f0f0f5" strokeWidth="1.4" strokeDasharray="1 0.8" />
                    <line {...line} stroke="#0c0c11" strokeWidth="1.4" strokeDasharray="0.8 1" strokeDashoffset="0.9" />
                </>
            )}
        </>
    );
};

// Marcas de sector: ticks tenues a 1/3 y 2/3 del trazado.
const SectorMarks = ({ pathD }: { pathD: string }) => {
    const ref = useRef<SVGPathElement>(null);
    const [marks, setMarks] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const total = el.getTotalLength();
        const out = [1 / 3, 2 / 3].map(f => {
            const at = f * total;
            const p0 = el.getPointAtLength(at);
            const p1 = el.getPointAtLength(Math.min(at + 1.2, total));
            const dx = p1.x - p0.x, dy = p1.y - p0.y;
            const len = Math.hypot(dx, dy) || 1;
            const nx = -dy / len, ny = dx / len;
            const HALF = 2.1;
            return { x1: p0.x - nx * HALF, y1: p0.y - ny * HALF, x2: p0.x + nx * HALF, y2: p0.y + ny * HALF };
        });
        setMarks(out);
    }, [pathD]);

    return (
        <>
            <path ref={ref} d={pathD} fill="none" stroke="none" />
            {marks.map((m, i) => <line key={i} {...m} stroke="#63636f" strokeWidth="0.9" strokeLinecap="round" />)}
        </>
    );
};

// Mapa 2D del circuito: un punto por coche sobre el trazado. El loop de rAF es
// imperativo (escribe transforms directamente, cero estado React por frame) e
// interpola el progreso entre ticks de vuelta para que el movimiento sea fluido.
export const TrackMap = ({ race, teams, drivers, playerTeamId, tickMs, paused, avgLapSec }: {
    race: RaceState;
    teams: Record<string, Team>;
    drivers: Record<string, Driver>;
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
            // Progreso en vueltas: vuelta + sector/3, menos el gap al líder en fracción de vuelta.
            const base = state.lap + state.sector / 3;
            return { p: base - (car.totalTime - leader.totalTime) / avgLapSec, dnf: false };
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
                // Parte fraccionaria del progreso en vueltas: una revolución del mapa = una vuelta.
                const frac = ((p % 1) + 1) % 1;
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
            <svg viewBox="0 0 100 100" className="w-full h-44 lg:h-56" aria-label="Mapa del circuito">
                <path d={d} fill="none" stroke="#24242f" strokeWidth="5.5" strokeLinejoin="round" strokeLinecap="round" />
                <path ref={pathRef} d={d} fill="none" stroke="#4a4a58" strokeWidth="1" strokeDasharray="2 2" />
                <SectorMarks pathD={d} />
                <FinishLine pathD={d} />
                {[...race.cars].reverse().map(car => {
                    const isPlayer = car.teamId === playerTeamId;
                    const color = teams[car.teamId].color;
                    return (
                        <g
                            key={car.driverId}
                            ref={el => {
                                if (el) dotRefs.current.set(car.driverId, el);
                                else dotRefs.current.delete(car.driverId);
                            }}
                        >
                            {isPlayer && <circle r="3.6" fill={color} opacity="0.25" />}
                            {isPlayer && <circle r="2.7" fill="none" stroke="#ffffff" strokeWidth="0.7" />}
                            <circle r="1.9" fill={color} />
                            {isPlayer && (
                                <text x="0" y="-3.6" textAnchor="middle" fill="#f2f2f7"
                                    style={{ fontSize: '3px', fontWeight: 700, fontFamily: 'Saira Condensed, sans-serif' }}
                                    stroke="#0c0c11" strokeWidth="0.6" paintOrder="stroke">
                                    {drivers[car.driverId].shortCode}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};
