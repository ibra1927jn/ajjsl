import { Driver } from '../types';
import { SIGNING_FEE_FACTOR, RACES_PER_SEASON } from '../data/constants';

export function signingFee(driver: Driver): number {
    return Math.round(driver.salary * SIGNING_FEE_FACTOR * 10) / 10;
}

// Salario prorrateado que se paga por cada carrera disputada.
export function salaryPerRace(driver: Driver): number {
    return driver.salary / RACES_PER_SEASON;
}

export function freeAgents(drivers: Record<string, Driver>): Driver[] {
    return Object.values(drivers).filter(d => d.teamId === null)
        .sort((a, b) => b.pace - a.pace);
}
