import { CarStats, Driver, Team } from '../types';
import { CAR_WEIGHTS, CAR_SHARE, PERF_SEC_PER_POINT } from '../data/constants';

export function carPerformance(car: CarStats): number {
    return car.aero * CAR_WEIGHTS.aero + car.engine * CAR_WEIGHTS.engine + car.chassis * CAR_WEIGHTS.chassis;
}

export function combinedRating(team: Team, driver: Driver): number {
    return CAR_SHARE * carPerformance(team.car) + (1 - CAR_SHARE) * driver.pace;
}

// Segundos por vuelta que pierde este coche+piloto respecto a un rating perfecto de 100.
export function perfDelta(team: Team, driver: Driver): number {
    return (100 - combinedRating(team, driver)) * PERF_SEC_PER_POINT;
}
