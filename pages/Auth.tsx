import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Button, PinModal } from '../components/Shared';
import { Role } from '../types';

export const Registration = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-sm mx-auto bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-gray-100 relative flex flex-col h-[812px] max-h-[90vh]">
                {/* Simplified for direct flow access in this demo */}
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="bg-primary/10 p-6 rounded-3xl mb-6 text-primary">
                        <Icon name="eco" className="text-6xl" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">HarvestPro NZ</h1>
                    <p className="text-gray-500 text-center mb-10">Orchard Management System 2025</p>
                    <Button fullWidth icon="login" onClick={() => navigate('/role-select')}>Enter Workspace</Button>
                </div>
            </div>
        </div>
    );
};

export const RoleSelection = () => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [showPin, setShowPin] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleRoleSelect = (role: Role) => {
        setSelectedRole(role);
        setShowPin(true);
    };

    const handlePinSuccess = () => {
        setShowPin(false);
        setShowSuccess(true);
    };

    const handleEnter = () => {
        if (selectedRole === Role.MANAGER) navigate('/manager/dashboard');
        else if (selectedRole === Role.TEAM_LEAD) navigate('/tl/home');
        else navigate('/runner/logistics');
    };

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-8 text-white animate-in zoom-in duration-300">
                <div className="bg-white text-primary rounded-full p-8 mb-6 shadow-2xl">
                    <Icon name="check" className="text-6xl font-bold" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Access Granted</h2>
                <p className="text-white/80 mb-12">Welcome back, {selectedRole === Role.MANAGER ? 'Manager' : selectedRole === Role.TEAM_LEAD ? 'Team Lead' : 'Runner'}.</p>
                <button 
                    onClick={handleEnter}
                    className="w-full max-w-xs bg-white text-primary font-bold h-16 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-lg active:scale-95 transition-transform"
                >
                    Enter Workspace <Icon name="arrow_forward" />
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-6">
            <header className="pt-10 pb-6">
                 <h1 className="text-2xl font-bold text-gray-900">Select Role</h1>
                 <p className="text-gray-500">Choose your department to login.</p>
            </header>
            
            <div className="flex-1 flex flex-col gap-4">
                {[
                    { id: Role.MANAGER, label: 'Manager', icon: 'admin_panel_settings', desc: 'Operations Control Center', color: 'bg-gray-900 text-white' },
                    { id: Role.TEAM_LEAD, label: 'Team Lead', icon: 'groups', desc: 'Field Supervision & QC', color: 'bg-primary text-white' },
                    { id: Role.RUNNER, label: 'Runner', icon: 'shopping_basket', desc: 'Logistics & Warehouse', color: 'bg-blue-600 text-white' }
                ].map((role) => (
                    <button 
                        key={role.id}
                        onClick={() => handleRoleSelect(role.id)}
                        className={`relative overflow-hidden rounded-3xl p-6 text-left shadow-lg transition-transform active:scale-[0.98] ${role.color} h-40 flex flex-col justify-between group`}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Icon name={role.icon} className="text-8xl" />
                        </div>
                        <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Icon name={role.icon} className="text-2xl" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">{role.label}</h3>
                            <p className="text-xs opacity-80 font-medium tracking-wide uppercase">{role.desc}</p>
                        </div>
                    </button>
                ))}
            </div>

            <PinModal 
                isOpen={showPin} 
                onClose={() => setShowPin(false)} 
                onSuccess={handlePinSuccess} 
            />
        </div>
    );
};