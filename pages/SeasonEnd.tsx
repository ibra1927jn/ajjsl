import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveGame } from '../context/GameContext';
import { computeDriverStandings, computeTeamStandings } from '../engine/season';
import { StandingsTable } from '../components/StandingsTable';
import { Button, Card, SectionTitle } from '../components/ui';

export const SeasonEnd = () => {
    const { game, dispatch } = useActiveGame();
    const navigate = useNavigate();

    if (game.phase !== 'postSeason') {
        return (
            <Card className="text-center">
                <p className="mb-3">La temporada aún no ha terminado.</p>
                <Button onClick={() => navigate('/dashboard')}>Volver</Button>
            </Card>
        );
    }

    const driverStandings = computeDriverStandings(game.results);
    const teamStandings = computeTeamStandings(game.results);
    const wdc = driverStandings[0];
    const wcc = teamStandings[0];
    const playerPos = teamStandings.findIndex(s => s.teamId === game.playerTeamId);

    return (
        <div className="space-y-4 animate-fade-in-up max-w-2xl mx-auto">
            <div className="text-center py-4">
                <p className="text-4xl mb-2">🏆</p>
                <h1 className="text-2xl font-extrabold">Temporada {game.season} finalizada</h1>
                <p className="text-text-sub mt-1">
                    Tu equipo terminó <span className="font-bold text-text-main">P{playerPos + 1}</span> en constructores.
                </p>
            </div>

            {wdc && wcc && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="text-center">
                        <p className="text-xs text-text-sub uppercase font-bold tracking-wider mb-1">Campeón de pilotos</p>
                        <p className="text-lg font-extrabold" style={{ color: game.teams[wdc.teamId]?.color }}>
                            {game.drivers[wdc.driverId].name}
                        </p>
                        <p className="text-sm text-text-sub tabular-nums">{wdc.points} pts · {wdc.wins} victorias</p>
                    </Card>
                    <Card className="text-center">
                        <p className="text-xs text-text-sub uppercase font-bold tracking-wider mb-1">Campeón de constructores</p>
                        <p className="text-lg font-extrabold" style={{ color: game.teams[wcc.teamId].color }}>
                            {game.teams[wcc.teamId].name}
                        </p>
                        <p className="text-sm text-text-sub tabular-nums">{wcc.points} pts</p>
                    </Card>
                </div>
            )}

            <SectionTitle>Clasificación final de pilotos</SectionTitle>
            <StandingsTable rows={driverStandings.map(s => ({
                id: s.driverId,
                name: game.drivers[s.driverId].name,
                sub: game.teams[s.teamId]?.shortName,
                color: game.teams[s.teamId]?.color ?? '#8a8a99',
                points: s.points,
                wins: s.wins,
                highlight: s.teamId === game.playerTeamId,
            }))} />

            <Button
                className="w-full py-3"
                onClick={() => { dispatch({ type: 'ADVANCE_SEASON' }); navigate('/dashboard'); }}
            >
                Comenzar temporada {game.season + 1} →
            </Button>
        </div>
    );
};
