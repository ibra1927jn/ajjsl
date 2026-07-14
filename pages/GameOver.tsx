import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveGame } from '../context/GameContext';
import { computeTeamStandings } from '../engine/season';
import { Button, Card } from '../components/ui';

export const GameOver = () => {
    const { game, dispatch } = useActiveGame();
    const navigate = useNavigate();
    const standings = computeTeamStandings(game.results);
    const pos = standings.findIndex(s => s.teamId === game.playerTeamId) + 1;
    const player = game.teams[game.playerTeamId];

    return (
        <div className="max-w-md mx-auto py-10 text-center space-y-4 animate-fade-in-up">
            <p className="text-5xl">🚪</p>
            <h1 className="text-2xl font-extrabold text-danger">Despedido</h1>
            <Card>
                <p className="text-sm text-text-sub leading-relaxed">
                    La junta de <span className="font-bold" style={{ color: player.color }}>{player.name}</span> ha
                    perdido la paciencia. El objetivo era acabar <span className="font-bold text-text-main">P{game.board.targetPos}</span> en
                    constructores{pos > 0 && <> y el equipo marcha <span className="font-bold text-text-main">P{pos}</span></>}.
                    Gracias por tus servicios.
                </p>
            </Card>
            <p className="text-xs text-text-sub">Temporada {game.season} · Ronda {game.raceIndex} de 24</p>
            <Button
                className="w-full py-3"
                onClick={() => { dispatch({ type: 'RESET' }); navigate('/'); }}
            >
                Empezar una nueva carrera profesional
            </Button>
        </div>
    );
};
