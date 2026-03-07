import { motion } from 'framer-motion';
import ParticleField from './ParticleField';

/** Slow floating animation for blobs — GPU-accelerated via transform */
const float = (duration, x = 0) => ({
    animate: {
        y: [0, -24, 0],
        x: [0, x, 0],
        scale: [1, 1.06, 1],
    },
    transition: {
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
    },
});

export default function AnimatedBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            {/* Scrolling animated grid */}
            <div className="absolute inset-0 grid-pattern-animated opacity-70" />

            {/* Floating particles */}
            <ParticleField count={35} />

            {/* Gradient blobs — animated */}
            <motion.div
                className="absolute -top-40 -left-40 w-[500px] h-[500px] blob-purple rounded-full"
                {...float(12, 14)}
            />
            <motion.div
                className="absolute top-1/3 -right-32 w-[400px] h-[400px] blob-cyan rounded-full"
                {...float(15, -10)}
            />
            <motion.div
                className="absolute -bottom-32 left-1/4 w-[450px] h-[450px] blob-indigo rounded-full"
                {...float(18, 8)}
            />

            {/* Center radial glow — breathe */}
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                }}
                animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.08, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Scan-line overlay for futuristic feel */}
            <div className="absolute inset-0 scan-lines" />

            {/* Noise overlay */}
            <div className="absolute inset-0 noise-overlay" />

            {/* Vignette */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 50%, rgba(15,23,42,0.6) 100%)',
                }}
            />
        </div>
    );
}
