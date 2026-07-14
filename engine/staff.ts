import { StaffMember, StaffRole, Team } from '../types';
import {
    STAFF_PC_PIT_DELTA_MAX, STAFF_RE_QUALI_NOISE_MAX, STAFF_SIGNING_FEE_FACTOR,
    STAFF_TD_DEV_DISCOUNT_MAX, RACES_PER_SEASON,
} from '../data/constants';

export interface StaffEffects {
    devDiscount: number;   // 0-0.2: descuento en coste de desarrollo (TD)
    qualiNoiseMult: number; // 1 → sin efecto; hasta 0.85 (RE)
    reSkill: number;        // skill del ingeniero para el feedback de setup (50 = neutro)
    pitLossDelta: number;   // s menos por parada (negativo, PC)
}

const NEUTRAL: StaffEffects = { devDiscount: 0, qualiNoiseMult: 1, reSkill: 50, pitLossDelta: 0 };

// Efectos del personal de un equipo. Neutro para roles vacíos.
export function staffEffects(team: Team, staff: Record<string, StaffMember>): StaffEffects {
    const get = (role: StaffRole) => {
        const id = team.staffIds?.[role];
        return id ? staff[id] ?? null : null;
    };
    const td = get('td');
    const re = get('re');
    const pc = get('pc');
    return {
        devDiscount: td ? (td.skill / 100) * STAFF_TD_DEV_DISCOUNT_MAX : NEUTRAL.devDiscount,
        qualiNoiseMult: re ? 1 - (re.skill / 100) * STAFF_RE_QUALI_NOISE_MAX : NEUTRAL.qualiNoiseMult,
        reSkill: re ? re.skill : NEUTRAL.reSkill,
        pitLossDelta: pc ? -(pc.skill / 100) * STAFF_PC_PIT_DELTA_MAX : NEUTRAL.pitLossDelta,
    };
}

export function staffSigningFee(m: StaffMember): number {
    return Math.round(m.salary * STAFF_SIGNING_FEE_FACTOR * 10) / 10;
}

export function staffSalaryPerRace(team: Team, staff: Record<string, StaffMember>): number {
    let total = 0;
    for (const id of Object.values(team.staffIds ?? {})) {
        if (id && staff[id]) total += staff[id].salary / RACES_PER_SEASON;
    }
    return total;
}

export function freeStaff(staff: Record<string, StaffMember>, role?: StaffRole): StaffMember[] {
    return Object.values(staff)
        .filter(m => m.teamId === null && (!role || m.role === role))
        .sort((a, b) => b.skill - a.skill);
}
