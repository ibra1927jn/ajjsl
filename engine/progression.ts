import { Driver } from '../types';
import { PROG_PEAK_END, PROG_YOUNG_AGE, RETIRE_AGE, RETIRE_HARD_AGE } from '../data/constants';
import { Rng } from './rng';

const clamp = (v: number) => Math.max(30, Math.min(99, Math.round(v)));

// Envejece y hace progresar/declinar a los pilotos una temporada. Determinista
// (usa el Rng de la temporada). Muta `drivers` (copias) y devuelve los retirados.
export function ageAndProgress(drivers: Record<string, Driver>, rng: Rng): { news: string[]; retired: string[] } {
    const news: string[] = [];
    const retired: string[] = [];

    for (const d of Object.values(drivers)) {
        d.age += 1;

        if (d.age <= PROG_YOUNG_AGE) {
            // Jóvenes: crecen rápido, sobre todo si tienen margen.
            d.pace = clamp(d.pace + rng.int(1, 3));
            d.racecraft = clamp(d.racecraft + rng.int(1, 3));
            d.consistency = clamp(d.consistency + rng.int(0, 2));
            d.experience = clamp(d.experience + rng.int(3, 6));
        } else if (d.age <= PROG_PEAK_END) {
            // Plenitud: casi estables, la experiencia sigue subiendo.
            d.pace = clamp(d.pace + rng.int(-1, 1));
            d.racecraft = clamp(d.racecraft + rng.int(0, 1));
            d.experience = clamp(d.experience + rng.int(1, 3));
        } else {
            // Veteranía: declive gradual (el ritmo cae antes que el racecraft).
            const decline = 1 + Math.floor((d.age - PROG_PEAK_END) / 3);
            d.pace = clamp(d.pace - rng.int(1, decline + 1));
            d.racecraft = clamp(d.racecraft - rng.int(0, decline));
            d.consistency = clamp(d.consistency - rng.int(0, 1));
        }

        // Retiro por edad.
        const retireChance = d.age >= RETIRE_HARD_AGE ? 1
            : d.age >= RETIRE_AGE ? (d.age - RETIRE_AGE + 1) / (RETIRE_HARD_AGE - RETIRE_AGE + 1)
            : 0;
        if (retireChance > 0 && rng.next() < retireChance) {
            retired.push(d.id);
            news.push(`🏁 ${d.name} se retira de la F1 a los ${d.age} años.`);
        }
    }

    return { news, retired };
}
