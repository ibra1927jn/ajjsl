import React from 'react';
import { Compound, Driver, RaceState } from '../types';
import { COMPOUNDS } from '../data/constants';
import { TireBadge } from './TimingTower';

// Controles de estrategia del jugador: encolar/cancelar parada por coche.
export const PitControls = ({ race, playerTeamId, drivers, onQueuePit }: {
    race: RaceState;
    playerTeamId: string;
    drivers: Record<string, Driver>;
    onQueuePit: (driverId: string, compound: Compound | null) => void;
}) => {
    const playerCars = race.cars.filter(c => c.teamId === playerTeamId);
    const disabled = race.phase === 'finished';

    return (
        <div className="bg-card-darker rounded-2xl border border-border-dark p-3">
            <h3 className="text-xs font-bold text-text-sub uppercase tracking-wider mb-2">Muro de boxes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {playerCars.map(car => {
                    const driver = drivers[car.driverId];
                    const pos = race.cars.filter(c => c.status === 'running').indexOf(car);
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
                            ) : car.pendingPit ? (
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
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-text-sub">Parar y montar:</span>
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
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
