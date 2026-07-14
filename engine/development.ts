import { CarStatKey, CarStats, Team } from '../types';
import { RELIABILITY_COST_FACTOR, STAT_CAP, UPGRADE_STEP, upgradeCostPerPoint, AI_DEV_SPEND_FRACTION } from '../data/constants';

// Coste en $M de comprar `points` puntos partiendo del nivel actual.
export function upgradeCost(stat: CarStatKey, currentLevel: number, points: number = UPGRADE_STEP): number {
    let cost = 0;
    for (let i = 0; i < points; i++) {
        cost += upgradeCostPerPoint(currentLevel + i);
    }
    if (stat === 'reliability') cost *= RELIABILITY_COST_FACTOR;
    return Math.round(cost * 10) / 10;
}

export function maxedOut(car: CarStats, stat: CarStatKey): boolean {
    return car[stat] + UPGRADE_STEP > STAT_CAP;
}

function weakestStat(car: CarStats): CarStatKey {
    const keys: CarStatKey[] = ['aero', 'engine', 'chassis', 'reliability'];
    return keys.reduce((min, k) => (car[k] < car[min] ? k : min), keys[0]);
}

// La IA invierte parte de sus ingresos tras cada carrera en su stat más débil.
// Muta el equipo (que debe ser una copia) y devuelve lo gastado.
export function aiDevelop(team: Team, income: number): number {
    let wallet = income * AI_DEV_SPEND_FRACTION;
    let spent = 0;
    while (true) {
        const stat = weakestStat(team.car);
        if (team.car[stat] >= STAT_CAP) break;
        const cost = upgradeCostPerPoint(team.car[stat]) * (stat === 'reliability' ? RELIABILITY_COST_FACTOR : 1);
        if (wallet < cost || team.budget - cost < 0) break;
        team.car[stat] += 1;
        team.budget -= cost;
        wallet -= cost;
        spent += cost;
    }
    return spent;
}
