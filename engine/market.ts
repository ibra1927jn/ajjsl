import { Driver, Team } from '../types';
import {
    BUYOUT_FACTOR, FA_POOL_CAP, POACH_SALARY_BUMP, RACES_PER_SEASON,
    ROOKIES_PER_SEASON, SIGNING_FEE_FACTOR,
} from '../data/constants';
import { ROOKIE_FIRST_NAMES, ROOKIE_LAST_NAMES } from '../data/names';
import { carPerformance } from './performance';
import { freshEngine } from './driverInit';
import { Rng } from './rng';

export function signingFee(driver: Driver): number {
    return Math.round(driver.salary * SIGNING_FEE_FACTOR * 10) / 10;
}

// Cláusula por robar un piloto con contrato a otro equipo.
export function buyoutFee(driver: Driver): number {
    return Math.round((signingFee(driver) + driver.contractYears * driver.salary * BUYOUT_FACTOR) * 10) / 10;
}

export const poachedSalary = (driver: Driver) => Math.round(driver.salary * POACH_SALARY_BUMP * 10) / 10;

// Salario prorrateado que se paga por cada carrera disputada.
export function salaryPerRace(driver: Driver): number {
    return driver.salary / RACES_PER_SEASON;
}

export function freeAgents(drivers: Record<string, Driver>): Driver[] {
    return Object.values(drivers).filter(d => d.teamId === null)
        .sort((a, b) => b.pace - a.pace);
}

export function driverQuality(d: Driver): number {
    return d.pace * 0.5 + d.racecraft * 0.25 + d.consistency * 0.25;
}

// La víctima de un robo (o un equipo corto de pilotos a mitad de temporada)
// ficha al mejor agente libre que pueda pagar, o al más barato si no llega.
// Muta teams/drivers (copias) y devuelve el titular de la noticia.
export function signReplacementFA(team: Team, drivers: Record<string, Driver>): string | null {
    const pool = freeAgents(drivers).sort((a, b) => driverQuality(b) - driverQuality(a));
    if (pool.length === 0) return null;
    const pick = pool.find(d => signingFee(d) <= team.budget) ?? pool[pool.length - 1];
    drivers[pick.id] = { ...pick, teamId: team.id, contractYears: 1 };
    team.driverIds.push(pick.id);
    team.budget = Math.round((team.budget - signingFee(pick)) * 10) / 10;
    return `${team.shortName} ficha a ${pick.name} como sustituto.`;
}

// Silly season: los equipos IA con asientos libres fichan agentes libres por
// deseabilidad (calidad + asequibilidad). Los equipos fuertes eligen primero.
// Muta teams/drivers (copias). Devuelve los titulares.
export function runSillySeason(
    teams: Record<string, Team>,
    drivers: Record<string, Driver>,
    playerTeamId: string,
    rng: Rng,
): string[] {
    const news: string[] = [];
    const order = Object.values(teams)
        .filter(t => t.id !== playerTeamId)
        .sort((a, b) => carPerformance(b.car) - carPerformance(a.car));

    for (const team of order) {
        while (team.driverIds.length < 2) {
            const pool = freeAgents(drivers)
                .sort((a, b) => driverQuality(b) - driverQuality(a) + (rng.next() - 0.5) * 6);
            if (pool.length === 0) break;
            const pick = pool.find(d => signingFee(d) <= team.budget) ?? pool[pool.length - 1];
            drivers[pick.id] = { ...pick, teamId: team.id, contractYears: 1 + rng.int(0, 1) };
            team.driverIds.push(pick.id);
            team.budget = Math.round((team.budget - signingFee(pick)) * 10) / 10;
            news.push(`${team.shortName} ficha a ${pick.name}.`);
        }
    }
    return news;
}

// Rookies procedurales que entran al pool de agentes libres cada temporada.
export function generateRookies(season: number, existing: Record<string, Driver>, rng: Rng): Driver[] {
    const rookies: Driver[] = [];
    for (let i = 0; i < ROOKIES_PER_SEASON; i++) {
        const name = `${rng.pick(ROOKIE_FIRST_NAMES)} ${rng.pick(ROOKIE_LAST_NAMES)}`;
        const id = `rookie_${season}_${i}`;
        if (existing[id]) continue;
        const pace = 55 + rng.int(0, 20);
        rookies.push({
            id,
            name,
            shortCode: name.split(' ').map(p => p[0]).join('').padEnd(3, name[1]?.toUpperCase() ?? 'X').slice(0, 3).toUpperCase(),
            teamId: null,
            pace,
            racecraft: pace - rng.int(2, 8),
            consistency: 60 + rng.int(0, 15),
            experience: 10 + rng.int(0, 15),
            salary: 1 + rng.int(0, 2) * 0.5,
            contractYears: 0,
            age: 18 + rng.int(0, 4),
            morale: 65,
            engine: freshEngine(),
        });
    }
    return rookies;
}

// Recorta el pool de agentes libres: los peores se retiran.
// Muta drivers (copia). Devuelve titulares de retiradas.
export function retireWorstFreeAgents(drivers: Record<string, Driver>): string[] {
    const pool = freeAgents(drivers).sort((a, b) => driverQuality(a) - driverQuality(b));
    const news: string[] = [];
    while (pool.length > FA_POOL_CAP) {
        const worst = pool.shift()!;
        delete drivers[worst.id];
        news.push(`${worst.name} se retira de la F1.`);
    }
    return news;
}
