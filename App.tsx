import React from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { GameProvider, useGame } from './context/GameContext';
import { Layout } from './components/Layout';
import { NewGame } from './pages/NewGame';
import { Dashboard } from './pages/Dashboard';
import { RaceWeekend } from './pages/RaceWeekend';
import { Development } from './pages/Development';
import { DriverMarket } from './pages/DriverMarket';
import { Finances } from './pages/Finances';
import { Standings } from './pages/Standings';
import { SeasonEnd } from './pages/SeasonEnd';

// Las páginas de partida solo son accesibles con una partida activa.
const RequireGame = ({ children }: { children: React.ReactNode }) => {
    const { game } = useGame();
    if (!game) return <Navigate to="/" replace />;
    return <>{children}</>;
};

const App = () => (
    <GameProvider>
        <HashRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<NewGame />} />
                    <Route path="/dashboard" element={<RequireGame><Dashboard /></RequireGame>} />
                    <Route path="/race" element={<RequireGame><RaceWeekend /></RequireGame>} />
                    <Route path="/development" element={<RequireGame><Development /></RequireGame>} />
                    <Route path="/market" element={<RequireGame><DriverMarket /></RequireGame>} />
                    <Route path="/finances" element={<RequireGame><Finances /></RequireGame>} />
                    <Route path="/standings" element={<RequireGame><Standings /></RequireGame>} />
                    <Route path="/season-end" element={<RequireGame><SeasonEnd /></RequireGame>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Layout>
        </HashRouter>
    </GameProvider>
);

export default App;
