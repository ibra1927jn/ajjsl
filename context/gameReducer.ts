import { Difficulty, Driver, GameAction, GameState, RaceLength, StaffMember, Team } from '../types';
import { hydrateDriver } from '../engine/driverInit';
import { wearEngine, fitNewEngine } from '../engine/engines';
import { ageAndProgress } from '../engine/progression';
import { applyRaceMorale } from '../engine/morale';
import { generateMissions, evaluateMissions } from '../engine/missions';
import { generateDecisionEvent } from '../engine/events';
import { applyRaceToRecords } from '../engine/records';
import { TEAMS } from '../data/teams';
import { DRIVERS } from '../data/drivers';
import { defaultFacilities } from '../data/driverTraits';
import { CIRCUITS } from '../data/circuits';
import { initialStaffAssignment } from '../data/staff';
import {
    BOARD_GRACE_RACES, BOARD_MET_BUDGET_BONUS, BOARD_SEASON_BONUS_PATIENCE, BOARD_START_PATIENCE,
    BOARD_TARGET_SLACK, DEV_COST_CAP, devCostCap, DIFFICULTY, MORALE_RENEW,
    PATIENCE_GAIN_PER_RACE, PATIENCE_LOSS_CAP, PATIENCE_LOSS_PER_RACE,
    REG_BASE_SEASON, REG_KEEP, REG_SHAKE_SD, REGULATION_PERIOD,
    SPONSOR_PER_RACE, STAT_CAP, UPGRADE_LEAD_RACES,
    UPGRADE_VARIANCE_BASE, WIND_TUNNEL_VARIANCE_CUT, FACILITY_COST, FACILITY_MAX, FACTORY_LEAD_L5,
} from '../data/constants';
import { prizeFor } from '../engine/results';
import { aiDevelop } from '../engine/development';
import { carPerformance } from '../engine/performance';
import {
    freeAgents, generateRookies, poachedSalary, retireWorstFreeAgents,
    runSillySeason, salaryPerRace, signingFee, signReplacementFA,
} from '../engine/market';
import { computeDriverStandings, computeTeamStandings } from '../engine/season';
import { freeStaff, staffEffects, staffSalaryPerRace, staffSigningFee } from '../engine/staff';
import { Rng } from '../engine/rng';
import { SAVE_VERSION } from '../services/persistence';

// Bonus de presupuesto por posición final en el mundial de constructores.
const WCC_SEASON_BONUS = [40, 35, 30, 27, 24, 21, 18, 15, 12, 10];

export function createNewGame(playerTeamId: string, difficulty: Difficulty = 'normal', raceLength: RaceLength = 'medium'): GameState {
    const { staff, byTeam } = initialStaffAssignment();
    const teams: Record<string, Team> = {};
    for (const t of TEAMS) {
        teams[t.id] = { ...t, car: { ...t.car }, driverIds: [...t.driverIds], devSpendSeason: 0, staffIds: byTeam[t.id], facilities: defaultFacilities(t.car) };
    }
    teams[playerTeamId].budget = Math.round(teams[playerTeamId].budget * DIFFICULTY[difficulty].budgetMult * 10) / 10;
    const drivers: Record<string, Driver> = {};
    for (const d of DRIVERS) drivers[d.id] = hydrateDriver(d);
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
        difficulty,
        staff,
        history: [],
        raceLength,
        records: {},
        driverRecords: {},
    };
}

export function gameReducer(state: GameState | null, action: GameAction): GameState | null {
    switch (action.type) {
        case 'NEW_GAME':
            return createNewGame(action.playerTeamId, action.difficulty ?? 'normal', action.raceLength ?? 'medium');

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
                const salaries = team.driverIds.reduce((sum, id) => sum + salaryPerRace(state.drivers[id]), 0)
                    + staffSalaryPerRace(team, state.staff);
                const income = prize + sponsor;
                team.budget = Math.round((team.budget + income - salaries) * 10) / 10;

                if (team.id === state.playerTeamId) {
                    ledger.push(
                        { raceIndex: record.raceIndex, label: `${circuit.name}: premios`, amount: prize },
                        { raceIndex: record.raceIndex, label: `${circuit.name}: patrocinio`, amount: sponsor },
                        { raceIndex: record.raceIndex, label: `${circuit.name}: salarios (pilotos y personal)`, amount: -Math.round(salaries * 10) / 10 },
                    );
                } else {
                    // la IA también desarrolla su coche (agresividad según dificultad, descuento del TD)
                    aiDevelop(team, income, devCostCap(state.season), DIFFICULTY[state.difficulty].aiDevFraction,
                        staffEffects(team, state.staff).devDiscount);
                }
            }

            const raceIndex = state.raceIndex + 1;

            // Mejoras del jugador que salen de fabricación.
            const player = teams[state.playerTeamId];
            const ready = state.upgradeQueue.filter(o => o.readyAtRace <= raceIndex);
            const pending = state.upgradeQueue.filter(o => o.readyAtRace > raceIndex);
            ready.forEach((order, qi) => {
                // Riesgo de correlación: los puntos entregados varían ± varianza (Rng
                // dedicado y determinista → el reducer sigue puro, sin Math.random).
                const rng = new Rng((state.season * 1009 + raceIndex * 31 + qi) >>> 0);
                const swing = order.variance > 0 ? (rng.next() * 2 - 1) * order.variance : 0;
                const delivered = Math.max(0, Math.round(order.predicted * (1 + swing) * 10) / 10);
                player.car[order.stat] = Math.min(STAT_CAP, player.car[order.stat] + delivered);
                const vs = delivered > order.predicted ? '↑ supera lo previsto'
                    : delivered < order.predicted ? '↓ por debajo de lo previsto' : 'según lo previsto';
                ledger.push({ raceIndex, label: `Mejora de ${order.stat} (+${delivered}) montada · ${vs}`, amount: 0 });
            });

            // Motores: desgaste de la carrera + limpieza de sanciones ya aplicadas.
            const drivers: Record<string, Driver> = {};
            for (const [id, d] of Object.entries(state.drivers)) {
                drivers[id] = { ...d, engine: { ...d.engine, gridPenaltyPending: 0 } };
            }
            for (const team of Object.values(teams)) {
                for (const id of team.driverIds) {
                    const d = drivers[id];
                    if (!d) continue;
                    const stress = record.engineStress?.[id] ?? 0;
                    const news = wearEngine(d.engine, stress, d.name);
                    if (news && team.id === state.playerTeamId) {
                        ledger.push({ raceIndex, label: news, amount: 0 });
                    }
                }
            }
            // Moral: se mueve por resultado y por batir (o no) al compañero.
            applyRaceMorale(drivers, record);

            // Misiones de patrocinador de esta carrera.
            const missions = generateMissions(state.season, record.raceIndex, state.playerTeamId, state.teams);
            const { completed, payout } = evaluateMissions(missions, record, state.playerTeamId);
            if (payout > 0) {
                teams[state.playerTeamId].budget = Math.round((teams[state.playerTeamId].budget + payout) * 10) / 10;
                for (const m of completed) {
                    ledger.push({ raceIndex, label: `Misión: ${m.label}`, amount: m.reward });
                }
            }

            // Records de circuito y estadísticas de piloto.
            const records = { ...state.records };
            const driverRecords: Record<string, typeof state.driverRecords[string]> = {};
            for (const [id, c] of Object.entries(state.driverRecords)) driverRecords[id] = { ...c };
            applyRaceToRecords(records, driverRecords, record, drivers, teams);

            // La junta evalúa tras cada carrera contra el objetivo de constructores.
            // Periodo de gracia al inicio de temporada: los standings tempranos son ruido.
            const results = [...state.results, record];
            const wcc = computeTeamStandings(results);
            const playerWccPos = wcc.findIndex(s => s.teamId === state.playerTeamId) + 1;
            const shortfall = Math.max(0, playerWccPos - state.board.targetPos);
            const inGrace = results.length <= BOARD_GRACE_RACES;
            const diff = DIFFICULTY[state.difficulty];
            const patience = Math.max(0, Math.min(100, Math.round(
                shortfall === 0
                    ? state.board.patience + PATIENCE_GAIN_PER_RACE * diff.patienceGainMult
                    : inGrace
                        ? state.board.patience
                        : state.board.patience - Math.min(PATIENCE_LOSS_CAP, PATIENCE_LOSS_PER_RACE * shortfall) * diff.patienceLossMult)));
            const fired = patience <= 0;

            const next: GameState = {
                ...state,
                teams,
                drivers,
                ledger,
                results,
                raceIndex,
                upgradeQueue: pending,
                board: { ...state.board, patience },
                records,
                driverRecords,
                phase: fired ? 'gameOver' : raceIndex >= CIRCUITS.length ? 'postSeason' : 'preRace',
            };
            // Evento de decisión (junta/prensa/patrocinador) tras la carrera.
            const playerBest = action.record.classification
                .filter(r => r.teamId === state.playerTeamId && r.position !== null)
                .reduce((m, r) => Math.min(m, r.position as number), Infinity);
            next.pendingEvent = fired ? null
                : (state.pendingEvent ?? generateDecisionEvent(state.season, state.raceIndex, next, Number.isFinite(playerBest) ? playerBest : null));
            return next;
        }

        case 'TAKE_ENGINE': {
            const d = state.drivers[action.driverId];
            if (!d || d.teamId !== state.playerTeamId) return state;
            return {
                ...state,
                drivers: { ...state.drivers, [d.id]: { ...d, engine: fitNewEngine(d.engine) } },
            };
        }

        case 'RESOLVE_EVENT': {
            const ev = state.pendingEvent;
            if (!ev) return state;
            const choice = ev.choices[action.choiceIndex];
            if (!choice) return state;
            const player = state.teams[state.playerTeamId];
            const teams = choice.budget
                ? { ...state.teams, [player.id]: { ...player, budget: Math.round((player.budget + choice.budget) * 10) / 10 } }
                : state.teams;
            const drivers = choice.moraleAll
                ? Object.fromEntries(Object.entries(state.drivers).map(([id, d]) =>
                    [id, d.teamId === player.id ? { ...d, morale: Math.max(0, Math.min(100, d.morale + choice.moraleAll!)) } : d]))
                : state.drivers;
            const patience = choice.patience
                ? Math.max(0, Math.min(100, state.board.patience + choice.patience))
                : state.board.patience;
            return {
                ...state,
                teams,
                drivers,
                board: { ...state.board, patience },
                pendingEvent: null,
                ledger: choice.budget ? [...state.ledger, { raceIndex: state.raceIndex, label: `Decisión: ${choice.label}`, amount: choice.budget }] : state.ledger,
            };
        }

        case 'UPGRADE_FACILITY': {
            const player = state.teams[state.playerTeamId];
            const level = player.facilities[action.facility];
            if (level >= FACILITY_MAX) return state;
            if (player.budget < action.cost) return state;
            return {
                ...state,
                teams: {
                    ...state.teams,
                    [player.id]: {
                        ...player,
                        budget: Math.round((player.budget - action.cost) * 10) / 10,
                        facilities: { ...player.facilities, [action.facility]: level + 1 },
                    },
                },
                ledger: [...state.ledger, { raceIndex: state.raceIndex, label: `Mejora de instalación: ${action.facility} → nivel ${level + 1}`, amount: -action.cost }],
            };
        }

        case 'APPLY_UPGRADE': {
            // Encola la mejora: se cobra ya, pero tarda UPGRADE_LEAD_RACES en llegar al coche.
            const player = state.teams[state.playerTeamId];
            const queuedPoints = state.upgradeQueue
                .filter(o => o.stat === action.stat)
                .reduce((s, o) => s + o.points, 0);
            if (player.budget < action.cost) return state;
            if (player.devSpendSeason + action.cost > devCostCap(state.season)) return state;
            if (player.car[action.stat] + queuedPoints + action.points > STAT_CAP) return state;
            const teams = {
                ...state.teams,
                [player.id]: {
                    ...player,
                    budget: Math.round((player.budget - action.cost) * 10) / 10,
                    devSpendSeason: Math.round((player.devSpendSeason + action.cost) * 10) / 10,
                },
            };
            // El túnel de viento reduce la varianza de correlación del proyecto.
            const variance = Math.max(0, UPGRADE_VARIANCE_BASE - WIND_TUNNEL_VARIANCE_CUT * (player.facilities.windTunnel - 1));
            // A fábrica nivel 5, la fabricación tarda una carrera menos.
            const lead = Math.max(1, UPGRADE_LEAD_RACES - (player.facilities.factory >= FACILITY_MAX ? FACTORY_LEAD_L5 : 0));
            return {
                ...state,
                teams,
                upgradeQueue: [...state.upgradeQueue, {
                    stat: action.stat,
                    points: action.points,
                    cost: action.cost,
                    readyAtRace: state.raceIndex + lead,
                    predicted: action.points,
                    variance,
                }],
                ledger: [...state.ledger, { raceIndex: state.raceIndex, label: `Fabricación: mejora de ${action.stat} (~+${action.points})`, amount: -action.cost }],
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

        case 'HIRE_STAFF': {
            // Fichar personal libre; el titular actual del rol queda libre.
            const player = state.teams[state.playerTeamId];
            const target = state.staff[action.staffId];
            if (!target || target.teamId !== null) return state;
            if (player.budget < action.fee) return state;

            const staff = { ...state.staff };
            const outgoingId = player.staffIds[target.role];
            if (outgoingId && staff[outgoingId]) {
                staff[outgoingId] = { ...staff[outgoingId], teamId: null, contractYears: 0 };
            }
            staff[target.id] = { ...target, teamId: player.id, contractYears: 2 };

            return {
                ...state,
                staff,
                teams: {
                    ...state.teams,
                    [player.id]: {
                        ...player,
                        budget: Math.round((player.budget - action.fee) * 10) / 10,
                        staffIds: { ...player.staffIds, [target.role]: target.id },
                    },
                },
                ledger: [...state.ledger, { raceIndex: state.raceIndex, label: `Fichaje de ${target.name} (personal)`, amount: -action.fee }],
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
                    [driver.id]: { ...driver, contractYears: driver.contractYears + 2, morale: Math.min(100, driver.morale + MORALE_RENEW) },
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
            // Nueva temporada: los pools de motor se resetean a 3.
            for (const [id, d] of Object.entries(state.drivers)) {
                drivers[id] = { ...d, engine: { used: 1, poolSize: d.engine.poolSize, gridPenaltyPending: 0, wear: 0 } };
            }
            const news: string[] = [];
            const rng = new Rng(state.season);

            // Envejecimiento y progresión + retiros por edad.
            const prog = ageAndProgress(drivers, rng);
            news.push(...prog.news);
            for (const id of prog.retired) {
                const d = drivers[id];
                if (d?.teamId) {
                    const team = teams[d.teamId];
                    if (team) team.driverIds = team.driverIds.filter(x => x !== id);
                }
                delete drivers[id];
            }

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

            // Personal: contratos que expiran y auto-fichajes de la IA.
            const staff: Record<string, typeof state.staff[string]> = {};
            for (const [id, m] of Object.entries(state.staff)) staff[id] = { ...m };
            for (const m of Object.values(staff)) {
                if (!m.teamId) continue;
                m.contractYears -= 1;
                if (m.contractYears <= 0) {
                    const team = teams[m.teamId];
                    if (team && team.staffIds[m.role] === m.id) {
                        team.staffIds = { ...team.staffIds, [m.role]: null };
                    }
                    if (m.teamId === state.playerTeamId) {
                        news.push(`${m.name} deja el equipo: contrato expirado.`);
                    }
                    m.teamId = null;
                    m.contractYears = 0;
                }
            }
            for (const team of Object.values(teams)) {
                if (team.id === state.playerTeamId) continue; // el jugador ficha a mano
                for (const role of ['td', 're', 'pc'] as const) {
                    if (team.staffIds[role]) continue;
                    const pool = freeStaff(staff, role).filter(m => staffSigningFee(m) <= team.budget);
                    const pick = pool[0];
                    if (!pick) continue;
                    staff[pick.id] = { ...pick, teamId: team.id, contractYears: 1 + rng.int(0, 1) };
                    team.staffIds = { ...team.staffIds, [role]: pick.id };
                    team.budget = Math.round((team.budget - staffSigningFee(pick)) * 10) / 10;
                }
            }
            // Reglamento técnico nuevo cada N temporadas: los coches se comprimen
            // hacia la media + sacudida aleatoria → oportunidad para el medio campo.
            // Rng dedicado para no alterar el stream del mercado.
            const newSeason = state.season + 1;
            const regRng = new Rng(newSeason * 7919 + 13);
            const sinceBase = newSeason - REG_BASE_SEASON;
            if (sinceBase > 0 && sinceBase % REGULATION_PERIOD === 0) {
                for (const stat of ['aero', 'engine', 'chassis'] as const) {
                    const mean = Object.values(teams).reduce((s, t) => s + t.car[stat], 0) / Object.keys(teams).length;
                    for (const team of Object.values(teams)) {
                        const shaken = mean * (1 - REG_KEEP) + team.car[stat] * REG_KEEP + regRng.gaussian(0, REG_SHAKE_SD);
                        team.car[stat] = Math.max(40, Math.min(STAT_CAP, Math.round(shaken)));
                    }
                }
                news.unshift(`🏛️ ¡Reglamento técnico nuevo para ${newSeason}! Los coches se rediseñan y la parrilla se sacude.`);
            } else if ((sinceBase + 1) % REGULATION_PERIOD === 0) {
                news.push(`🏛️ La FIA anuncia un reglamento nuevo para ${newSeason + 1}. Los equipos ya piensan en el próximo coche.`);
            }

            const playerPos = standings.findIndex(s => s.teamId === state.playerTeamId);
            const playerBonus = playerPos >= 0 && playerPos < WCC_SEASON_BONUS.length ? WCC_SEASON_BONUS[playerPos] : 10;
            const ledger = [...state.ledger, { raceIndex: 0, label: `Bonus FIA temporada ${state.season} (P${playerPos + 1} WCC)`, amount: playerBonus }];

            // Palmarés: registro denormalizado de la temporada que termina
            // (usa state.teams/state.drivers, ANTES del reset de reglamento).
            const driverStandings = computeDriverStandings(state.results);
            const wdcS = driverStandings[0];
            const wccS = standings[0];
            const playerResults = state.results.flatMap(r => r.classification.filter(c => c.teamId === state.playerTeamId));
            const history = [...state.history];
            if (wdcS && wccS) {
                const wdcDriver = state.drivers[wdcS.driverId];
                const wdcTeam = state.teams[wdcS.teamId];
                const wccTeam = state.teams[wccS.teamId];
                history.push({
                    season: state.season,
                    wdc: {
                        driverId: wdcS.driverId,
                        name: wdcDriver?.name ?? wdcS.driverId,
                        teamId: wdcS.teamId,
                        teamName: wdcTeam?.shortName ?? wdcS.teamId,
                        color: wdcTeam?.color ?? '#8a8a99',
                    },
                    wcc: { teamId: wccS.teamId, name: wccTeam?.name ?? wccS.teamId, color: wccTeam?.color ?? '#8a8a99' },
                    playerPos: playerPos + 1,
                    playerPoints: standings[playerPos]?.points ?? 0,
                    playerWins: playerResults.filter(r => r.position === 1).length,
                    playerPodiums: playerResults.filter(r => r.position !== null && r.position <= 3).length,
                    playerPoles: state.results.filter(r =>
                        r.classification.find(c => c.driverId === r.polesitterId)?.teamId === state.playerTeamId).length,
                });
            }

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
                staff,
                history,
                ledger,
            };
        }

        default:
            return state;
    }
}
