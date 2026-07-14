import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { CIRCUITS } from '../data/circuits';
import { money } from './ui';

const NAV = [
    { to: '/dashboard', icon: 'dashboard', label: 'Inicio' },
    { to: '/standings', icon: 'leaderboard', label: 'Mundial' },
    { to: '/development', icon: 'construction', label: 'Coche' },
    { to: '/market', icon: 'sports_motorsports', label: 'Pilotos' },
    { to: '/finances', icon: 'payments', label: 'Finanzas' },
];

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
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-text-sub hidden sm:inline">
                            {game.season} · Ronda {Math.min(game.raceIndex + 1, CIRCUITS.length)}/{CIRCUITS.length}
                        </span>
                        <span className="font-semibold tabular-nums" style={{ color: game.teams[game.playerTeamId].color }}>
                            {game.teams[game.playerTeamId].shortName}
                        </span>
                        <span className="text-gap-green font-semibold tabular-nums">{money(game.teams[game.playerTeamId].budget)}</span>
                    </div>
                </header>
            )}
            <main className="flex-1 px-4 py-4 pb-24">{children}</main>
            {game && !location.pathname.startsWith('/race') && (
                <nav className="fixed bottom-0 left-0 right-0 bg-card-dark border-t border-border-dark z-40">
                    <div className="max-w-5xl mx-auto flex justify-around py-2">
                        {NAV.map(item => {
                            const active = location.pathname === item.to;
                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className={`flex flex-col items-center gap-0.5 min-w-[60px] text-[10px] font-medium transition-colors ${active ? 'text-f1-red' : 'text-text-sub hover:text-text-main'}`}
                                >
                                    <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            )}
        </div>
    );
};
