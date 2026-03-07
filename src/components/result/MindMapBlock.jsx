import { useState } from 'react';
import { motion } from 'framer-motion';
import { cleanLine, renderInline } from './markdownUtils';
import SectionCard from './SectionCard';

/* ═══════════════════ Color palette per branch ═══════════════════ */
const BRANCH_COLORS = [
    { header: 'from-teal-500 to-cyan-500', border: 'border-teal-400/40', dot: 'bg-teal-400', text: 'text-teal-300' },
    { header: 'from-violet-500 to-fuchsia-500', border: 'border-violet-400/40', dot: 'bg-violet-400', text: 'text-violet-300' },
    { header: 'from-pink-500 to-rose-500', border: 'border-pink-400/40', dot: 'bg-pink-400', text: 'text-pink-300' },
    { header: 'from-blue-500 to-indigo-500', border: 'border-blue-400/40', dot: 'bg-blue-400', text: 'text-blue-300' },
    { header: 'from-amber-500 to-orange-500', border: 'border-amber-400/40', dot: 'bg-amber-400', text: 'text-amber-300' },
    { header: 'from-emerald-500 to-teal-500', border: 'border-emerald-400/40', dot: 'bg-emerald-400', text: 'text-emerald-300' },
];

/* ═══════════════════ Tree parser ═══════════════════
 * Converts flat text lines into a {title, children[]} tree.
 * Indented lines become children of the previous non-indented line.
====================================================== */
function parseTree(lines) {
    const roots = [];
    let currentParent = null;

    for (const rawLine of lines) {
        if (!rawLine.trim()) continue;

        const isIndented = rawLine.startsWith('  ') || rawLine.startsWith('\t');
        const text = cleanLine(rawLine);
        if (!text) continue;

        if (isIndented && currentParent) {
            currentParent.children.push({ title: text, children: [] });
        } else {
            const node = { title: text, children: [] };
            roots.push(node);
            currentParent = node;
        }
    }

    return roots;
}

/* ═══════════════════ ConceptNode — leaf node card ═══════════════════ */
function ConceptNode({ title, color, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            className="flex items-start gap-2 px-3 py-2 rounded-xl bg-white/[0.04]
                       border border-white/[0.07] hover:border-white/15
                       text-slate-300 text-xs leading-snug transition-colors"
        >
            <span className={`mt-1 shrink-0 w-1.5 h-1.5 rounded-full ${color.dot}`} />
            <span>{renderInline(title, `cn-${title}`)}</span>
        </motion.div>
    );
}

/* ═══════════════════ NodeGroup — a first-level branch with its children ═══════════════════ */
function NodeGroup({ node, color, branchIndex, totalBranches, baseDelay }) {
    const [hovered, setHovered] = useState(false);
    const nodeDelay = baseDelay + branchIndex * 0.1;

    return (
        <div className="flex flex-col items-center min-w-[130px] max-w-[180px]">
            {/* Vertical connector from top horizontal bar down to the card */}
            <div className="w-px h-6 bg-gradient-to-b from-white/20 to-white/10" />

            {/* Branch card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: nodeDelay, type: 'spring', stiffness: 240, damping: 20 }}
                whileHover={{ y: -4, transition: { duration: 0.18 } }}
                onHoverStart={() => setHovered(true)}
                onHoverEnd={() => setHovered(false)}
                className={`w-full rounded-2xl border overflow-hidden shadow-lg transition-shadow duration-200
                    ${color.border} ${hovered ? 'shadow-xl' : 'shadow-md'}`}
            >
                {/* Coloured header strip */}
                <div className={`bg-gradient-to-r ${color.header} px-3 py-2`}>
                    <p className="text-white text-xs font-semibold text-center leading-tight">
                        {node.title}
                    </p>
                </div>

                {/* Children list */}
                {node.children.length > 0 && (
                    <div className="bg-white/[0.03] px-2 py-2 flex flex-col gap-1.5">
                        {node.children.map((child, ci) => (
                            <ConceptNode
                                key={ci}
                                title={child.title}
                                color={color}
                                delay={nodeDelay + 0.08 + ci * 0.05}
                            />
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}

/* ═══════════════════ MindMapBlock — main export ═══════════════════ */
export default function MindMapBlock({ title, items, delay = 0 }) {
    const branches = parseTree(items);
    if (!branches.length) return null;

    // First item might be the overall hub label; keep it as root label
    // If there's only 1 branch with no children it's the hub label — use section title instead
    const hubLabel = branches.length === 1 && !branches[0].children.length
        ? title
        : title || branches[0]?.title;

    const displayBranches = branches.length === 1 && !branches[0].children.length
        ? []
        : branches;

    const hasBranches = displayBranches.length > 0;

    return (
        <SectionCard title={null} accent="violet" delay={delay}>
            <div className="flex flex-col items-center gap-0 w-full">

                {/* ── Root node ── */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.75 }}
                    animate={{
                        opacity: 1, scale: 1,
                        boxShadow: [
                            '0 0 16px rgba(167,139,250,0.25)',
                            '0 0 28px rgba(167,139,250,0.5)',
                            '0 0 16px rgba(167,139,250,0.25)',
                        ],
                    }}
                    transition={{
                        opacity: { duration: 0.45, delay },
                        scale: { duration: 0.45, delay, type: 'spring', stiffness: 250 },
                        boxShadow: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 },
                    }}
                    className="relative z-10 px-8 py-3 rounded-2xl
                               bg-gradient-to-br from-violet-600/40 via-fuchsia-600/30 to-violet-600/25
                               border border-violet-400/50 text-white font-heading font-bold text-sm text-center"
                >
                    {hubLabel || 'Concept Map'}
                    {/* Inner ring */}
                    <span className="absolute inset-0 rounded-2xl border border-violet-300/20 pointer-events-none" />
                </motion.div>

                {/* ── Vertical stem ── */}
                {hasBranches && (
                    <motion.div
                        className="w-px bg-gradient-to-b from-violet-400/60 to-white/20"
                        initial={{ scaleY: 0, originY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.3, delay: delay + 0.25 }}
                        style={{ height: '24px' }}
                    />
                )}

                {/* ── Horizontal crossbar ── */}
                {hasBranches && (
                    <motion.div
                        className="h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.45, delay: delay + 0.35, ease: 'easeOut' }}
                        style={{ width: `${Math.min(displayBranches.length * 170, 680)}px`, maxWidth: '100%' }}
                    />
                )}

                {/* ── Branch nodes ── */}
                {hasBranches && (
                    <div className="flex flex-wrap justify-center gap-5 w-full">
                        {displayBranches.map((branch, i) => (
                            <NodeGroup
                                key={i}
                                node={branch}
                                color={BRANCH_COLORS[i % BRANCH_COLORS.length]}
                                branchIndex={i}
                                totalBranches={displayBranches.length}
                                baseDelay={delay + 0.45}
                            />
                        ))}
                    </div>
                )}

                {/* Fallback: no hierarchy detected — simple concept pills */}
                {!hasBranches && branches.length > 1 && (
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        {branches.map((b, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: delay + 0.1 + i * 0.07 }}
                                whileHover={{ scale: 1.06 }}
                                className={`relative px-4 py-2 rounded-xl bg-white/[0.04] border
                                    ${BRANCH_COLORS[i % BRANCH_COLORS.length].border}
                                    text-sm text-slate-300`}
                            >
                                <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full
                                    ${BRANCH_COLORS[i % BRANCH_COLORS.length].dot}`}
                                />
                                {renderInline(b.title, `pill-${i}`)}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </SectionCard>
    );
}
