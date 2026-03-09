import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRef, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import GlassCard from '../components/ui/GlassCard';

const features = [
    {
        to: '/pdf',
        title: 'PDF Input',
        description: 'Upload and process PDF documents with AI-powered analysis and summarization.',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
        ),
        gradient: 'from-violet-500 to-fuchsia-500',
        accentColor: 'violet',
    },
    {
        to: '/audio',
        title: 'Audio Input',
        description: 'Upload or record audio files for transcription, analysis, and intelligent processing.',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
        ),
        gradient: 'from-cyan-500 to-teal-500',
        accentColor: 'cyan',
    },
];

const stagger = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.15 },
    },
};

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function Home() {
    return (
        <PageWrapper>
            <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="relative"
            >
                {/* ── Hero Section ── */}
                <motion.section
                    variants={fadeUp}
                    className="relative max-w-3xl mx-auto mb-24 pt-8"
                >
                    {/* Decorative floating sparkle */}
                    <div className="absolute -top-4 right-12 w-20 h-20 opacity-30 animate-float">
                        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-primary-400">
                            <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" fill="currentColor" />
                        </svg>
                    </div>

                    {/* Badge */}
                    <motion.div
                        variants={scaleIn}
                        className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide gradient-border"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
                        </span>
                        <span className="text-slate-400 font-medium tracking-wide">
                            Powered by Lipiflow AI
                        </span>
                    </motion.div>

                    {/* Heading */}
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold leading-[1.1] tracking-tight mb-6">
                        <span className="block bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                            Transform your files
                        </span>
                        <span className="block mt-2">
                            <span className="gradient-text-animated">into insights</span>
                        </span>
                    </h1>

                    {/* Subtext */}
                    <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-xl">
                        Upload PDFs or audio files and let our intelligent pipeline{' '}
                        <span className="text-slate-300 font-medium animated-underline active">extract, analyse</span>, and{' '}
                        summarise the content for you — in seconds.
                    </p>

                    {/* CTA Row */}
                    <motion.div
                        variants={fadeUp}
                        className="mt-10 flex flex-wrap items-center gap-4"
                    >
                        <Link
                            to="/pdf"
                            className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-heading font-semibold text-sm glow-pulse transition-all duration-300 hover:shadow-glow-md"
                        >
                            <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                            <span className="relative">Get started</span>
                            <svg className="relative w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </Link>

                        <Link
                            to="/audio"
                            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl glass glass-hover text-slate-300 hover:text-white font-heading font-semibold text-sm transition-all duration-300"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                            </svg>
                            Record audio
                        </Link>
                    </motion.div>
                </motion.section>

                {/* ── Feature Cards — Staggered Grid ── */}
                <motion.section
                    variants={stagger}
                    className="relative max-w-4xl mx-auto"
                >
                    {/* Section label */}
                    <motion.div variants={fadeUp} className="flex items-center gap-4 mb-8">
                        <div className="h-px flex-1 bg-gradient-to-r from-primary-600/30 to-transparent" />
                        <span className="text-xs font-heading font-semibold uppercase tracking-[0.2em] text-slate-500">Tools</span>
                        <div className="h-px flex-1 bg-gradient-to-l from-accent/30 to-transparent" />
                    </motion.div>

                    <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                        {features.map(({ to, title, description, icon, gradient, accentColor }, i) => (
                            <motion.div
                                key={to}
                                variants={fadeUp}
                                className={i === 1 ? 'sm:mt-8' : ''}
                            >
                                <Link to={to} className="block group">
                                    <GlassCard glow hover className="p-8 sm:p-10">
                                        {/* Gradient accent top bar */}
                                        <div className={`absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r ${gradient} opacity-40 group-hover:opacity-80 transition-opacity duration-500`} />

                                        {/* Icon */}
                                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-20 flex items-center justify-center text-white mb-6 shadow-lg`}
                                            style={{ background: `linear-gradient(135deg, rgba(${accentColor === 'violet' ? '139,92,246' : '34,211,238'}, 0.15), rgba(${accentColor === 'violet' ? '139,92,246' : '34,211,238'}, 0.05))` }}>
                                            {icon}
                                        </div>

                                        {/* Content */}
                                        <h2 className="text-xl font-heading font-bold text-white mb-3 group-hover:text-primary-200 transition-colors">
                                            {title}
                                        </h2>
                                        <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                            {description}
                                        </p>

                                        {/* Action row */}
                                        <div className={`flex items-center gap-2 text-sm font-semibold transition-all duration-300
                                            ${accentColor === 'violet' ? 'text-violet-400 group-hover:text-violet-300' : 'text-cyan-400 group-hover:text-cyan-300'}`}>
                                            <span>Explore</span>
                                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                            </svg>
                                        </div>
                                    </GlassCard>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* ── Stats / Trust row ── */}
                <motion.section
                    variants={fadeUp}
                    className="mt-20 max-w-3xl mx-auto"
                >
                    <div className="rounded-2xl glass p-6 sm:p-8">
                        <div className="grid grid-cols-3 gap-6 text-center">
                            {[
                                { value: 'Advanced', label: 'Content Analysis' },
                                { value: 'AI', label: 'Intelligent Processing' },
                                { value: 'Structured', label: 'Organized Insights' }
                            ].map(({ value, label }) => (
                                <div key={label}>
                                    <div className="text-2xl sm:text-3xl font-heading font-bold gradient-text-animated">{value}</div>
                                    <div className="text-xs sm:text-sm text-slate-500 mt-1">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>
            </motion.div>
        </PageWrapper>
    );
}
