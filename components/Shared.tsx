import React, { useState } from 'react';

export const Icon = ({ name, className = "", filled = false }: { name: string; className?: string; filled?: boolean }) => (
    <span 
        className={`material-symbols-outlined ${className}`}
        style={filled ? { fontVariationSettings: "'FILL' 1" } : {}}
    >
        {name}
    </span>
);

export const Button = ({ children, onClick, variant = 'primary', className = "", fullWidth = false, icon }: any) => {
    const baseStyle = "h-14 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm";
    const variants = {
        primary: "bg-primary hover:bg-primary-dark text-white shadow-lg shadow-red-900/20",
        secondary: "bg-white border-2 border-primary/10 text-primary hover:bg-cherry-light",
        ghost: "bg-transparent text-gray-500 hover:bg-gray-100",
        dark: "bg-gray-900 text-white",
        outline: "bg-transparent border border-white/20 text-white hover:bg-white/5"
    };

    return (
        <button 
            onClick={onClick} 
            className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${fullWidth ? 'w-full' : ''} ${className}`}
        >
            {icon && <Icon name={icon} className="text-xl" />}
            {children}
        </button>
    );
};

export const Avatar = ({ initials, src, className = "size-10" }: { initials?: string, src?: string, className?: string }) => {
    return (
        <div className={`${className} rounded-full bg-gray-200 overflow-hidden border border-gray-100 relative flex items-center justify-center text-gray-500 font-bold`}>
            {src ? <img src={src} alt="Avatar" className="w-full h-full object-cover" /> : initials}
        </div>
    );
};

export const Card: React.FC<{ children?: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = "", onClick }) => (
    <div onClick={onClick} className={`bg-white rounded-xl p-4 shadow-soft border border-border-light ${className}`}>
        {children}
    </div>
);

export const PinModal = ({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) => {
    const [pin, setPin] = useState("");
    
    if (!isOpen) return null;

    const handleNum = (num: string) => {
        if (pin.length < 4) {
            const newPin = pin + num;
            setPin(newPin);
            if (newPin.length === 4) {
                // Simulate verification delay
                setTimeout(() => {
                    onSuccess();
                    setPin("");
                }, 300);
            }
        }
    };

    const handleBack = () => setPin(pin.slice(0, -1));

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white animate-in fade-in duration-200">
            <div className="w-full max-w-xs">
                <div className="mb-10 text-center">
                    <Icon name="lock" className="text-4xl text-primary mb-4" />
                    <h3 className="text-2xl font-bold">Enter Access PIN</h3>
                    <div className="flex justify-center gap-4 mt-6">
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} className={`w-4 h-4 rounded-full transition-all duration-200 ${i < pin.length ? 'bg-primary scale-110' : 'bg-white/20'}`}></div>
                        ))}
                    </div>
                </div>
                
                <div className="grid grid-cols-3 gap-x-6 gap-y-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                        <button 
                            key={n} 
                            onClick={() => handleNum(n.toString())}
                            className="h-20 w-20 rounded-full bg-white/10 text-2xl font-bold hover:bg-white/20 active:bg-white/30 transition-all flex items-center justify-center mx-auto"
                        >
                            {n}
                        </button>
                    ))}
                    <div/>
                    <button 
                        onClick={() => handleNum("0")}
                        className="h-20 w-20 rounded-full bg-white/10 text-2xl font-bold hover:bg-white/20 active:bg-white/30 transition-all flex items-center justify-center mx-auto"
                    >
                        0
                    </button>
                    <button 
                        onClick={handleBack}
                        className="h-20 w-20 rounded-full text-white/50 hover:text-white transition-all flex items-center justify-center mx-auto"
                    >
                        <Icon name="backspace" className="text-2xl" />
                    </button>
                </div>
                
                <button onClick={onClose} className="mt-12 text-sm text-gray-400 w-full text-center hover:text-white">Cancel</button>
            </div>
        </div>
    );
};

export const OfflineBanner = ({ isOffline }: { isOffline: boolean }) => {
    if (!isOffline) return null;
    return (
        <div className="bg-amber-500 text-black text-xs font-bold px-4 py-1 text-center flex items-center justify-center gap-2 fixed top-0 w-full z-[60]">
            <Icon name="wifi_off" className="text-sm" />
            Offline Sync Pending - Data Saved Locally
        </div>
    );
};

export const BottomNav = ({ role, activeTab }: { role: string, activeTab: string }) => {
    return <></>; 
};