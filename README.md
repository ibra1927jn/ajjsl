# F1 Manager (web)

Juego de mánager de Fórmula 1 en el navegador, inspirado en F1 Manager de Frontier. Eres el jefe de equipo: eliges escudería, desarrollas el coche, fichas pilotos, gestionas el presupuesto y vives cada gran premio con timing en vivo y estrategia de paradas.

## Características

- **Temporada 2025 completa**: 10 equipos y parrilla real, calendario de 24 grandes premios con los 6 fines de semana **sprint** reales (el sprint reparte 8-7-...-1 puntos y define la parrilla del domingo).
- **Fin de semana de carrera**: clasificación simulada + carrera vuelta a vuelta con torre de tiempos en vivo, **mapa 2D del circuito** con los coches en movimiento, feed de eventos y control total de estrategia: compuesto de salida, paradas (blando/medio/duro/intermedio/lluvia), **dial de ritmo** (atacar/normal/conservar) y **órdenes de equipo**.
- **Clima dinámico**: puede llover a mitad de carrera, la pista se seca, los crossovers slick↔intermedio↔lluvia deciden carreras y en mojado se cometen más errores.
- **Guardado a mitad de carrera**: si cierras el navegador en plena carrera, continúas en la misma vuelta.
- **Desarrollo del coche**: las mejoras tardan 2 carreras en fabricarse y hay **cost cap** anual para todos; la IA también desarrolla.
- **Mercado vivo**: los contratos expiran, la IA ficha en invierno, llegan rookies, se retiran veteranos, puedes renovar a tus pilotos o **pagar la cláusula** de los de otros equipos.
- **Junta directiva**: objetivo de posición en constructores y medidor de paciencia; si llega a 0, estás **despedido** (game over).
- **Finanzas y mundiales** con gráficas; múltiples temporadas. Guardado automático versionado en `localStorage` (los saves antiguos migran solos).
- **Práctica libre y setup** (v3): ajusta alerones/suspensión/marchas con feedback de tus pilotos; un buen setup vale décimas todo el finde.
- **DRS y duelos** (v3): rebufo a menos de 1s, contactos con penalizaciones de 5s, y radio de pilotos en el feed.
- **Personal del equipo** (v3): director técnico, ingeniero de carrera y jefe de mecánicos con su propio mercado.
- **Dificultad, palmarés y reglamentos** (v3): fácil/normal/difícil al empezar, historial de temporadas con vitrina de trofeos, y cada 3 años un reglamento nuevo sacude la parrilla.
- **Mapa con trazados reales estilizados** (v3) para los 8 circuitos icónicos (la figura en 8 de Suzuka incluida), con línea de meta y una revolución por vuelta.
- **Simulación por sectores S1/S2/S3** (v4): la carrera avanza sector a sector (a 1x una vuelta dura ~6s), con tiempos de vuelta y de sector reales en la torre y velocidades 1x/2x/4x/8x.
- **Duración de carrera configurable** (v4): corta (25%), media (50%) o completa (100% de vueltas reales).
- **Daño de ala, VSC y banderas amarillas, y gestión de motores** (v4): los contactos rompen el ala (repara en boxes), incidentes menores traen VSC o amarilla local, y tienes 3 motores por temporada (atacar los desgasta; el 4º = sanción de parrilla).
- **Progresión de pilotos, moral, misiones y records** (v4): los pilotos envejecen, mejoran y se retiran; la moral influye en el ritmo; misiones de patrocinador por carrera; y records de vuelta por circuito con estadísticas históricas por piloto.
- **Interfaz estilo retransmisión** (v5): fuentes e iconos embebidos (funciona 100% offline), torre de tiempos broadcast con intervalo y gap al líder, mapa del circuito con dorsales, HUD reordenado en móvil y un sistema visual coherente en todas las pantallas.
- **Carrera como duelo estratégico** (v6): **ERS** con modos de despliegue (vuelta rápida / equilibrado / recargar / adelantar) y batería que gestionas cada vuelta; **IA rival reactiva** que ataca en la pelea, gestiona ritmo y te hace el **undercut**; e **ingeniero de estrategia** con ventana de parada, aviso de «box esta vuelta» y amenazas/oportunidades de los rivales.
- **Fin de semana auténtico** (v6): **clasificación por eliminación Q1/Q2/Q3** con tensión de corte, y **regla de dos compuestos** en seco.
- **Paddock vivo** (v6): **rasgos de piloto** (mago de la lluvia, cuida-ruedas, agresivo, temperamental…) que cambian su conducta en pista y clasificación; y **eventos de decisión** de junta, prensa y patrocinadores con consecuencias en presupuesto, paciencia y moral.
- **Ingeniería de equipo** (v6): **I+D con riesgo de correlación** (las mejoras entregan puntos con varianza: pueden fallar o superar lo previsto) e **instalaciones** (túnel de viento, simulador, fábrica) que subes de nivel para reducir ese riesgo, mejorar la clasificación y acelerar las paradas y la fabricación.
- **Consolidación y realismo** (v6.5): pasada de revisión — carreras más realistas (menos adelantamientos fantasma, sin paradas absurdas en sprint, menos abandonos, mundial más reñido), un **glosario "Cómo se juega"** y textos que explican el ERS, eventos de decisión con **consecuencias visibles**, y **batería/DRS de todos los coches en la torre de tiempos**. Las instalaciones ahora tienen efecto real.

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
