import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';

/**
 * GlassCard — glassmorphism card with:
 *  - Continuous subtle floating animation
 *  - 3D tilt on mouse move
 *  - Hover lift (y: -4)
 *  - Optional gradient border
 */
export default function GlassCard({
    children,
    className = '',
    hover = true,
    glow = false,
    float = false,
    as = 'div',
    ...props
}) {
    const cardRef = useRef(null);

    // Motion values for 3D tilt
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);

    // Smooth springs for tilt
    const springX = useSpring(rotateX, { stiffness: 120, damping: 20 });
    const springY = useSpring(rotateY, { stiffness: 120, damping: 20 });

    // Subtle glow follow
    const glowX = useTransform(rotateY, [-12, 12], ['0%', '100%']);
    const glowY = useTransform(rotateX, [-12, 12], ['0%', '100%']);

    const handleMouseMove = (e) => {
        if (!hover || !cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        rotateX.set(-dy * 8);   // max ±8°
        rotateY.set(dx * 8);
    };

    const handleMouseLeave = () => {
        rotateX.set(0);
        rotateY.set(0);
    };

    const Component = motion[as] || motion.div;

    return (
        <Component
            ref={cardRef}
            className={`
                relative rounded-2xl glass overflow-hidden
                ${glow ? 'gradient-border' : ''}
                ${hover ? 'card-hover' : ''}
                ${float ? 'card-float-anim' : ''}
                ${className}
            `}
            style={{
                rotateX: springX,
                rotateY: springY,
                transformStyle: 'preserve-3d',
                perspective: 800,
            }}
            whileHover={hover ? { y: -5, transition: { duration: 0.22 } } : undefined}
            whileTap={hover ? { scale: 0.98, transition: { duration: 0.1 } } : undefined}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            {...props}
        >
            {/* Dynamic inner glow that follows cursor */}
            {hover && (
                <motion.div
                    className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100"
                    style={{
                        background: `radial-gradient(circle at ${glowX} ${glowY}, rgba(99,102,241,0.12) 0%, transparent 60%)`,
                        transition: 'opacity 0.3s',
                    }}
                />
            )}
            <div style={{ transform: 'translateZ(0)' }}>
                {children}
            </div>
        </Component>
    );
}
