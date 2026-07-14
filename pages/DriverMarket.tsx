import React, { useState } from 'react';
import { useActiveGame } from '../context/GameContext';
import { Driver } from '../types';
import { freeAgents, signingFee } from '../engine/market';
import { Badge, Button, Card, SectionTitle, StatBar, money } from '../components/ui';

const DriverCard = ({ driver, footer }: { driver: Driver; footer?: React.ReactNode }) => (
    <Card>
        <div className="flex items-center justify-between mb-2">
            <span className="font-bold">{driver.name}</span>
            <Badge>{driver.shortCode}</Badge>
        </div>
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
    const [hiring, setHiring] = useState<Driver | null>(null);

    const confirmSwap = (outDriverId: string) => {
        if (!hiring) return;
        dispatch({ type: 'SWAP_DRIVER', outDriverId, inDriverId: hiring.id, signingFee: signingFee(hiring) });
        setHiring(null);
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div>
                <SectionTitle>Tu alineación</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {player.driverIds.map(id => <DriverCard key={id} driver={game.drivers[id]} />)}
                </div>
            </div>

            <div>
                <SectionTitle>Agentes libres</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {agents.map(d => {
                        const fee = signingFee(d);
                        const affordable = player.budget >= fee;
                        return (
                            <DriverCard
                                key={d.id}
                                driver={d}
                                footer={
                                    <Button disabled={!affordable} onClick={() => setHiring(d)} className="w-full">
                                        Fichar · {money(fee)}
                                    </Button>
                                }
                            />
                        );
                    })}
                    {agents.length === 0 && <p className="text-sm text-text-sub">No quedan pilotos libres.</p>}
                </div>
            </div>

            {hiring && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setHiring(null)}>
                    <div className="bg-card-dark border border-border-dark rounded-2xl p-5 max-w-sm w-full" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold mb-1">Fichar a {hiring.name}</h3>
                        <p className="text-sm text-text-sub mb-4">
                            Prima de fichaje {money(signingFee(hiring))} + salario {money(hiring.salary)}/año. ¿A quién sustituye?
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
