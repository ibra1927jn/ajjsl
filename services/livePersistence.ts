import { Compound, DriverResult, RaceState } from '../types';

// Estado vivo del fin de semana (carrera a medias). Clave separada del save
// principal; se descarta si no coincide con la partida — nunca se migra.
export const LIVE_VERSION = 5; // v5: ERS + compoundsUsed (regla de dos compuestos)
const KEY = 'f1m_live';

export interface LiveSave {
    version: number;
    season: number;
    raceIndex: number;
    seed: number;
    step: 'sprint' | 'sprintResults' | 'race';
    startCompound: Compound;
    sprintResult: DriverResult[] | null;
    raceState: RaceState | null;            // null en pantallas intermedias
    setups: Record<string, number> | null;  // calidad de setup por equipo
}

export function saveLive(save: Omit<LiveSave, 'version'>): void {
    try {
        localStorage.setItem(KEY, JSON.stringify({ ...save, version: LIVE_VERSION }));
    } catch {
        // sin almacenamiento: seguimos sin guardado en vivo
    }
}

export function loadLive(season: number, raceIndex: number): LiveSave | null {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as LiveSave;
        if (!parsed || parsed.version !== LIVE_VERSION) return null;
        if (parsed.season !== season || parsed.raceIndex !== raceIndex) return null;
        return parsed;
    } catch {
        return null;
    }
}

export function clearLive(): void {
    try {
        localStorage.removeItem(KEY);
    } catch {
        // nada que borrar
    }
}
