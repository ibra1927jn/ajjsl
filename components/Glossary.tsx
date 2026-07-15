import React from 'react';
import { createPortal } from 'react-dom';
import { IconGauge, IconPit, IconWrench, IconHelmet, IconFlag, IconTrophy } from './icons';

const SECTIONS: { Icon: React.FC<{ size?: number; className?: string }>; title: string; body: string }[] = [
    { Icon: IconGauge, title: 'ERS (energía)', body: 'Cada coche tiene batería. En el muro de boxes eliges el modo: CARGA recarga (pierdes algo de ritmo), BAL es sostenible, HOT da ritmo extra gastando batería, y OT (adelantar) da el máximo empujón para atacar pero la vacía. Gestiónala: sin batería no hay bonus.' },
    { Icon: IconGauge, title: 'Ritmo', body: 'El dial de ritmo: ATACAR va más rápido pero desgasta neumático y motor y sube el riesgo de error; CONSERVAR cuida las gomas; NORMAL es el equilibrio.' },
    { Icon: IconPit, title: 'Neumáticos y 2 compuestos', body: 'Los neumáticos se degradan y caen de golpe tras su vida útil ("cliff"). En seco es OBLIGATORIO usar 2 compuestos slick distintos durante la carrera: si no, penalización en meta. Elige cuándo parar en el muro de boxes.' },
    { Icon: IconGauge, title: 'Ingeniero de estrategia', body: 'El panel bajo el muro te avisa de la ventana de parada, de "BOX esta vuelta" (p.ej. Safety Car = parada barata) y de amenazas/oportunidades de rivales cercanos con gomas más frescas o gastadas.' },
    { Icon: IconWrench, title: 'Desarrollo y correlación', body: 'Mejorar el coche cuesta dinero (limitado por el cost cap) y tarda 2 carreras. Los proyectos entregan puntos con VARIANZA: pueden fallar o superar lo previsto. El túnel de viento (Instalaciones) reduce ese riesgo.' },
    { Icon: IconWrench, title: 'Instalaciones', body: 'Túnel de viento (mejoras más fiables), simulador (mejor clasificación) y fábrica (paradas más rápidas y fabricación más ágil). Se pagan con presupuesto y se conservan entre temporadas.' },
    { Icon: IconHelmet, title: 'Rasgos de piloto', body: 'Cada piloto tiene rasgos que cambian su conducta: Lluvia (mejor en mojado), Neumáticos (menos desgaste), Agresivo (adelanta más), Temperamental (más contactos), Sólido (menos errores), Vuelta rápida (mejor en clasificación).' },
    { Icon: IconFlag, title: 'Clasificación Q1/Q2/Q3', body: 'La parrilla se decide por eliminación: se corta a los 5 más lentos en Q1 y en Q2; los 10 mejores pelean la pole en Q3.' },
    { Icon: IconTrophy, title: 'Junta y decisiones', body: 'La junta te fija un objetivo de constructores y tiene una barra de paciencia: si llega a 0, estás despedido. Entre carreras aparecen decisiones de junta/prensa/patrocinadores con consecuencias en presupuesto, paciencia y moral.' },
];

export const Glossary = ({ onClose }: { onClose: () => void }) => createPortal(
    // Portal a document.body: el header tiene backdrop-blur y atraparía el fixed.
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-card-dark border border-border-dark rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto hide-scrollbar" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-border-dark bg-card-dark z-10">
                <h3 className="font-display text-lg font-bold">Cómo se juega</h3>
                <button onClick={onClose} className="text-text-sub hover:text-text-main text-sm">Cerrar</button>
            </div>
            <div className="p-4 space-y-4">
                {SECTIONS.map((s, i) => (
                    <div key={i} className="flex gap-3">
                        <span className="text-f1-red shrink-0 mt-0.5"><s.Icon size={18} /></span>
                        <div>
                            <p className="font-bold text-sm mb-0.5">{s.title}</p>
                            <p className="text-xs text-text-sub leading-relaxed">{s.body}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>,
    document.body,
);
