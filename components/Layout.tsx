import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { CIRCUITS } from '../data/circuits';
import { money } from './ui';
import { IconHome, IconTrophy, IconWrench, IconHelmet, IconWallet, IconSettings } from './icons';

const NAV = [
    { to: '/dashboard', Icon: IconHome, label: 'Inicio' },
    { to: '/standings', Icon: IconTrophy, label: 'Mundial' },
    { to: '/development', Icon: IconWrench, label: 'Equipo' },
    { to: '/market', Icon: IconHelmet, label: 'Pilotos' },
    { to: '/finances', Icon: IconWallet, label: 'Finanzas' },
];

const SettingsMenu = () => {
    const { dispatch } = useGame();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const close = () => { setOpen(false); setConfirmDelete(false); };

    return (
        <div className="relative">
            <button
                onClick={() => (open ? close() : setOpen(true))}
                className="text-text-sub hover:text-text-main"
                aria-label="Ajustes"
            >
                <IconSettings size={20} />
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={close} />
                    <div className="absolute right-0 top-8 z-50 bg-card-dark border border-border-dark rounded-xl shadow-lg py-1 w-52">
                        <button
                            onClick={() => { close(); navigate('/'); }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-card-darker"
                        >
                            🏁 Nueva partida
                        </button>
                        {confirmDelete ? (
                            <button
                                onClick={() => { close(); dispatch({ type: 'RESET' }); navigate('/'); }}
                                className="w-full text-left px-4 py-2 text-sm text-danger font-bold hover:bg-card-darker"
                            >
                                ¿Seguro? Borrar para siempre
                            </button>
                        ) : (
                            <button
                                onClick={() => setConfirmDelete(true)}
                                className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-card-darker"
                            >
                                🗑️ Borrar partida
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
    const { game } = useGame();
    const location = useLocation();

    return (
        <div className="min-h-screen flex flex-col max-w-5xl mx-auto">
            {game && (
                <header className="flex items-center justify-between px-4 py-3 border-b border-border-dark sticky top-0 bg-background-dark/95 backdrop-blur z-40">
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <span className="bg-f1-red text-white font-extrabold italic px-2 py-0.5 rounded">F1</span>
                        <span className="font-bold">Manager</span>
                    </Link>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-text-sub hidden sm:inline">
                            {game.season} · Ronda {Math.min(game.raceIndex + 1, CIRCUITS.length)}/{CIRCUITS.length}
                        </span>
                        <span className="font-semibold tabular-nums" style={{ color: game.teams[game.playerTeamId].color }}>
                            {game.teams[game.playerTeamId].shortName}
                        </span>
                        <span className="text-gap-green font-semibold tabular-nums">{money(game.teams[game.playerTeamId].budget)}</span>
                        <SettingsMenu />
                    </div>
                </header>
            )}
            <main className="flex-1 px-4 py-4 pb-24">{children}</main>
            {game && !location.pathname.startsWith('/race') && (
                <nav className="fixed bottom-0 left-0 right-0 bg-card-dark border-t border-border-dark z-40">
                    <div className="max-w-5xl mx-auto flex justify-around py-2">
                        {NAV.map(({ to, Icon, label }) => {
                            const active = location.pathname === to;
                            return (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`flex flex-col items-center gap-0.5 min-w-[60px] text-[10px] font-medium transition-colors ${active ? 'text-f1-red' : 'text-text-sub hover:text-text-main'}`}
                                >
                                    <Icon size={22} />
                                    {label}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            )}
        </div>
    );
};
