import React, { useState } from 'react';
import { useActiveGame } from '../context/GameContext';
import { CarStatKey, StaffRole } from '../types';
import { devCostCap, STAT_CAP, UPGRADE_LEAD_RACES, UPGRADE_STEP } from '../data/constants';
import { CIRCUITS } from '../data/circuits';
import { ROLE_LABELS } from '../data/staff';
import { upgradeCost } from '../engine/development';
import { carPerformance } from '../engine/performance';
import { freeStaff, staffEffects, staffSigningFee } from '../engine/staff';
import { Facilities } from '../types';
import { FACILITY_COST, FACILITY_MAX, UPGRADE_VARIANCE_BASE, WIND_TUNNEL_VARIANCE_CUT } from '../data/constants';
import { Badge, Button, Card, SectionTitle, StatBar, money } from '../components/ui';
import { IconAir, IconEngine, IconChassis, IconShield } from '../components/icons';

const STATS: { key: CarStatKey; label: string; desc: string; Icon: React.FC<{ size?: number; className?: string }> }[] = [
    { key: 'aero', label: 'Aerodinámica', desc: 'Carga y eficiencia. El área con más peso en el ritmo.', Icon: IconAir },
    { key: 'engine', label: 'Motor', desc: 'Potencia en rectas y salida de curva.', Icon: IconEngine },
    { key: 'chassis', label: 'Chasis', desc: 'Equilibrio mecánico y paso por curva lenta.', Icon: IconChassis },
    { key: 'reliability', label: 'Fiabilidad', desc: 'Menos averías y abandonos. Más barata de mejorar.', Icon: IconShield },
];

export const Development = () => {
    const { game, dispatch } = useActiveGame();
    const player = game.teams[game.playerTeamId];
    const cap = devCostCap(game.season);
    const [tab, setTab] = useState<DevTab>('car');
    const fx = staffEffects(player, game.staff);

    if (tab === 'staff') {
        return (
            <div className="space-y-4 animate-fade-in-up">
                <DevTabs tab={tab} setTab={setTab} />
                <StaffPanel />
            </div>
        );
    }

    if (tab === 'facilities') {
        return (
            <div className="space-y-4 animate-fade-in-up">
                <DevTabs tab={tab} setTab={setTab} />
                <FacilitiesPanel />
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in-up">
            <DevTabs tab={tab} setTab={setTab} />
            <div className="flex items-center justify-between">
                <SectionTitle>Desarrollo del coche</SectionTitle>
                <span className="text-sm text-text-sub">
                    Rendimiento global <span className="font-bold text-text-main">{Math.round(carPerformance(player.car))}</span>
                    {fx.devDiscount > 0 && <span className="text-gap-green"> · −{Math.round(fx.devDiscount * 100)}% coste (TD)</span>}
                </span>
            </div>
            {(() => {
                const variance = Math.max(0, UPGRADE_VARIANCE_BASE - WIND_TUNNEL_VARIANCE_CUT * (player.facilities.windTunnel - 1));
                return (
                    <p className="text-xs text-text-sub">
                        Riesgo de correlación actual: <span className={variance > 0.2 ? 'text-danger font-semibold' : variance > 0.1 ? 'text-pit-yellow font-semibold' : 'text-gap-green font-semibold'}>±{Math.round(variance * 100)}%</span>
                        {' '}sobre lo previsto — sube el túnel de viento (Instalaciones) para reducirlo.
                    </p>
                );
            })()}

            <Card>
                <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold">Cost cap de desarrollo</p>
                    <p className="text-sm tabular-nums text-text-sub">
                        {money(player.devSpendSeason)} / {money(cap)}
                    </p>
                </div>
                <div className="h-2 bg-card-darker rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{
                        width: `${Math.min(100, (player.devSpendSeason / cap) * 100)}%`,
                        background: player.devSpendSeason / cap > 0.85 ? '#ff4d4d' : '#e10600',
                    }} />
                </div>
                {game.upgradeQueue.length > 0 && (
                    <div className="mt-3 space-y-1">
                        <p className="text-xs font-bold text-text-sub uppercase tracking-wider">En fabricación</p>
                        {game.upgradeQueue.map((o, i) => (
                            <p key={i} className="text-xs text-text-sub">
                                ⚙️ {o.stat} ~+{o.predicted}
                                {o.variance > 0 && <span className="text-pit-yellow"> ±{Math.round(o.variance * 100)}%</span>} · lista para{' '}
                                <span className="text-text-main font-semibold">
                                    {CIRCUITS[Math.min(o.readyAtRace, CIRCUITS.length - 1)].name}
                                </span>
                            </p>
                        ))}
                    </div>
                )}
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {STATS.map(({ key, label, desc, Icon }) => {
                    const level = player.car[key];
                    const queued = game.upgradeQueue.filter(o => o.stat === key).reduce((s, o) => s + o.points, 0);
                    const cost = Math.round(upgradeCost(key, level + queued) * (1 - fx.devDiscount) * 10) / 10;
                    const capped = level + queued + UPGRADE_STEP > STAT_CAP;
                    const overCap = player.devSpendSeason + cost > cap;
                    const affordable = player.budget >= cost;
                    return (
                        <Card key={key}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-f1-red"><Icon size={20} /></span>
                                <span className="font-bold">{label}</span>
                            </div>
                            <StatBar label="" value={level} color={key === 'reliability' ? '#00d26a' : player.color} />
                            <p className="text-xs text-text-sub mt-2 mb-3">
                                {desc}
                                {queued > 0 && <span className="text-pit-yellow"> · +{queued} en fabricación</span>}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm tabular-nums">
                                    +{UPGRADE_STEP} pts · <span className={affordable && !overCap ? 'text-gap-green' : 'text-danger'}>{money(cost)}</span>
                                </span>
                                <Button
                                    disabled={capped || !affordable || overCap}
                                    onClick={() => dispatch({ type: 'APPLY_UPGRADE', stat: key, points: UPGRADE_STEP, cost })}
                                >
                                    {capped ? 'Máximo' : overCap ? 'Cost cap' : 'Fabricar'}
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>
            <p className="text-xs text-text-sub">
                Las mejoras tardan {UPGRADE_LEAD_RACES} carreras en fabricarse y montarse en el coche. El gasto en
                desarrollo de TODOS los equipos está limitado por el cost cap anual; la IA también invierte tras cada carrera.
            </p>
        </div>
    );
};

type DevTab = 'car' | 'staff' | 'facilities';
const DEV_TAB_LABEL: Record<DevTab, string> = { car: 'Coche', staff: 'Personal', facilities: 'Instalaciones' };
const DevTabs = ({ tab, setTab }: { tab: DevTab; setTab: (t: DevTab) => void }) => (
    <div className="flex gap-1 bg-card-darker rounded-xl p-1 border border-border-dark w-fit">
        {(['car', 'staff', 'facilities'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold ${tab === t ? 'bg-f1-red text-white' : 'text-text-sub hover:text-text-main'}`}>
                {DEV_TAB_LABEL[t]}
            </button>
        ))}
    </div>
);

const FACILITY_META: { key: keyof Facilities; label: string; desc: string }[] = [
    { key: 'windTunnel', label: 'Túnel de viento', desc: 'Mejoras más fiables: reduce la varianza de correlación del desarrollo.' },
    { key: 'simulator', label: 'Simulador', desc: 'Menos ruido en clasificación y mejor lectura del setup.' },
    { key: 'factory', label: 'Fábrica', desc: 'Paradas más rápidas; a nivel 5, una carrera menos de fabricación.' },
];

const FacilitiesPanel = () => {
    const { game, dispatch } = useActiveGame();
    const player = game.teams[game.playerTeamId];
    return (
        <div className="space-y-4">
            <SectionTitle eyebrow="Infraestructura">Instalaciones</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {FACILITY_META.map(({ key, label, desc }) => {
                    const level = player.facilities[key];
                    const maxed = level >= FACILITY_MAX;
                    const cost = maxed ? 0 : FACILITY_COST[level];
                    const affordable = player.budget >= cost;
                    return (
                        <Card key={key} accent={player.color}>
                            <p className="font-bold text-sm mb-1">{label}</p>
                            <div className="flex items-center gap-1 mb-2">
                                {Array.from({ length: FACILITY_MAX }).map((_, i) => (
                                    <span key={i} className={`h-2 flex-1 rounded-full ${i < level ? 'bg-gap-green' : 'bg-card-darker'}`} />
                                ))}
                            </div>
                            <p className="font-display text-lg font-bold tabular-nums leading-none">Nivel {level}<span className="text-text-dim text-sm">/{FACILITY_MAX}</span></p>
                            <p className="text-[11px] text-text-sub mt-2 mb-3">{desc}</p>
                            <Button size="sm" className="w-full justify-center"
                                disabled={maxed || !affordable}
                                onClick={() => dispatch({ type: 'UPGRADE_FACILITY', facility: key, cost })}>
                                {maxed ? 'Al máximo' : `Subir nivel · ${money(cost)}`}
                            </Button>
                        </Card>
                    );
                })}
            </div>
            <p className="text-xs text-text-sub">
                Las instalaciones se pagan con presupuesto (no cuentan para el cost cap de desarrollo) y se conservan
                entre temporadas. Un buen túnel de viento hace que tus mejoras entreguen lo previsto en vez de fallar.
            </p>
        </div>
    );
};

const ROLE_DESC: Record<StaffRole, string> = {
    td: 'Abarata el desarrollo del coche (hasta −20%).',
    re: 'Feedback de setup más preciso y menos ruido en quali.',
    pc: 'Paradas más rápidas (hasta −2s).',
};

const StaffPanel = () => {
    const { game, dispatch } = useActiveGame();
    const player = game.teams[game.playerTeamId];
    const roles: StaffRole[] = ['td', 're', 'pc'];

    return (
        <div className="space-y-6">
            <div>
                <SectionTitle>Tu personal</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {roles.map(role => {
                        const id = player.staffIds[role];
                        const m = id ? game.staff[id] : null;
                        return (
                            <Card key={role}>
                                <p className="text-xs text-text-sub uppercase font-bold tracking-wider mb-1">{ROLE_LABELS[role]}</p>
                                {m ? (
                                    <>
                                        <p className="font-bold text-sm mb-1">{m.name}</p>
                                        <StatBar label="Habilidad" value={m.skill} />
                                        <p className="text-xs text-text-sub mt-2">
                                            {money(m.salary)}/año · {m.contractYears} año{m.contractYears !== 1 ? 's' : ''}
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-sm text-danger font-semibold">Vacante</p>
                                )}
                                <p className="text-[11px] text-text-sub mt-2">{ROLE_DESC[role]}</p>
                            </Card>
                        );
                    })}
                </div>
            </div>

            <div>
                <SectionTitle>Mercado de personal</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {freeStaff(game.staff).map(m => {
                        const fee = staffSigningFee(m);
                        const affordable = player.budget >= fee;
                        return (
                            <Card key={m.id}>
                                <div className="flex items-center justify-between mb-1">
                                    <p className="font-bold text-sm">{m.name}</p>
                                    <Badge>{ROLE_LABELS[m.role]}</Badge>
                                </div>
                                <StatBar label="Habilidad" value={m.skill} />
                                <p className="text-xs text-text-sub my-2">{money(m.salary)}/año</p>
                                <Button
                                    className="w-full"
                                    disabled={!affordable}
                                    onClick={() => dispatch({ type: 'HIRE_STAFF', staffId: m.id, fee })}
                                >
                                    Fichar · {money(fee)}
                                </Button>
                            </Card>
                        );
                    })}
                    {freeStaff(game.staff).length === 0 && (
                        <p className="text-sm text-text-sub">No hay personal libre ahora mismo. Los contratos expiran a final de temporada.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
