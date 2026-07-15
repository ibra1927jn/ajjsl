import React from 'react';
import { Driver, RaceState, Team } from '../types';
import { COMPOUNDS } from '../data/constants';
import { formatGap, formatLapTime } from './ui';

export const TireBadge = ({ compound, age }: { compound: keyof typeof COMPOUNDS; age?: number }) => {
    const spec = COMPOUNDS[compound];
    return (
        <span className="inline-flex items-center gap-1">
            <span
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center text-[9px] font-extrabold text-black"
                style={{ borderColor: spec.color, background: spec.color }}
            >
                {spec.label}
            </span>
            {age !== undefined && <span className="font-display text-[10px] text-text-sub tabular-nums">{Math.floor(age)}</span>}
        </span>
    );
};

export const TimingTower = ({ race, teams, drivers, playerTeamId }: {
    race: RaceState;
    teams: Record<string, Team>;
    drivers: Record<string, Driver>;
    playerTeamId: string;
}) => {
    const leader = race.cars.find(c => c.status === 'running');
    const ersSet = new Set(race.ersDrivers);   // desplegando ERS 'overtake' esta vuelta
    const drsSet = new Set(race.drsDrivers);   // con DRS esta vuelta
    let prevRunningTime: number | null = null; // tiempo del coche de delante (para el intervalo)

    return (
        <div className="bg-card-darker rounded-2xl border border-border-dark overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border-dark/70">
                <span className="font-display text-xs font-bold uppercase tracking-widest text-text-sub">Clasificación en vivo</span>
            </div>
            {race.cars.map((car, i) => {
                const driver = drivers[car.driverId];
                const team = teams[car.teamId];
                const isPlayer = car.teamId === playerTeamId;
                const dnf = car.status === 'dnf';
                const hasFL = race.fastestLap?.driverId === car.driverId;
                const isLeader = car === leader;
                const gapToLeader = leader && !isLeader && !dnf ? car.totalTime - leader.totalTime : null;
                const interval = !dnf && !isLeader && prevRunningTime !== null ? car.totalTime - prevRunningTime : null;
                if (!dnf) prevRunningTime = car.totalTime;

                return (
                    <div
                        key={car.driverId}
                        className={`relative flex items-center gap-2 pl-3 pr-2.5 py-1.5 border-b border-border-dark/40 last:border-0 ${dnf ? 'opacity-40' : ''} ${isPlayer ? 'bg-f1-red/10' : ''}`}
                    >
                        {isPlayer && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-f1-red" />}
                        <span className="w-5 text-center font-display font-bold text-sm tabular-nums text-text-main">{dnf ? '–' : i + 1}</span>
                        <span className="w-1 h-6 rounded-full shrink-0" style={{ background: team.color }} />
                        <span className={`font-display font-bold text-base tracking-wide w-11 ${hasFL ? 'text-fastest-purple' : ''}`}>{driver.shortCode}</span>
                        {!dnf && <TireBadge compound={car.compound} age={car.tireAge} />}
                        {!dnf && (
                            <span className="w-3.5 h-1.5 rounded-full bg-card-dark overflow-hidden shrink-0" title="Batería ERS">
                                <span className="block h-full rounded-full" style={{ width: `${Math.round(car.ers * 100)}%`, background: car.ers > 0.25 ? '#22e07a' : '#ffd12e' }} />
                            </span>
                        )}
                        <span className={`flex-1 text-right font-display tabular-nums text-[11px] ${hasFL ? 'text-fastest-purple font-bold' : 'text-text-sub'}`}>
                            {!dnf && car.lastLap > 0 ? formatLapTime(car.lastLap) : ''}
                        </span>
                        <span className="w-16 text-right leading-none">
                            {dnf ? (
                                <span className="font-display text-danger text-xs font-bold">DNF</span>
                            ) : isLeader ? (
                                <span className="font-display text-gap-green text-sm font-bold">LÍDER</span>
                            ) : (
                                <>
                                    <span className="block font-display tabular-nums text-sm font-bold text-text-main">{interval !== null ? formatGap(interval) : ''}</span>
                                    {gapToLeader !== null && <span className="block font-display tabular-nums text-[10px] text-text-dim mt-0.5">{formatGap(gapToLeader)}</span>}
                                </>
                            )}
                        </span>
                        <span className="w-9 flex justify-end items-center">
                            {!dnf && car.damage > 0 && <span className="text-danger" title="Ala dañada"><span className="text-[11px]">⚠</span></span>}
                            {car.pendingPit && !dnf ? (
                                <span className="font-display text-pit-yellow text-[10px] font-bold animate-pulse">BOX</span>
                            ) : car.penaltySec > 0 && !dnf ? (
                                <span className="font-display text-danger text-[10px] font-bold">+{car.penaltySec}s</span>
                            ) : !dnf && ersSet.has(car.driverId) ? (
                                <span className="font-display text-weather-blue text-[10px] font-bold animate-pulse">OT</span>
                            ) : !dnf && drsSet.has(car.driverId) ? (
                                <span className="font-display text-gap-green text-[10px] font-bold">DRS</span>
                            ) : null}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};
