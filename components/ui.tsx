import React from 'react';

export const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-card-dark border border-border-dark rounded-2xl p-4 ${className}`}>{children}</div>
);

export const Button = ({ children, onClick, disabled = false, variant = 'primary', className = '' }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'ghost' | 'danger';
    className?: string;
}) => {
    const styles = {
        primary: 'bg-f1-red hover:bg-f1-red-dark text-white',
        ghost: 'bg-card-darker hover:bg-border-dark text-text-main border border-border-dark',
        danger: 'bg-danger/20 hover:bg-danger/30 text-danger border border-danger/40',
    };
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

export const StatBar = ({ label, value, max = 100, color = '#e10600' }: {
    label: string; value: number; max?: number; color?: string;
}) => (
    <div>
        <div className="flex justify-between text-xs mb-1">
            <span className="text-text-sub">{label}</span>
            <span className="font-semibold tabular-nums">{Math.round(value)}</span>
        </div>
        <div className="h-2 bg-card-darker rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${(value / max) * 100}%`, background: color }} />
        </div>
    </div>
);

export const Badge = ({ children, color = '#8a8a99' }: { children: React.ReactNode; color?: string }) => (
    <span
        className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold"
        style={{ background: `${color}22`, color }}
    >
        {children}
    </span>
);

export const TeamStripe = ({ color }: { color: string }) => (
    <span className="inline-block w-1 h-4 rounded-full mr-2 align-middle" style={{ background: color }} />
);

export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-lg font-bold mb-3">{children}</h2>
);

export const money = (m: number) => `${m < 0 ? '-' : ''}$${Math.abs(m).toFixed(1)}M`;

export const formatGap = (s: number) => `+${s.toFixed(1)}`;

export const formatLapTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s - m * 60;
    return `${m}:${sec.toFixed(3).padStart(6, '0')}`;
};
