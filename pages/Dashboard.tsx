import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useActiveGame } from '../context/GameContext';
import { CIRCUITS } from '../data/circuits';
import { carPerformance } from '../engine/performance';
import { computeDriverStandings, computeTeamStandings } from '../engine/season';
import { generateMissions } from '../engine/missions';
import { Button, Card, SectionTitle, StatBar, money, triColor } from '../components/ui';
import { IconChevronRight } from '../components/icons';
import { TraitBadges } from '../components/TraitBadges';

export const Dashboard = () => {
    const { game, dispatch } = useActiveGame();
    const navigate = useNavigate();
    const player = game.teams[game.playerTeamId];
    const nextCircuit = game.phase === 'preRace' ? CIRCUITS[game.raceIndex] : null;
    const missions = nextCircuit ? generateMissions(game.season, game.raceIndex, game.playerTeamId, game.teams) : [];

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
                    <h1 className="font-display text-2xl font-bold leading-none">{player.name}</h1>
                    <p className="text-sm text-text-sub mt-0.5">
                        Temporada {game.season}
                        {game.results.length > 0 && playerPos >= 0 && ` · P${playerPos + 1} en constructores (${teamStandings[playerPos].points} pts)`}
                    </p>
                </div>
            </div>

            {nextCircuit ? (
                <Card hero>
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs text-text-sub uppercase tracking-widest font-bold mb-1">
                                Ronda {game.raceIndex + 1} de {CIRCUITS.length}
                            </p>
                            <p className="font-display text-2xl font-bold leading-none">{nextCircuit.name}</p>
                            <p className="text-sm text-text-sub mt-1">{nextCircuit.country}</p>
                        </div>
                        <Button onClick={() => navigate('/race')} className="shrink-0">
                            Ir al circuito <IconChevronRight size={16} />
                        </Button>
                    </div>
                    {missions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border-dark">
                            <p className="text-[11px] text-text-sub uppercase font-bold tracking-wider mb-1">🎯 Misiones de patrocinador</p>
                            <div className="space-y-1">
                                {missions.map((m, i) => (
                                    <div key={i} className="flex justify-between text-xs">
                                        <span>{m.label}</span>
                                        <span className="text-gap-green font-semibold tabular-nums">+{money(m.reward)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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

            <Card>
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <p className="text-xs text-text-sub uppercase font-bold tracking-wider">Junta directiva</p>
                        <p className="text-sm">
                            Objetivo: <span className="font-bold">P{game.board.targetPos}</span> en constructores
                            {game.results.length > 0 && playerPos >= 0 && (
                                <span className={playerPos + 1 <= game.board.targetPos ? ' text-gap-green' : ' text-danger'}>
                                    {' '}· vas P{playerPos + 1}
                                </span>
                            )}
                        </p>
                    </div>
                    <span className="font-display text-2xl font-bold tabular-nums" style={{ color: triColor(game.board.patience, 41, 21) }}>
                        {game.board.patience}
                    </span>
                </div>
                <div className="h-2 bg-card-darker rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{
                        width: `${game.board.patience}%`,
                        background: triColor(game.board.patience, 41, 21),
                    }} />
                </div>
                <p className="text-[11px] text-text-sub mt-1">Paciencia de la junta: si llega a 0, estás despedido.</p>
            </Card>

            {game.news && game.news.length > 0 && game.raceIndex === 0 && (
                <Card>
                    <p className="text-xs text-text-sub uppercase font-bold tracking-wider mb-2">📰 Mercado de invierno</p>
                    <div className="space-y-1">
                        {game.news.map((n, i) => <p key={i} className="text-xs text-text-sub">· {n}</p>)}
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
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm">{d.name}</p>
                                        <p className="text-xs text-text-sub">
                                            Ritmo {d.pace} · {money(d.salary)}/año
                                            {standing && pos >= 0 && ` · P${pos + 1} (${standing.points} pts)`}
                                        </p>
                                        {d.traits.length > 0 && <TraitBadges traits={d.traits} className="mt-1" />}
                                    </div>
                                    <span className="font-display font-bold text-lg tracking-wide text-text-sub">{d.shortCode}</span>
                                </div>
                            );
                        })}
                    </div>
                    <Link to="/market" className="text-xs text-f1-red font-semibold hover:underline">Mercado de pilotos →</Link>
                </Card>
            </div>

            <Card>
                <SectionTitle>Motores</SectionTitle>
                <div className="space-y-3">
                    {player.driverIds.map(id => {
                        const d = game.drivers[id];
                        const e = d.engine;
                        const overPool = e.used > e.poolSize;
                        return (
                            <div key={id} className="flex items-center justify-between gap-3">
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-semibold">{d.name}</span>
                                        <span className={overPool ? 'text-danger' : 'text-text-sub'}>
                                            Motor {e.used}/{e.poolSize} · desgaste {Math.round(e.wear * 100)}%
                                            {e.gridPenaltyPending > 0 && <span className="text-danger font-bold"> · sanción parrilla</span>}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-card-darker rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, e.wear * 100)}%`, background: e.wear > 0.8 ? '#ff4d4d' : '#e10600' }} />
                                    </div>
                                </div>
                                <Button variant="ghost" onClick={() => dispatch({ type: 'TAKE_ENGINE', driverId: id })}>
                                    PU nuevo
                                </Button>
                            </div>
                        );
                    })}
                </div>
                <p className="text-[11px] text-text-sub mt-2">
                    3 motores por temporada. Correr en «atacar» los desgasta. Coger un 4º motor = salir del fondo:
                    hazlo en un circuito donde adelantar sea fácil.
                </p>
            </Card>
        </div>
    );
};
