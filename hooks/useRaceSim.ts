import { useEffect, useState } from 'react';
import { Circuit, Compound, Driver, PaceMode, RaceState, Team } from '../types';
import { TICK_SPEEDS } from '../data/constants';
import { advanceLap, applyTeamOrderSwap, createRaceState, RaceOptions } from '../engine/race';
import { QualiResult } from '../engine/qualifying';

// Loop de ticks de la carrera en vivo.
export function useRaceSim(
    grid: QualiResult[],
    circuit: Circuit,
    teams: Record<string, Team>,
    drivers: Record<string, Driver>,
    playerTeamId: string,
    seed: number,
    opts: RaceOptions = {},
) {
    const [race, setRace] = useState<RaceState>(() => createRaceState(grid, circuit, playerTeamId, seed, opts));
    const [paused, setPaused] = useState(false);
    const [speedIdx, setSpeedIdx] = useState(0);

    const finished = race.phase === 'finished';

    useEffect(() => {
        if (paused || finished) return;
        const id = setInterval(() => {
            setRace(prev => advanceLap(prev, circuit, teams, drivers, playerTeamId));
        }, TICK_SPEEDS[speedIdx].ms);
        return () => clearInterval(id);
        // teams/drivers/circuit no cambian durante una carrera
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paused, speedIdx, finished]);

    const queuePit = (driverId: string, compound: Compound | null) => {
        setRace(prev => ({
            ...prev,
            cars: prev.cars.map(c =>
                c.driverId === driverId && c.teamId === playerTeamId && c.status === 'running'
                    ? { ...c, pendingPit: compound }
                    : c,
            ),
        }));
    };

    const setPaceMode = (driverId: string, paceMode: PaceMode) => {
        setRace(prev => ({
            ...prev,
            cars: prev.cars.map(c =>
                c.driverId === driverId && c.teamId === playerTeamId ? { ...c, paceMode } : c,
            ),
        }));
    };

    const requestSwap = () => {
        setRace(prev => (prev.phase === 'finished' ? prev : applyTeamOrderSwap(prev, playerTeamId)));
    };

    return { race, paused, setPaused, speedIdx, setSpeedIdx, queuePit, setPaceMode, requestSwap };
}
