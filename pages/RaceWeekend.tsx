import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveGame } from '../context/GameContext';
import { CIRCUITS } from '../data/circuits';
import { TICK_SPEEDS } from '../data/constants';
import { Circuit, Driver, RaceResultRecord, RaceState, Team } from '../types';
import { Rng } from '../engine/rng';
import { QualiResult, simulateQualifying } from '../engine/qualifying';
import { finalizeRace, prizeFor } from '../engine/results';
import { useRaceSim } from '../hooks/useRaceSim';
import { TimingTower } from '../components/TimingTower';
import { EventFeed } from '../components/EventFeed';
import { PitControls } from '../components/PitControls';
import { Button, Card, SectionTitle, TeamStripe, formatLapTime, money } from '../components/ui';

type Step = 'quali' | 'race' | 'results';

export const RaceWeekend = () => {
    const { game, dispatch } = useActiveGame();
    const navigate = useNavigate();

    // Se fija al montar: tras RACE_COMPLETED el índice del juego ya apunta a la siguiente.
    const [raceIndex] = useState(game.raceIndex);
    const [seed] = useState(() => Math.floor(Math.random() * 2 ** 31));
    const [step, setStep] = useState<Step>('quali');
    const [record, setRecord] = useState<RaceResultRecord | null>(null);

    const circuit = CIRCUITS[raceIndex];
    const grid = useMemo(
        () => simulateQualifying(game.teams, game.drivers, circuit, new Rng(seed)),
        // la parrilla se calcula una vez con el estado al llegar al circuito
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [seed],
    );

    if (!circuit || (game.phase !== 'preRace' && !record)) {
        return (
            <Card className="text-center">
                <p className="mb-3">No hay carrera pendiente.</p>
                <Button onClick={() => navigate('/dashboard')}>Volver</Button>
            </Card>
        );
    }

    const onRaceFinished = (raceState: RaceState) => {
        const rec = finalizeRace(raceState, raceIndex, game.season, grid[0].driverId);
        setRecord(rec);
        dispatch({ type: 'RACE_COMPLETED', record: rec });
        setStep('results');
    };

    return (
        <div className="animate-fade-in-up">
            <div className="mb-4">
                <p className="text-xs text-text-sub uppercase tracking-wider font-bold">Ronda {raceIndex + 1} · {circuit.country}</p>
                <h1 className="text-xl font-extrabold">{circuit.name}</h1>
            </div>

            {step === 'quali' && (
                <QualiScreen grid={grid} teams={game.teams} drivers={game.drivers}
                    playerTeamId={game.playerTeamId} onStart={() => setStep('race')} />
            )}
            {step === 'race' && (
                <RaceRunner grid={grid} circuit={circuit} teams={game.teams} drivers={game.drivers}
                    playerTeamId={game.playerTeamId} seed={seed + 1} onFinished={onRaceFinished} />
            )}
            {step === 'results' && record && (
                <ResultsScreen record={record} teams={game.teams} drivers={game.drivers}
                    playerTeamId={game.playerTeamId} onContinue={() => navigate(game.phase === 'postSeason' ? '/season-end' : '/dashboard')} />
            )}
        </div>
    );
};

const QualiScreen = ({ grid, teams, drivers, playerTeamId, onStart }: {
    grid: QualiResult[];
    teams: Record<string, Team>;
    drivers: Record<string, Driver>;
    playerTeamId: string;
    onStart: () => void;
}) => (
    <div className="space-y-4">
        <SectionTitle>Clasificación</SectionTitle>
        <div className="bg-card-darker rounded-2xl border border-border-dark overflow-hidden">
            {grid.map((q, i) => (
                <div key={q.driverId}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm border-b border-border-dark/50 last:border-0 ${q.teamId === playerTeamId ? 'bg-f1-red/10' : ''}`}>
                    <span className="w-6 text-right font-bold tabular-nums text-text-sub">{i + 1}</span>
                    <TeamStripe color={teams[q.teamId].color} />
                    <span className="w-12 font-bold">{drivers[q.driverId].shortCode}</span>
                    <span className="flex-1 text-text-sub text-xs truncate">{teams[q.teamId].shortName}</span>
                    <span className="tabular-nums text-xs">{formatLapTime(q.time)}</span>
                    <span className="w-16 text-right tabular-nums text-xs text-text-sub">
                        {i === 0 ? 'POLE' : `+${(q.time - grid[0].time).toFixed(3)}`}
                    </span>
                </div>
            ))}
        </div>
        <Button onClick={onStart} className="w-full py-3">🏁 Comenzar carrera</Button>
    </div>
);

const RaceRunner = ({ grid, circuit, teams, drivers, playerTeamId, seed, onFinished }: {
    grid: QualiResult[];
    circuit: Circuit;
    teams: Record<string, Team>;
    drivers: Record<string, Driver>;
    playerTeamId: string;
    seed: number;
    onFinished: (raceState: RaceState) => void;
}) => {
    const { race, paused, setPaused, speedIdx, setSpeedIdx, queuePit } = useRaceSim(grid, circuit, teams, drivers, playerTeamId, seed);
    const finished = race.phase === 'finished';

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between bg-card-dark border border-border-dark rounded-2xl px-4 py-2">
                <span className="font-extrabold tabular-nums">
                    Vuelta {Math.min(race.lap + (finished ? 0 : 1), race.totalLaps)}/{race.totalLaps}
                    {race.phase === 'safetyCar' && <span className="ml-2 text-pit-yellow text-xs font-bold animate-pulse">SAFETY CAR</span>}
                </span>
                <div className="flex items-center gap-1">
                    {!finished && (
                        <>
                            <button onClick={() => setPaused(!paused)}
                                className="px-3 py-1 rounded-lg text-xs font-bold bg-card-darker border border-border-dark hover:border-f1-red">
                                {paused ? '▶ Reanudar' : '⏸ Pausa'}
                            </button>
                            {TICK_SPEEDS.map((s, i) => (
                                <button key={s.label} onClick={() => setSpeedIdx(i)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${speedIdx === i ? 'bg-f1-red border-f1-red text-white' : 'bg-card-darker border-border-dark hover:border-f1-red'}`}>
                                    {s.label}
                                </button>
                            ))}
                        </>
                    )}
                    {finished && <Button onClick={() => onFinished(race)}>Ver resultados →</Button>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                <div className="lg:col-span-3 space-y-3">
                    <TimingTower race={race} teams={teams} drivers={drivers} playerTeamId={playerTeamId} />
                </div>
                <div className="lg:col-span-2 space-y-3">
                    <PitControls race={race} playerTeamId={playerTeamId} drivers={drivers} onQueuePit={queuePit} />
                    <EventFeed events={race.events} />
                </div>
            </div>
        </div>
    );
};

const ResultsScreen = ({ record, teams, drivers, playerTeamId, onContinue }: {
    record: RaceResultRecord;
    teams: Record<string, Team>;
    drivers: Record<string, Driver>;
    playerTeamId: string;
    onContinue: () => void;
}) => {
    const playerEarnings = record.classification
        .filter(r => r.teamId === playerTeamId)
        .reduce((sum, r) => sum + prizeFor(r.position), 0);

    return (
        <div className="space-y-4">
            <SectionTitle>Resultado de la carrera</SectionTitle>
            <div className="bg-card-darker rounded-2xl border border-border-dark overflow-hidden">
                {record.classification.map(r => (
                    <div key={r.driverId}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm border-b border-border-dark/50 last:border-0 ${r.teamId === playerTeamId ? 'bg-f1-red/10' : ''} ${r.dnf ? 'opacity-40' : ''}`}>
                        <span className="w-6 text-right font-bold tabular-nums text-text-sub">{r.position ?? '—'}</span>
                        <TeamStripe color={teams[r.teamId].color} />
                        <span className="flex-1 font-semibold truncate">
                            {drivers[r.driverId].name}
                            {r.fastestLap && <span className="ml-1 text-fastest-purple text-xs font-bold">VR</span>}
                        </span>
                        <span className="text-xs text-text-sub hidden sm:block">{teams[r.teamId].shortName}</span>
                        {r.dnf ? <span className="text-danger text-xs font-semibold w-12 text-right">DNF</span>
                            : <span className="w-12 text-right font-bold tabular-nums">{r.points > 0 ? `+${r.points}` : ''}</span>}
                    </div>
                ))}
            </div>
            <Card className="flex items-center justify-between">
                <span className="text-sm text-text-sub">Premios del equipo esta carrera</span>
                <span className="font-bold text-gap-green tabular-nums">{money(playerEarnings)}</span>
            </Card>
            <Button onClick={onContinue} className="w-full py-3">Continuar →</Button>
        </div>
    );
};
