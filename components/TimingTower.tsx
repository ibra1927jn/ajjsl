import React from 'react';
import { Driver, RaceState, Team } from '../types';
import { COMPOUNDS } from '../data/constants';
import { formatGap } from './ui';

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
            {age !== undefined && <span className="text-[10px] text-text-sub tabular-nums">{Math.floor(age)}</span>}
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
    return (
        <div className="bg-card-darker rounded-2xl border border-border-dark overflow-hidden">
            {race.cars.map((car, i) => {
                const driver = drivers[car.driverId];
                const team = teams[car.teamId];
                const isPlayer = car.teamId === playerTeamId;
                const dnf = car.status === 'dnf';
                const hasFL = race.fastestLap?.driverId === car.driverId;
                const gap = leader && car !== leader && !dnf ? car.totalTime - leader.totalTime : null;

                return (
                    <div
                        key={car.driverId}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm border-b border-border-dark/50 last:border-0 ${dnf ? 'opacity-40' : ''} ${isPlayer ? 'bg-f1-red/10' : ''}`}
                    >
                        <span className="w-6 text-right font-bold tabular-nums text-text-sub">{dnf ? '—' : i + 1}</span>
                        <span className="w-1 h-5 rounded-full" style={{ background: team.color }} />
                        <span className={`w-12 font-bold ${hasFL ? 'text-fastest-purple' : ''}`}>{driver.shortCode}</span>
                        <span className="flex-1 text-text-sub text-xs hidden sm:block truncate">{team.shortName}</span>
                        <span className="w-16 text-right tabular-nums text-xs">
                            {dnf ? <span className="text-danger font-semibold">DNF</span>
                                : car === leader ? <span className="text-gap-green font-semibold">Líder</span>
                                : gap !== null ? formatGap(gap) : ''}
                        </span>
                        <span className="w-14 flex justify-end">
                            {!dnf && <TireBadge compound={car.compound} age={car.tireAge} />}
                        </span>
                        <span className="w-10 text-right">
                            {car.pendingPit && !dnf
                                ? <span className="text-pit-yellow text-[10px] font-bold animate-pulse">BOX</span>
                                : car.penaltySec > 0 && !dnf
                                    ? <span className="text-danger text-[10px] font-bold">+{car.penaltySec}s</span>
                                    : null}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};
