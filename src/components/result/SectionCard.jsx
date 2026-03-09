import { motion } from 'framer-motion';

/**
 * Generic section card — used as a fallback for unrecognised section types.
 * Animates into view when scrolled into the viewport (once).
 */
export default function SectionCard({ title, children, accent = 'violet', delay = 0 }) {
    const accents = {
        violet: {
            border: 'border-violet-500/20',
            dot: 'bg-violet-400',
            title: 'from-violet-400 to-fuchsia-400',
            glow: 'from-violet-600/10 to-transparent',
        },
        cyan: {
            border: 'border-cyan-500/20',
            dot: 'bg-cyan-400',
            title: 'from-cyan-400 to-teal-400',
            glow: 'from-cyan-600/10 to-transparent',
        },
        amber: {
            border: 'border-amber-500/20',
            dot: 'bg-amber-400',
            title: 'from-amber-400 to-orange-400',
            glow: 'from-amber-600/10 to-transparent',
        },
        emerald: {
            border: 'border-emerald-500/20',
            dot: 'bg-emerald-400',
            title: 'from-emerald-400 to-teal-400',
            glow: 'from-emerald-600/10 to-transparent',
        },
    };

    const c = accents[accent] ?? accents.violet;

    return (
        <motion.div
            /* ── Entry: trigger when scrolled into view ── */
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay, type: "spring", stiffness: 100, damping: 20 }}
            /* ── Hover: subtle lift and glow ── */
            whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)', transition: { duration: 0.25 } }}
            className={`relative rounded-2xl glass border ${c.border} hover:border-white/20 transition-all duration-300 overflow-hidden group`}
        >
            {/* Gradient glow top-left */}
            <div className={`absolute top-0 left-0 w-48 h-24 bg-gradient-to-br ${c.glow} rounded-full blur-2xl pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />

            <div className="relative p-6 sm:p-7">
                {title && (
                    <div className="flex items-center gap-3 mb-5">
                        <span className={`w-2 h-2 rounded-full ${c.dot} shrink-0`} />
                        <h2 className={`text-lg font-heading font-bold bg-gradient-to-r ${c.title} bg-clip-text text-transparent`}>
                            {title}
                        </h2>
                    </div>
                )}
                {children}
            </div>
        </motion.div>
    );
}
