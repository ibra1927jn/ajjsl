import { Driver, GameAction, GameState, Team } from '../types';
import { TEAMS } from '../data/teams';
import { DRIVERS } from '../data/drivers';
import { CIRCUITS } from '../data/circuits';
import {
    BOARD_GRACE_RACES, BOARD_MET_BUDGET_BONUS, BOARD_SEASON_BONUS_PATIENCE, BOARD_START_PATIENCE,
    BOARD_TARGET_SLACK, DEV_COST_CAP,
    PATIENCE_GAIN_PER_RACE, PATIENCE_LOSS_CAP, PATIENCE_LOSS_PER_RACE,
    SPONSOR_PER_RACE, STAT_CAP, UPGRADE_LEAD_RACES,
} from '../data/constants';
import { prizeFor } from '../engine/results';
import { aiDevelop } from '../engine/development';
import { carPerformance } from '../engine/performance';
import {
    freeAgents, generateRookies, poachedSalary, retireWorstFreeAgents,
    runSillySeason, salaryPerRace, signingFee, signReplacementFA,
} from '../engine/market';
import { computeTeamStandings } from '../engine/season';
import { Rng } from '../engine/rng';
import { SAVE_VERSION } from '../services/persistence';

// Bonus de presupuesto por posición final en el mundial de constructores.
const WCC_SEASON_BONUS = [40, 35, 30, 27, 24, 21, 18, 15, 12, 10];

export function createNewGame(playerTeamId: string): GameState {
    const teams: Record<string, Team> = {};
    for (const t of TEAMS) teams[t.id] = { ...t, car: { ...t.car }, driverIds: [...t.driverIds], devSpendSeason: 0 };
    const drivers: Record<string, Driver> = {};
    for (const d of DRIVERS) drivers[d.id] = { ...d };
    const ranked = Object.values(teams).sort((a, b) => carPerformance(b.car) - carPerformance(a.car));
    const targetPos = Math.min(10, Math.max(1, ranked.findIndex(t => t.id === playerTeamId) + 1 + BOARD_TARGET_SLACK));
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

            // Mejoras del jugador que salen de fabricación.
            const player = teams[state.playerTeamId];
            const ready = state.upgradeQueue.filter(o => o.readyAtRace <= raceIndex);
            const pending = state.upgradeQueue.filter(o => o.readyAtRace > raceIndex);
            for (const order of ready) {
                player.car[order.stat] = Math.min(STAT_CAP, player.car[order.stat] + order.points);
                ledger.push({ raceIndex, label: `Mejora de ${order.stat} (+${order.points}) montada en el coche`, amount: 0 });
            }

            // La junta evalúa tras cada carrera contra el objetivo de constructores.
            // Periodo de gracia al inicio de temporada: los standings tempranos son ruido.
            const results = [...state.results, record];
            const wcc = computeTeamStandings(results);
            const playerWccPos = wcc.findIndex(s => s.teamId === state.playerTeamId) + 1;
            const shortfall = Math.max(0, playerWccPos - state.board.targetPos);
            const inGrace = results.length <= BOARD_GRACE_RACES;
            const patience = Math.max(0, Math.min(100,
                shortfall === 0
                    ? state.board.patience + PATIENCE_GAIN_PER_RACE
                    : inGrace
                        ? state.board.patience
                        : state.board.patience - Math.min(PATIENCE_LOSS_CAP, PATIENCE_LOSS_PER_RACE * shortfall)));
            const fired = patience <= 0;

            return {
                ...state,
                teams,
                ledger,
                results,
                raceIndex,
                upgradeQueue: pending,
                board: { ...state.board, patience },
                phase: fired ? 'gameOver' : raceIndex >= CIRCUITS.length ? 'postSeason' : 'preRace',
            };
        }

        case 'APPLY_UPGRADE': {
            // Encola la mejora: se cobra ya, pero tarda UPGRADE_LEAD_RACES en llegar al coche.
            const player = state.teams[state.playerTeamId];
            const queuedPoints = state.upgradeQueue
                .filter(o => o.stat === action.stat)
                .reduce((s, o) => s + o.points, 0);
            if (player.budget < action.cost) return state;
            if (player.devSpendSeason + action.cost > DEV_COST_CAP) return state;
            if (player.car[action.stat] + queuedPoints + action.points > STAT_CAP) return state;
            const teams = {
                ...state.teams,
                [player.id]: {
                    ...player,
                    budget: Math.round((player.budget - action.cost) * 10) / 10,
                    devSpendSeason: Math.round((player.devSpendSeason + action.cost) * 10) / 10,
                },
            };
            return {
                ...state,
                teams,
                upgradeQueue: [...state.upgradeQueue, {
                    stat: action.stat,
                    points: action.points,
                    cost: action.cost,
                    readyAtRace: state.raceIndex + UPGRADE_LEAD_RACES,
                }],
                ledger: [...state.ledger, { raceIndex: state.raceIndex, label: `Fabricación: mejora de ${action.stat} (+${action.points})`, amount: -action.cost }],
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

        case 'POACH_DRIVER': {
            // Comprar un piloto con contrato de otro equipo (cláusula de rescisión).
            const player = state.teams[state.playerTeamId];
            const inDriver = state.drivers[action.inDriverId];
            const outDriver = state.drivers[action.outDriverId];
            if (!inDriver || !inDriver.teamId || inDriver.teamId === state.playerTeamId) return state;
            if (!outDriver || outDriver.teamId !== state.playerTeamId) return state;
            if (player.budget < action.fee) return state;

            const victimId = inDriver.teamId;
            const drivers: Record<string, Driver> = {};
            for (const [id, d] of Object.entries(state.drivers)) drivers[id] = { ...d };
            const teams: Record<string, Team> = {};
            for (const [id, t] of Object.entries(state.teams)) {
                teams[id] = { ...t, car: { ...t.car }, driverIds: [...t.driverIds] };
            }

            drivers[inDriver.id] = { ...inDriver, teamId: player.id, contractYears: 2, salary: poachedSalary(inDriver) };
            drivers[outDriver.id] = { ...outDriver, teamId: null, contractYears: 0 };
            teams[player.id].driverIds = teams[player.id].driverIds.map(id => (id === outDriver.id ? inDriver.id : id));
            teams[player.id].budget = Math.round((teams[player.id].budget - action.fee) * 10) / 10;
            const victim = teams[victimId];
            victim.driverIds = victim.driverIds.filter(id => id !== inDriver.id);
            victim.budget = Math.round((victim.budget + action.fee) * 10) / 10;
            signReplacementFA(victim, drivers); // la víctima repone al instante

            return {
                ...state,
                teams,
                drivers,
                ledger: [...state.ledger, { raceIndex: state.raceIndex, label: `Cláusula de ${inDriver.name} (${victim.shortName})`, amount: -action.fee }],
            };
        }

        case 'RENEW_DRIVER': {
            const player = state.teams[state.playerTeamId];
            const driver = state.drivers[action.driverId];
            if (!driver || driver.teamId !== state.playerTeamId) return state;
            if (player.budget < action.fee) return state;
            return {
                ...state,
                drivers: {
                    ...state.drivers,
                    [driver.id]: { ...driver, contractYears: driver.contractYears + 2 },
                },
                teams: {
                    ...state.teams,
                    [player.id]: { ...player, budget: Math.round((player.budget - action.fee) * 10) / 10 },
                },
                ledger: [...state.ledger, { raceIndex: state.raceIndex, label: `Renovación de ${driver.name} (+2 años)`, amount: -action.fee }],
            };
        }

        case 'ADVANCE_SEASON': {
            if (state.phase !== 'postSeason') return state;
            const standings = computeTeamStandings(state.results);
            const teams: Record<string, Team> = {};
            for (const [id, t] of Object.entries(state.teams)) {
                const pos = standings.findIndex(s => s.teamId === id);
                const bonus = pos >= 0 && pos < WCC_SEASON_BONUS.length ? WCC_SEASON_BONUS[pos] : 10;
                // El cost cap se resetea con la temporada.
                teams[id] = { ...t, car: { ...t.car }, driverIds: [...t.driverIds], budget: Math.round((t.budget + bonus) * 10) / 10, devSpendSeason: 0 };
            }
            // Las mejoras aún en fabricación se montan al arrancar la nueva temporada.
            for (const order of state.upgradeQueue) {
                const player = teams[state.playerTeamId];
                player.car[order.stat] = Math.min(STAT_CAP, player.car[order.stat] + order.points);
            }
            const drivers: Record<string, Driver> = {};
            for (const [id, d] of Object.entries(state.drivers)) drivers[id] = { ...d };
            const news: string[] = [];
            const rng = new Rng(state.season);

            // Los contratos expiran de verdad: a 0 años, el piloto queda libre.
            for (const d of Object.values(drivers)) {
                if (!d.teamId) continue;
                d.contractYears -= 1;
                if (d.contractYears <= 0) {
                    const team = teams[d.teamId];
                    team.driverIds = team.driverIds.filter(id => id !== d.id);
                    news.push(`${d.name} queda libre al expirar su contrato con ${team.shortName}.`);
                    d.teamId = null;
                    d.contractYears = 0;
                }
            }

            // Nuevos rookies entran al mercado.
            for (const rookie of generateRookies(state.season + 1, drivers, rng)) {
                drivers[rookie.id] = rookie;
                news.push(`${rookie.name} llega a la F1 como agente libre.`);
            }

            // Red de seguridad del jugador: nunca se queda con menos de 2 pilotos.
            const playerTeam = teams[state.playerTeamId];
            while (playerTeam.driverIds.length < 2) {
                const pool = freeAgents(drivers).sort((a, b) => signingFee(a) - signingFee(b));
                if (pool.length === 0) break;
                const pick = pool[0];
                drivers[pick.id] = { ...pick, teamId: playerTeam.id, contractYears: 1 };
                playerTeam.driverIds.push(pick.id);
                playerTeam.budget = Math.round((playerTeam.budget - signingFee(pick)) * 10) / 10;
                news.push(`${playerTeam.shortName} ficha de urgencia a ${pick.name}.`);
            }

            // Silly season de la IA y retiradas del fondo del pool.
            news.push(...runSillySeason(teams, drivers, state.playerTeamId, rng));
            news.push(...retireWorstFreeAgents(drivers));
            const playerPos = standings.findIndex(s => s.teamId === state.playerTeamId);
            const playerBonus = playerPos >= 0 && playerPos < WCC_SEASON_BONUS.length ? WCC_SEASON_BONUS[playerPos] : 10;
            const ledger = [...state.ledger, { raceIndex: 0, label: `Bonus FIA temporada ${state.season} (P${playerPos + 1} WCC)`, amount: playerBonus }];

            // Veredicto de la junta y nuevo objetivo según el coche de la nueva temporada.
            const metTarget = playerPos + 1 <= state.board.targetPos;
            let patience = state.board.patience;
            if (metTarget) {
                patience = Math.min(100, patience + BOARD_SEASON_BONUS_PATIENCE);
                teams[state.playerTeamId].budget = Math.round((teams[state.playerTeamId].budget + BOARD_MET_BUDGET_BONUS) * 10) / 10;
                ledger.push({ raceIndex: 0, label: 'Bonus de la junta por cumplir el objetivo', amount: BOARD_MET_BUDGET_BONUS });
            }
            const ranked = Object.values(teams).sort((a, b) => carPerformance(b.car) - carPerformance(a.car));
            const targetPos = Math.min(10, Math.max(1, ranked.findIndex(t => t.id === state.playerTeamId) + 1 + BOARD_TARGET_SLACK));

            return {
                ...state,
                season: state.season + 1,
                raceIndex: 0,
                results: [],
                teams,
                drivers,
                phase: 'preRace',
                upgradeQueue: [],
                board: { targetPos, patience },
                news,
                ledger,
            };
        }

        default:
            return state;
    }
}
