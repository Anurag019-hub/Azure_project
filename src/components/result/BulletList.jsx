import { motion } from 'framer-motion';
import { cleanLine, extractSubHeading, renderInline } from './markdownUtils';
import SectionCard from './SectionCard';

/**
 * Renders a "Detailed Bullet Points" section as a clean nested list.
 * Strips all markdown symbols before rendering.
 */
export default function BulletList({ title, items, delay = 0 }) {
    return (
        <SectionCard title={title} accent="emerald" delay={delay}>
            <ul className="space-y-2.5">
                {items.map((rawItem, i) => {
                    // Check for sub-heading (#### or **Bold**)
                    const subHeading = extractSubHeading(rawItem);
                    if (subHeading) {
                        return (
                            <li key={i} className="pt-3 pb-1">
                                <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">
                                    {subHeading}
                                </span>
                            </li>
                        );
                    }

                    const text = cleanLine(rawItem);
                    // null means it was a separator line
                    if (!text) return <li key={i}><hr className="border-white/10 my-1" /></li>;

                    const isSubItem = rawItem.startsWith('  ') || rawItem.startsWith('\t');

                    return (
                        <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: delay + 0.08 + i * 0.04, duration: 0.35 }}
                            className={`flex items-start gap-3 ${isSubItem ? 'ml-6' : ''}`}
                        >
                            <span className={`shrink-0 rounded-full ${isSubItem
                                    ? 'w-1 h-1 bg-slate-500 mt-2.5'
                                    : 'w-1.5 h-1.5 bg-emerald-400 mt-2'
                                }`} />
                            <span className={`leading-relaxed ${isSubItem ? 'text-sm text-slate-400' : 'text-slate-300'}`}>
                                {renderInline(text, `bl-${i}`)}
                            </span>
                        </motion.li>
                    );
                })}
            </ul>
        </SectionCard>
    );
}
