import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveGame } from '../context/GameContext';
import { CIRCUITS } from '../data/circuits';
import { COMPOUNDS, TICK_SPEEDS, TO_INTER_WETNESS } from '../data/constants';
import { Circuit, Compound, Driver, DriverResult, RaceLength, RaceResultRecord, RaceState, SessionKind, Team } from '../types';
import { Rng } from '../engine/rng';
import { QualiResult, QualiSegment, simulateKnockout } from '../engine/qualifying';
import { finalizeRace, finalizeSprint, prizeFor } from '../engine/results';
import { generateWeather } from '../engine/weather';
import { scaledLaps } from '../engine/race';
import { applyGridPenalties } from '../engine/engines';
import { feedbackFor, generateSetupContext, qualityOf, SetupValues, SliderFeedback } from '../engine/setup';
import { staffEffects, StaffEffects } from '../engine/staff';
import { PRACTICE_RUNS, SETUP_BASE_QUALITY, SETUP_LAP_BONUS_MAX, SETUP_MAX, SETUP_MIN, SETUP_SLIDERS, SPRINT_LAP_FRACTION } from '../data/constants';
import { clearLive, loadLive, saveLive } from '../services/livePersistence';
import { useRaceSim } from '../hooks/useRaceSim';
import { TimingTower } from '../components/TimingTower';
import { EventFeed } from '../components/EventFeed';
import { PitControls } from '../components/PitControls';
import { StrategyEngineer } from '../components/StrategyEngineer';
import { TrackMap } from '../components/TrackMap';
import { Button, Card, SectionTitle, StatusPill, formatLapTime, money } from '../components/ui';
import { IconPlay, IconPause } from '../components/icons';

type Step = 'practice' | 'quali' | 'sprint' | 'sprintResults' | 'race' | 'results';

export const RaceWeekend = () => {
    const { game, dispatch } = useActiveGame();
    const navigate = useNavigate();

    // Se fija al montar: tras RACE_COMPLETED el índice del juego ya apunta a la siguiente.
    const [raceIndex] = useState(game.raceIndex);
    // Guardado en vivo: si hay una sesión a medias de ESTE fin de semana, se ofrece reanudar.
    const [live] = useState(() => loadLive(game.season, game.raceIndex));
    const [seed] = useState(() => live?.seed ?? Math.floor(Math.random() * 2 ** 31));
    const [step, setStep] = useState<Step>('practice');
    const [record, setRecord] = useState<RaceResultRecord | null>(null);
    const [sprintResult, setSprintResult] = useState<DriverResult[] | null>(live?.sprintResult ?? null);
    const [startCompound, setStartCompound] = useState<Compound>(live?.startCompound ?? 'medium');
    const [setups, setSetups] = useState<Record<string, number> | null>(live?.setups ?? null);
    const [resumeState, setResumeState] = useState<RaceState | null>(null);
    const [showResume, setShowResume] = useState(live !== null);

    const circuit = CIRCUITS[raceIndex];
    const isSprint = circuit?.sprint === true;
    // Seeds por sesión: quali=seed, sprint=seed+1, carrera=seed+2 (o seed+1 sin sprint).
    const raceSeed = isSprint ? seed + 2 : seed + 1;

    // Contexto de setup del finde (ideal oculto + calidades IA), stream propio.
    const setupCtx = useMemo(
        () => generateSetupContext(seed, game.teams, game.drivers, game.playerTeamId),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [seed],
    );

    // Efectos del personal por equipo (estables durante el fin de semana).
    const staffFx = useMemo(() => {
        const fx: Record<string, StaffEffects> = {};
        for (const t of Object.values(game.teams)) fx[t.id] = staffEffects(t, game.staff);
        return fx;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const knockout = useMemo(() => {
        const noiseMults: Record<string, number> = {};
        for (const [id, fx] of Object.entries(staffFx)) noiseMults[id] = fx.qualiNoiseMult;
        return simulateKnockout(game.teams, game.drivers, circuit, new Rng(seed), setups ?? undefined, noiseMults);
        // la parrilla se calcula una vez, tras confirmar el setup
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seed, setups]);
    const grid = knockout.grid;

    const mods = useMemo(() => {
        const m: RaceState['mods'] = {};
        for (const teamId of Object.keys(game.teams)) {
            const q = setups?.[teamId] ?? SETUP_BASE_QUALITY;
            m[teamId] = { setupLapDelta: -SETUP_LAP_BONUS_MAX * q, pitLossDelta: staffFx[teamId].pitLossDelta };
        }
        return m;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setups]);

    const confirmSetup = (quality: number) => {
        setSetups({ ...setupCtx.aiQuality, [game.playerTeamId]: quality });
        setStep('quali');
    };
    // Mismo seed y orden de draws que createRaceState → el pronóstico refleja la carrera real.
    const forecast = useMemo(
        () => generateWeather(circuit, scaledLaps(circuit, game.raceLength), new Rng(raceSeed)),
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
    // Se aplican las sanciones de motor (pilotos penalizados al fondo).
    const raceGrid: QualiResult[] = applyGridPenalties(
        isSprint && sprintResult
            ? sprintResult.map(r => ({ driverId: r.driverId, teamId: r.teamId, time: 0 }))
            : grid,
        game.drivers,
    );

    const onSprintFinished = (raceState: RaceState) => {
        const res = finalizeSprint(raceState);
        setSprintResult(res);
        saveLive({ season: game.season, raceIndex, seed, step: 'sprintResults', startCompound, sprintResult: res, raceState: null, setups });
        setStep('sprintResults');
    };

    const onRaceFinished = (raceState: RaceState) => {
        const rec = finalizeRace(raceState, raceIndex, game.season, grid[0].driverId);
        if (sprintResult) rec.sprintClassification = sprintResult;
        setRecord(rec);
        clearLive();
        dispatch({ type: 'RACE_COMPLETED', record: rec });
        setStep('results');
    };

    const saveLap = (liveStep: 'sprint' | 'race') => (state: RaceState) => {
        saveLive({ season: game.season, raceIndex, seed, step: liveStep, startCompound, sprintResult, raceState: state, setups });
    };

    const resumeNow = () => {
        if (!live) return;
        setResumeState(live.raceState);
        setStep(live.step);
        setShowResume(false);
    };

    const discardLive = () => {
        clearLive();
        setSprintResult(null);
        setShowResume(false);
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

            {showResume && live && (
                <Card className="mb-4 border-pit-yellow/50 flex items-center justify-between gap-3">
                    <div>
                        <p className="font-bold text-sm">Sesión a medias encontrada</p>
                        <p className="text-xs text-text-sub">
                            {live.raceState
                                ? `${live.step === 'sprint' ? 'Sprint' : 'Carrera'} en la vuelta ${live.raceState.lap}/${live.raceState.totalLaps}.`
                                : 'Sprint completado, carrera pendiente.'}
                        </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <Button onClick={resumeNow}>Reanudar</Button>
                        <Button variant="ghost" onClick={discardLive}>Descartar</Button>
                    </div>
                </Card>
            )}
            {step === 'practice' && (
                <PracticeScreen
                    ideal={setupCtx.ideal}
                    feedbackSeeds={setupCtx.feedbackSeeds}
                    reSkill={staffFx[game.playerTeamId].reSkill}
                    onConfirm={q => { setShowResume(false); confirmSetup(q); }}
                />
            )}
            {step === 'quali' && (
                <QualiScreen grid={grid} segmentOf={knockout.segmentOf} cuts={knockout.cuts}
                    teams={game.teams} drivers={game.drivers}
                    playerTeamId={game.playerTeamId} forecast={forecast}
                    setupQuality={setups?.[game.playerTeamId] ?? SETUP_BASE_QUALITY}
                    startCompound={startCompound} onStartCompound={setStartCompound}
                    startLabel={isSprint ? '🏁 Comenzar sprint' : '🏁 Comenzar carrera'}
                    onStart={() => { setShowResume(false); setStep(isSprint ? 'sprint' : 'race'); }} />
            )}
            {step === 'sprint' && (
                <SessionRunner kind="sprint" grid={grid} circuit={circuit} teams={game.teams} drivers={game.drivers}
                    playerTeamId={game.playerTeamId} seed={seed + 1} mods={mods} raceLength={game.raceLength}
                    lapsOverride={Math.max(5, Math.round(scaledLaps(circuit, game.raceLength) * SPRINT_LAP_FRACTION))}
                    startCompound={startCompound} initial={resumeState} onLap={saveLap('sprint')}
                    onFinished={onSprintFinished} />
            )}
            {step === 'sprintResults' && sprintResult && (
                <SprintResults classification={sprintResult} teams={game.teams} drivers={game.drivers}
                    playerTeamId={game.playerTeamId} onContinue={() => setStep('race')} />
            )}
            {step === 'race' && (
                <SessionRunner kind="race" grid={raceGrid} circuit={circuit} teams={game.teams} drivers={game.drivers}
                    playerTeamId={game.playerTeamId} seed={raceSeed} mods={mods} raceLength={game.raceLength}
                    startCompound={startCompound} initial={resumeState} onLap={saveLap('race')}
                    onFinished={onRaceFinished} />
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
                    className={`relative flex items-center gap-2 pl-3 pr-3 py-1.5 text-sm border-b border-border-dark/40 last:border-0 ${r.teamId === playerTeamId ? 'bg-f1-red/10' : ''} ${r.dnf ? 'opacity-40' : ''}`}>
                    {r.teamId === playerTeamId && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-f1-red" />}
                    <span className={`w-6 text-center font-display font-bold text-base tabular-nums ${r.position === 1 ? 'text-pit-yellow' : 'text-text-main'}`}>{r.position ?? '—'}</span>
                    <span className="w-1 h-6 rounded-full shrink-0" style={{ background: teams[r.teamId].color }} />
                    <span className="flex-1 font-semibold truncate">{drivers[r.driverId].name}</span>
                    {r.dnf ? <span className="font-display text-danger text-xs font-bold w-12 text-right">DNF</span>
                        : <span className="w-12 text-right font-display font-bold text-lg tabular-nums">{r.points > 0 ? `+${r.points}` : ''}</span>}
                </div>
            ))}
        </div>
        <p className="text-xs text-text-sub">El resultado del sprint define la parrilla de la carrera del domingo.</p>
        <Button onClick={onContinue} className="w-full py-3">Continuar a la carrera →</Button>
    </div>
);

const FORECAST_ICON = (w: number) => (w < 0.05 ? '☀️' : w < TO_INTER_WETNESS ? '🌦️' : '🌧️');

const FEEDBACK_UI: Record<SliderFeedback, { icon: string; label: string; cls: string }> = {
    up: { icon: '▲', label: 'subir', cls: 'text-pit-yellow' },
    down: { icon: '▼', label: 'bajar', cls: 'text-pit-yellow' },
    ok: { icon: '✓', label: 'bien', cls: 'text-gap-green' },
};

// Práctica libre: encuentra el setup ideal con tandas limitadas de feedback.
const PracticeScreen = ({ ideal, feedbackSeeds, reSkill, onConfirm }: {
    ideal: number[];
    feedbackSeeds: number[];
    reSkill: number;
    onConfirm: (quality: number) => void;
}) => {
    const [values, setValues] = useState<SetupValues>(SETUP_SLIDERS.map(() => 5));
    const [runsUsed, setRunsUsed] = useState(0);
    const [feedback, setFeedback] = useState<SliderFeedback[] | null>(null);

    const runPractice = () => {
        if (runsUsed >= PRACTICE_RUNS) return;
        setFeedback(feedbackFor(values, ideal, reSkill, feedbackSeeds[runsUsed]));
        setRunsUsed(runsUsed + 1);
    };

    const quality = qualityOf(values, ideal);

    return (
        <div className="space-y-4">
            <SectionTitle>Práctica libre · Setup</SectionTitle>
            <Card>
                <p className="text-xs text-text-sub mb-4">
                    Ajusta el coche y rueda tandas de libres: tus pilotos te dirán por dónde van los ajustes.
                    Un buen setup vale décimas durante todo el fin de semana. Tienes {PRACTICE_RUNS} tandas.
                </p>
                <div className="space-y-4">
                    {SETUP_SLIDERS.map((s, i) => (
                        <div key={s.key}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-semibold">{s.label}</span>
                                <span className="tabular-nums flex items-center gap-2">
                                    {feedback && (
                                        <span className={`text-xs font-bold ${FEEDBACK_UI[feedback[i]].cls}`}>
                                            {FEEDBACK_UI[feedback[i]].icon} {FEEDBACK_UI[feedback[i]].label}
                                        </span>
                                    )}
                                    {values[i]}
                                </span>
                            </div>
                            <input
                                type="range"
                                min={SETUP_MIN}
                                max={SETUP_MAX}
                                value={values[i]}
                                onChange={e => {
                                    const next = [...values];
                                    next[i] = Number(e.target.value);
                                    setValues(next);
                                    setFeedback(null); // el feedback era para los valores anteriores
                                }}
                                className="w-full accent-[#e10600]"
                            />
                        </div>
                    ))}
                </div>
            </Card>
            <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" disabled={runsUsed >= PRACTICE_RUNS} onClick={runPractice}>
                    🔧 Rodar libres ({PRACTICE_RUNS - runsUsed})
                </Button>
                <Button className="flex-1" onClick={() => onConfirm(quality)}>
                    Confirmar setup →
                </Button>
            </div>
            <button onClick={() => onConfirm(SETUP_BASE_QUALITY)} className="w-full text-xs text-text-sub underline hover:text-text-main">
                Saltar y usar setup base
            </button>
        </div>
    );
};

const SEGMENT_TONE: Record<QualiSegment, string> = {
    Q3: 'text-fastest-purple',
    Q2: 'text-weather-blue',
    Q1: 'text-text-dim',
};

const QualiScreen = ({ grid, segmentOf, cuts, teams, drivers, playerTeamId, forecast, setupQuality, startCompound, onStartCompound, startLabel, onStart }: {
    grid: QualiResult[];
    segmentOf: Record<string, QualiSegment>;
    cuts: [number, number];
    teams: Record<string, Team>;
    drivers: Record<string, Driver>;
    playerTeamId: string;
    forecast: number[];
    setupQuality: number;
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
        <div className="flex items-center justify-between">
            <SectionTitle>Clasificación</SectionTitle>
            <span className={`text-xs font-bold ${setupQuality >= 0.75 ? 'text-gap-green' : setupQuality >= 0.45 ? 'text-pit-yellow' : 'text-danger'}`}>
                Setup: {setupQuality >= 0.75 ? 'óptimo' : setupQuality >= 0.45 ? 'aceptable' : 'flojo'}
            </span>
        </div>
        <div className="bg-card-darker rounded-2xl border border-border-dark overflow-hidden">
            {grid.map((q, i) => {
                const seg = segmentOf[q.driverId] ?? 'Q1';
                const divider = i === cuts[1]
                    ? `Eliminados en Q2 · P${cuts[1] + 1}-${cuts[0]}`
                    : i === cuts[0]
                        ? `Eliminados en Q1 · P${cuts[0] + 1}+`
                        : null;
                return (
                    <React.Fragment key={q.driverId}>
                        {divider && (
                            <div className="px-3 py-1 bg-card-darker border-y border-border-dark/60">
                                <span className="font-display text-[10px] font-bold uppercase tracking-widest text-text-dim">{divider}</span>
                            </div>
                        )}
                        <div className={`relative flex items-center gap-2 pl-3 pr-3 py-1.5 text-sm border-b border-border-dark/40 last:border-0 ${q.teamId === playerTeamId ? 'bg-f1-red/10' : ''}`}>
                            {q.teamId === playerTeamId && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-f1-red" />}
                            <span className={`w-6 text-center font-display font-bold text-base tabular-nums ${i === 0 ? 'text-pit-yellow' : 'text-text-main'}`}>{i + 1}</span>
                            <span className="w-1 h-6 rounded-full shrink-0" style={{ background: teams[q.teamId].color }} />
                            <span className="w-11 font-display font-bold text-base tracking-wide">{drivers[q.driverId].shortCode}</span>
                            <span className="flex-1 text-text-sub text-xs truncate">{teams[q.teamId].shortName}</span>
                            <span className="font-display tabular-nums text-xs">{formatLapTime(q.time)}</span>
                            <span className={`w-10 text-right font-display text-[10px] font-bold tracking-wide ${i === 0 ? 'text-pit-yellow' : SEGMENT_TONE[seg]}`}>
                                {i === 0 ? 'POLE' : seg}
                            </span>
                        </div>
                    </React.Fragment>
                );
            })}
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
                    Compuesto de salida {wetStart && <span className="text-weather-blue">(salida en mojado: I/W forzado)</span>}
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

const SessionRunner = ({ kind, grid, circuit, teams, drivers, playerTeamId, seed, lapsOverride, startCompound, mods, raceLength, initial, onLap, onFinished }: {
    kind: SessionKind;
    grid: QualiResult[];
    circuit: Circuit;
    teams: Record<string, Team>;
    drivers: Record<string, Driver>;
    playerTeamId: string;
    seed: number;
    lapsOverride?: number;
    startCompound: Compound;
    mods: RaceState['mods'];
    raceLength: RaceLength;
    initial?: RaceState | null;
    onLap?: (state: RaceState) => void;
    onFinished: (raceState: RaceState) => void;
}) => {
    const { race, paused, setPaused, speedIdx, setSpeedIdx, queuePit, setPaceMode, setErsMode, requestSwap } = useRaceSim(
        grid, circuit, teams, drivers, playerTeamId, seed,
        { kind, lapsOverride, playerStartCompound: startCompound, mods, raceLength, initial, onLap });
    const finished = race.phase === 'finished';
    const wetness = race.weather.wetness[Math.min(race.lap, race.weather.wetness.length - 1)];

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 bg-card-dark border border-border-dark rounded-2xl px-3 py-2 shadow-panel">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="font-display font-bold tabular-nums text-lg leading-none whitespace-nowrap">
                        <span className="text-text-dim text-xs align-middle mr-1">V</span>
                        {Math.min(race.lap + (finished ? 0 : 1), race.totalLaps)}
                        <span className="text-text-dim">/{race.totalLaps}</span>
                        {!finished && <span className="ml-1.5 text-text-sub text-xs">S{race.sector + 1}</span>}
                    </span>
                    <div className="flex items-center gap-1 overflow-hidden">
                        {kind === 'sprint' && <StatusPill tone="yellow">Sprint</StatusPill>}
                        {race.phase === 'safetyCar' && <StatusPill tone="yellow" pulse>SC</StatusPill>}
                        {race.phase === 'vsc' && <StatusPill tone="yellow" pulse>VSC</StatusPill>}
                        {wetness >= 0.05 && <StatusPill tone="blue">🌧 {Math.round(wetness * 100)}%</StatusPill>}
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {!finished && (
                        <>
                            <button onClick={() => setPaused(!paused)} aria-label={paused ? 'Reanudar' : 'Pausar'}
                                className="flex items-center justify-center w-8 h-8 rounded-lg bg-card-darker border border-border-dark hover:border-f1-red transition-colors">
                                {paused ? <IconPlay size={16} /> : <IconPause size={16} />}
                            </button>
                            <div className="flex items-center rounded-lg border border-border-dark overflow-hidden">
                                {TICK_SPEEDS.map((s, i) => (
                                    <button key={s.label} onClick={() => setSpeedIdx(i)}
                                        className={`font-display px-2.5 py-1.5 text-xs font-bold transition-colors ${speedIdx === i ? 'bg-f1-red text-white' : 'bg-card-darker text-text-sub hover:text-text-main'}`}>
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                    {finished && <Button size="sm" onClick={() => onFinished(race)}>Ver resultados →</Button>}
                </div>
            </div>

            {/* Orden en móvil: mapa → muro de boxes (accionable) → torre → feed. */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                <div className="lg:col-span-3 lg:row-start-1 order-1">
                    <TrackMap race={race} teams={teams} drivers={drivers} playerTeamId={playerTeamId}
                        tickMs={TICK_SPEEDS[speedIdx].ms} paused={paused} avgLapSec={circuit.baseLapSec} />
                </div>
                <div className="lg:col-span-2 lg:row-start-1 lg:col-start-4 order-2 space-y-3">
                    <PitControls race={race} playerTeamId={playerTeamId} drivers={drivers}
                        onQueuePit={queuePit} onPaceMode={setPaceMode} onErsMode={setErsMode} onSwap={requestSwap} />
                    {!finished && <StrategyEngineer race={race} circuit={circuit} drivers={drivers} playerTeamId={playerTeamId} />}
                </div>
                <div className="lg:col-span-3 lg:row-start-2 lg:col-start-1 order-3">
                    <TimingTower race={race} teams={teams} drivers={drivers} playerTeamId={playerTeamId} />
                </div>
                <div className="lg:col-span-2 lg:row-start-2 lg:col-start-4 order-4">
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
                        className={`relative flex items-center gap-2 pl-3 pr-3 py-1.5 text-sm border-b border-border-dark/40 last:border-0 ${r.teamId === playerTeamId ? 'bg-f1-red/10' : ''} ${r.dnf ? 'opacity-40' : ''}`}>
                        {r.teamId === playerTeamId && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-f1-red" />}
                        <span className={`w-6 text-center font-display font-bold text-base tabular-nums ${r.position === 1 ? 'text-pit-yellow' : 'text-text-main'}`}>{r.position ?? '—'}</span>
                        <span className="w-1 h-6 rounded-full shrink-0" style={{ background: teams[r.teamId].color }} />
                        <span className="flex-1 font-semibold truncate">
                            {drivers[r.driverId].name}
                            {r.fastestLap && <span className="ml-1 font-display text-fastest-purple text-xs font-bold">VR</span>}
                        </span>
                        <span className="text-xs text-text-sub hidden sm:block">{teams[r.teamId].shortName}</span>
                        {r.dnf ? <span className="font-display text-danger text-xs font-bold w-12 text-right">DNF</span>
                            : <span className="w-12 text-right font-display font-bold text-lg tabular-nums">{r.points > 0 ? `+${r.points}` : ''}</span>}
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
