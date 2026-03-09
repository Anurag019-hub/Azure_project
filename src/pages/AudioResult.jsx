import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageWrapper from '../components/layout/PageWrapper';
import ResultRenderer from '../components/result/ResultRenderer';
import { getAudioResult } from '../services/api';
import sanitizeContent from '../utils/sanitizeContent';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function AudioResult() {
    const location = useLocation();
    const navigate = useNavigate();

    const [content, setContent] = useState(() => sanitizeContent(location.state?.content || ''));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const resultId = location.state?.resultId;
        if (!content && resultId) {
            setLoading(true);
            getAudioResult(resultId)
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
            <motion.div
                className="max-w-3xl mx-auto"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
                {/* ── Header ── */}
                <motion.div variants={fadeUp} className="mb-10 relative">
                    {/* Waveform decorative bars */}
                    <div className="absolute -left-8 top-0 flex flex-col gap-1.5 opacity-20">
                        {[3, 5, 4, 6, 3, 5].map((h, i) => (
                            <div key={i} className="w-1.5 rounded-full bg-cyan-400" style={{ height: `${h * 3}px` }} />
                        ))}
                    </div>

                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 mb-5 text-sm text-slate-500">
                        <Link to="/audio" className="hover:text-slate-300 transition-colors">Audio Upload</Link>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                        <span className="text-slate-300">Result</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight mb-3">
                        <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-300 bg-clip-text text-transparent">
                            Audio Analysis Result
                        </span>
                    </h1>
                    <p className="text-slate-400 leading-relaxed">
                        AI-generated study guide from your uploaded audio.
                    </p>
                    <div className="mt-6 h-[2px] w-24 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full opacity-60" />
                </motion.div>

                {/* ── States ── */}
                {loading && (
                    <motion.div variants={fadeUp}>
                        <LoadingCard />
                    </motion.div>
                )}

                {error && (
                    <motion.div variants={fadeUp}>
                        <ErrorCard message={error} onBack={() => navigate('/audio')} />
                    </motion.div>
                )}

                {!loading && !error && !content && (
                    <motion.div variants={fadeUp} className="rounded-2xl glass p-12 text-center">
                        <p className="text-slate-500 mb-4">No result available.</p>
                        <Link to="/audio" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Upload audio to get started
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
                        <Link to="/audio" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Upload another audio
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
