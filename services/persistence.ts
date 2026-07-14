import { GameState, Team } from '../types';
import { carPerformance } from '../engine/performance';
import { BOARD_START_PATIENCE } from '../data/constants';

export const SAVE_VERSION = 2;
const KEY = 'f1m_save';

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
        const targetPos = Math.max(1, ranked.findIndex(t => t.id === s.playerTeamId) + 1);
        return {
            ...s,
            saveVersion: 2,
            teams,
            board: { targetPos, patience: BOARD_START_PATIENCE },
            upgradeQueue: [],
        };
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
}
