import { Circuit } from '../types';

// Calendario 2025 completo (24 GPs). baseLapSec ≈ ritmo de carrera aproximado.
// rainChance: probabilidad de lluvia en carrera. sprint: fin de semana con sprint (6 en 2025).
export const CIRCUITS: Circuit[] = [
    { id: 'australia',   name: 'GP de Australia',        country: 'Australia',      laps: 58, baseLapSec: 80,  overtakingDifficulty: 0.60, tireStress: 1.00, rainChance: 0.25 },
    { id: 'china',       name: 'GP de China',            country: 'China',          laps: 56, baseLapSec: 95,  overtakingDifficulty: 0.40, tireStress: 1.10, rainChance: 0.25, sprint: true },
    { id: 'japan',       name: 'GP de Japón',            country: 'Japón',          laps: 53, baseLapSec: 92,  overtakingDifficulty: 0.60, tireStress: 1.15, rainChance: 0.40 },
    { id: 'bahrain',     name: 'GP de Baréin',           country: 'Baréin',         laps: 57, baseLapSec: 95,  overtakingDifficulty: 0.30, tireStress: 1.20, rainChance: 0.05 },
    { id: 'saudi',       name: 'GP de Arabia Saudí',     country: 'Arabia Saudí',   laps: 50, baseLapSec: 91,  overtakingDifficulty: 0.45, tireStress: 0.95, rainChance: 0.05 },
    { id: 'miami',       name: 'GP de Miami',            country: 'EE. UU.',        laps: 57, baseLapSec: 90,  overtakingDifficulty: 0.45, tireStress: 1.00, rainChance: 0.30, sprint: true },
    { id: 'imola',       name: 'GP de Emilia-Romaña',    country: 'Italia',         laps: 63, baseLapSec: 78,  overtakingDifficulty: 0.65, tireStress: 1.00, rainChance: 0.25 },
    { id: 'monaco',      name: 'GP de Mónaco',           country: 'Mónaco',         laps: 78, baseLapSec: 74,  overtakingDifficulty: 0.90, tireStress: 0.80, rainChance: 0.15 },
    { id: 'spain',       name: 'GP de España',           country: 'España',         laps: 66, baseLapSec: 78,  overtakingDifficulty: 0.60, tireStress: 1.15, rainChance: 0.15 },
    { id: 'canada',      name: 'GP de Canadá',           country: 'Canadá',         laps: 70, baseLapSec: 75,  overtakingDifficulty: 0.40, tireStress: 0.95, rainChance: 0.30 },
    { id: 'austria',     name: 'GP de Austria',          country: 'Austria',        laps: 71, baseLapSec: 68,  overtakingDifficulty: 0.35, tireStress: 1.05, rainChance: 0.30 },
    { id: 'britain',     name: 'GP de Gran Bretaña',     country: 'Reino Unido',    laps: 52, baseLapSec: 90,  overtakingDifficulty: 0.40, tireStress: 1.15, rainChance: 0.35 },
    { id: 'belgium',     name: 'GP de Bélgica',          country: 'Bélgica',        laps: 44, baseLapSec: 107, overtakingDifficulty: 0.25, tireStress: 1.10, rainChance: 0.45, sprint: true },
    { id: 'hungary',     name: 'GP de Hungría',          country: 'Hungría',        laps: 70, baseLapSec: 79,  overtakingDifficulty: 0.75, tireStress: 1.05, rainChance: 0.25 },
    { id: 'netherlands', name: 'GP de Países Bajos',     country: 'Países Bajos',   laps: 72, baseLapSec: 73,  overtakingDifficulty: 0.70, tireStress: 1.05, rainChance: 0.30 },
    { id: 'monza',       name: 'GP de Italia',           country: 'Italia',         laps: 53, baseLapSec: 84,  overtakingDifficulty: 0.20, tireStress: 0.95, rainChance: 0.20 },
    { id: 'baku',        name: 'GP de Azerbaiyán',       country: 'Azerbaiyán',     laps: 51, baseLapSec: 103, overtakingDifficulty: 0.30, tireStress: 0.90, rainChance: 0.10 },
    { id: 'singapore',   name: 'GP de Singapur',         country: 'Singapur',       laps: 62, baseLapSec: 95,  overtakingDifficulty: 0.70, tireStress: 1.00, rainChance: 0.35 },
    { id: 'usa',         name: 'GP de Estados Unidos',   country: 'EE. UU.',        laps: 56, baseLapSec: 96,  overtakingDifficulty: 0.40, tireStress: 1.10, rainChance: 0.20, sprint: true },
    { id: 'mexico',      name: 'GP de México',           country: 'México',         laps: 71, baseLapSec: 80,  overtakingDifficulty: 0.50, tireStress: 1.00, rainChance: 0.15 },
    { id: 'brazil',      name: 'GP de São Paulo',        country: 'Brasil',         laps: 71, baseLapSec: 72,  overtakingDifficulty: 0.35, tireStress: 1.05, rainChance: 0.45, sprint: true },
    { id: 'vegas',       name: 'GP de Las Vegas',        country: 'EE. UU.',        laps: 50, baseLapSec: 95,  overtakingDifficulty: 0.35, tireStress: 0.85, rainChance: 0.05 },
    { id: 'qatar',       name: 'GP de Catar',            country: 'Catar',          laps: 57, baseLapSec: 84,  overtakingDifficulty: 0.50, tireStress: 1.30, rainChance: 0.05, sprint: true },
    { id: 'abudhabi',    name: 'GP de Abu Dabi',         country: 'EAU',            laps: 58, baseLapSec: 87,  overtakingDifficulty: 0.50, tireStress: 1.00, rainChance: 0.05 },
];
