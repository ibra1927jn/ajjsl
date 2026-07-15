import React from 'react';

// Set de iconos SVG inline (sin CDN → funcionan offline en el artifact).
// Trazo coherente 24×24, hereda color con currentColor.
type IconProps = { size?: number; className?: string; filled?: boolean };

const Svg = ({ size = 22, className, children }: IconProps & { children: React.ReactNode }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"
        className={className} aria-hidden="true">
        {children}
    </svg>
);

// --- Navegación ---
export const IconHome = (p: IconProps) => (
    <Svg {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1V9.5" /></Svg>
);
export const IconTrophy = (p: IconProps) => (
    <Svg {...p}><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" /><path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3" /><path d="M12 13v4M8.5 21h7M10 17h4l.5 4h-5l.5-4Z" /></Svg>
);
export const IconWrench = (p: IconProps) => (
    <Svg {...p}><path d="M14.5 5.5a3.5 3.5 0 0 0-4.6 4.3L4 15.7 6.3 18l5.9-5.9a3.5 3.5 0 0 0 4.3-4.6l-2 2-1.7-1.7 2-2Z" /></Svg>
);
export const IconHelmet = (p: IconProps) => (
    <Svg {...p}><path d="M3.5 13a8.5 8.5 0 0 1 16.8-1.8L21 14H10a5 5 0 0 1-5-5" /><path d="M3.6 13c.3 3 2.7 5 5.4 5h9c.8 0 1.5-.5 1.8-1.2L21 14" /></Svg>
);
export const IconWallet = (p: IconProps) => (
    <Svg {...p}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /><circle cx="16.5" cy="14" r="1.3" fill="currentColor" stroke="none" /></Svg>
);

// --- HUD / general ---
export const IconFlag = (p: IconProps) => (
    <Svg {...p}><path d="M5 21V4" /><path d="M5 4h11l-1.5 3L16 10H5" /></Svg>
);
export const IconGauge = (p: IconProps) => (
    <Svg {...p}><path d="M4 15a8 8 0 0 1 16 0" /><path d="M12 15l3.5-3" /><path d="M4 15h1M19 15h1M12 7v1" /></Svg>
);
export const IconSettings = (p: IconProps) => (
    <Svg {...p}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" /></Svg>
);
export const IconPlay = (p: IconProps) => (
    <Svg {...p}><path d="M7 4.5v15l13-7.5-13-7.5Z" fill="currentColor" stroke="none" /></Svg>
);
export const IconPause = (p: IconProps) => (
    <Svg {...p}><rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" /><rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" /></Svg>
);
export const IconChevronRight = (p: IconProps) => (
    <Svg {...p}><path d="M9 5l7 7-7 7" /></Svg>
);
export const IconWarning = (p: IconProps) => (
    <Svg {...p}><path d="M12 3 22 20H2L12 3Z" /><path d="M12 10v4M12 17h.01" /></Svg>
);
export const IconWeather = (p: IconProps) => (
    <Svg {...p}><path d="M7 16a4 4 0 0 1 .6-8 5 5 0 0 1 9.6 1.4A3.5 3.5 0 0 1 17 16H7Z" /><path d="M8 19l-1 2M12 19l-1 2M16 19l-1 2" /></Svg>
);
export const IconPit = (p: IconProps) => (
    <Svg {...p}><path d="M6 21V4h6a4 4 0 0 1 0 8H6" /></Svg>
);
export const IconRadio = (p: IconProps) => (
    <Svg {...p}><path d="M4 9a8 8 0 0 1 8-3M4 12a5 5 0 0 1 5-2" /><rect x="3" y="13" width="14" height="7" rx="1.5" /><circle cx="13" cy="16.5" r="1.6" /></Svg>
);
export const IconSwap = (p: IconProps) => (
    <Svg {...p}><path d="M7 4 4 7l3 3" /><path d="M4 7h11a4 4 0 0 1 0 8h-1" /><path d="M17 20l3-3-3-3" /><path d="M20 17H9" /></Svg>
);
export const IconAir = (p: IconProps) => (
    <Svg {...p}><path d="M3 8h11a2.5 2.5 0 1 0-2.5-2.5" /><path d="M3 12h15a2.5 2.5 0 1 1-2.5 2.5" /><path d="M3 16h9a2 2 0 1 1-2 2" /></Svg>
);
export const IconEngine = (p: IconProps) => (
    <Svg {...p}><path d="M4 10h2V8h4v2h4l2-2h2v3h2v4h-2v3h-4v-2h-4v2H6v-4H4v-4Z" /></Svg>
);
export const IconChassis = (p: IconProps) => (
    <Svg {...p}><rect x="3" y="8" width="18" height="8" rx="2" /><path d="M7 16v2M17 16v2M7 6v2M17 6v2M12 8v8" /></Svg>
);
export const IconShield = (p: IconProps) => (
    <Svg {...p}><path d="M12 3 5 6v6c0 4 3 6.5 7 9 4-2.5 7-5 7-9V6l-7-3Z" /><path d="M9.5 12l1.8 1.8L15 10" /></Svg>
);
