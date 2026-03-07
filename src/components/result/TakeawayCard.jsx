import { motion } from 'framer-motion';
import { cleanLine, renderInline } from './markdownUtils';
import SectionCard from './SectionCard';

/**
 * Renders a "Key Takeaways" section as a grid of highlighted cards with icons.
 * Strips all markdown symbols before rendering.
 */
export default function TakeawayCard({ title, items, delay = 0 }) {
    // Clean each item: strip bullet markers and --- separators
    const cleanItems = items
        .map(cleanLine)
        .filter(Boolean); // removes nulls (separator lines) and empty strings

    return (
        <SectionCard title={title} accent="cyan" delay={delay}>
            <ul className="flex flex-col gap-3 sm:grid sm:grid-cols-2">
                {cleanItems.map((item, i) => (
                    <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: delay + 0.1 + i * 0.06, duration: 0.4 }}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-start gap-3 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10 hover:border-cyan-400/30 transition-colors"
                    >
                        {/* Checkmark icon */}
                        <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center">
                            <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </span>
                        <span className="text-sm text-slate-300 leading-relaxed">
                            {renderInline(item, `tc-${i}`)}
                        </span>
                    </motion.li>
                ))}
            </ul>
        </SectionCard>
    );
}
