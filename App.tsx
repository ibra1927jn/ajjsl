import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Registration, RoleSelection, PasswordRecovery, SuccessScreen } from './pages/Auth';
import { ManagerDashboard, ManagerTeams, ManagerLogistics, ManagerSettings, ManagerMessaging } from './pages/Manager';
import { RunnerLogistics, RunnerWarehouse, RunnerTeam, RunnerMessaging } from './pages/Runner';
import { TLHome, TLProfile, TLCrew, TLRows } from './pages/TeamLeader';
import { OfflineBanner } from './components/Shared';
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

    const NavItem = ({ to, icon, label, activeColor = 'text-primary' }: any) => {
        const isActive = path === to;
        return (
            <Link to={to} className={`flex flex-col items-center justify-center w-full h-full transition-colors group ${isActive ? activeColor : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}>
                <span className={`material-symbols-outlined text-[24px] mb-1 group-hover:scale-110 transition-transform ${isActive ? 'filled' : ''}`} style={isActive ? {fontVariationSettings: "'FILL' 1"} : {}}>{icon}</span>
                <span className="text-[10px] font-medium">{label}</span>
            </Link>
        );
    };

    // Runner Nav (White/Dark Mode compatible)
    if (path.includes('/runner')) {
        return (
            <div className="fixed bottom-0 left-0 w-full z-20 bg-white dark:bg-[#1b0d0f] border-t border-gray-100 dark:border-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-safe">
                <nav className="flex items-center justify-around px-2 py-3">
                    <NavItem to="/runner/logistics" icon="local_shipping" label="Logistics" activeColor="text-primary" />
                    <NavItem to="/runner/team" icon="barcode_reader" label="Team" activeColor="text-primary" /> {/* Reusing barcode icon for team list as per HTML slot, technically coordination */}
                    <NavItem to="/runner/warehouse" icon="inventory_2" label="Warehouse" activeColor="text-primary" />
                    <NavItem to="/runner/messaging" icon="chat" label="Messaging" activeColor="text-primary" />
                </nav>
                <div className="h-1 w-full bg-white dark:bg-[#1b0d0f]"></div>
            </div>
        );
    }
    
    // Manager Nav (Dark Mode mainly)
    if (path.includes('/manager')) {
        return (
             <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-card-dark border-t border-gray-200 dark:border-white/10 pb-6 pt-3 px-6 z-50">
                <nav className="flex justify-between items-center">
                    <NavItem to="/manager/dashboard" icon="dashboard" label="Dashboard" activeColor="text-primary" />
                    <NavItem to="/manager/teams" icon="groups" label="Teams" activeColor="text-primary" />
                    <NavItem to="/manager/logistics" icon="local_shipping" label="Logistics" activeColor="text-primary" />
                    <NavItem to="/manager/messaging" icon="chat" label="Messaging" activeColor="text-primary" />
                </nav>
            </div>
        );
    }

    // TL Nav (Light Mode)
    if (path.includes('/tl')) {
        return (
            <div className="fixed bottom-0 w-full bg-white border-t border-border-light z-50 pb-safe-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
                <nav className="grid grid-cols-4 items-center h-16">
                    <NavItem to="/tl/home" icon="home" label="Home" activeColor="text-primary-vibrant" />
                    <NavItem to="/tl/crew" icon="group" label="Team" activeColor="text-primary-vibrant" />
                    <NavItem to="/tl/rows" icon="assignment" label="Tasks" activeColor="text-primary-vibrant" />
                    <NavItem to="/tl/profile" icon="person" label="Profile" activeColor="text-primary-vibrant" />
                </nav>
                <div className="fixed bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent pointer-events-none z-10"></div>
            </div>
        );
    }

    return null;
};

const AppContent = () => {
    return (
        <HashRouter>
            <Layout>
                <Routes>
                    {/* Auth */}
                    <Route path="/" element={<Registration />} />
                    <Route path="/role-select" element={<RoleSelection />} />
                    <Route path="/password-recovery" element={<PasswordRecovery />} />
                    <Route path="/success" element={<SuccessScreen />} />
                    
                    {/* Manager Routes */}
                    <Route path="/manager/dashboard" element={<ManagerDashboard />} />
                    <Route path="/manager/teams" element={<ManagerTeams />} />
                    <Route path="/manager/logistics" element={<ManagerLogistics />} />
                    <Route path="/manager/settings" element={<ManagerSettings />} />
                    <Route path="/manager/messaging" element={<ManagerMessaging />} />
                    
                    {/* Runner Routes */}
                    <Route path="/runner/logistics" element={<RunnerLogistics />} />
                    <Route path="/runner/warehouse" element={<RunnerWarehouse />} />
                    <Route path="/runner/team" element={<RunnerTeam />} />
                    <Route path="/runner/messaging" element={<RunnerMessaging />} />
                    
                    {/* TL Routes */}
                    <Route path="/tl/home" element={<TLHome />} />
                    <Route path="/tl/crew" element={<TLCrew />} />
                    <Route path="/tl/rows" element={<TLRows />} />
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