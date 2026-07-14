// RNG con seed (mulberry32) para que las simulaciones sean reproducibles.
export class Rng {
    state: number;

    constructor(seed: number) {
        this.state = seed >>> 0;
    }

    next(): number {
        this.state = (this.state + 0x6D2B79F5) >>> 0;
        let t = this.state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    chance(p: number): boolean {
        return this.next() < p;
    }

    int(min: number, max: number): number {
        return min + Math.floor(this.next() * (max - min + 1));
    }

    pick<T>(arr: T[]): T {
        return arr[Math.floor(this.next() * arr.length)];
    }

    // Box-Muller
    gaussian(mean = 0, sd = 1): number {
        let u = 0;
        while (u === 0) u = this.next();
        const v = this.next();
        return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }
}
