import React from 'react';
import { DriverTrait } from '../types';

// Etiqueta y color de cada rasgo de piloto.
const TRAIT_META: Record<DriverTrait, { label: string; color: string }> = {
    wetMaster:      { label: 'Lluvia', color: '#4aa8ff' },
    tyreWhisperer:  { label: 'Neumáticos', color: '#22e07a' },
    aggressive:     { label: 'Agresivo', color: '#ff8a3d' },
    hotHead:        { label: 'Temperamental', color: '#ff4d4d' },
    ironNerve:      { label: 'Sólido', color: '#9a9aab' },
    qualiSpecialist:{ label: 'Vuelta rápida', color: '#c061ff' },
};

export const TRAIT_LABEL = (t: DriverTrait) => TRAIT_META[t].label;

export const TraitBadges = ({ traits, className = '' }: { traits: DriverTrait[]; className?: string }) => {
    if (!traits || traits.length === 0) return null;
    return (
        <span className={`inline-flex flex-wrap gap-1 ${className}`}>
            {traits.map(t => (
                <span key={t}
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                    style={{ background: `${TRAIT_META[t].color}22`, color: TRAIT_META[t].color }}>
                    {TRAIT_META[t].label}
                </span>
            ))}
        </span>
    );
};
