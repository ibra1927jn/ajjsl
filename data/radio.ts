// Plantillas de radio de los pilotos del jugador. {code} = código del piloto.
export type RadioTrigger = 'tireCliff' | 'rainStart' | 'posGain' | 'posLoss' | 'fastestLap' | 'contact' | 'finalLap';

export const RADIO_TEMPLATES: Record<RadioTrigger, string[]> = {
    tireCliff: [
        '¡Estos neumáticos están muertos, no puedo mantener el ritmo!',
        'Sin goma, sin goma. Necesito boxes ya.',
        'Se me va de atrás en cada curva, los neumáticos no dan más.',
    ],
    rainStart: [
        'Está empezando a llover... la pista se está poniendo imposible.',
        'Gotas en la visera. ¿Cuándo entramos a por intermedios?',
    ],
    posGain: [
        '¡Le tengo! Buen adelantamiento, seguimos.',
        '¡Uno menos! Vamos a por el siguiente.',
        'Pasado. El coche va fino hoy.',
    ],
    posLoss: [
        'Me ha pasado, no tengo ritmo en las rectas.',
        'No he podido defenderme, íbamos muy justos.',
    ],
    fastestLap: [
        '¡Vuelta rápida! El coche vuela.',
        'Ese giro ha sido bueno, ¿eh? Vuelta rápida.',
    ],
    contact: [
        '¡Me ha tocado! Revisad el coche, noto algo raro.',
        '¡Contacto! El alerón parece entero, sigo.',
    ],
    finalLap: [
        'Última vuelta. Tráemelo a casa.',
        'Vuelta final, mantengo posición.',
    ],
};
