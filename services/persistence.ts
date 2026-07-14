import { GameState } from '../types';

export const SAVE_VERSION = 1;
const KEY = 'f1m_save';

// Migraciones futuras: version → función que transforma el estado antiguo.
const migrations: Record<number, (old: unknown) => unknown> = {};

export function saveGame(state: GameState): void {
    try {
        localStorage.setItem(KEY, JSON.stringify({ version: SAVE_VERSION, state }));
    } catch {
        // almacenamiento lleno o no disponible: el juego sigue sin autosave
    }
}

export function loadGame(): GameState | null {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
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

export function clearSave(): void {
    try {
        localStorage.removeItem(KEY);
    } catch {
        // sin acceso a localStorage: nada que borrar
    }
}
