import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageWrapper from '../components/layout/PageWrapper';
import ResultRenderer from '../components/result/ResultRenderer';
import { getPdfResult } from '../services/api';
import sanitizeContent from '../utils/sanitizeContent';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function PdfResult() {
    const location = useLocation();
    const navigate = useNavigate();

    const [content, setContent] = useState(() => sanitizeContent(location.state?.content || ''));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const resultId = location.state?.resultId;
        if (!content && resultId) {
            setLoading(true);
            getPdfResult(resultId)
                .then((data) => {
                    const text = typeof data === 'string'
                        ? data
                        : (data?.synthesis ?? data?.content ?? '');
                    setContent(sanitizeContent(text));
                })
                .catch(() => setError('Failed to load result. Please try again.'))
                .finally(() => setLoading(false));
        }
    }, [location.state?.resultId, content]);

    return (
        <PageWrapper>
            {/* Animated Background Blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.15, 0.25, 0.15],
                        x: [0, 50, 0],
                        y: [0, -50, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-violet-600/20 blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.1, 0.2, 0.1],
                        x: [0, -60, 0],
                        y: [0, 60, 0]
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute top-[40%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-fuchsia-600/20 blur-[100px]"
                />
            </div>

            <motion.div
                className="relative z-10 max-w-3xl mx-auto"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
                {/* ── Header ── */}
                <motion.div variants={fadeUp} className="mb-10 relative">
                    <div className="absolute -left-8 top-0 flex flex-col gap-1.5 opacity-20">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                        ))}
                    </div>

                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 mb-5 text-sm text-slate-500">
                        <Link to="/pdf" className="hover:text-slate-300 transition-colors">PDF Upload</Link>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                        <span className="text-slate-300">Result</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight mb-3">
                        <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-300 bg-clip-text text-transparent">
                            PDF Analysis Result
                        </span>
                    </h1>
                    <p className="text-slate-400 leading-relaxed">
                        AI-generated study guide from your uploaded document.
                    </p>
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 96, opacity: 0.8 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="mt-6 h-[2px] bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                    />
                </motion.div>

                {/* ── States ── */}
                {loading && (
                    <motion.div variants={fadeUp}>
                        <LoadingCard />
                    </motion.div>
                )}

                {error && (
                    <motion.div variants={fadeUp}>
                        <ErrorCard message={error} onBack={() => navigate('/pdf')} />
                    </motion.div>
                )}

                {!loading && !error && !content && (
                    <motion.div variants={fadeUp} className="rounded-2xl glass p-12 text-center">
                        <p className="text-slate-500 mb-4">No result available.</p>
                        <Link to="/pdf" className="inline-flex items-center gap-2 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Upload a PDF to get started
                        </Link>
                    </motion.div>
                )}

                {/* ── Rendered sections ── */}
                {!loading && !error && content && (
                    <ResultRenderer content={content} />
                )}

                {/* ── Action bar ── */}
                {content && (
                    <motion.div variants={fadeUp} className="mt-8">
                        <Link to="/pdf" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-sm font-medium text-slate-300 hover:text-white hover:border-violet-500/30 hover:shadow-[0_0_20px_-5px_rgba(139,92,246,0.2)] hover:-translate-y-1 transition-all duration-300">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Upload another PDF
                        </Link>
                    </motion.div>
                )}
            </motion.div>
        </PageWrapper>
    );
}

function LoadingCard() {
    return (
        <div className="rounded-2xl glass p-12 text-center">
            <div className="inline-flex items-center gap-3 text-slate-400">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading analysis…
            </div>
        </div>
    );
}

function ErrorCard({ message, onBack }) {
    return (
        <div className="rounded-2xl glass p-8 text-center border border-red-500/20">
            <p className="text-red-400 mb-4">{message}</p>
            <button onClick={onBack} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                ← Back to upload
            </button>
        </div>
    );
}
