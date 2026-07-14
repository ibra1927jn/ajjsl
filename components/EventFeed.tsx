import React from 'react';
import { RaceEvent, RaceEventType } from '../types';

const COLORS: Record<RaceEventType, string> = {
    overtake: 'text-gap-green',
    pit: 'text-pit-yellow',
    dnf: 'text-danger',
    safetyCar: 'text-pit-yellow',
    safetyCarEnd: 'text-gap-green',
    fastestLap: 'text-fastest-purple',
    info: 'text-text-sub',
};

export const EventFeed = ({ events }: { events: RaceEvent[] }) => {
    const recent = [...events].reverse().slice(0, 40);
    return (
        <div className="bg-card-darker rounded-2xl border border-border-dark p-3 h-64 lg:h-full overflow-y-auto hide-scrollbar">
            <h3 className="text-xs font-bold text-text-sub uppercase tracking-wider mb-2">Eventos</h3>
            <div className="space-y-1.5">
                {recent.map((e, i) => (
                    <div key={events.length - i} className="flex gap-2 text-xs animate-fade-in-up">
                        <span className="text-text-sub tabular-nums w-8 shrink-0">V{e.lap}</span>
                        <span className={COLORS[e.type]}>{e.message}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
