import React from 'react';
import { TeamStripe } from './ui';

export interface StandingRow {
    id: string;
    name: string;
    sub?: string;
    color: string;
    points: number;
    wins: number;
    highlight?: boolean;
}

export const StandingsTable = ({ rows }: { rows: StandingRow[] }) => (
    <div className="bg-card-darker rounded-2xl border border-border-dark overflow-hidden">
        {rows.map((row, i) => (
            <div
                key={row.id}
                className={`flex items-center gap-2 px-3 py-2 text-sm border-b border-border-dark/50 last:border-0 ${row.highlight ? 'bg-f1-red/10' : ''}`}
            >
                <span className="w-6 text-right font-bold tabular-nums text-text-sub">{i + 1}</span>
                <TeamStripe color={row.color} />
                <span className="flex-1 font-semibold truncate">{row.name}</span>
                {row.sub && <span className="text-xs text-text-sub hidden sm:block">{row.sub}</span>}
                {row.wins > 0 && <span className="text-xs text-text-sub tabular-nums">🏆 {row.wins}</span>}
                <span className="w-12 text-right font-bold tabular-nums">{row.points}</span>
            </div>
        ))}
        {rows.length === 0 && <div className="p-4 text-sm text-text-sub">Aún no hay resultados.</div>}
    </div>
);
