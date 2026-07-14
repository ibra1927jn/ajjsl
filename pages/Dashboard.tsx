import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useActiveGame } from '../context/GameContext';
import { CIRCUITS } from '../data/circuits';
import { carPerformance } from '../engine/performance';
import { computeDriverStandings, computeTeamStandings } from '../engine/season';
import { Button, Card, SectionTitle, StatBar, money } from '../components/ui';

export const Dashboard = () => {
    const { game } = useActiveGame();
    const navigate = useNavigate();
    const player = game.teams[game.playerTeamId];
    const nextCircuit = game.phase === 'preRace' ? CIRCUITS[game.raceIndex] : null;

    const teamStandings = computeTeamStandings(game.results);
    const driverStandings = computeDriverStandings(game.results);
    const playerPos = teamStandings.findIndex(s => s.teamId === player.id);
    const bestCar = Math.max(...Object.values(game.teams).map(t => carPerformance(t.car)));
    const myCar = carPerformance(player.car);

    return (
        <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center gap-3">
                <span className="w-2 h-10 rounded-full" style={{ background: player.color }} />
                <div>
                    <h1 className="text-xl font-extrabold">{player.name}</h1>
                    <p className="text-sm text-text-sub">
                        Temporada {game.season}
                        {game.results.length > 0 && playerPos >= 0 && ` · P${playerPos + 1} en constructores (${teamStandings[playerPos].points} pts)`}
                    </p>
                </div>
            </div>

            {nextCircuit ? (
                <Card className="border-f1-red/40">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs text-text-sub uppercase tracking-wider font-bold mb-1">
                                Ronda {game.raceIndex + 1} de {CIRCUITS.length}
                            </p>
                            <p className="text-lg font-extrabold">{nextCircuit.name}</p>
                            <p className="text-sm text-text-sub">{nextCircuit.country}</p>
                        </div>
                        <Button onClick={() => navigate('/race')} className="shrink-0">
                            Ir al circuito →
                        </Button>
                    </div>
                </Card>
            ) : (
                <Card className="border-fastest-purple/40">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-lg font-extrabold">Temporada {game.season} finalizada</p>
                            <p className="text-sm text-text-sub">Revisa el resumen y arranca la siguiente.</p>
                        </div>
                        <Button onClick={() => navigate('/season-end')}>Resumen →</Button>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                    <SectionTitle>Tu coche</SectionTitle>
                    <div className="space-y-2">
                        <StatBar label="Aerodinámica" value={player.car.aero} color={player.color} />
                        <StatBar label="Motor" value={player.car.engine} color={player.color} />
                        <StatBar label="Chasis" value={player.car.chassis} color={player.color} />
                        <StatBar label="Fiabilidad" value={player.car.reliability} color="#00d26a" />
                    </div>
                    <p className="text-xs text-text-sub mt-3">
                        Rendimiento global <span className="font-bold text-text-main">{Math.round(myCar)}</span> · mejor de la parrilla {Math.round(bestCar)}
                    </p>
                    <Link to="/development" className="text-xs text-f1-red font-semibold hover:underline">Desarrollar coche →</Link>
                </Card>

                <Card>
                    <SectionTitle>Tus pilotos</SectionTitle>
                    <div className="space-y-3">
                        {player.driverIds.map(id => {
                            const d = game.drivers[id];
                            const standing = driverStandings.find(s => s.driverId === id);
                            const pos = driverStandings.findIndex(s => s.driverId === id);
                            return (
                                <div key={id} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-sm">{d.name}</p>
                                        <p className="text-xs text-text-sub">
                                            Ritmo {d.pace} · {money(d.salary)}/año
                                            {standing && pos >= 0 && ` · P${pos + 1} (${standing.points} pts)`}
                                        </p>
                                    </div>
                                    <span className="font-extrabold text-text-sub">{d.shortCode}</span>
                                </div>
                            );
                        })}
                    </div>
                    <Link to="/market" className="text-xs text-f1-red font-semibold hover:underline">Mercado de pilotos →</Link>
                </Card>
            </div>
        </div>
    );
};
