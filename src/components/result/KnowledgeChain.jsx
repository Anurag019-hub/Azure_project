import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cleanLine, cleanTitle, extractSubHeading, renderInline } from './markdownUtils';

/* ═══════════════════ Parse Explanation Nodes ═══════════════════ */

/**
 * Parses raw explanation lines into a Main Concept node and subsequent Subtopic nodes.
 * @param {string[]} lines
 * @returns {{ mainConcept: string[], subtopics: { title: string, lines: string[] }[] }}
 */
function parseKnowledgeNodes(lines) {
    let mainConceptLines = [];
    let subtopics = [];
    let currentSub = null;
    let mainConceptFinished = false;

    for (const rawLine of lines) {
        // Divider indicates end of a section
        if (/^[-*_]{3,}$/.test(rawLine.trim())) continue;

        const heading = extractSubHeading(rawLine) || rawLine.match(/^#{1,4}\s+(.+)/)?.[1];

        if (heading) {
            // Found a heading -> starting a subtopic
            mainConceptFinished = true;
            if (currentSub) subtopics.push(currentSub);
            currentSub = { title: cleanTitle(heading), lines: [] };
        } else if (cleanLine(rawLine)) {
            // Normal text
            if (!mainConceptFinished) {
                mainConceptLines.push(rawLine);
                // Heuristic: If we hit a blank line after gathering text, finish the main concept.
                // Or if it's getting too long, we can cap it. We'll simply let the first paragraph(s) before a heading be the main concept.
            } else if (currentSub) {
                currentSub.lines.push(rawLine);
            } else {
                // If main concept finished but no subtopic started yet (fallback edge case)
                currentSub = { title: 'Further Details', lines: [rawLine] };
            }
        } else if (!rawLine.trim() && mainConceptLines.length > 0) {
            // Optional: aggressive main concept stop on first blank line.
            // mainConceptFinished = true; 
        }
    }

    if (currentSub) subtopics.push(currentSub);

    // Filter out completely empty subtopics
    subtopics = subtopics.filter((sub) => sub.lines.some((l) => cleanLine(l)));

    // Fallback: If no subtopics were found, force the first line to be the main concept and the rest a single subtopic.
    if (subtopics.length === 0 && mainConceptLines.length > 1) {
        const first = mainConceptLines.shift();
        subtopics = [{ title: 'Overview', lines: [...mainConceptLines] }];
        mainConceptLines = [first];
    }

    return { mainConcept: mainConceptLines, subtopics };
}

/* ═══════════════════ Components ═══════════════════ */

function SubtopicNode({ subtopic, index, delay }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.3 + index * 0.15, duration: 0.5, type: 'spring', stiffness: 100, damping: 20 }}
            className="relative flex items-start gap-4 mb-4 group"
        >
            {/* Connector dot */}
            <div className="relative z-10 w-8 flex justify-center mt-3 shrink-0">
                <motion.div
                    animate={{ scale: expanded ? 1.2 : 1 }}
                    className={`w-3 h-3 rounded-full transition-colors duration-300 ${expanded ? 'bg-fuchsia-400' : 'bg-slate-500 group-hover:bg-fuchsia-400/50'}`}
                />
            </div>

            {/* Subtopic Card */}
            <motion.div
                layout
                onClick={() => setExpanded(!expanded)}
                whileHover={{ x: 4, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)' }}
                className="flex-1 bg-slate-800/40 rounded-xl p-5 border border-white/10 hover:border-fuchsia-500/30 cursor-pointer transition-all overflow-hidden"
            >
                <div className="flex justify-between items-center gap-4">
                    <h3 className="text-base font-bold text-slate-200 group-hover:text-white transition-colors">
                        {renderInline(subtopic.title, `subt-${index}`)}
                    </h3>
                    <motion.div
                        animate={{ rotate: expanded ? 180 : 0 }}
                        className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center shrink-0"
                    >
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </motion.div>
                </div>

                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                            <div className="h-px border-t border-dashed border-white/10 mb-4" />
                            <div className="flex flex-col gap-2.5">
                                {subtopic.lines.map((rawLine, i) => {
                                    const text = cleanLine(rawLine);
                                    if (!text) return null;

                                    const isBullet = /^[\-*•]\s/.test(rawLine.trimStart());
                                    return (
                                        <div key={i} className={`flex items-start gap-3 ${isBullet ? 'ml-1' : ''}`}>
                                            {isBullet && (
                                                <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-fuchsia-400" />
                                            )}
                                            <p className="text-sm text-slate-300 leading-relaxed">
                                                {renderInline(text, `st-${index}-${i}`)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}

export default function KnowledgeChain({ title, lines, delay = 0 }) {
    const { mainConcept, subtopics } = parseKnowledgeNodes(lines);

    return (
        <div className="relative w-full max-w-3xl mx-auto py-6">

            {/* ── Main Concept Root ── */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay, type: 'spring', stiffness: 90 }}
                className="relative rounded-2xl glass p-7 sm:p-9 border border-violet-500/30 overflow-hidden mb-6 z-10"
                style={{ boxShadow: '0 20px 40px -20px rgba(139, 92, 246, 0.4)' }}
            >
                {/* Glowing Background Blob */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

                <h2 className="relative text-xl font-heading font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-4">
                    {title || 'Core Concept'}
                </h2>

                <div className="relative flex flex-col gap-3">
                    {mainConcept.map((rawLine, i) => {
                        const text = cleanLine(rawLine);
                        if (!text) return null;
                        return (
                            <p key={i} className="text-base text-slate-200 leading-relaxed font-medium">
                                {renderInline(text, `mc-${i}`)}
                            </p>
                        );
                    })}
                </div>
            </motion.div>

            {/* ── Subtopics Chain Flow ── */}
            {subtopics.length > 0 && (
                <div className="relative pl-4 sm:pl-8">
                    {/* Continuous animated vertical line connecting main concept to bottom node */}
                    <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: '100%' }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 1.5, delay: delay + 0.3, ease: 'easeInOut' }}
                        className="absolute left-8 sm:left-12 top-0 bottom-4 w-px bg-gradient-to-b from-violet-500 via-fuchsia-500/50 to-transparent"
                    />

                    <div className="relative pt-4">
                        {subtopics.map((sub, i) => (
                            <SubtopicNode key={i} subtopic={sub} index={i} delay={delay} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
