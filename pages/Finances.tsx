import React, { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useActiveGame } from '../context/GameContext';
import { SPONSOR_PER_RACE } from '../data/constants';
import { salaryPerRace } from '../engine/market';
import { Card, SectionTitle, money } from '../components/ui';

export const Finances = () => {
    const { game } = useActiveGame();
    const player = game.teams[game.playerTeamId];

    // Evolución del presupuesto reconstruida hacia atrás desde el saldo actual.
    const series = useMemo(() => {
        const points: { label: string; budget: number }[] = [];
        let budget = player.budget;
        points.push({ label: 'Ahora', budget: Math.round(budget * 10) / 10 });
        for (let i = game.ledger.length - 1; i >= 0; i--) {
            budget -= game.ledger[i].amount;
            if (points.length < 25) points.push({ label: `${game.ledger.length - i}`, budget: Math.round(budget * 10) / 10 });
        }
        return points.reverse().map((p, i) => ({ ...p, idx: i }));
    }, [game.ledger, player.budget]);

    const salaries = player.driverIds.reduce((s, id) => s + salaryPerRace(game.drivers[id]), 0);
    const recent = [...game.ledger].reverse().slice(0, 20);

    return (
        <div className="space-y-4 animate-fade-in-up">
            <SectionTitle>Finanzas</SectionTitle>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card accent="#22e07a">
                    <p className="text-xs text-text-sub uppercase font-bold tracking-widest mb-1">Presupuesto</p>
                    <p className="font-display text-3xl font-bold text-gap-green tabular-nums leading-none">{money(player.budget)}</p>
                </Card>
                <Card accent="#4aa8ff">
                    <p className="text-xs text-text-sub uppercase font-bold tracking-widest mb-1">Patrocinio / carrera</p>
                    <p className="font-display text-3xl font-bold tabular-nums leading-none">{money(SPONSOR_PER_RACE[player.sponsorTier])}</p>
                    <p className="text-xs text-text-sub mt-1">Nivel de patrocinador {player.sponsorTier}</p>
                </Card>
                <Card accent="#ff4d4d">
                    <p className="text-xs text-text-sub uppercase font-bold tracking-widest mb-1">Salarios / carrera</p>
                    <p className="font-display text-3xl font-bold text-danger tabular-nums leading-none">{money(-salaries)}</p>
                </Card>
            </div>

            {series.length > 1 && (
                <Card>
                    <p className="text-sm font-bold mb-2">Evolución del presupuesto <span className="text-text-sub font-normal">($M, últimos movimientos)</span></p>
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={series} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                                <CartesianGrid stroke="#2a2a35" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="idx" hide />
                                <YAxis width={44} tick={{ fill: '#8a8a99', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ background: '#14141b', border: '1px solid #2a2a35', borderRadius: 8, fontSize: 12 }}
                                    labelFormatter={() => ''}
                                    formatter={(v: number) => [money(v), 'Presupuesto']}
                                />
                                <Area type="monotone" dataKey="budget" stroke="#00d26a" strokeWidth={2}
                                    fill="#00d26a" fillOpacity={0.12} dot={false} activeDot={{ r: 4 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            )}

            <Card>
                <p className="text-sm font-bold mb-2">Últimos movimientos</p>
                <div className="divide-y divide-border-dark/50">
                    {recent.map((e, i) => (
                        <div key={i} className="flex justify-between py-1.5 text-sm">
                            <span className="text-text-sub">{e.label}</span>
                            <span className={`font-semibold tabular-nums ${e.amount >= 0 ? 'text-gap-green' : 'text-danger'}`}>
                                {e.amount >= 0 ? '+' : ''}{money(e.amount)}
                            </span>
                        </div>
                    ))}
                    {recent.length === 0 && <p className="text-sm text-text-sub py-2">Sin movimientos todavía. Corre tu primera carrera.</p>}
                </div>
            </Card>
        </div>
    );
};
