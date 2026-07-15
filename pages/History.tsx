import React, { useState } from 'react';
import { useActiveGame } from '../context/GameContext';
import { CIRCUITS } from '../data/circuits';
import { formatLapTime } from '../components/ui';
import { Card, SectionTitle, TeamStripe } from '../components/ui';

type Tab = 'seasons' | 'records' | 'drivers';

// Palmarés: historial de temporadas + totales de la carrera del mánager.
export const History = () => {
    const { game } = useActiveGame();
    const history = game.history;
    const [tab, setTab] = useState<Tab>('seasons');

    const circuitRecords = CIRCUITS
        .map(c => ({ circuit: c, rec: game.records[c.id] }))
        .filter(x => x.rec);
    const careers = Object.entries(game.driverRecords)
        .map(([id, c]) => ({ id, ...c }))
        .sort((a, b) => b.wins - a.wins || b.podiums - a.podiums || b.poles - a.poles)
        .slice(0, 20);

    const totals = history.reduce(
        (acc, r) => ({
            wins: acc.wins + r.playerWins,
            podiums: acc.podiums + r.playerPodiums,
            poles: acc.poles + r.playerPoles,
            wcc: acc.wcc + (r.wcc.teamId === game.playerTeamId ? 1 : 0),
            wdc: acc.wdc + (r.wdc.teamId === game.playerTeamId ? 1 : 0),
        }),
        { wins: 0, podiums: 0, poles: 0, wcc: 0, wdc: 0 },
    );

    return (
        <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <SectionTitle>Palmarés</SectionTitle>
                <div className="flex gap-1 bg-card-darker rounded-xl p-1 border border-border-dark">
                    {([['seasons', 'Temporadas'], ['records', 'Records'], ['drivers', 'Pilotos']] as [Tab, string][]).map(([t, label]) => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold ${tab === t ? 'bg-f1-red text-white' : 'text-text-sub hover:text-text-main'}`}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                    { label: 'Títulos WCC', value: totals.wcc, icon: '🏆' },
                    { label: 'Títulos WDC', value: totals.wdc, icon: '👑' },
                    { label: 'Victorias', value: totals.wins, icon: '🥇' },
                    { label: 'Podios', value: totals.podiums, icon: '🍾' },
                    { label: 'Poles', value: totals.poles, icon: '⏱️' },
                ].map(s => (
                    <Card key={s.label} className="text-center">
                        <p className="text-2xl">{s.icon}</p>
                        <p className="text-xl font-extrabold tabular-nums">{s.value}</p>
                        <p className="text-[11px] text-text-sub uppercase font-bold tracking-wider">{s.label}</p>
                    </Card>
                ))}
            </div>

            {tab === 'records' && (
                <div className="bg-card-darker rounded-2xl border border-border-dark overflow-x-auto">
                    {circuitRecords.length === 0 ? (
                        <p className="p-4 text-sm text-text-sub">Aún no hay records de vuelta. Se registran carrera a carrera.</p>
                    ) : (
                        <table className="w-full text-sm min-w-[420px]">
                            <thead>
                                <tr className="text-left text-[11px] text-text-sub uppercase tracking-wider border-b border-border-dark">
                                    <th className="px-3 py-2">Circuito</th>
                                    <th className="px-3 py-2">Récord de vuelta</th>
                                    <th className="px-3 py-2">Piloto</th>
                                    <th className="px-3 py-2 text-right">Año</th>
                                </tr>
                            </thead>
                            <tbody>
                                {circuitRecords.map(({ circuit, rec }) => (
                                    <tr key={circuit.id} className="border-b border-border-dark/50 last:border-0">
                                        <td className="px-3 py-2 font-semibold">{circuit.name}</td>
                                        <td className="px-3 py-2 tabular-nums text-fastest-purple">{formatLapTime(rec!.time)}</td>
                                        <td className="px-3 py-2">{rec!.driverName} <span className="text-text-sub text-xs">{rec!.teamName}</span></td>
                                        <td className="px-3 py-2 text-right tabular-nums text-text-sub">{rec!.season}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {tab === 'drivers' && (
                <div className="bg-card-darker rounded-2xl border border-border-dark overflow-x-auto">
                    {careers.length === 0 ? (
                        <p className="p-4 text-sm text-text-sub">Aún no hay estadísticas de pilotos.</p>
                    ) : (
                        <table className="w-full text-sm min-w-[440px]">
                            <thead>
                                <tr className="text-left text-[11px] text-text-sub uppercase tracking-wider border-b border-border-dark">
                                    <th className="px-3 py-2">Piloto</th>
                                    <th className="px-3 py-2 text-right">Carreras</th>
                                    <th className="px-3 py-2 text-right">Victorias</th>
                                    <th className="px-3 py-2 text-right">Podios</th>
                                    <th className="px-3 py-2 text-right">Poles</th>
                                    <th className="px-3 py-2 text-right">VR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {careers.map(c => (
                                    <tr key={c.id} className="border-b border-border-dark/50 last:border-0">
                                        <td className="px-3 py-2 font-semibold">{c.name}</td>
                                        <td className="px-3 py-2 text-right tabular-nums text-text-sub">{c.races}</td>
                                        <td className="px-3 py-2 text-right tabular-nums font-bold">{c.wins}</td>
                                        <td className="px-3 py-2 text-right tabular-nums">{c.podiums}</td>
                                        <td className="px-3 py-2 text-right tabular-nums">{c.poles}</td>
                                        <td className="px-3 py-2 text-right tabular-nums">{c.fastestLaps}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {tab === 'seasons' && (history.length === 0 ? (
                <Card>
                    <p className="text-sm text-text-sub">
                        Aún no has completado ninguna temporada. Tu historia como mánager se escribirá aquí.
                    </p>
                </Card>
            ) : (
                <div className="bg-card-darker rounded-2xl border border-border-dark overflow-x-auto">
                    <table className="w-full text-sm min-w-[520px]">
                        <thead>
                            <tr className="text-left text-[11px] text-text-sub uppercase tracking-wider border-b border-border-dark">
                                <th className="px-3 py-2">Año</th>
                                <th className="px-3 py-2">Campeón (WDC)</th>
                                <th className="px-3 py-2">Constructores (WCC)</th>
                                <th className="px-3 py-2 text-right">Tú</th>
                                <th className="px-3 py-2 text-right">Pts</th>
                                <th className="px-3 py-2 text-right">V/P/Poles</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...history].reverse().map(r => (
                                <tr key={r.season} className="border-b border-border-dark/50 last:border-0">
                                    <td className="px-3 py-2 font-bold tabular-nums">{r.season}</td>
                                    <td className="px-3 py-2">
                                        <TeamStripe color={r.wdc.color} />
                                        <span className="font-semibold">{r.wdc.name}</span>
                                        <span className="text-text-sub text-xs"> · {r.wdc.teamName}</span>
                                    </td>
                                    <td className="px-3 py-2">
                                        <TeamStripe color={r.wcc.color} />
                                        {r.wcc.name}
                                        {r.wcc.teamId === game.playerTeamId && <span className="ml-1">🏆</span>}
                                    </td>
                                    <td className="px-3 py-2 text-right font-bold tabular-nums">P{r.playerPos}</td>
                                    <td className="px-3 py-2 text-right tabular-nums">{r.playerPoints}</td>
                                    <td className="px-3 py-2 text-right tabular-nums text-text-sub">
                                        {r.playerWins}/{r.playerPodiums}/{r.playerPoles}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
};
