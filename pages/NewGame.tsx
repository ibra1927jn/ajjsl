import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { TEAMS } from '../data/teams';
import { DRIVERS } from '../data/drivers';
import { DIFFICULTY } from '../data/constants';
import { Difficulty, RaceLength } from '../types';
import { carPerformance } from '../engine/performance';
import { clearLive } from '../services/livePersistence';
import { Button, Card, money } from '../components/ui';

const RACE_LENGTHS: { key: RaceLength; label: string }[] = [
    { key: 'short', label: 'Corta (25%)' },
    { key: 'medium', label: 'Media (50%)' },
    { key: 'full', label: 'Completa (100%)' },
];

export const NewGame = () => {
    const { game, dispatch } = useGame();
    const navigate = useNavigate();
    // Modal propio: window.confirm está bloqueado en iframes con sandbox (artifacts).
    const [confirmTeamId, setConfirmTeamId] = useState<string | null>(null);
    const [difficulty, setDifficulty] = useState<Difficulty>('normal');
    const [raceLength, setRaceLength] = useState<RaceLength>('medium');

    const startGame = (teamId: string) => {
        clearLive(); // que no quede una carrera a medias de la partida anterior
        dispatch({ type: 'NEW_GAME', playerTeamId: teamId, difficulty, raceLength });
        navigate('/dashboard');
    };

    const pickTeam = (teamId: string) => {
        if (game) setConfirmTeamId(teamId);
        else startGame(teamId);
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

            <div className="flex flex-col items-center gap-2 mb-5">
                <div className="flex gap-1 bg-card-darker rounded-xl p-1 border border-border-dark w-fit">
                    {(Object.keys(DIFFICULTY) as Difficulty[]).map(d => (
                        <button key={d} onClick={() => setDifficulty(d)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${difficulty === d ? 'bg-f1-red text-white' : 'text-text-sub hover:text-text-main'}`}>
                            {DIFFICULTY[d].label}
                        </button>
                    ))}
                </div>
                <div className="flex gap-1 bg-card-darker rounded-xl p-1 border border-border-dark w-fit">
                    {RACE_LENGTHS.map(l => (
                        <button key={l.key} onClick={() => setRaceLength(l.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${raceLength === l.key ? 'bg-f1-red text-white' : 'text-text-sub hover:text-text-main'}`}>
                            {l.label}
                        </button>
                    ))}
                </div>
                <p className="text-[11px] text-text-sub">Duración de carrera: {raceLength === 'full' ? 'realista (~1h a ritmo normal)' : raceLength === 'short' ? 'rápida' : 'equilibrada'}</p>
            </div>

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

            {confirmTeamId && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setConfirmTeamId(null)}>
                    <div className="bg-card-dark border border-border-dark rounded-2xl p-5 max-w-sm w-full" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold mb-1">¿Empezar de cero?</h3>
                        <p className="text-sm text-text-sub mb-4">
                            Ya tienes una partida guardada
                            {game && <> con <span className="font-semibold text-text-main">{game.teams[game.playerTeamId].shortName}</span> (temporada {game.season}, ronda {game.raceIndex + 1})</>}.
                            Se borrará para siempre.
                        </p>
                        <div className="space-y-2">
                            <Button variant="danger" className="w-full" onClick={() => startGame(confirmTeamId)}>
                                Borrar y empezar con {TEAMS.find(t => t.id === confirmTeamId)?.shortName}
                            </Button>
                            <Button variant="ghost" className="w-full" onClick={() => setConfirmTeamId(null)}>Cancelar</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
