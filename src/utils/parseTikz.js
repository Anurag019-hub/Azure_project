/**
 * TikZ / LaTeX diagram parser
 *
 * Takes a raw LaTeX string (e.g. returned from the image API) and extracts
 * the \node definitions into structured data ready for rendering.
 */

/**
 * Returns true when the string looks like a LaTeX / TikZ document.
 * Used to decide whether to use TikzDiagram instead of ResultRenderer.
 */
export function isLatexContent(text = '') {
    return (
        text.includes('\\documentclass') ||
        text.includes('\\begin{tikzpicture}') ||
        text.includes('\\begin{document}') ||
        /\\node\s*\(/.test(text)
    );
}

/**
 * Parses TikZ \node definitions from a LaTeX string.
 *
 * Handles patterns like:
 *   \node (id) [options] {label text \\ bullet \\ bullet};
 *   \node (id) {label text};
 *   \node[options] (id) {label};
 *
 * @param {string} latex  — raw LaTeX source
 * @returns {{ id: string, label: string, bullets: string[] }[]}
 */
export function parseTikzNodes(latex = '') {
    const nodes = [];

    // Normalise line endings and collapse whitespace-only lines
    const text = latex.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Match \node with optional options before or after the id
    // Pattern: \node [opts] (id) [opts] { content }
    // or:      \node (id) [opts] { content }
    const nodeRegex =
        /\\node\s*(?:\[[^\]]*\])?\s*\(([^)]+)\)\s*(?:\[[^\]]*\])?\s*\{([\s\S]*?)\}\s*;/g;

    let match;
    while ((match = nodeRegex.exec(text)) !== null) {
        const id = match[1].trim();
        const rawBody = match[2];

        // Split on LaTeX line-break \\ and clean each part
        const parts = rawBody
            .split(/\\\\/)                    // split on \\
            .map(p => p
                .replace(/\$[^$]*\$/g, '')    // strip inline math $...$
                .replace(/\\[a-zA-Z]+\{[^}]*\}/g, '') // strip \cmd{arg}
                .replace(/\\[a-zA-Z]+/g, '')  // strip bare \cmd
                .replace(/[{}]/g, '')          // strip remaining braces
                .replace(/\s+/g, ' ')
                .trim()
            )
            .filter(Boolean);

        if (!parts.length) continue;

        const [label, ...bullets] = parts;

        nodes.push({ id, label, bullets });
    }

    // Also try to extract \tikzstyle / \tikzset named styles as category hints
    // (ignore for now — just return nodes)

    return nodes;
}

/**
 * Extracts the \tikzpicture body from a full LaTeX document.
 * Falls back to the entire string if no environment is found.
 */
export function extractTikzBody(latex = '') {
    const match = latex.match(/\\begin\{tikzpicture\}([\s\S]*?)\\end\{tikzpicture\}/);
    return match ? match[1] : latex;
}

/**
 * High-level entry point: parse a LaTeX string and return node array.
 */
export function parseLatexDiagram(latex = '') {
    const body = extractTikzBody(latex);
    return parseTikzNodes(body);
}
