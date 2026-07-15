import { RaceResultRecord, Team } from '../types';
import { carPerformance } from './performance';
import { Rng } from './rng';

export type MissionKind = 'top8' | 'points' | 'podium' | 'bothPoints' | 'beatRival' | 'leadLap';

export interface Mission {
    kind: MissionKind;
    label: string;
    reward: number;        // $M
    rivalTeamId?: string;
    rivalName?: string;
}

// Misiones de patrocinador de la carrera. Deterministas (mismo seed → mismas
// misiones), así se pueden mostrar antes de la carrera sin persistirlas.
export function generateMissions(
    season: number,
    raceIndex: number,
    playerTeamId: string,
    teams: Record<string, Team>,
): Mission[] {
    const rng = new Rng(season * 1000 + raceIndex + 1);
    const ranked = Object.values(teams).sort((a, b) => carPerformance(b.car) - carPerformance(a.car));
    const rank = ranked.findIndex(t => t.id === playerTeamId); // 0 = mejor coche
    // Rival: el equipo adyacente por rendimiento.
    const rivalTeam = ranked[rank <= 0 ? 1 : rank - 1] ?? ranked[0];

    const pool: Mission[] = [];
    if (rank <= 3) {
        pool.push({ kind: 'podium', label: 'Sube al podio', reward: 3 });
        pool.push({ kind: 'bothPoints', label: 'Los dos coches en puntos', reward: 2.5 });
        pool.push({ kind: 'leadLap', label: 'Gana la carrera', reward: 3.5 });
    } else if (rank <= 6) {
        pool.push({ kind: 'points', label: 'Termina en los puntos', reward: 2 });
        pool.push({ kind: 'bothPoints', label: 'Los dos coches en puntos', reward: 3 });
        pool.push({ kind: 'beatRival', label: `Bate a ${rivalTeam.shortName}`, reward: 2.5, rivalTeamId: rivalTeam.id, rivalName: rivalTeam.shortName });
    } else {
        pool.push({ kind: 'top8', label: 'Termina en el top 8', reward: 3 });
        pool.push({ kind: 'points', label: 'Termina en los puntos', reward: 2.5 });
        pool.push({ kind: 'beatRival', label: `Bate a ${rivalTeam.shortName}`, reward: 2, rivalTeamId: rivalTeam.id, rivalName: rivalTeam.shortName });
    }

    // Elige 2 sin repetir.
    const chosen: Mission[] = [];
    const idxs = pool.map((_, i) => i);
    for (let k = 0; k < 2 && idxs.length; k++) {
        const j = Math.floor(rng.next() * idxs.length);
        chosen.push(pool[idxs[j]]);
        idxs.splice(j, 1);
    }
    return chosen;
}

// Comprueba las misiones contra el resultado. Devuelve las cumplidas y el pago.
export function evaluateMissions(
    missions: Mission[],
    record: RaceResultRecord,
    playerTeamId: string,
): { completed: Mission[]; payout: number } {
    const player = record.classification.filter(r => r.teamId === playerTeamId);
    const bestPos = Math.min(...player.map(r => r.position ?? 99));
    const inPoints = (r: { position: number | null }) => r.position !== null && r.position <= 10;

    const met = (m: Mission): boolean => {
        switch (m.kind) {
            case 'top8': return bestPos <= 8;
            case 'points': return bestPos <= 10;
            case 'podium': return bestPos <= 3;
            case 'bothPoints': return player.length >= 2 && player.every(inPoints);
            case 'leadLap': return record.ledLapsDriverId !== undefined
                && player.some(r => r.driverId === record.ledLapsDriverId);
            case 'beatRival': {
                if (!m.rivalTeamId) return false;
                const rival = record.classification.filter(r => r.teamId === m.rivalTeamId);
                const rivalBest = Math.min(...rival.map(r => r.position ?? 99));
                return bestPos < rivalBest;
            }
        }
    };

    const completed = missions.filter(met);
    const payout = completed.reduce((s, m) => s + m.reward, 0);
    return { completed, payout };
}
