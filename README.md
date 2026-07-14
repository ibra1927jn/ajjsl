# F1 Manager (web)

Juego de mánager de Fórmula 1 en el navegador, inspirado en F1 Manager de Frontier. Eres el jefe de equipo: eliges escudería, desarrollas el coche, fichas pilotos, gestionas el presupuesto y vives cada gran premio con timing en vivo y estrategia de paradas.

## Características

- **Temporada 2025 completa**: 10 equipos y parrilla real, calendario de 24 grandes premios.
- **Fin de semana de carrera**: clasificación simulada + carrera vuelta a vuelta con torre de tiempos en vivo, feed de eventos (adelantamientos, paradas, abandonos, safety car) y control de estrategia: tú decides cuándo paran tus coches y qué compuesto montan (blando/medio/duro).
- **Desarrollo del coche**: invierte en aerodinámica, motor, chasis y fiabilidad. La IA también desarrolla.
- **Mercado de pilotos**: ficha agentes libres con prima y salario.
- **Finanzas**: premios por resultado, patrocinio por carrera, salarios y libro de movimientos.
- **Mundiales de pilotos y constructores** con gráficas de progresión; múltiples temporadas.
- Guardado automático en `localStorage`. (Refrescar a mitad de carrera te devuelve al inicio del fin de semana.)

## Ejecutar en local

Requisitos: Node.js

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## Estructura

- `data/` — equipos, pilotos, circuitos y **todas las constantes de balance** (`constants.ts`).
- `engine/` — motor del juego en TypeScript puro (sin React), con RNG con seed reproducible: clasificación, carrera vuelta a vuelta, adelantamientos, paradas, incidentes, resultados, desarrollo y mercado.
- `context/` + `services/` — estado global (reducer) y persistencia versionada.
- `pages/` + `components/` + `hooks/` — interfaz React.
