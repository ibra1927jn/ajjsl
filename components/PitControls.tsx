import React from 'react';
import { Compound, Driver, ErsMode, PaceMode, RaceState } from '../types';
import { COMPOUNDS, ERS_MODES, PACE_MODES } from '../data/constants';
import { TireBadge } from './TimingTower';
import { IconSwap, IconWarning } from './icons';

const ERS_ORDER: ErsMode[] = ['harvest', 'balanced', 'hotlap', 'overtake'];
const ERS_SHORT: Record<ErsMode, string> = { harvest: 'CARGA', balanced: 'BAL', hotlap: 'HOT', overtake: 'OT' };
const ERS_HINT: Record<ErsMode, string> = {
    harvest: 'Recarga batería (pierdes un poco de ritmo).',
    balanced: 'Sostenible: sin bonus, recarga lenta.',
    hotlap: 'Ritmo extra constante, gasta batería.',
    overtake: 'Máximo empujón para atacar, vacía la batería.',
};

// Muro de boxes: paradas, dial de ritmo, ERS y órdenes de equipo del jugador.
export const PitControls = ({ race, playerTeamId, drivers, onQueuePit, onPaceMode, onErsMode, onSwap }: {
    race: RaceState;
    playerTeamId: string;
    drivers: Record<string, Driver>;
    onQueuePit: (driverId: string, compound: Compound | null) => void;
    onPaceMode: (driverId: string, mode: PaceMode) => void;
    onErsMode: (driverId: string, mode: ErsMode) => void;
    onSwap: () => void;
}) => {
    const playerCars = race.cars.filter(c => c.teamId === playerTeamId);
    const disabled = race.phase === 'finished';

    // Órdenes de equipo solo si los dos coches van adyacentes y en carrera.
    const running = race.cars.filter(c => c.status === 'running');
    const firstIdx = running.findIndex(c => c.teamId === playerTeamId);
    const swapReady = firstIdx >= 0 && firstIdx + 1 < running.length
        && running[firstIdx + 1].teamId === playerTeamId;

    return (
        <div className="bg-card-darker rounded-2xl border border-border-dark overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border-dark/70">
                <span className="font-display text-xs font-bold uppercase tracking-widest text-text-sub">Muro de boxes</span>
                <button
                    disabled={!swapReady || disabled}
                    onClick={onSwap}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-card-dark border border-border-dark hover:border-f1-red transition-colors disabled:opacity-30"
                    title="Disponible cuando tus dos coches van seguidos en pista"
                >
                    <IconSwap size={14} /> Intercambiar
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3">
                {playerCars.map(car => {
                    const driver = drivers[car.driverId];
                    const pos = running.indexOf(car);
                    return (
                        <div key={car.driverId} className="bg-card-dark rounded-xl p-3 border border-border-dark">
                            <div className="flex items-center justify-between mb-2.5">
                                <span className="flex items-center gap-2 min-w-0">
                                    <span className="font-display font-bold text-sm tabular-nums text-text-sub shrink-0">
                                        {car.status === 'dnf' ? '—' : `P${pos + 1}`}
                                    </span>
                                    <span className="font-bold text-sm truncate">{driver.name}</span>
                                </span>
                                <TireBadge compound={car.compound} age={car.tireAge} />
                            </div>
                            {car.status === 'dnf' ? (
                                <span className="text-danger text-xs font-semibold">Abandono</span>
                            ) : (
                                <div className="space-y-2.5">
                                    {car.damage > 0 && (
                                        <div className="flex items-center gap-1.5 text-danger text-[11px] font-bold bg-danger/10 rounded-lg px-2 py-1.5">
                                            <IconWarning size={14} className="shrink-0" /> Ala dañada · repara en boxes (+8s)
                                        </div>
                                    )}
                                    {car.pendingPit ? (
                                        <div className="flex items-center justify-between gap-2 bg-pit-yellow/10 rounded-lg px-2.5 py-2">
                                            <span className="font-display text-pit-yellow text-xs font-bold animate-pulse">
                                                BOX ESTA VUELTA → {COMPOUNDS[car.pendingPit].label}
                                            </span>
                                            <button
                                                onClick={() => onQueuePit(car.driverId, null)}
                                                className="text-[11px] text-text-sub underline hover:text-text-main shrink-0"
                                            >
                                                cancelar
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-text-dim mb-1.5">Parada</p>
                                            <div className="flex items-center gap-2">
                                                {(Object.keys(COMPOUNDS) as Compound[]).map(c => (
                                                    <button
                                                        key={c}
                                                        disabled={disabled}
                                                        onClick={() => onQueuePit(car.driverId, c)}
                                                        className="w-9 h-9 rounded-full border-2 text-xs font-extrabold text-black transition-transform hover:scale-110 active:scale-95 disabled:opacity-40"
                                                        style={{ background: COMPOUNDS[c].color, borderColor: COMPOUNDS[c].color }}
                                                        title={COMPOUNDS[c].label}
                                                    >
                                                        {COMPOUNDS[c].label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-dim mb-1.5">Ritmo</p>
                                        <div className="flex gap-1">
                                            {(Object.keys(PACE_MODES) as PaceMode[]).map(m => (
                                                <button
                                                    key={m}
                                                    disabled={disabled}
                                                    onClick={() => onPaceMode(car.driverId, m)}
                                                    className={`flex-1 font-display text-xs font-bold uppercase tracking-wide py-1.5 rounded-lg border transition-colors disabled:opacity-40 ${
                                                        car.paceMode === m
                                                            ? m === 'attack' ? 'bg-f1-red border-f1-red text-white'
                                                                : m === 'conserve' ? 'bg-gap-green/20 border-gap-green text-gap-green'
                                                                : 'bg-border-dark border-border-soft text-text-main'
                                                            : 'bg-card-darker border-border-dark text-text-sub hover:text-text-main'
                                                    }`}
                                                >
                                                    {PACE_MODES[m].label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-text-dim">Energía</p>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-16 h-1.5 rounded-full bg-card-darker overflow-hidden">
                                                    <div className="h-full rounded-full transition-all"
                                                        style={{ width: `${Math.round(car.ers * 100)}%`, background: car.ers > 0.25 ? '#22e07a' : '#ffd12e' }} />
                                                </div>
                                                <span className="font-display text-[10px] font-bold tabular-nums text-text-sub w-7 text-right">{Math.round(car.ers * 100)}%</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {ERS_ORDER.map(m => (
                                                <button
                                                    key={m}
                                                    disabled={disabled}
                                                    onClick={() => onErsMode(car.driverId, m)}
                                                    title={ERS_MODES[m].label}
                                                    className={`flex-1 font-display text-[10px] font-bold uppercase tracking-wide py-1.5 rounded-lg border transition-colors disabled:opacity-40 ${
                                                        car.ersMode === m
                                                            ? m === 'overtake' ? 'bg-weather-blue/20 border-weather-blue text-weather-blue'
                                                                : m === 'harvest' ? 'bg-gap-green/20 border-gap-green text-gap-green'
                                                                : 'bg-border-dark border-border-soft text-text-main'
                                                            : 'bg-card-darker border-border-dark text-text-sub hover:text-text-main'
                                                    }`}
                                                >
                                                    {ERS_SHORT[m]}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-text-dim mt-1 leading-snug">{ERS_HINT[car.ersMode]}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
