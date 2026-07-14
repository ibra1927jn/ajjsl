import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useActiveGame } from '../context/GameContext';
import { computeDriverStandings, computeTeamStandings, pointsProgression } from '../engine/season';
import { StandingsTable } from '../components/StandingsTable';
import { Card, SectionTitle } from '../components/ui';

export const Standings = () => {
    const { game } = useActiveGame();
    const [tab, setTab] = useState<'drivers' | 'teams'>('drivers');

    const driverStandings = useMemo(() => computeDriverStandings(game.results), [game.results]);
    const teamStandings = useMemo(() => computeTeamStandings(game.results), [game.results]);

    // Progresión de puntos de los 5 primeros del campeonato mostrado.
    const chart = useMemo(() => {
        if (game.results.length < 2) return null;
        const ids = tab === 'drivers'
            ? driverStandings.slice(0, 5).map(s => s.driverId)
            : teamStandings.slice(0, 5).map(s => s.teamId);
        return { ids, data: pointsProgression(game.results, ids, tab === 'drivers' ? 'driver' : 'team') };
    }, [game.results, tab, driverStandings, teamStandings]);

    const colorOf = (id: string) =>
        tab === 'drivers' ? game.teams[game.drivers[id].teamId ?? '']?.color ?? '#8a8a99' : game.teams[id].color;
    const nameOf = (id: string) => (tab === 'drivers' ? game.drivers[id].shortCode : game.teams[id].shortName);

    return (
        <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <SectionTitle>Mundial {game.season}</SectionTitle>
                <div className="flex items-center gap-2">
                <Link to="/history" className="text-xs text-f1-red font-semibold hover:underline">🏆 Palmarés</Link>
                <div className="flex gap-1 bg-card-darker rounded-xl p-1 border border-border-dark">
                    {(['drivers', 'teams'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold ${tab === t ? 'bg-f1-red text-white' : 'text-text-sub hover:text-text-main'}`}>
                            {t === 'drivers' ? 'Pilotos' : 'Constructores'}
                        </button>
                    ))}
                </div>
                </div>
            </div>

            {tab === 'drivers' ? (
                <StandingsTable rows={driverStandings.map(s => ({
                    id: s.driverId,
                    name: game.drivers[s.driverId].name,
                    sub: game.teams[s.teamId]?.shortName,
                    color: game.teams[s.teamId]?.color ?? '#8a8a99',
                    points: s.points,
                    wins: s.wins,
                    highlight: s.teamId === game.playerTeamId,
                }))} />
            ) : (
                <StandingsTable rows={teamStandings.map(s => ({
                    id: s.teamId,
                    name: game.teams[s.teamId].name,
                    color: game.teams[s.teamId].color,
                    points: s.points,
                    wins: s.wins,
                    highlight: s.teamId === game.playerTeamId,
                }))} />
            )}

            {chart && (
                <Card>
                    <p className="text-sm font-bold mb-2">Progresión de puntos <span className="text-text-sub font-normal">(top 5)</span></p>
                    <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chart.data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                                <CartesianGrid stroke="#2a2a35" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="raceIndex" tickFormatter={v => `R${v + 1}`}
                                    tick={{ fill: '#8a8a99', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis width={36} tick={{ fill: '#8a8a99', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ background: '#14141b', border: '1px solid #2a2a35', borderRadius: 8, fontSize: 12 }}
                                    labelFormatter={v => `Ronda ${Number(v) + 1}`}
                                />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                {chart.ids.map(id => (
                                    <Line key={id} type="monotone" dataKey={id} name={nameOf(id)}
                                        stroke={colorOf(id)} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            )}
        </div>
    );
};
