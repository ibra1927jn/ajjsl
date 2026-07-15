import React from 'react';

// ===== Superficies =====

export const Card = ({ children, className = '', accent, hero = false }: {
    children: React.ReactNode;
    className?: string;
    accent?: string;   // color hex de acento (barra lateral izquierda)
    hero?: boolean;    // tarjeta destacada (borde de acento + sombra)
}) => (
    <div
        className={`relative bg-card-dark border rounded-2xl p-4 shadow-card ${hero ? 'border-f1-red/40 shadow-hero' : 'border-border-dark'} ${className}`}
    >
        {accent && <span className="absolute left-0 top-3 bottom-3 w-1 rounded-full" style={{ background: accent }} />}
        {children}
    </div>
);

// Panel del HUD: superficie con cabecera opcional.
export const Panel = ({ title, right, children, className = '', bodyClass = '' }: {
    title?: React.ReactNode;
    right?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    bodyClass?: string;
}) => (
    <div className={`bg-card-darker border border-border-dark rounded-2xl overflow-hidden ${className}`}>
        {title && (
            <div className="flex items-center justify-between px-3 py-2 border-b border-border-dark/70">
                <span className="font-display text-xs font-bold uppercase tracking-widest text-text-sub">{title}</span>
                {right}
            </div>
        )}
        <div className={bodyClass}>{children}</div>
    </div>
);

// ===== Botones =====

type ButtonSize = 'sm' | 'md' | 'lg' | 'block';
export const Button = ({ children, onClick, disabled = false, variant = 'primary', size = 'md', icon, className = '' }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'ghost' | 'danger';
    size?: ButtonSize;
    icon?: React.ReactNode;
    className?: string;
}) => {
    const styles = {
        primary: 'bg-f1-red hover:bg-f1-red-dark text-white',
        ghost: 'bg-card-2 hover:bg-border-dark text-text-main border border-border-dark',
        danger: 'bg-danger/15 hover:bg-danger/25 text-danger border border-danger/40',
    };
    const sizes: Record<ButtonSize, string> = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-3 text-base',
        block: 'w-full px-5 py-3 text-base justify-center',
    };
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center gap-2 rounded-xl font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${sizes[size]} ${styles[variant]} ${className}`}
        >
            {icon}
            {children}
        </button>
    );
};

// ===== Datos / indicadores =====

// Devuelve un color de la paleta según umbrales (verde/amarillo/rojo).
export const triColor = (v: number, good = 60, warn = 35) =>
    v >= good ? '#22e07a' : v >= warn ? '#ffd12e' : '#ff4d4d';

export const StatBar = ({ label, value, max = 100, color = '#e10600' }: {
    label?: string; value: number; max?: number; color?: string;
}) => (
    <div>
        {label !== undefined && (
            <div className="flex justify-between text-xs mb-1">
                <span className="text-text-sub">{label}</span>
                <span className="font-semibold tabular-nums">{Math.round(value)}</span>
            </div>
        )}
        <div className="h-2 bg-card-darker rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }} />
        </div>
    </div>
);

export const Badge = ({ children, color = '#9a9aab' }: { children: React.ReactNode; color?: string }) => (
    <span
        className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide"
        style={{ background: `${color}22`, color }}
    >
        {children}
    </span>
);

// Pill de estado (SPRINT / SC / VSC / lluvia). Colores de la paleta.
export const StatusPill = ({ children, tone = 'yellow', pulse = false }: {
    children: React.ReactNode;
    tone?: 'yellow' | 'blue' | 'red' | 'green';
    pulse?: boolean;
}) => {
    const tones = {
        yellow: 'bg-pit-yellow/20 text-pit-yellow',
        blue: 'bg-weather-blue/20 text-weather-blue',
        red: 'bg-f1-red/20 text-f1-red',
        green: 'bg-gap-green/20 text-gap-green',
    };
    return (
        <span className={`font-display inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${tones[tone]} ${pulse ? 'animate-pulse' : ''}`}>
            {children}
        </span>
    );
};

export const TeamStripe = ({ color, className = '' }: { color: string; className?: string }) => (
    <span className={`inline-block w-1 h-4 rounded-full mr-2 align-middle ${className}`} style={{ background: color }} />
);

export const SectionTitle = ({ children, eyebrow, right }: {
    children: React.ReactNode;
    eyebrow?: string;
    right?: React.ReactNode;
}) => (
    <div className="flex items-end justify-between mb-3">
        <div>
            {eyebrow && <p className="text-[11px] font-bold uppercase tracking-widest text-text-sub mb-0.5">{eyebrow}</p>}
            <h2 className="font-display text-xl font-bold leading-none">{children}</h2>
        </div>
        {right}
    </div>
);

// ===== Helpers de formato =====

export const money = (m: number) => `${m < 0 ? '-' : ''}$${Math.abs(m).toFixed(1)}M`;

// Intervalo/gap siempre con signo correcto (arregla el "+-0.4").
export const formatGap = (s: number) => `${s < 0 ? '' : '+'}${s.toFixed(1)}`;

export const formatLapTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s - m * 60;
    return `${m}:${sec.toFixed(3).padStart(6, '0')}`;
};
