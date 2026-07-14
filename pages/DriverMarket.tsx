import React, { useState } from 'react';
import { useActiveGame } from '../context/GameContext';
import { Driver } from '../types';
import { buyoutFee, freeAgents, signingFee } from '../engine/market';
import { Badge, Button, Card, SectionTitle, StatBar, money } from '../components/ui';

const DriverCard = ({ driver, sub, footer }: { driver: Driver; sub?: string; footer?: React.ReactNode }) => (
    <Card>
        <div className="flex items-center justify-between mb-2">
            <span className="font-bold">{driver.name}</span>
            <Badge>{driver.shortCode}</Badge>
        </div>
        {sub && <p className="text-xs text-text-sub mb-2">{sub}</p>}
        <div className="space-y-1.5 mb-2">
            <StatBar label="Ritmo" value={driver.pace} />
            <StatBar label="Racecraft" value={driver.racecraft} color="#ffd12e" />
            <StatBar label="Consistencia" value={driver.consistency} color="#00d26a" />
            <StatBar label="Experiencia" value={driver.experience} color="#b45bff" />
        </div>
        <p className="text-xs text-text-sub mb-2">
            Salario {money(driver.salary)}/año
            {driver.contractYears > 0 && ` · ${driver.contractYears} año${driver.contractYears > 1 ? 's' : ''} de contrato`}
        </p>
        {footer}
    </Card>
);

export const DriverMarket = () => {
    const { game, dispatch } = useActiveGame();
    const player = game.teams[game.playerTeamId];
    const agents = freeAgents(game.drivers);
    const contracted = Object.values(game.drivers)
        .filter(d => d.teamId !== null && d.teamId !== game.playerTeamId)
        .sort((a, b) => b.pace - a.pace);
    const [tab, setTab] = useState<'free' | 'contracted'>('free');
    const [hiring, setHiring] = useState<Driver | null>(null);

    const hiringFee = hiring ? (hiring.teamId ? buyoutFee(hiring) : signingFee(hiring)) : 0;

    const confirmSwap = (outDriverId: string) => {
        if (!hiring) return;
        if (hiring.teamId) {
            dispatch({ type: 'POACH_DRIVER', outDriverId, inDriverId: hiring.id, fee: hiringFee });
        } else {
            dispatch({ type: 'SWAP_DRIVER', outDriverId, inDriverId: hiring.id, signingFee: hiringFee });
        }
        setHiring(null);
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div>
                <SectionTitle>Tu alineación</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {player.driverIds.map(id => {
                        const d = game.drivers[id];
                        const renewFee = signingFee(d);
                        return (
                            <DriverCard
                                key={id}
                                driver={d}
                                footer={d.contractYears <= 1 ? (
                                    <Button
                                        variant="ghost"
                                        className="w-full"
                                        disabled={player.budget < renewFee}
                                        onClick={() => dispatch({ type: 'RENEW_DRIVER', driverId: id, fee: renewFee })}
                                    >
                                        Renovar +2 años · {money(renewFee)}
                                    </Button>
                                ) : undefined}
                            />
                        );
                    })}
                </div>
                <p className="text-xs text-text-sub mt-2">
                    Los contratos que expiran al final de la temporada dejan al piloto libre; renueva a tiempo o el mercado se lo llevará.
                </p>
            </div>

            <div>
                <div className="flex items-center justify-between mb-3">
                    <SectionTitle>Mercado</SectionTitle>
                    <div className="flex gap-1 bg-card-darker rounded-xl p-1 border border-border-dark">
                        <button onClick={() => setTab('free')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold ${tab === 'free' ? 'bg-f1-red text-white' : 'text-text-sub hover:text-text-main'}`}>
                            Agentes libres
                        </button>
                        <button onClick={() => setTab('contracted')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold ${tab === 'contracted' ? 'bg-f1-red text-white' : 'text-text-sub hover:text-text-main'}`}>
                            Con contrato
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(tab === 'free' ? agents : contracted).map(d => {
                        const fee = d.teamId ? buyoutFee(d) : signingFee(d);
                        const affordable = player.budget >= fee;
                        return (
                            <DriverCard
                                key={d.id}
                                driver={d}
                                sub={d.teamId ? `Contratado por ${game.teams[d.teamId].shortName}` : undefined}
                                footer={
                                    <Button disabled={!affordable} onClick={() => setHiring(d)} className="w-full">
                                        {d.teamId ? `Pagar cláusula · ${money(fee)}` : `Fichar · ${money(fee)}`}
                                    </Button>
                                }
                            />
                        );
                    })}
                    {tab === 'free' && agents.length === 0 && <p className="text-sm text-text-sub">No quedan pilotos libres.</p>}
                </div>
            </div>

            {hiring && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setHiring(null)}>
                    <div className="bg-card-dark border border-border-dark rounded-2xl p-5 max-w-sm w-full" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold mb-1">Fichar a {hiring.name}</h3>
                        <p className="text-sm text-text-sub mb-4">
                            {hiring.teamId
                                ? `Cláusula de rescisión ${money(hiringFee)} (su salario sube a ${money(hiring.salary * 1.2)}/año). ${game.teams[hiring.teamId].shortName} ficha un sustituto al instante.`
                                : `Prima de fichaje ${money(hiringFee)} + salario ${money(hiring.salary)}/año.`}
                            {' '}¿A quién sustituye?
                        </p>
                        <div className="space-y-2">
                            {player.driverIds.map(id => (
                                <Button key={id} variant="ghost" className="w-full" onClick={() => confirmSwap(id)}>
                                    Sustituir a {game.drivers[id].name}
                                </Button>
                            ))}
                            <Button variant="danger" className="w-full" onClick={() => setHiring(null)}>Cancelar</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
