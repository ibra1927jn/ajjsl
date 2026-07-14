import { Driver } from '../types';

// Parrilla 2025 + agentes libres. Stats 0-100.
export const DRIVERS: Driver[] = [
    // McLaren
    { id: 'norris', name: 'Lando Norris', shortCode: 'NOR', teamId: 'mclaren', pace: 93, racecraft: 88, consistency: 84, experience: 70, salary: 35, contractYears: 3 },
    { id: 'piastri', name: 'Oscar Piastri', shortCode: 'PIA', teamId: 'mclaren', pace: 91, racecraft: 88, consistency: 90, experience: 60, salary: 20, contractYears: 3 },
    // Red Bull
    { id: 'verstappen', name: 'Max Verstappen', shortCode: 'VER', teamId: 'redbull', pace: 96, racecraft: 95, consistency: 92, experience: 90, salary: 55, contractYears: 3 },
    { id: 'lawson', name: 'Liam Lawson', shortCode: 'LAW', teamId: 'redbull', pace: 78, racecraft: 76, consistency: 70, experience: 40, salary: 2, contractYears: 1 },
    // Ferrari
    { id: 'leclerc', name: 'Charles Leclerc', shortCode: 'LEC', teamId: 'ferrari', pace: 92, racecraft: 89, consistency: 85, experience: 80, salary: 34, contractYears: 3 },
    { id: 'hamilton', name: 'Lewis Hamilton', shortCode: 'HAM', teamId: 'ferrari', pace: 89, racecraft: 92, consistency: 86, experience: 99, salary: 50, contractYears: 2 },
    // Mercedes
    { id: 'russell', name: 'George Russell', shortCode: 'RUS', teamId: 'mercedes', pace: 90, racecraft: 87, consistency: 88, experience: 75, salary: 20, contractYears: 2 },
    { id: 'antonelli', name: 'Kimi Antonelli', shortCode: 'ANT', teamId: 'mercedes', pace: 82, racecraft: 78, consistency: 72, experience: 25, salary: 3, contractYears: 3 },
    // Williams
    { id: 'albon', name: 'Alexander Albon', shortCode: 'ALB', teamId: 'williams', pace: 83, racecraft: 81, consistency: 82, experience: 65, salary: 8, contractYears: 2 },
    { id: 'sainz', name: 'Carlos Sainz', shortCode: 'SAI', teamId: 'williams', pace: 87, racecraft: 86, consistency: 85, experience: 78, salary: 12, contractYears: 2 },
    // Aston Martin
    { id: 'alonso', name: 'Fernando Alonso', shortCode: 'ALO', teamId: 'astonmartin', pace: 88, racecraft: 93, consistency: 89, experience: 99, salary: 20, contractYears: 2 },
    { id: 'stroll', name: 'Lance Stroll', shortCode: 'STR', teamId: 'astonmartin', pace: 76, racecraft: 74, consistency: 72, experience: 70, salary: 10, contractYears: 2 },
    // Racing Bulls
    { id: 'tsunoda', name: 'Yuki Tsunoda', shortCode: 'TSU', teamId: 'racingbulls', pace: 81, racecraft: 79, consistency: 76, experience: 60, salary: 5, contractYears: 1 },
    { id: 'hadjar', name: 'Isack Hadjar', shortCode: 'HAD', teamId: 'racingbulls', pace: 77, racecraft: 74, consistency: 70, experience: 20, salary: 1.5, contractYears: 2 },
    // Alpine
    { id: 'gasly', name: 'Pierre Gasly', shortCode: 'GAS', teamId: 'alpine', pace: 82, racecraft: 81, consistency: 80, experience: 70, salary: 10, contractYears: 2 },
    { id: 'doohan', name: 'Jack Doohan', shortCode: 'DOO', teamId: 'alpine', pace: 74, racecraft: 72, consistency: 68, experience: 20, salary: 1.5, contractYears: 1 },
    // Haas
    { id: 'ocon', name: 'Esteban Ocon', shortCode: 'OCO', teamId: 'haas', pace: 81, racecraft: 80, consistency: 79, experience: 70, salary: 7, contractYears: 2 },
    { id: 'bearman', name: 'Oliver Bearman', shortCode: 'BEA', teamId: 'haas', pace: 79, racecraft: 77, consistency: 70, experience: 25, salary: 2, contractYears: 2 },
    // Sauber
    { id: 'hulkenberg', name: 'Nico Hülkenberg', shortCode: 'HUL', teamId: 'sauber', pace: 82, racecraft: 81, consistency: 84, experience: 85, salary: 6, contractYears: 2 },
    { id: 'bortoleto', name: 'Gabriel Bortoleto', shortCode: 'BOR', teamId: 'sauber', pace: 78, racecraft: 75, consistency: 72, experience: 20, salary: 1.5, contractYears: 3 },

    // Agentes libres
    { id: 'bottas', name: 'Valtteri Bottas', shortCode: 'BOT', teamId: null, pace: 80, racecraft: 79, consistency: 85, experience: 85, salary: 6, contractYears: 0 },
    { id: 'perez', name: 'Sergio Pérez', shortCode: 'PER', teamId: null, pace: 80, racecraft: 82, consistency: 78, experience: 90, salary: 8, contractYears: 0 },
    { id: 'zhou', name: 'Guanyu Zhou', shortCode: 'ZHO', teamId: null, pace: 75, racecraft: 73, consistency: 76, experience: 55, salary: 3, contractYears: 0 },
    { id: 'ricciardo', name: 'Daniel Ricciardo', shortCode: 'RIC', teamId: null, pace: 79, racecraft: 81, consistency: 76, experience: 85, salary: 6, contractYears: 0 },
    { id: 'drugovich', name: 'Felipe Drugovich', shortCode: 'DRU', teamId: null, pace: 72, racecraft: 70, consistency: 72, experience: 30, salary: 1, contractYears: 0 },
    { id: 'schumacher', name: 'Mick Schumacher', shortCode: 'MSC', teamId: null, pace: 74, racecraft: 72, consistency: 74, experience: 45, salary: 2, contractYears: 0 },
];
