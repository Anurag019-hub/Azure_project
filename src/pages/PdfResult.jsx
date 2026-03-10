import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageWrapper from '../components/layout/PageWrapper';
import ResultRenderer from '../components/result/ResultRenderer';
import { getPdfResult } from '../services/api';
import sanitizeContent from '../utils/sanitizeContent';
import LatexRenderer from '../components/common/LatexRenderer';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function PdfResult() {
    const location = useLocation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Extract structured data from navigation state
    const data = location.state?.data || {};
    const hasData = Object.keys(data).length > 0;

    console.log("Flashcards:", data.flashcards);

    const flashcards = data?.flashcards || [];
    const summary = data.summary || [];
    const importantTopics = data.important_topics || [];
    const logicalTopics = data.logical_topics || {};
    const latex = data.latex || data.content || data.synthesis || '';

    // Support string responses by forcing it into latex/explanation
    const content = typeof data === 'string' ? data : '';

    // If we only have content, we'll use sanitizeContent to format it
    const [sanitizedContent, setSanitizedContent] = useState(() =>
        (content || latex) ? sanitizeContent(content || latex) : ''
    );

    useEffect(() => {
        const resultId = location.state?.resultId;
        if (!hasData && resultId) {
            setLoading(true);
            getPdfResult(resultId)
                .then((fetchedData) => {
                    const text = typeof fetchedData === 'string'
                        ? fetchedData
                        : (fetchedData?.synthesis ?? fetchedData?.content ?? fetchedData?.latex ?? '');
                    setSanitizedContent(sanitizeContent(text));
                })
                .catch(() => setError('Failed to load result. Please try again.'))
                .finally(() => setLoading(false));
        }
    }, [location.state?.resultId, hasData]);

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
                            Analysis Result
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

                {!loading && !error && !hasData && !sanitizedContent && (
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
                {!loading && !error && (
                    <motion.div variants={fadeUp} className="space-y-6">

                        {/* Concept Explanation (Logical Topics) */}
                        {Object.keys(logicalTopics).length > 0 && (
                            <div className="space-y-4">
                                {Object.entries(logicalTopics).map(([section, points]) => (
                                    <div key={section} className="glass rounded-2xl p-6">
                                        <h3 className="text-lg font-heading font-semibold text-violet-400 mb-3">
                                            {section}
                                        </h3>
                                        {Array.isArray(points) ? (
                                            <ul className="list-disc text-slate-300 space-y-2 ml-5">
                                                {points.map((p, i) => {
                                                    // Handle object structure: { Title: "...", BulletPoints: [...] }
                                                    if (typeof p === 'object' && p !== null && p.Title && Array.isArray(p.BulletPoints)) {
                                                        return (
                                                            <li key={i} className="leading-relaxed pl-1 mt-4 first:mt-0">
                                                                <strong className="block text-violet-300 mb-1"><LatexRenderer content={p.Title} /></strong>
                                                                <ul className="list-disc text-slate-400 space-y-1 ml-5 mt-2">
                                                                    {p.BulletPoints.map((bp, j) => (
                                                                        <li key={j} className="leading-relaxed"><LatexRenderer content={bp} /></li>
                                                                    ))}
                                                                </ul>
                                                            </li>
                                                        );
                                                    }
                                                    return <li key={i} className="leading-relaxed pl-1"><LatexRenderer content={p} /></li>;
                                                })}
                                            </ul>
                                        ) : (
                                            <div className="leading-relaxed text-slate-300"><LatexRenderer content={points} /></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Important Topics */}
                        {importantTopics.length > 0 && (
                            <div className="rounded-2xl glass p-8 border-l-[3px] border-l-violet-500">
                                <h3 className="text-xl font-heading font-semibold text-white mb-4">Key Priorities</h3>
                                <ul className="space-y-2">
                                    {importantTopics.map((topic, i) => (
                                        <li key={`important-${i}`} className="flex items-start gap-3 text-slate-300">
                                            <svg className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <div className="leading-relaxed flex-1"><LatexRenderer content={topic} /></div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Summary */}
                        {summary.length > 0 && (
                            <div
                                className="rounded-2xl p-8"
                                style={{
                                    backgroundColor: 'rgba(255, 221, 87, 0.08)',
                                    border: '1px solid rgba(255, 221, 87, 0.25)'
                                }}
                            >
                                <h3
                                    className="text-xl font-heading font-semibold mb-4"
                                    style={{ color: 'rgba(255, 230, 130, 0.95)' }}
                                >
                                    Summary
                                </h3>
                                <ul className="space-y-3">
                                    {summary.map((point, i) => (
                                        <li key={`summary-${i}`} className="flex gap-4 items-start">
                                            <span style={{ color: 'rgba(255, 221, 87, 0.7)' }} className="mt-1">•</span>
                                            <div style={{ color: 'rgba(255, 240, 180, 0.85)' }} className="leading-relaxed flex-1"><LatexRenderer content={point} /></div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Flashcards */}
                        {flashcards.length > 0 && (
                            <div className="rounded-2xl p-2 mt-4">
                                <h3 className="text-2xl font-heading font-semibold text-white mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                        </svg>
                                    </div>
                                    Study Cards
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {flashcards.map((card, idx) => {
                                        const question = card.Q || card.question?.text || card.question || card.front || card.prompt || card.q || "";
                                        const answer = card.A || card.answer?.text || card.answer || card.back || card.response || card.a || "";

                                        return (
                                            <div key={idx} className="group relative rounded-2xl glass p-6 overflow-hidden transition-all duration-300 hover:border-violet-500/30 hover:shadow-[0_8px_30px_-12px_rgba(139,92,246,0.3)] hover:-translate-y-1">
                                                {/* Accent line */}
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                                <div className="mb-6">
                                                    <div className="text-[10px] font-heading tracking-wider uppercase text-violet-400 mb-2 font-semibold">Question {idx + 1}</div>
                                                    <LatexRenderer content={question} className="text-lg font-medium text-slate-200 leading-snug" />
                                                </div>
                                                <div className="pt-5 border-t border-white/10">
                                                    <div className="text-[10px] font-heading tracking-wider uppercase text-fuchsia-400 mb-2 font-semibold">Answer</div>
                                                    <LatexRenderer content={answer} className="text-slate-400 leading-relaxed text-sm" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ── Action bar ── */}
                {(hasData || sanitizedContent) && (
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
