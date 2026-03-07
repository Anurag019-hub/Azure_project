import { motion } from 'framer-motion';
import { cleanLine, extractSubHeading, renderInline } from './markdownUtils';

/**
 * Renders a "Final Notes / Summary" section as an amber-bordered callout box.
 * Strips all markdown symbols before rendering.
 */
export default function FinalNotesBox({ title, lines, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-6 sm:p-7 overflow-hidden"
        >
            {/* Corner glow */}
            <div className="absolute top-0 right-0 w-40 h-20 bg-amber-500/10 blur-2xl rounded-full pointer-events-none" />

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>
                </span>
                <h2 className="text-lg font-heading font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    {title}
                </h2>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-2 relative">
                {lines.map((rawLine, i) => {
                    // Separator
                    if (!rawLine.trim() || /^[-*_]{3,}$/.test(rawLine.trim())) {
                        return <div key={i} className="h-1" />;
                    }

                    // Sub-heading inside notes
                    const subHeading = extractSubHeading(rawLine);
                    if (subHeading) {
                        return (
                            <motion.p
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: delay + 0.1 + i * 0.04 }}
                                className="text-sm font-semibold text-amber-300 mt-2"
                            >
                                {subHeading}
                            </motion.p>
                        );
                    }

                    const text = cleanLine(rawLine);
                    if (!text) return null;

                    return (
                        <motion.p
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: delay + 0.12 + i * 0.05 }}
                            className="text-sm text-slate-300 leading-relaxed"
                        >
                            {renderInline(text, `fn-${i}`)}
                        </motion.p>
                    );
                })}
            </div>
        </motion.div>
    );
}
