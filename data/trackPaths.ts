// Trazados aproximados (estilizados, reconocibles) de circuitos reales.
// ViewBox 0-100, subpath único cerrado; la meta está en el inicio del path.
// Los circuitos que no estén aquí usan la forma generada de engine/trackShape.
export const TRACK_PATHS: Record<string, string> = {
    // Mónaco: subida a Casino, horquilla de Loews, túnel y sección del puerto.
    monaco: 'M 18 62 L 30 40 Q 33 35 38 37 L 44 42 Q 47 44 45 48 L 40 52 Q 36 56 41 58 L 46 55 Q 49 53 52 55 Q 62 57 68 62 L 78 68 Q 82 71 79 74 L 60 78 Q 50 82 40 78 L 26 72 Q 16 68 18 62 Z',
    // Spa: horquilla de La Source, Eau Rouge, Kemmel, Pouhon y Blanchimont.
    belgium: 'M 28 18 L 24 12 Q 28 6 34 10 L 30 30 Q 30 36 36 37 L 70 20 Q 76 17 77 23 L 70 33 Q 66 38 70 42 L 60 48 Q 52 52 55 58 L 75 72 Q 80 76 76 82 L 45 88 Q 38 90 36 84 L 33 70 Q 31 66 30 60 Z',
    // Suzuka: el único trazado en 8 del calendario.
    japan: 'M 50 50 C 20 40, 10 70, 35 80 C 55 88, 60 65, 50 50 C 40 35, 45 12, 65 15 C 90 20, 80 45, 50 50 Z',
    // Monza: rectas larguísimas, chicanes, Lesmo y Parabólica.
    monza: 'M 30 90 L 26 44 L 29 40 L 27 36 Q 26 26 36 22 L 62 12 Q 70 10 72 16 L 74 24 Q 75 30 70 32 L 66 34 Q 62 36 63 42 L 78 78 Q 80 84 74 86 L 40 92 Q 32 93 30 90 Z',
    // Silverstone: Maggotts-Becketts y curvas rápidas.
    britain: 'M 25 80 L 45 84 Q 52 85 55 80 L 60 70 Q 62 64 68 64 L 76 66 Q 84 66 83 58 L 70 45 Q 66 40 70 36 L 78 28 Q 80 22 74 20 L 60 24 Q 55 26 52 22 L 44 14 Q 38 10 34 16 L 20 40 Q 14 46 18 54 L 22 64 Q 24 72 25 80 Z',
    // Interlagos: la "S" de Senna y el riñón compacto.
    brazil: 'M 35 30 Q 25 32 24 42 L 30 55 Q 33 60 30 65 L 45 78 Q 52 84 60 80 L 72 68 Q 78 62 74 56 L 66 50 Q 62 46 66 42 L 76 34 Q 78 26 70 24 L 42 26 Q 38 26 35 30 Z',
    // Canadá: isla Notre-Dame, larga y estrecha, con la horquilla del este.
    canada: 'M 15 65 L 60 35 Q 66 31 72 33 L 82 38 Q 88 41 85 47 L 75 50 Q 70 52 66 50 L 25 78 Q 18 82 15 76 Q 12 70 15 65 Z',
    // Singapur: callejero de ángulos rectos en Marina Bay.
    singapore: 'M 22 30 L 70 22 Q 76 21 77 27 L 79 45 L 68 47 L 70 58 L 82 56 Q 87 56 86 62 L 84 74 Q 83 79 77 78 L 40 72 L 42 62 L 30 60 Q 24 59 25 52 L 27 38 Q 27 32 22 30 Z',
};
