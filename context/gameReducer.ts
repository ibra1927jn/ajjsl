import { Driver, GameAction, GameState, Team } from '../types';
import { TEAMS } from '../data/teams';
import { DRIVERS } from '../data/drivers';
import { CIRCUITS } from '../data/circuits';
import { BOARD_START_PATIENCE, SPONSOR_PER_RACE, STAT_CAP } from '../data/constants';
import { prizeFor } from '../engine/results';
import { aiDevelop } from '../engine/development';
import { carPerformance } from '../engine/performance';
import { salaryPerRace } from '../engine/market';
import { computeTeamStandings } from '../engine/season';
import { SAVE_VERSION } from '../services/persistence';

// Bonus de presupuesto por posición final en el mundial de constructores.
const WCC_SEASON_BONUS = [40, 35, 30, 27, 24, 21, 18, 15, 12, 10];

export function createNewGame(playerTeamId: string): GameState {
    const teams: Record<string, Team> = {};
    for (const t of TEAMS) teams[t.id] = { ...t, car: { ...t.car }, driverIds: [...t.driverIds], devSpendSeason: 0 };
    const drivers: Record<string, Driver> = {};
    for (const d of DRIVERS) drivers[d.id] = { ...d };
    const ranked = Object.values(teams).sort((a, b) => carPerformance(b.car) - carPerformance(a.car));
    const targetPos = Math.max(1, ranked.findIndex(t => t.id === playerTeamId) + 1);
    return {
        saveVersion: SAVE_VERSION,
        playerTeamId,
        season: 2025,
        raceIndex: 0,
        teams,
        drivers,
        results: [],
        ledger: [],
        phase: 'preRace',
        board: { targetPos, patience: BOARD_START_PATIENCE },
        upgradeQueue: [],
    };
}

export function gameReducer(state: GameState | null, action: GameAction): GameState | null {
    switch (action.type) {
        case 'NEW_GAME':
            return createNewGame(action.playerTeamId);

        case 'LOAD_GAME':
            return action.state;

        case 'RESET':
            return null;
    }

    if (!state) return state;

    switch (action.type) {
        case 'RACE_COMPLETED': {
            const { record } = action;
            const circuit = CIRCUITS[record.raceIndex];
            const teams: Record<string, Team> = {};
            for (const [id, t] of Object.entries(state.teams)) {
                teams[id] = { ...t, car: { ...t.car }, driverIds: [...t.driverIds] };
            }
            const ledger = [...state.ledger];

            for (const team of Object.values(teams)) {
                let prize = 0;
                for (const r of record.classification) {
                    if (r.teamId === team.id) prize += prizeFor(r.position);
                }
                const sponsor = SPONSOR_PER_RACE[team.sponsorTier];
                const salaries = team.driverIds.reduce((sum, id) => sum + salaryPerRace(state.drivers[id]), 0);
                const income = prize + sponsor;
                team.budget = Math.round((team.budget + income - salaries) * 10) / 10;

                if (team.id === state.playerTeamId) {
                    ledger.push(
                        { raceIndex: record.raceIndex, label: `${circuit.name}: premios`, amount: prize },
                        { raceIndex: record.raceIndex, label: `${circuit.name}: patrocinio`, amount: sponsor },
                        { raceIndex: record.raceIndex, label: `${circuit.name}: salarios`, amount: -Math.round(salaries * 10) / 10 },
                    );
                } else {
                    aiDevelop(team, income); // la IA también desarrolla su coche
                }
            }

            const raceIndex = state.raceIndex + 1;
            return {
                ...state,
                teams,
                ledger,
                results: [...state.results, record],
                raceIndex,
                phase: raceIndex >= CIRCUITS.length ? 'postSeason' : 'preRace',
            };
        }

        case 'APPLY_UPGRADE': {
            const player = state.teams[state.playerTeamId];
            if (player.budget < action.cost || player.car[action.stat] + action.points > STAT_CAP) return state;
            const teams = {
                ...state.teams,
                [player.id]: {
                    ...player,
                    car: { ...player.car, [action.stat]: player.car[action.stat] + action.points },
                    budget: Math.round((player.budget - action.cost) * 10) / 10,
                },
            };
            return {
                ...state,
                teams,
                ledger: [...state.ledger, { raceIndex: state.raceIndex, label: `Mejora de ${action.stat} (+${action.points})`, amount: -action.cost }],
            };
        }

        case 'SWAP_DRIVER': {
            const player = state.teams[state.playerTeamId];
            const inDriver = state.drivers[action.inDriverId];
            const outDriver = state.drivers[action.outDriverId];
            if (!inDriver || inDriver.teamId !== null) return state;
            if (!outDriver || outDriver.teamId !== state.playerTeamId) return state;
            if (player.budget < action.signingFee) return state;

            const drivers = {
                ...state.drivers,
                [action.outDriverId]: { ...outDriver, teamId: null, contractYears: 0 },
                [action.inDriverId]: { ...inDriver, teamId: player.id, contractYears: 2 },
            };
            const teams = {
                ...state.teams,
                [player.id]: {
                    ...player,
                    budget: Math.round((player.budget - action.signingFee) * 10) / 10,
                    driverIds: player.driverIds.map(id => (id === action.outDriverId ? action.inDriverId : id)),
                },
            };
            return {
                ...state,
                teams,
                drivers,
                ledger: [...state.ledger, { raceIndex: state.raceIndex, label: `Fichaje de ${inDriver.name}`, amount: -action.signingFee }],
            };
        }

        case 'ADVANCE_SEASON': {
            if (state.phase !== 'postSeason') return state;
            const standings = computeTeamStandings(state.results);
            const teams: Record<string, Team> = {};
            for (const [id, t] of Object.entries(state.teams)) {
                const pos = standings.findIndex(s => s.teamId === id);
                const bonus = pos >= 0 && pos < WCC_SEASON_BONUS.length ? WCC_SEASON_BONUS[pos] : 10;
                teams[id] = { ...t, car: { ...t.car }, driverIds: [...t.driverIds], budget: Math.round((t.budget + bonus) * 10) / 10 };
            }
            const drivers: Record<string, Driver> = {};
            for (const [id, d] of Object.entries(state.drivers)) {
                // Renovación automática en v1: los contratos nunca bajan de 1 año.
                drivers[id] = { ...d, contractYears: d.teamId ? Math.max(1, d.contractYears - 1) : 0 };
            }
            const playerPos = standings.findIndex(s => s.teamId === state.playerTeamId);
            const playerBonus = playerPos >= 0 && playerPos < WCC_SEASON_BONUS.length ? WCC_SEASON_BONUS[playerPos] : 10;
            return {
                ...state,
                season: state.season + 1,
                raceIndex: 0,
                results: [],
                teams,
                drivers,
                phase: 'preRace',
                ledger: [...state.ledger, { raceIndex: 0, label: `Bonus FIA temporada ${state.season} (P${playerPos + 1} WCC)`, amount: playerBonus }],
            };
        }

        default:
            return state;
    }
}
