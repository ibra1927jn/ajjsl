import React from 'react';
import { useActiveGame } from '../context/GameContext';
import { Card, SectionTitle, TeamStripe } from '../components/ui';

// Palmarés: historial de temporadas + totales de la carrera del mánager.
export const History = () => {
    const { game } = useActiveGame();
    const history = game.history;

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
            <SectionTitle>Palmarés</SectionTitle>

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

            {history.length === 0 ? (
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
            )}
        </div>
    );
};
