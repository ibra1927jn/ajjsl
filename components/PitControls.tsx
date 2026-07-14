import React from 'react';
import { Compound, Driver, PaceMode, RaceState } from '../types';
import { COMPOUNDS, PACE_MODES } from '../data/constants';
import { TireBadge } from './TimingTower';

// Muro de boxes: paradas, dial de ritmo y órdenes de equipo del jugador.
export const PitControls = ({ race, playerTeamId, drivers, onQueuePit, onPaceMode, onSwap }: {
    race: RaceState;
    playerTeamId: string;
    drivers: Record<string, Driver>;
    onQueuePit: (driverId: string, compound: Compound | null) => void;
    onPaceMode: (driverId: string, mode: PaceMode) => void;
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
        <div className="bg-card-darker rounded-2xl border border-border-dark p-3">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-text-sub uppercase tracking-wider">Muro de boxes</h3>
                <button
                    disabled={!swapReady || disabled}
                    onClick={onSwap}
                    className="text-[11px] font-bold px-2 py-1 rounded-lg bg-card-dark border border-border-dark hover:border-f1-red disabled:opacity-30"
                    title="Disponible cuando tus dos coches van seguidos en pista"
                >
                    📻 Intercambiar posiciones
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {playerCars.map(car => {
                    const driver = drivers[car.driverId];
                    const pos = running.indexOf(car);
                    return (
                        <div key={car.driverId} className="bg-card-dark rounded-xl p-3 border border-border-dark">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-sm">
                                    {car.status === 'dnf' ? '— ' : `P${pos + 1} `}{driver.name}
                                </span>
                                <TireBadge compound={car.compound} age={car.tireAge} />
                            </div>
                            {car.status === 'dnf' ? (
                                <span className="text-danger text-xs font-semibold">Abandono</span>
                            ) : (
                                <div className="space-y-2">
                                    {car.pendingPit ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-pit-yellow text-xs font-bold animate-pulse">
                                                BOX esta vuelta → {COMPOUNDS[car.pendingPit].label}
                                            </span>
                                            <button
                                                onClick={() => onQueuePit(car.driverId, null)}
                                                className="text-[11px] text-text-sub underline hover:text-text-main"
                                            >
                                                cancelar
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-[11px] text-text-sub">Parar:</span>
                                            {(Object.keys(COMPOUNDS) as Compound[]).map(c => (
                                                <button
                                                    key={c}
                                                    disabled={disabled}
                                                    onClick={() => onQueuePit(car.driverId, c)}
                                                    className="w-7 h-7 rounded-full border-2 text-[11px] font-extrabold text-black transition-transform hover:scale-110 disabled:opacity-40"
                                                    style={{ background: COMPOUNDS[c].color, borderColor: COMPOUNDS[c].color }}
                                                >
                                                    {COMPOUNDS[c].label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex gap-1">
                                        {(Object.keys(PACE_MODES) as PaceMode[]).map(m => (
                                            <button
                                                key={m}
                                                disabled={disabled}
                                                onClick={() => onPaceMode(car.driverId, m)}
                                                className={`flex-1 text-[10px] font-bold py-1 rounded-lg border transition-colors disabled:opacity-40 ${
                                                    car.paceMode === m
                                                        ? m === 'attack' ? 'bg-f1-red border-f1-red text-white'
                                                            : m === 'conserve' ? 'bg-gap-green/20 border-gap-green text-gap-green'
                                                            : 'bg-border-dark border-border-dark text-text-main'
                                                        : 'bg-card-darker border-border-dark text-text-sub hover:text-text-main'
                                                }`}
                                            >
                                                {PACE_MODES[m].label}
                                            </button>
                                        ))}
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
