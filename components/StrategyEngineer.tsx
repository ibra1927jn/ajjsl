import React from 'react';
import { Circuit, Driver, RaceState } from '../types';
import { strategyAdvice } from '../engine/strategy';
import { TireBadge } from './TimingTower';
import { IconGauge, IconWarning, IconChevronRight } from './icons';

// Panel del ingeniero de estrategia: consejo de parada por coche del jugador.
// Puro (deriva del estado en vivo), no muta nada.
export const StrategyEngineer = ({ race, circuit, drivers, playerTeamId }: {
    race: RaceState;
    circuit: Circuit;
    drivers: Record<string, Driver>;
    playerTeamId: string;
}) => {
    const advice = strategyAdvice(race, circuit, playerTeamId, id => drivers[id]?.shortCode ?? id);
    if (advice.length === 0) return null;

    const toneCls = { green: 'text-gap-green', yellow: 'text-pit-yellow', red: 'text-danger' };

    return (
        <div className="bg-card-darker rounded-2xl border border-border-dark overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border-dark/70">
                <IconGauge size={15} className="text-text-sub" />
                <span className="font-display text-xs font-bold uppercase tracking-widest text-text-sub">Ingeniero de estrategia</span>
            </div>
            <div className="p-3 space-y-2.5">
                {advice.map(a => {
                    const pct = Math.max(0, Math.min(100, (1 - a.tireAge / a.life) * 100));
                    return (
                        <div key={a.driverId} className="bg-card-dark rounded-xl p-2.5 border border-border-dark">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="flex items-center gap-2">
                                    <span className="font-display font-bold text-sm tracking-wide">{drivers[a.driverId].shortCode}</span>
                                    <TireBadge compound={a.compound} age={a.tireAge} />
                                </span>
                                {a.boxNow && (
                                    <span className="font-display text-[10px] font-bold uppercase tracking-wider text-pit-yellow bg-pit-yellow/15 rounded px-2 py-0.5 animate-pulse">
                                        Box esta vuelta
                                    </span>
                                )}
                            </div>
                            <div className="h-1.5 rounded-full bg-card-darker overflow-hidden mb-1.5">
                                <div className="h-full rounded-full transition-all"
                                    style={{ width: `${pct}%`, background: pct > 40 ? '#22e07a' : pct > 15 ? '#ffd12e' : '#ff4d4d' }} />
                            </div>
                            <p className={`text-[11px] font-semibold ${toneCls[a.tone]}`}>{a.headline}</p>
                            {a.threat && (
                                <p className="flex items-center gap-1 text-[11px] text-incident-orange mt-1">
                                    <IconWarning size={12} className="shrink-0" /> Amenaza: {a.threat}
                                </p>
                            )}
                            {a.opportunity && (
                                <p className="flex items-center gap-1 text-[11px] text-gap-green mt-1">
                                    <IconChevronRight size={12} className="shrink-0" /> {a.opportunity}
                                </p>
                            )}
                            {a.needsCompound && (
                                <p className="flex items-center gap-1 text-[11px] text-weather-blue mt-1">
                                    <IconWarning size={12} className="shrink-0" /> Regla: aún falta un 2º compuesto
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
