import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cleanLine, renderInline } from './markdownUtils';
import SectionCard from './SectionCard';

/* ═══════════════════ Parse Q&A pairs from raw lines ═══════════════════ */

/**
 * Extracts question/answer pairs from section body lines.
 *
 * Supported formats:
 *   Question: ...   / Answer: ...
 *   Q: ...          / A: ...
 *   **Question:** ...  (bold-prefixed)
 *   Lines starting with "Card N" are treated as separators.
 */
function parseFlashcards(lines) {
    const cards = [];
    let current = { question: '', answer: '' };

    for (const rawLine of lines) {
        const line = cleanLine(rawLine) || '';
        if (!line) continue;

        // Skip pure "Card N" header lines
        if (/^Card\s+\d+$/i.test(line)) continue;

        const qMatch = line.match(/^(?:\*{0,2})(?:Question|Q)\s*[:：]\s*\*{0,2}\s*(.+)/i);
        const aMatch = line.match(/^(?:\*{0,2})(?:Answer|A)\s*[:：]\s*\*{0,2}\s*(.+)/i);

        if (qMatch) {
            // Start a new card when we see a question
            if (current.question && current.answer) {
                cards.push({ ...current });
            }
            current = { question: qMatch[1].trim(), answer: '' };
        } else if (aMatch) {
            current.answer = aMatch[1].trim();
        } else if (current.question && !current.answer) {
            // Continuation line for the question
            current.question += ' ' + line;
        } else if (current.question && current.answer) {
            // Continuation line for the answer
            current.answer += ' ' + line;
        }
    }

    // Push last card
    if (current.question && current.answer) {
        cards.push(current);
    }

    return cards;
}

/* ═══════════════════ Individual flashcard ═══════════════════ */

function Flashcard({ question, answer, index, delay }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ delay: delay + index * 0.08, duration: 0.5, type: 'spring', stiffness: 100, damping: 20 }}
            whileHover={{ scale: 1.01, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)', transition: { duration: 0.2 } }}
            onClick={() => setExpanded(!expanded)}
            className="flex flex-col bg-slate-800/40 rounded-2xl p-6 border border-white/10 hover:border-amber-500/40 transition-colors cursor-pointer group overflow-hidden"
        >
            <motion.div layout className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-500/80 group-hover:text-amber-400 transition-colors">
                    Card {index + 1}
                </span>
                <motion.span
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center group-hover:bg-amber-500/25 transition-colors"
                >
                    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </motion.span>
            </motion.div>

            <motion.h3 layout className="text-lg font-bold text-white leading-snug">
                {renderInline(question, `fq-${index}`)}
            </motion.h3>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/30 to-transparent mb-4" />
                        <p className="text-slate-300 leading-relaxed">
                            {renderInline(answer, `fa-${index}`)}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* ═══════════════════ Main export ═══════════════════ */

export default function FlashcardGrid({ title, items, delay = 0 }) {
    const cards = parseFlashcards(items);

    if (!cards.length) return null;

    return (
        <SectionCard title={title || 'Flashcards'} accent="amber" delay={delay}>
            <div className="grid gap-6 sm:grid-cols-1">
                {cards.map((card, i) => (
                    <Flashcard
                        key={i}
                        question={card.question}
                        answer={card.answer}
                        index={i}
                        delay={delay}
                    />
                ))}
            </div>
        </SectionCard>
    );
}
