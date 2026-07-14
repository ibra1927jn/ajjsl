import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { TEAMS } from '../data/teams';
import { DRIVERS } from '../data/drivers';
import { carPerformance } from '../engine/performance';
import { Button, Card, money } from '../components/ui';

export const NewGame = () => {
    const { game, dispatch } = useGame();
    const navigate = useNavigate();

    const pickTeam = (teamId: string) => {
        if (game && !window.confirm('Ya tienes una partida guardada. ¿Empezar de cero y borrarla?')) return;
        dispatch({ type: 'NEW_GAME', playerTeamId: teamId });
        navigate('/dashboard');
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 mb-2">
                    <span className="bg-f1-red text-white font-extrabold italic text-2xl px-3 py-1 rounded">F1</span>
                    <span className="text-3xl font-extrabold">Manager</span>
                </div>
                <p className="text-text-sub">Temporada 2025 · Elige tu equipo y llévalo a la gloria</p>
            </div>

            {game && (
                <Card className="mb-6 flex items-center justify-between">
                    <div>
                        <p className="font-bold">Partida guardada</p>
                        <p className="text-sm text-text-sub">
                            {game.teams[game.playerTeamId].name} · Temporada {game.season} · Ronda {game.raceIndex + 1}
                        </p>
                    </div>
                    <Button onClick={() => navigate('/dashboard')}>Continuar</Button>
                </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TEAMS.map(team => {
                    const lineup = DRIVERS.filter(d => team.driverIds.includes(d.id));
                    return (
                        <button
                            key={team.id}
                            onClick={() => pickTeam(team.id)}
                            className="text-left bg-card-dark border border-border-dark rounded-2xl p-4 hover:border-f1-red transition-colors group"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-1.5 h-6 rounded-full" style={{ background: team.color }} />
                                <span className="font-bold group-hover:text-f1-red transition-colors">{team.shortName}</span>
                                <span className="ml-auto text-xs text-text-sub tabular-nums">Coche {Math.round(carPerformance(team.car))}</span>
                            </div>
                            <p className="text-xs text-text-sub mb-1">{lineup.map(d => d.name).join(' · ')}</p>
                            <p className="text-xs text-gap-green font-semibold tabular-nums">{money(team.budget)}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
