import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveGame } from '../context/GameContext';
import { CIRCUITS } from '../data/circuits';
import { COMPOUNDS, TICK_SPEEDS, TO_INTER_WETNESS } from '../data/constants';
import { Circuit, Compound, Driver, DriverResult, RaceResultRecord, RaceState, SessionKind, Team } from '../types';
import { Rng } from '../engine/rng';
import { QualiResult, simulateQualifying } from '../engine/qualifying';
import { finalizeRace, finalizeSprint, prizeFor } from '../engine/results';
import { generateWeather } from '../engine/weather';
import { scaledLaps } from '../engine/race';
import { SPRINT_LAP_FRACTION } from '../data/constants';
import { useRaceSim } from '../hooks/useRaceSim';
import { TimingTower } from '../components/TimingTower';
import { EventFeed } from '../components/EventFeed';
import { PitControls } from '../components/PitControls';
import { Button, Card, SectionTitle, TeamStripe, formatLapTime, money } from '../components/ui';

type Step = 'quali' | 'sprint' | 'sprintResults' | 'race' | 'results';

export const RaceWeekend = () => {
    const { game, dispatch } = useActiveGame();
    const navigate = useNavigate();

    // Se fija al montar: tras RACE_COMPLETED el índice del juego ya apunta a la siguiente.
    const [raceIndex] = useState(game.raceIndex);
    const [seed] = useState(() => Math.floor(Math.random() * 2 ** 31));
    const [step, setStep] = useState<Step>('quali');
    const [record, setRecord] = useState<RaceResultRecord | null>(null);
    const [sprintResult, setSprintResult] = useState<DriverResult[] | null>(null);
    const [startCompound, setStartCompound] = useState<Compound>('medium');

    const circuit = CIRCUITS[raceIndex];
    const isSprint = circuit?.sprint === true;
    // Seeds por sesión: quali=seed, sprint=seed+1, carrera=seed+2 (o seed+1 sin sprint).
    const raceSeed = isSprint ? seed + 2 : seed + 1;

    const grid = useMemo(
        () => simulateQualifying(game.teams, game.drivers, circuit, new Rng(seed)),
        // la parrilla se calcula una vez con el estado al llegar al circuito
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [seed],
    );
    // Mismo seed y orden de draws que createRaceState → el pronóstico refleja la carrera real.
    const forecast = useMemo(
        () => generateWeather(circuit, scaledLaps(circuit), new Rng(raceSeed)),
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

    // La parrilla de la carrera en fin de semana sprint es el resultado del sprint.
    const raceGrid: QualiResult[] = isSprint && sprintResult
        ? sprintResult.map(r => ({ driverId: r.driverId, teamId: r.teamId, time: 0 }))
        : grid;

    const onSprintFinished = (raceState: RaceState) => {
        setSprintResult(finalizeSprint(raceState));
        setStep('sprintResults');
    };

    const onRaceFinished = (raceState: RaceState) => {
        const rec = finalizeRace(raceState, raceIndex, game.season, grid[0].driverId);
        if (sprintResult) rec.sprintClassification = sprintResult;
        setRecord(rec);
        dispatch({ type: 'RACE_COMPLETED', record: rec });
        setStep('results');
    };

    return (
        <div className="animate-fade-in-up">
            <div className="mb-4">
                <p className="text-xs text-text-sub uppercase tracking-wider font-bold">
                    Ronda {raceIndex + 1} · {circuit.country}
                    {isSprint && <span className="ml-2 text-pit-yellow">· FIN DE SEMANA SPRINT</span>}
                </p>
                <h1 className="text-xl font-extrabold">{circuit.name}</h1>
            </div>

            {step === 'quali' && (
                <QualiScreen grid={grid} teams={game.teams} drivers={game.drivers}
                    playerTeamId={game.playerTeamId} forecast={forecast}
                    startCompound={startCompound} onStartCompound={setStartCompound}
                    startLabel={isSprint ? '🏁 Comenzar sprint' : '🏁 Comenzar carrera'}
                    onStart={() => setStep(isSprint ? 'sprint' : 'race')} />
            )}
            {step === 'sprint' && (
                <SessionRunner kind="sprint" grid={grid} circuit={circuit} teams={game.teams} drivers={game.drivers}
                    playerTeamId={game.playerTeamId} seed={seed + 1}
                    lapsOverride={Math.max(5, Math.round(scaledLaps(circuit) * SPRINT_LAP_FRACTION))}
                    startCompound={startCompound} onFinished={onSprintFinished} />
            )}
            {step === 'sprintResults' && sprintResult && (
                <SprintResults classification={sprintResult} teams={game.teams} drivers={game.drivers}
                    playerTeamId={game.playerTeamId} onContinue={() => setStep('race')} />
            )}
            {step === 'race' && (
                <SessionRunner kind="race" grid={raceGrid} circuit={circuit} teams={game.teams} drivers={game.drivers}
                    playerTeamId={game.playerTeamId} seed={raceSeed}
                    startCompound={startCompound} onFinished={onRaceFinished} />
            )}
            {step === 'results' && record && (
                <ResultsScreen record={record} teams={game.teams} drivers={game.drivers}
                    playerTeamId={game.playerTeamId} onContinue={() => navigate(game.phase === 'postSeason' ? '/season-end' : '/dashboard')} />
            )}
        </div>
    );
};

const SprintResults = ({ classification, teams, drivers, playerTeamId, onContinue }: {
    classification: DriverResult[];
    teams: Record<string, Team>;
    drivers: Record<string, Driver>;
    playerTeamId: string;
    onContinue: () => void;
}) => (
    <div className="space-y-4">
        <SectionTitle>Resultado del sprint</SectionTitle>
        <div className="bg-card-darker rounded-2xl border border-border-dark overflow-hidden">
            {classification.map(r => (
                <div key={r.driverId}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm border-b border-border-dark/50 last:border-0 ${r.teamId === playerTeamId ? 'bg-f1-red/10' : ''} ${r.dnf ? 'opacity-40' : ''}`}>
                    <span className="w-6 text-right font-bold tabular-nums text-text-sub">{r.position ?? '—'}</span>
                    <TeamStripe color={teams[r.teamId].color} />
                    <span className="flex-1 font-semibold truncate">{drivers[r.driverId].name}</span>
                    {r.dnf ? <span className="text-danger text-xs font-semibold w-12 text-right">DNF</span>
                        : <span className="w-12 text-right font-bold tabular-nums">{r.points > 0 ? `+${r.points}` : ''}</span>}
                </div>
            ))}
        </div>
        <p className="text-xs text-text-sub">El resultado del sprint define la parrilla de la carrera del domingo.</p>
        <Button onClick={onContinue} className="w-full py-3">Continuar a la carrera →</Button>
    </div>
);

const FORECAST_ICON = (w: number) => (w < 0.05 ? '☀️' : w < TO_INTER_WETNESS ? '🌦️' : '🌧️');

const QualiScreen = ({ grid, teams, drivers, playerTeamId, forecast, startCompound, onStartCompound, startLabel, onStart }: {
    grid: QualiResult[];
    teams: Record<string, Team>;
    drivers: Record<string, Driver>;
    playerTeamId: string;
    forecast: number[];
    startCompound: Compound;
    onStartCompound: (c: Compound) => void;
    startLabel: string;
    onStart: () => void;
}) => {
    const q = Math.max(1, Math.floor(forecast.length / 4));
    const quarters = [0, 1, 2, 3].map(i => {
        const slice = forecast.slice(i * q, i === 3 ? forecast.length : (i + 1) * q);
        return slice.reduce((s, v) => s + v, 0) / Math.max(slice.length, 1);
    });
    const wetStart = forecast[0] >= TO_INTER_WETNESS;

    return (
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
        <div className="bg-card-dark border border-border-dark rounded-2xl p-3 flex flex-wrap items-center gap-4">
            <div>
                <p className="text-xs text-text-sub uppercase font-bold tracking-wider mb-1">Pronóstico</p>
                <div className="flex gap-2 text-lg">
                    {quarters.map((w, i) => <span key={i} title={`Cuarto ${i + 1}`}>{FORECAST_ICON(w)}</span>)}
                </div>
            </div>
            <div className="flex-1 min-w-[180px]">
                <p className="text-xs text-text-sub uppercase font-bold tracking-wider mb-1">
                    Compuesto de salida {wetStart && <span className="text-[#4aa8ff]">(salida en mojado: I/W forzado)</span>}
                </p>
                <div className="flex gap-2">
                    {(Object.keys(COMPOUNDS) as Compound[]).map(c => (
                        <button key={c} disabled={wetStart} onClick={() => onStartCompound(c)}
                            className={`w-8 h-8 rounded-full border-2 text-xs font-extrabold text-black transition-transform hover:scale-110 disabled:opacity-40 ${startCompound === c && !wetStart ? 'ring-2 ring-white scale-110' : ''}`}
                            style={{ background: COMPOUNDS[c].color, borderColor: COMPOUNDS[c].color }}>
                            {COMPOUNDS[c].label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
        <Button onClick={onStart} className="w-full py-3">{startLabel}</Button>
    </div>
    );
};

const SessionRunner = ({ kind, grid, circuit, teams, drivers, playerTeamId, seed, lapsOverride, startCompound, onFinished }: {
    kind: SessionKind;
    grid: QualiResult[];
    circuit: Circuit;
    teams: Record<string, Team>;
    drivers: Record<string, Driver>;
    playerTeamId: string;
    seed: number;
    lapsOverride?: number;
    startCompound: Compound;
    onFinished: (raceState: RaceState) => void;
}) => {
    const { race, paused, setPaused, speedIdx, setSpeedIdx, queuePit, setPaceMode, requestSwap } = useRaceSim(
        grid, circuit, teams, drivers, playerTeamId, seed, { kind, lapsOverride, playerStartCompound: startCompound });
    const finished = race.phase === 'finished';
    const wetness = race.weather.wetness[Math.min(race.lap, race.weather.wetness.length - 1)];

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between bg-card-dark border border-border-dark rounded-2xl px-4 py-2">
                <span className="font-extrabold tabular-nums">
                    {kind === 'sprint' && <span className="text-pit-yellow mr-2">SPRINT</span>}
                    Vuelta {Math.min(race.lap + (finished ? 0 : 1), race.totalLaps)}/{race.totalLaps}
                    {race.phase === 'safetyCar' && <span className="ml-2 text-pit-yellow text-xs font-bold animate-pulse">SAFETY CAR</span>}
                    {wetness >= 0.05 && (
                        <span className="ml-2 text-[#4aa8ff] text-xs font-bold">🌧️ {Math.round(wetness * 100)}%</span>
                    )}
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
                    <PitControls race={race} playerTeamId={playerTeamId} drivers={drivers}
                        onQueuePit={queuePit} onPaceMode={setPaceMode} onSwap={requestSwap} />
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
