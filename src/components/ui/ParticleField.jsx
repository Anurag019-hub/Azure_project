import { useEffect, useRef } from 'react';

/**
 * Floating particle field — pure CSS animated dots.
 * Renders N particles with randomised size, color, speed, and direction.
 * Zero JS animation loops — all driven by CSS custom properties + keyframes.
 */
export default function ParticleField({ count = 40 }) {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Clear any existing particles
        container.innerHTML = '';

        const colors = [
            'rgba(99,102,241,0.7)',
            'rgba(139,92,246,0.6)',
            'rgba(34,211,238,0.6)',
            'rgba(167,139,250,0.5)',
            'rgba(196,181,253,0.4)',
        ];

        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.className = 'particle';

            const size = Math.random() * 3 + 1;       // 1–4px
            const x = Math.random() * 100;             // vw position
            const y = Math.random() * 100;             // vh start
            const driftX = (Math.random() - 0.5) * 120; // ±60px horizontal
            const driftY = -(Math.random() * 100 + 60);  // -60 to -160px up
            const dur = (Math.random() * 10 + 6).toFixed(1);   // 6–16s
            const delay = (Math.random() * 8).toFixed(1);       // 0–8s delay
            const color = colors[Math.floor(Math.random() * colors.length)];

            Object.assign(el.style, {
                width: `${size}px`,
                height: `${size}px`,
                left: `${x}%`,
                top: `${y}%`,
                background: color,
                '--drift-x': `${driftX}px`,
                '--drift-y': `${driftY}px`,
                '--duration': `${dur}s`,
                '--delay': `${delay}s`,
                boxShadow: `0 0 ${size * 2}px ${color}`,
            });

            container.appendChild(el);
        }

        return () => { container.innerHTML = ''; };
    }, [count]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 pointer-events-none overflow-hidden -z-10"
            aria-hidden
        />
    );
}
