import { Driver, EngineAllocation } from '../types';
import { ENGINE_POOL } from '../data/constants';
import { DEFAULT_AGE, DEFAULT_MORALE, DRIVER_AGES } from '../data/driverAges';
import { DRIVER_TRAITS } from '../data/driverTraits';

export function freshEngine(): EngineAllocation {
    return { used: 1, poolSize: ENGINE_POOL, gridPenaltyPending: 0, wear: 0 };
}

// Completa un piloto base (sin age/morale/engine/traits) con sus campos v4/v6.
export function hydrateDriver(d: Omit<Driver, 'age' | 'morale' | 'engine' | 'traits'>): Driver {
    return {
        ...d,
        age: DRIVER_AGES[d.id] ?? DEFAULT_AGE,
        morale: DEFAULT_MORALE,
        engine: freshEngine(),
        traits: DRIVER_TRAITS[d.id] ?? [],
    };
}
