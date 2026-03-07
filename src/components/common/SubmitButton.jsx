import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

/**
 * SubmitButton — enhanced with:
 *  - Ripple burst on click
 *  - Magnetic hover (cursor attraction)
 *  - Neon glow pulse
 *  - Press scale animation
 */
export default function SubmitButton({ label = 'Submit', loading = false, disabled = false, onClick }) {
    const isDisabled = disabled || loading;
    const buttonRef = useRef(null);
    const rippleContainer = useRef(null);

    /* ── Ripple effect ── */
    const spawnRipple = useCallback((e) => {
        if (isDisabled || !rippleContainer.current || !buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const size = Math.max(rect.width, rect.height);

        const circle = document.createElement('span');
        circle.className = 'ripple-circle';
        Object.assign(circle.style, {
            width: `${size}px`,
            height: `${size}px`,
            left: `${x - size / 2}px`,
            top: `${y - size / 2}px`,
        });

        rippleContainer.current.appendChild(circle);
        circle.addEventListener('animationend', () => circle.remove());
    }, [isDisabled]);

    /* ── Magnetic hover ── */
    const handleMouseMove = useCallback((e) => {
        if (isDisabled || !buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.25;
        const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.25;
        buttonRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    }, [isDisabled]);

    const handleMouseLeave = useCallback(() => {
        if (!buttonRef.current) return;
        buttonRef.current.style.transform = 'translate(0px, 0px)';
    }, []);

    return (
        <div style={{ display: 'inline-block', transition: 'transform 0.3s ease' }} ref={buttonRef}>
            <motion.button
                type="button"
                disabled={isDisabled}
                onClick={(e) => { spawnRipple(e); onClick?.(); }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={`relative w-full sm:w-auto px-8 py-3.5 rounded-2xl font-heading font-semibold text-sm tracking-wide transition-all duration-300 overflow-hidden
                    ${isDisabled
                        ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-white/5'
                        : 'bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 text-white glow-pulse neon-glow'
                    }`}
                style={!isDisabled ? { '--neon-color': 'rgba(99,102,241,0.5)' } : undefined}
                whileHover={!isDisabled ? { scale: 1.04 } : undefined}
                whileTap={!isDisabled ? { scale: 0.95 } : undefined}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            >
                {/* Ripple container */}
                <span ref={rippleContainer} className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none" />

                {/* Shimmer sweep */}
                {!isDisabled && (
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"
                        style={{ backgroundSize: '200% 100%' }}
                    />
                )}

                <span className="relative flex items-center justify-center gap-2.5">
                    {loading ? (
                        <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Uploading…
                        </>
                    ) : (
                        <>
                            {label}
                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </>
                    )}
                </span>
            </motion.button>
        </div>
    );
}
