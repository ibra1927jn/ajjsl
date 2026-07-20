import React, { useEffect, useRef } from 'react';
import { RaceEvent, RaceEventType } from '../types';
import { Panel } from './ui';
import { IconSwap, IconPit, IconWarning, IconFlag, IconGauge, IconWeather, IconRadio, IconChevronRight } from './icons';

const COLORS: Record<RaceEventType, string> = {
    overtake: 'text-gap-green',
    pit: 'text-pit-yellow',
    dnf: 'text-danger',
    safetyCar: 'text-pit-yellow',
    safetyCarEnd: 'text-gap-green',
    fastestLap: 'text-fastest-purple',
    info: 'text-text-sub',
    weather: 'text-weather-blue',
    incident: 'text-incident-orange',
    radio: 'text-text-main',
    damage: 'text-danger',
};

const ICONS: Record<RaceEventType, React.FC<{ size?: number; className?: string }>> = {
    overtake: IconSwap,
    pit: IconPit,
    dnf: IconWarning,
    safetyCar: IconWarning,
    safetyCarEnd: IconFlag,
    fastestLap: IconGauge,
    info: IconChevronRight,
    weather: IconWeather,
    incident: IconWarning,
    radio: IconRadio,
    damage: IconWarning,
};

export const EventFeed = ({ events }: { events: RaceEvent[] }) => {
    const recent = [...events].reverse().slice(0, 40);
    // Solo animamos las entradas nuevas desde el último render (fin del parpadeo).
    const prevCount = useRef(0);
    useEffect(() => { prevCount.current = events.length; });

    return (
        <Panel title="Directo" collapsible icon={<IconRadio size={15} className="text-text-sub" />}
            className="lg:h-full lg:flex lg:flex-col"
            bodyClass="overflow-y-auto hide-scrollbar px-3 py-2 space-y-1.5 max-h-56 lg:max-h-none lg:flex-1">
            <>
                {recent.map((e, i) => {
                    const origIndex = events.length - 1 - i;
                    const isNew = origIndex >= prevCount.current;
                    const Icon = ICONS[e.type];
                    return (
                        <div key={origIndex} className={`flex items-start gap-2 text-xs ${isNew ? 'animate-fade-in-up' : ''}`}>
                            <span className="font-display tabular-nums text-[10px] font-bold text-text-dim w-7 shrink-0 pt-0.5 text-right">V{e.lap}</span>
                            <span className={`shrink-0 pt-0.5 ${COLORS[e.type]}`}><Icon size={13} /></span>
                            <span className={`leading-snug ${e.type === 'radio' ? 'italic text-text-main' : COLORS[e.type]}`}>{e.message}</span>
                        </div>
                    );
                })}
            </>
        </Panel>
    );
};
