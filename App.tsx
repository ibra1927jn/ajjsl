import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Registration, RoleSelection } from './pages/Auth';
import { ManagerDashboard, ManagerTeams, ManagerSettings } from './pages/Manager';
import { RunnerLogistics, RunnerWarehouse } from './pages/Runner';
import { TLHome, TLStats, TLProfile } from './pages/TeamLeader';
import { Icon, OfflineBanner } from './components/Shared';
import { HarvestProvider, useHarvest } from './context/HarvestContext';

const Layout = ({ children }: { children: React.ReactNode }) => {
    const { isOffline } = useHarvest();
    return (
        <>
            <OfflineBanner isOffline={isOffline} />
            {children}
        </>
    );
};

const BottomNav = () => {
    const location = useLocation();
    const path = location.pathname;

    const NavLink = ({ to, icon, label, activeColor = 'text-primary' }: any) => {
        const isActive = path.includes(to);
        return (
            <Link to={to} className={`flex flex-col items-center gap-1 transition-colors ${isActive ? activeColor : 'text-gray-400'}`}>
                <Icon name={icon} filled={isActive} className="text-2xl" />
                <span className="text-[10px] font-medium">{label}</span>
            </Link>
        );
    };

    if (path.includes('/runner')) {
        return (
            <div className="fixed bottom-0 w-full bg-white dark:bg-[#1b0d0f] border-t border-gray-100 dark:border-gray-800 pb-safe z-50">
                <nav className="flex items-center justify-around px-2 py-3">
                    <NavLink to="/runner/logistics" icon="local_shipping" label="Logistics" />
                    <NavLink to="/runner/warehouse" icon="inventory_2" label="Warehouse" />
                </nav>
            </div>
        );
    }
    
    if (path.includes('/manager')) {
        return (
             <div className="fixed bottom-0 w-full bg-[#1a0508] border-t border-white/10 pb-6 pt-3 px-6 z-50">
                <nav className="flex items-center justify-between">
                    <NavLink to="/manager/dashboard" icon="dashboard" label="Home" activeColor="text-primary-vibrant" />
                    <NavLink to="/manager/teams" icon="groups" label="Teams" activeColor="text-primary-vibrant" />
                    <NavLink to="/manager/settings" icon="settings" label="Settings" activeColor="text-primary-vibrant" />
                </nav>
            </div>
        );
    }

    if (path.includes('/tl')) {
        return (
            <div className="fixed bottom-0 w-full bg-white border-t border-border-light z-50 pb-safe-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
                <nav className="grid grid-cols-3 items-center h-16">
                    <NavLink to="/tl/home" icon="home" label="Crew" activeColor="text-primary-vibrant" />
                    <NavLink to="/tl/stats" icon="bar_chart" label="Stats" activeColor="text-primary-vibrant" />
                    <NavLink to="/tl/profile" icon="person" label="Profile" activeColor="text-primary-vibrant" />
                </nav>
            </div>
        );
    }

    return null;
};

const SuccessScreen = () => (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl p-8 text-center shadow-xl">
             <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="check" className="text-green-500 text-4xl font-bold" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-500 mb-8">Your account is ready.</p>
            <Link to="/" className="block w-full bg-primary text-white font-bold py-3.5 rounded-xl">Back to Login</Link>
        </div>
    </div>
);

const AppContent = () => {
    return (
        <HashRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Registration />} />
                    <Route path="/role-select" element={<RoleSelection />} />
                    <Route path="/success" element={<SuccessScreen />} />
                    
                    {/* Manager Routes */}
                    <Route path="/manager/dashboard" element={<ManagerDashboard />} />
                    <Route path="/manager/teams" element={<ManagerTeams />} />
                    <Route path="/manager/settings" element={<ManagerSettings />} />
                    
                    {/* Runner Routes */}
                    <Route path="/runner/logistics" element={<RunnerLogistics />} />
                    <Route path="/runner/warehouse" element={<RunnerWarehouse />} />
                    
                    {/* TL Routes */}
                    <Route path="/tl/home" element={<TLHome />} />
                    <Route path="/tl/stats" element={<TLStats />} />
                    <Route path="/tl/profile" element={<TLProfile />} />
                </Routes>
                <BottomNav />
            </Layout>
        </HashRouter>
    );
}

const App = () => {
    return (
        <HarvestProvider>
            <AppContent />
        </HarvestProvider>
    );
};

export default App;