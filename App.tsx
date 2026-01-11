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

    const NavItem = ({ to, icon, label, activeColor, className = "" }: any) => {
        const isActive = path === to;
        const colorClass = isActive ? activeColor : 'text-gray-400 hover:text-gray-500';
        return (
            <Link to={to} className={`flex flex-col items-center gap-1 min-w-[64px] transition-colors group ${colorClass} ${className}`}>
                {isActive ? (
                    <span className="material-symbols-outlined filled" style={{fontVariationSettings: "'FILL' 1"}}>{icon}</span>
                ) : (
                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform">{icon}</span>
                )}
                <span className="text-[10px] font-medium">{label}</span>
            </Link>
        );
    };

    // Runner Nav (White/Clean)
    if (path.includes('/runner')) {
        return (
            <div className="fixed bottom-0 left-0 w-full z-40 bg-white dark:bg-[#1b0d0f] border-t border-gray-100 dark:border-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
                <nav className="flex items-center justify-around px-2 py-3 bg-white dark:bg-[#1b0d0f]">
                    <NavItem to="/runner/logistics" icon="local_shipping" label="Logistics" activeColor="text-runner-primary" />
                    <NavItem to="/runner/team" icon="barcode_reader" label="Scanning" activeColor="text-runner-primary" />
                    <NavItem to="/runner/warehouse" icon="inventory_2" label="Warehouse" activeColor="text-runner-primary" />
                    <NavItem to="/runner/messaging" icon="chat" label="Messaging" activeColor="text-runner-primary" />
                </nav>
            </div>
        );
    }
    
    // Manager Nav (Dark Mode)
    if (path.includes('/manager')) {
        return (
             <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-card-dark border-t border-gray-200 dark:border-white/10 pb-6 pt-3 px-6 z-50">
                <nav className="flex justify-between items-center">
                    <NavItem to="/manager/dashboard" icon="dashboard" label="Dashboard" activeColor="text-manager-primary" />
                    <NavItem to="/manager/teams" icon="groups" label="Teams" activeColor="text-manager-primary" />
                    <NavItem to="/manager/logistics" icon="local_shipping" label="Logistics" activeColor="text-manager-primary" />
                    <NavItem to="/manager/messaging" icon="chat" label="Messaging" activeColor="text-manager-primary" />
                </nav>
            </div>
        );
    }

    // TL Nav (Light Mode - Vibrant)
    if (path.includes('/tl')) {
        return (
            <div className="fixed bottom-0 w-full bg-white border-t border-border-light z-50 pb-safe-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
                <nav className="grid grid-cols-4 items-center h-16">
                    <NavItem to="/tl/home" icon="home" label="Home" activeColor="text-tl-vibrant" />
                    <NavItem to="/tl/crew" icon="group" label="Team" activeColor="text-tl-vibrant" />
                    <NavItem to="/tl/rows" icon="assignment" label="Tasks" activeColor="text-tl-vibrant" />
                    <NavItem to="/tl/profile" icon="person" label="Profile" activeColor="text-tl-vibrant" />
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