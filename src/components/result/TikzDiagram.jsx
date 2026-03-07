import { motion } from 'framer-motion';
import { parseLatexDiagram } from '../../utils/parseTikz';

/* ── Color palette cycling per node ── */
const PALETTES = [
    { header: 'from-violet-500 to-fuchsia-500', border: 'border-violet-400/30', dot: 'bg-violet-400', text: 'text-violet-200' },
    { header: 'from-cyan-500 to-teal-500', border: 'border-cyan-400/30', dot: 'bg-cyan-400', text: 'text-cyan-200' },
    { header: 'from-blue-500 to-indigo-500', border: 'border-blue-400/30', dot: 'bg-blue-400', text: 'text-blue-200' },
    { header: 'from-pink-500 to-rose-500', border: 'border-pink-400/30', dot: 'bg-pink-400', text: 'text-pink-200' },
    { header: 'from-amber-500 to-orange-500', border: 'border-amber-400/30', dot: 'bg-amber-400', text: 'text-amber-200' },
    { header: 'from-emerald-500 to-teal-500', border: 'border-emerald-400/30', dot: 'bg-emerald-400', text: 'text-emerald-200' },
    { header: 'from-rose-500 to-pink-500', border: 'border-rose-400/30', dot: 'bg-rose-400', text: 'text-rose-200' },
    { header: 'from-indigo-500 to-violet-500', border: 'border-indigo-400/30', dot: 'bg-indigo-400', text: 'text-indigo-200' },
];

/* ── Single node card ── */
function DiagramNode({ node, palette, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.92 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.45, delay: index * 0.07, type: 'spring', stiffness: 220, damping: 20 }}
            whileHover={{ y: -5, boxShadow: '0 20px 50px -10px rgba(99,102,241,0.25)', transition: { duration: 0.2 } }}
            className={`rounded-2xl border ${palette.border} overflow-hidden shadow-md bg-white/[0.03] backdrop-blur-md`}
        >
            {/* Coloured header strip */}
            <div className={`bg-gradient-to-r ${palette.header} px-4 py-3`}>
                <p className="text-white text-sm font-semibold leading-snug text-center">
                    {node.label}
                </p>
            </div>

            {/* Bullet points */}
            {node.bullets.length > 0 && (
                <ul className="px-4 py-3 space-y-1.5">
                    {node.bullets.map((b, i) => (
                        <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -6 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.07 + 0.1 + i * 0.04 }}
                            className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed"
                        >
                            <span className={`mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full ${palette.dot}`} />
                            {b}
                        </motion.li>
                    ))}
                </ul>
            )}
        </motion.div>
    );
}

/* ── Main diagram component ── */
export default function TikzDiagram({ latex }) {
    const nodes = parseLatexDiagram(latex);

    if (!nodes.length) {
        // Fallback: couldn't parse any nodes — show raw cleaned text
        const cleaned = latex
            .replace(/\\documentclass[\s\S]*?\\begin\{document\}/m, '')
            .replace(/\\end\{document\}/m, '')
            .replace(/\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/gm, (m) => m)
            .replace(/\\[a-zA-Z]+(\[[^\]]*\])?(\{[^}]*\})?/g, '')
            .trim();

        return (
            <div className="rounded-2xl glass border border-amber-500/20 p-6 text-sm text-slate-300 whitespace-pre-wrap font-mono">
                <p className="text-amber-400 text-xs font-semibold mb-3">
                    ⚠ Could not parse TikZ nodes — showing cleaned source:
                </p>
                {cleaned || latex}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-3"
            >
                {/* Diagram icon */}
                <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-base font-heading font-bold text-white">
                        System Diagram
                    </h2>
                    <p className="text-xs text-slate-500">
                        {nodes.length} node{nodes.length !== 1 ? 's' : ''} extracted from TikZ
                    </p>
                </div>
            </motion.div>

            {/* Node grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {nodes.map((node, i) => (
                    <DiagramNode
                        key={node.id}
                        node={node}
                        palette={PALETTES[i % PALETTES.length]}
                        index={i}
                    />
                ))}
            </div>
        </div>
    );
}
