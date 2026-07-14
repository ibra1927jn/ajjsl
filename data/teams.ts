import { Team } from '../types';

// Stats sembrados según la forma de inicio de 2025.
// devSpendSeason se inicializa en createNewGame.
export const TEAMS: Omit<Team, 'devSpendSeason'>[] = [
    {
        id: 'mclaren', name: 'McLaren F1 Team', shortName: 'McLaren', color: '#FF8000',
        car: { aero: 90, engine: 87, chassis: 88, reliability: 90 },
        budget: 145, sponsorTier: 1, driverIds: ['norris', 'piastri'],
    },
    {
        id: 'redbull', name: 'Oracle Red Bull Racing', shortName: 'Red Bull', color: '#3671C6',
        car: { aero: 87, engine: 86, chassis: 84, reliability: 88 },
        budget: 140, sponsorTier: 1, driverIds: ['verstappen', 'lawson'],
    },
    {
        id: 'ferrari', name: 'Scuderia Ferrari', shortName: 'Ferrari', color: '#E8002D',
        car: { aero: 85, engine: 87, chassis: 84, reliability: 87 },
        budget: 140, sponsorTier: 1, driverIds: ['leclerc', 'hamilton'],
    },
    {
        id: 'mercedes', name: 'Mercedes-AMG Petronas', shortName: 'Mercedes', color: '#27F4D2',
        car: { aero: 83, engine: 86, chassis: 84, reliability: 92 },
        budget: 135, sponsorTier: 1, driverIds: ['russell', 'antonelli'],
    },
    {
        id: 'williams', name: 'Atlassian Williams Racing', shortName: 'Williams', color: '#64C4FF',
        car: { aero: 77, engine: 80, chassis: 77, reliability: 84 },
        budget: 100, sponsorTier: 2, driverIds: ['albon', 'sainz'],
    },
    {
        id: 'astonmartin', name: 'Aston Martin Aramco', shortName: 'Aston Martin', color: '#229971',
        car: { aero: 76, engine: 78, chassis: 75, reliability: 85 },
        budget: 110, sponsorTier: 2, driverIds: ['alonso', 'stroll'],
    },
    {
        id: 'racingbulls', name: 'Visa Cash App Racing Bulls', shortName: 'Racing Bulls', color: '#6692FF',
        car: { aero: 75, engine: 77, chassis: 74, reliability: 86 },
        budget: 90, sponsorTier: 3, driverIds: ['tsunoda', 'hadjar'],
    },
    {
        id: 'alpine', name: 'BWT Alpine F1 Team', shortName: 'Alpine', color: '#0093CC',
        car: { aero: 74, engine: 74, chassis: 74, reliability: 82 },
        budget: 95, sponsorTier: 2, driverIds: ['gasly', 'doohan'],
    },
    {
        id: 'haas', name: 'MoneyGram Haas F1 Team', shortName: 'Haas', color: '#B6BABD',
        car: { aero: 73, engine: 75, chassis: 71, reliability: 83 },
        budget: 85, sponsorTier: 3, driverIds: ['ocon', 'bearman'],
    },
    {
        id: 'sauber', name: 'Stake F1 Team Kick Sauber', shortName: 'Sauber', color: '#52E252',
        car: { aero: 68, engine: 70, chassis: 67, reliability: 81 },
        budget: 80, sponsorTier: 3, driverIds: ['hulkenberg', 'bortoleto'],
    },
];
