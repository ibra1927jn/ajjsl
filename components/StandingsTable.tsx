import React from 'react';
import { IconTrophy } from './icons';

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
                className={`relative flex items-center gap-2 pl-3 pr-3 py-2 text-sm border-b border-border-dark/40 last:border-0 ${row.highlight ? 'bg-f1-red/10' : ''}`}
            >
                {row.highlight && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-f1-red" />}
                <span className={`w-6 text-center font-display font-bold text-base tabular-nums ${i === 0 ? 'text-pit-yellow' : 'text-text-main'}`}>{i + 1}</span>
                <span className="w-1 h-6 rounded-full shrink-0" style={{ background: row.color }} />
                <span className="flex-1 font-semibold truncate">{row.name}</span>
                {row.sub && <span className="text-xs text-text-sub hidden sm:block">{row.sub}</span>}
                {row.wins > 0 && <span className="inline-flex items-center gap-1 text-xs text-pit-yellow tabular-nums font-semibold"><IconTrophy size={13} /> {row.wins}</span>}
                <span className="w-12 text-right font-display font-bold text-lg tabular-nums">{row.points}</span>
            </div>
        ))}
        {rows.length === 0 && <div className="p-4 text-sm text-text-sub">Aún no hay resultados.</div>}
    </div>
);
