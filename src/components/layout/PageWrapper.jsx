import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedBackground from '../ui/AnimatedBackground';

const navLinks = [
    {
        to: '/', label: 'Home', icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
        )
    },
    {
        to: '/pdf', label: 'PDF Input', icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
        )
    },
    {
        to: '/audio', label: 'Audio Input', icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
        )
    },
];

export default function PageWrapper({ children }) {
    const { pathname } = useLocation();

    return (
        <div className="min-h-screen relative text-white font-body">
            {/* Animated decorative background */}
            <AnimatedBackground />

            {/* ── Navbar ── */}
            <nav className="sticky top-0 z-50 glass-strong border-b border-white/[0.06]">
                <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        {/* AI Logo mark */}
                        <motion.div
                            whileHover={{ scale: 1.12, rotate: -6 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                            className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-shadow duration-300"
                        >
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                            </svg>
                        </motion.div>
                        <motion.span
                            whileHover={{ x: 2 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className="text-lg font-heading font-bold tracking-tight gradient-text-animated"
                        >
                            Lipiflow
                        </motion.span>
                    </Link>

                    {/* Nav Links */}
                    <ul className="flex gap-1">
                        {navLinks.map(({ to, label, icon }) => {
                            const isActive = pathname === to;
                            return (
                                <li key={to}>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.96 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                                    >
                                        <Link
                                            to={to}
                                            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
                                            ${isActive
                                                    ? 'text-white'
                                                    : 'text-slate-400 hover:text-slate-200'
                                                }`}
                                        >
                                            {/* Active pill background */}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="nav-pill"
                                                    className="absolute inset-0 rounded-xl bg-white/[0.08] border border-white/[0.06]"
                                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                                />
                                            )}
                                            <motion.span
                                                className="relative z-10 flex items-center gap-2"
                                                whileHover={{ x: 1 }}
                                                transition={{ type: 'spring', stiffness: 300 }}
                                            >
                                                {icon}
                                                <span className="hidden sm:inline">{label}</span>
                                            </motion.span>
                                        </Link>
                                    </motion.div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </nav>

            {/* ── Page content ── */}
            <motion.main
                key={pathname}
                className="relative z-10 max-w-6xl mx-auto px-6 py-12"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
                {children}
            </motion.main>
        </div>
    );
}
