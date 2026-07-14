import React from 'react';
import { useActiveGame } from '../context/GameContext';
import { CarStatKey } from '../types';
import { DEV_COST_CAP, STAT_CAP, UPGRADE_LEAD_RACES, UPGRADE_STEP } from '../data/constants';
import { CIRCUITS } from '../data/circuits';
import { upgradeCost } from '../engine/development';
import { carPerformance } from '../engine/performance';
import { Button, Card, SectionTitle, StatBar, money } from '../components/ui';

const STATS: { key: CarStatKey; label: string; desc: string; icon: string }[] = [
    { key: 'aero', label: 'Aerodinámica', desc: 'Carga y eficiencia. El área con más peso en el ritmo.', icon: 'air' },
    { key: 'engine', label: 'Motor', desc: 'Potencia en rectas y salida de curva.', icon: 'bolt' },
    { key: 'chassis', label: 'Chasis', desc: 'Equilibrio mecánico y paso por curva lenta.', icon: 'settings' },
    { key: 'reliability', label: 'Fiabilidad', desc: 'Menos averías y abandonos. Más barata de mejorar.', icon: 'build_circle' },
];

export const Development = () => {
    const { game, dispatch } = useActiveGame();
    const player = game.teams[game.playerTeamId];

    return (
        <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <SectionTitle>Desarrollo del coche</SectionTitle>
                <span className="text-sm text-text-sub">
                    Rendimiento global <span className="font-bold text-text-main">{Math.round(carPerformance(player.car))}</span>
                </span>
            </div>

            <Card>
                <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold">Cost cap de desarrollo</p>
                    <p className="text-sm tabular-nums text-text-sub">
                        {money(player.devSpendSeason)} / {money(DEV_COST_CAP)}
                    </p>
                </div>
                <div className="h-2 bg-card-darker rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{
                        width: `${Math.min(100, (player.devSpendSeason / DEV_COST_CAP) * 100)}%`,
                        background: player.devSpendSeason / DEV_COST_CAP > 0.85 ? '#ff4d4d' : '#e10600',
                    }} />
                </div>
                {game.upgradeQueue.length > 0 && (
                    <div className="mt-3 space-y-1">
                        <p className="text-xs font-bold text-text-sub uppercase tracking-wider">En fabricación</p>
                        {game.upgradeQueue.map((o, i) => (
                            <p key={i} className="text-xs text-text-sub">
                                ⚙️ {o.stat} +{o.points} · lista para{' '}
                                <span className="text-text-main font-semibold">
                                    {CIRCUITS[Math.min(o.readyAtRace, CIRCUITS.length - 1)].name}
                                </span>
                            </p>
                        ))}
                    </div>
                )}
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {STATS.map(({ key, label, desc, icon }) => {
                    const level = player.car[key];
                    const queued = game.upgradeQueue.filter(o => o.stat === key).reduce((s, o) => s + o.points, 0);
                    const cost = upgradeCost(key, level + queued);
                    const capped = level + queued + UPGRADE_STEP > STAT_CAP;
                    const overCap = player.devSpendSeason + cost > DEV_COST_CAP;
                    const affordable = player.budget >= cost;
                    return (
                        <Card key={key}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-f1-red">{icon}</span>
                                <span className="font-bold">{label}</span>
                            </div>
                            <StatBar label="" value={level} color={key === 'reliability' ? '#00d26a' : player.color} />
                            <p className="text-xs text-text-sub mt-2 mb-3">
                                {desc}
                                {queued > 0 && <span className="text-pit-yellow"> · +{queued} en fabricación</span>}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm tabular-nums">
                                    +{UPGRADE_STEP} pts · <span className={affordable && !overCap ? 'text-gap-green' : 'text-danger'}>{money(cost)}</span>
                                </span>
                                <Button
                                    disabled={capped || !affordable || overCap}
                                    onClick={() => dispatch({ type: 'APPLY_UPGRADE', stat: key, points: UPGRADE_STEP, cost })}
                                >
                                    {capped ? 'Máximo' : overCap ? 'Cost cap' : 'Fabricar'}
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>
            <p className="text-xs text-text-sub">
                Las mejoras tardan {UPGRADE_LEAD_RACES} carreras en fabricarse y montarse en el coche. El gasto en
                desarrollo de TODOS los equipos está limitado por el cost cap anual; la IA también invierte tras cada carrera.
            </p>
        </div>
    );
};
