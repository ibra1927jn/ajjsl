import { CircuitRecord, DriverCareer, Driver, GameState, RaceResultRecord, Team } from '../types';
import { carPerformance } from '../engine/performance';
import { freshEngine } from '../engine/driverInit';
import { applyRaceToRecords } from '../engine/records';
import { BOARD_START_PATIENCE, BOARD_TARGET_SLACK } from '../data/constants';
import { DEFAULT_AGE, DEFAULT_MORALE, DRIVER_AGES } from '../data/driverAges';
import { DRIVER_TRAITS, defaultFacilities } from '../data/driverTraits';
import { initialStaffAssignment } from '../data/staff';
import { clearLive } from './livePersistence';

export const SAVE_VERSION = 5;
const KEY = 'f1m_save';

// Reconstruye records de vuelta y estadísticas de piloto desde los resultados
// existentes (para que un save v3 a mitad de carrera conserve su historia).
function buildRecordsFromResults(results: RaceResultRecord[], teams: GameState['teams'], drivers: GameState['drivers']) {
    const records: Record<string, CircuitRecord> = {};
    const driverRecords: Record<string, DriverCareer> = {};
    for (const r of results) applyRaceToRecords(records, driverRecords, r, drivers, teams);
    return { records, driverRecords };
}

// Migraciones: version → función que transforma el estado de esa versión a la siguiente.
// Deben ser puramente aditivas (spread + defaults) para no perder datos del jugador.
const migrations: Record<number, (old: unknown) => unknown> = {
    // v1 → v2: junta directiva, cola de fabricación y contador de cost cap.
    1: (old) => {
        const s = old as GameState;
        const teams: Record<string, Team> = {};
        for (const [id, t] of Object.entries(s.teams)) {
            teams[id] = { ...t, devSpendSeason: t.devSpendSeason ?? 0 };
        }
        const ranked = Object.values(teams)
            .sort((a, b) => carPerformance(b.car) - carPerformance(a.car));
        const targetPos = Math.min(10, Math.max(1, ranked.findIndex(t => t.id === s.playerTeamId) + 1 + BOARD_TARGET_SLACK));
        return {
            ...s,
            saveVersion: 2,
            teams,
            board: { targetPos, patience: BOARD_START_PATIENCE },
            upgradeQueue: [],
        };
    },
    // v2 → v3: dificultad, personal y palmarés (todos con defaults).
    2: (old) => {
        const s = old as GameState;
        const { staff, byTeam } = initialStaffAssignment();
        const teams: Record<string, Team> = {};
        for (const [id, t] of Object.entries(s.teams)) {
            teams[id] = { ...t, staffIds: t.staffIds ?? byTeam[id] ?? { td: null, re: null, pc: null } };
        }
        return {
            ...s,
            saveVersion: 3,
            teams,
            difficulty: s.difficulty ?? 'normal',
            staff: s.staff ?? staff,
            history: s.history ?? [],
        };
    },
    // v3 → v4: edad/moral/motor por piloto, duración, records e historia de pilotos.
    3: (old) => {
        const s = old as GameState;
        const drivers: Record<string, Driver> = {};
        for (const [id, d] of Object.entries(s.drivers)) {
            drivers[id] = {
                ...d,
                age: d.age ?? DRIVER_AGES[id] ?? DEFAULT_AGE,
                morale: d.morale ?? DEFAULT_MORALE,
                engine: d.engine ?? freshEngine(),
            };
        }
        const { records, driverRecords } = buildRecordsFromResults(s.results, s.teams, drivers);
        return {
            ...s,
            saveVersion: 4,
            drivers,
            raceLength: s.raceLength ?? 'medium',
            records: s.records ?? records,
            driverRecords: s.driverRecords ?? driverRecords,
        };
    },
    // v4 → v5: rasgos de piloto, instalaciones del equipo y varianza de I+D.
    4: (old) => {
        const s = old as GameState;
        const drivers: Record<string, Driver> = {};
        for (const [id, d] of Object.entries(s.drivers)) {
            drivers[id] = { ...d, traits: d.traits ?? DRIVER_TRAITS[id] ?? [] };
        }
        const teams: Record<string, Team> = {};
        for (const [id, t] of Object.entries(s.teams)) {
            teams[id] = { ...t, facilities: t.facilities ?? defaultFacilities(t.car) };
        }
        // Las mejoras en curso entregan lo previsto (varianza 0 → sin sorpresa retroactiva).
        const upgradeQueue = s.upgradeQueue.map(o => ({
            ...o, predicted: o.predicted ?? o.points, variance: o.variance ?? 0,
        }));
        return { ...s, saveVersion: 5, drivers, teams, upgradeQueue };
    },
};

export function saveGame(state: GameState): void {
    try {
        localStorage.setItem(KEY, JSON.stringify({ version: SAVE_VERSION, state }));
    } catch {
        // almacenamiento lleno o no disponible: el juego sigue sin autosave
    }
}

export function parseSave(raw: string): GameState | null {
    try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        let { version, state } = parsed as { version: number; state: unknown };
        while (version < SAVE_VERSION && migrations[version]) {
            state = migrations[version](state);
            version += 1;
        }
        if (version !== SAVE_VERSION || !state || typeof state !== 'object') return null;
        return state as GameState;
    } catch {
        return null;
    }
}

export function loadGame(): GameState | null {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? parseSave(raw) : null;
    } catch {
        return null;
    }
}

export function clearSave(): void {
    try {
        localStorage.removeItem(KEY);
    } catch {
        // sin acceso a localStorage: nada que borrar
    }
    clearLive(); // una carrera a medias sin partida no tiene sentido
}
