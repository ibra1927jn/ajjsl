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
    const inRace = location.pathname.startsWith('/race');
    const player = game ? game.teams[game.playerTeamId] : null;

    return (
        <div className="min-h-screen flex flex-col max-w-5xl mx-auto">
            {game && player && (
                // La cabecera es fija salvo en carrera (evita solaparse con el HUD).
                <header className={`flex items-center justify-between gap-2 px-4 py-2.5 border-b border-border-dark bg-background-dark/95 backdrop-blur z-40 ${inRace ? '' : 'sticky top-0'}`}>
                    <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
                        <span className="bg-f1-red text-white font-display font-bold italic text-lg px-2 py-0.5 rounded leading-none">F1</span>
                        <span className="font-display font-bold text-lg tracking-wide hidden sm:inline">MANAGER</span>
                    </Link>
                    <div className="flex items-center gap-2.5">
                        <div className="text-right leading-tight hidden sm:block">
                            <p className="text-[10px] uppercase tracking-widest text-text-dim">{game.season} · R{Math.min(game.raceIndex + 1, CIRCUITS.length)}/{CIRCUITS.length}</p>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg bg-card-dark border border-border-dark px-2 py-1">
                            <span className="w-1.5 h-4 rounded-full" style={{ background: player.color }} />
                            <span className="font-display font-bold text-sm tracking-wide">{player.shortName}</span>
                        </div>
                        <span className="font-display font-bold tabular-nums text-gap-green text-sm">{money(player.budget)}</span>
                        <SettingsMenu />
                    </div>
                </header>
            )}
            <main className={`flex-1 px-4 py-4 ${inRace ? 'pb-4' : 'pb-24'}`}>{children}</main>
            {game && !inRace && (
                <nav className="fixed bottom-0 left-0 right-0 bg-card-dark/95 backdrop-blur border-t border-border-dark z-40 pb-[env(safe-area-inset-bottom)]">
                    <div className="max-w-5xl mx-auto flex justify-around">
                        {NAV.map(({ to, Icon, label }) => {
                            const active = location.pathname === to;
                            return (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`relative flex flex-col items-center gap-0.5 min-w-[62px] pt-2.5 pb-2 text-[10px] font-semibold uppercase tracking-wide transition-colors ${active ? 'text-f1-red' : 'text-text-sub hover:text-text-main'}`}
                                >
                                    {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-f1-red" />}
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
