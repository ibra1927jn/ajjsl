import React from 'react';
import { useActiveGame } from '../context/GameContext';
import { CarStatKey } from '../types';
import { STAT_CAP, UPGRADE_STEP } from '../data/constants';
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {STATS.map(({ key, label, desc, icon }) => {
                    const level = player.car[key];
                    const cost = upgradeCost(key, level);
                    const capped = level + UPGRADE_STEP > STAT_CAP;
                    const affordable = player.budget >= cost;
                    return (
                        <Card key={key}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-f1-red">{icon}</span>
                                <span className="font-bold">{label}</span>
                            </div>
                            <StatBar label="" value={level} color={key === 'reliability' ? '#00d26a' : player.color} />
                            <p className="text-xs text-text-sub mt-2 mb-3">{desc}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm tabular-nums">
                                    +{UPGRADE_STEP} pts · <span className={affordable ? 'text-gap-green' : 'text-danger'}>{money(cost)}</span>
                                </span>
                                <Button
                                    disabled={capped || !affordable}
                                    onClick={() => dispatch({ type: 'APPLY_UPGRADE', stat: key, points: UPGRADE_STEP, cost })}
                                >
                                    {capped ? 'Máximo' : 'Mejorar'}
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>
            <p className="text-xs text-text-sub">
                Las mejoras se aplican de inmediato. Los demás equipos también invierten sus ingresos tras cada carrera.
            </p>
        </div>
    );
};
