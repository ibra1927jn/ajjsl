import { Driver, EngineAllocation } from '../types';
import { ENGINE_POOL } from '../data/constants';
import { DEFAULT_AGE, DEFAULT_MORALE, DRIVER_AGES } from '../data/driverAges';

export function freshEngine(): EngineAllocation {
    return { used: 1, poolSize: ENGINE_POOL, gridPenaltyPending: 0 };
}

// Completa un piloto base (sin age/morale/engine) con sus campos v4.
export function hydrateDriver(d: Omit<Driver, 'age' | 'morale' | 'engine'>): Driver {
    return {
        ...d,
        age: DRIVER_AGES[d.id] ?? DEFAULT_AGE,
        morale: DEFAULT_MORALE,
        engine: freshEngine(),
    };
}
