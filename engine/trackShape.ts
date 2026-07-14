import { Rng } from './rng';
import { TRACK_PATHS } from '../data/trackPaths';

// Trazado estilizado y estable por circuito: spline cerrada (Catmull-Rom → Bézier)
// sobre una elipse con jitter radial, sembrada con el hash del id del circuito.
// No pretende ser el trazado real, solo una forma distintiva y reconocible.

function hashId(id: string): number {
    let h = 5381;
    for (let i = 0; i < id.length; i++) h = ((h << 5) + h + id.charCodeAt(i)) >>> 0;
    return h;
}

const cache = new Map<string, string>();

export function trackPath(circuitId: string): string {
    // Trazado real aproximado si existe; si no, forma generada estable.
    const real = TRACK_PATHS[circuitId];
    if (real) return real;
    const cached = cache.get(circuitId);
    if (cached) return cached;

    const rng = new Rng(hashId(circuitId));
    const n = rng.int(9, 12);
    const cx = 50, cy = 50;
    const rx = 36 + rng.next() * 8;
    const ry = 26 + rng.next() * 12;
    const rot = rng.next() * Math.PI;

    const pts: [number, number][] = [];
    for (let i = 0; i < n; i++) {
        const ang = (i / n) * Math.PI * 2;
        const jr = 0.7 + rng.next() * 0.5;
        const x = Math.cos(ang) * rx * jr;
        const y = Math.sin(ang) * ry * jr;
        pts.push([
            cx + x * Math.cos(rot) - y * Math.sin(rot),
            cy + x * Math.sin(rot) + y * Math.cos(rot),
        ]);
    }

    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
        const p0 = pts[(i - 1 + n) % n];
        const p1 = pts[i];
        const p2 = pts[(i + 1) % n];
        const p3 = pts[(i + 2) % n];
        const c1x = p1[0] + (p2[0] - p0[0]) / 6;
        const c1y = p1[1] + (p2[1] - p0[1]) / 6;
        const c2x = p2[0] - (p3[0] - p1[0]) / 6;
        const c2y = p2[1] - (p3[1] - p1[1]) / 6;
        d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    d += ' Z';
    cache.set(circuitId, d);
    return d;
}
