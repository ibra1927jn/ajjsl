import { DecisionEvent, GameState } from '../types';
import { Rng } from './rng';
import { computeTeamStandings } from './season';

// Genera (de forma determinista, como las misiones) un evento de decisión tras
// una carrera, o null si esta vez no toca. Depende del resultado y del contexto.
export function generateDecisionEvent(season: number, raceIndex: number, state: GameState, playerFinishBest: number | null): DecisionEvent | null {
    const rng = new Rng((season * 1000 + raceIndex * 7 + 101) >>> 0);
    if (!rng.chance(0.45)) return null; // ~45% de las carreras traen un evento

    const standings = computeTeamStandings(state.results);
    const pos = standings.findIndex(s => s.teamId === state.playerTeamId);
    const won = playerFinishBest === 1;
    const podium = playerFinishBest !== null && playerFinishBest <= 3;
    const lowPatience = state.board.patience < 35;

    const pool: DecisionEvent[] = [];

    if (won || podium) {
        pool.push({
            id: 'sponsor-bonus', source: 'sponsor',
            prompt: 'Un patrocinador quiere un acto promocional con el equipo esta semana. Distrae al personal pero paga bien.',
            choices: [
                { label: 'Aceptar el acto', outcome: 'El equipo sonríe en las fotos y llega el cheque.', budget: 4, moraleAll: -2 },
                { label: 'Centrarse en el coche', outcome: 'El garaje agradece la concentración.', moraleAll: 3 },
            ],
        });
    }

    if (lowPatience) {
        pool.push({
            id: 'board-ultimatum', source: 'board',
            prompt: 'La junta está inquieta con los resultados. Te piden un plan.',
            choices: [
                { label: 'Prometer una mejora agresiva', outcome: 'Compras tiempo, pero gastas capital político.', patience: 8, budget: -6 },
                { label: 'Pedir paciencia y confianza', outcome: 'Aceptan a regañadientes.', patience: 3 },
            ],
        });
    }

    pool.push({
        id: 'press-controversy', source: 'press',
        prompt: 'La prensa te pregunta por un rumor sobre tu piloto estrella. ¿Cómo respondes?',
        choices: [
            { label: 'Defender al piloto en público', outcome: 'Tu piloto lo agradece; la prensa se queda con ganas.', moraleAll: 4 },
            { label: 'No mojarte', outcome: 'Titular tibio, vestuario indiferente.', },
            { label: 'Insinuar cambios', outcome: 'Titular jugoso, pero el vestuario se tensa.', moraleAll: -4, patience: 2 },
        ],
    });

    pool.push({
        id: 'sponsor-target', source: 'sponsor',
        prompt: `Vas ${pos >= 0 ? `P${pos + 1}` : 'sin puntuar'} en constructores. Un patrocinador ofrece un bonus por rendimiento a cambio de más presión.`,
        choices: [
            { label: 'Firmar el bonus', outcome: 'Más dinero, más ojos encima.', budget: 5, patience: -3 },
            { label: 'Rechazar la presión', outcome: 'Mantienes la calma en el box.', patience: 2 },
        ],
    });

    return pool[rng.int(0, pool.length - 1)];
}
