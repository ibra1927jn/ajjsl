import { StaffMember, StaffRole } from '../types';
import { TEAMS } from './teams';

// Pool inicial de personal: uno por rol y equipo (skill según el nivel del
// equipo) + 2 agentes libres por rol. Nombres ficticios.
const NAMES: Record<StaffRole, string[]> = {
    td: ['Adrian Foster', 'Enrico Baldi', 'James Whitmore', 'Rob Kessler', 'Dan Fallow',
        'Marco Resta', 'Pierre Vachon', 'Jody Ecclestone', 'Simone Ferri', 'Gustav Brandt',
        'Nikolas Tombas', 'Aldo Costa Jr.'],
    re: ['Hannah Bonner', 'Peter Bono', 'Xavi Marcos', 'Tom Stallard', 'Riccardo Adami',
        'Will Joseph', 'Gaëtan Jego', 'Chris Cronin', 'Jörn Becker', 'Marta Vidal',
        'Ed Regan', 'Sofia Lindh'],
    pc: ['Lando Quinn', 'Phil Turner', 'Sam McAdam', 'Diego Ferrán', 'Kenji Nakamura',
        'Otto Weiss', 'Ben Hollis', 'Luca Moretti', 'Pat Riley', 'Iker Zubiaga',
        'Max Lehmann', 'Théo Garnier'],
};

const ROLES: StaffRole[] = ['td', 're', 'pc'];

function build(): StaffMember[] {
    const members: StaffMember[] = [];
    for (const role of ROLES) {
        NAMES[role].forEach((name, i) => {
            const teamId = i < TEAMS.length ? TEAMS[i].id : null; // TEAMS está ordenado de mejor a peor coche
            const skill = teamId ? 78 - i * 3 : 60 - (i - TEAMS.length) * 5; // 78..51 empleados; 60/55 libres
            members.push({
                id: `${role}_${i}`,
                name,
                role,
                skill,
                salary: Math.round((1 + skill / 40) * 10) / 10, // ~2.3-3.0 $M
                contractYears: teamId ? 2 : 0,
                teamId,
            });
        });
    }
    return members;
}

export const STAFF: StaffMember[] = build();

// Reparto inicial: pool clonado + staffIds por equipo.
export function initialStaffAssignment(): {
    staff: Record<string, StaffMember>;
    byTeam: Record<string, Record<StaffRole, string | null>>;
} {
    const staff: Record<string, StaffMember> = {};
    const byTeam: Record<string, Record<StaffRole, string | null>> = {};
    for (const t of TEAMS) byTeam[t.id] = { td: null, re: null, pc: null };
    for (const m of STAFF) {
        staff[m.id] = { ...m };
        if (m.teamId) byTeam[m.teamId][m.role] = m.id;
    }
    return { staff, byTeam };
}

export const ROLE_LABELS: Record<StaffRole, string> = {
    td: 'Director técnico',
    re: 'Ingeniero de carrera',
    pc: 'Jefe de mecánicos',
};
