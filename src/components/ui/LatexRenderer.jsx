import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * LatexRenderer — renders mixed LaTeX content (text + math).
 *
 * Recognises:
 *   $$...$$  →  block (display) equations
 *   $...$    →  inline math
 *   \[...\]  →  block equations (alternative)
 *   \(...\)  →  inline math   (alternative)
 *
 * Everything else is rendered as plain text paragraphs.
 *
 * @param {{ content: string, className?: string }} props
 */
export default function LatexRenderer({ content = '', className = '' }) {
    const rendered = useMemo(() => {
        if (!content) return '';

        try {
            return parseLatexContent(content);
        } catch {
            // Fallback: show raw content if parsing completely fails
            return escapeHtml(content);
        }
    }, [content]);

    if (!content) {
        return null;
    }

    return (
        <div
            className={`latex-content ${className}`}
            dangerouslySetInnerHTML={{ __html: rendered }}
        />
    );
}

/* ─────────────────────── Internals ─────────────────────── */

/**
 * Splits content into text / math segments, renders math with KaTeX,
 * and wraps plain text in <p> tags with proper paragraph handling.
 */
function parseLatexContent(raw) {
    // Normalise \[ \] and \( \) to $$ and $ delimiters
    let text = raw
        .replace(/\\\[/g, '$$')
        .replace(/\\\]/g, '$$')
        .replace(/\\\(/g, '$')
        .replace(/\\\)/g, '$');

    // Regex: match $$...$$ (block) or $...$ (inline), non-greedy
    // Using a split approach to preserve order
    const tokens = [];
    let remaining = text;

    while (remaining.length > 0) {
        // Try block math first: $$...$$
        const blockMatch = remaining.match(/\$\$([\s\S]*?)\$\$/);
        // Try inline math: $...$  (but not $$)
        const inlineMatch = remaining.match(/(?<!\$)\$(?!\$)([\s\S]*?)(?<!\$)\$(?!\$)/);

        if (!blockMatch && !inlineMatch) {
            // No more math — rest is plain text
            if (remaining.trim()) {
                tokens.push({ type: 'text', value: remaining });
            }
            break;
        }

        // Determine which comes first
        const blockIdx = blockMatch ? remaining.indexOf(blockMatch[0]) : Infinity;
        const inlineIdx = inlineMatch ? remaining.indexOf(inlineMatch[0]) : Infinity;

        if (blockIdx <= inlineIdx && blockMatch) {
            // Text before the block math
            const before = remaining.slice(0, blockIdx);
            if (before.trim()) tokens.push({ type: 'text', value: before });

            // The block equation
            tokens.push({ type: 'block', value: blockMatch[1] });
            remaining = remaining.slice(blockIdx + blockMatch[0].length);
        } else if (inlineMatch) {
            // Text before inline math
            const before = remaining.slice(0, inlineIdx);
            if (before.trim()) tokens.push({ type: 'text', value: before });

            // The inline equation
            tokens.push({ type: 'inline', value: inlineMatch[1] });
            remaining = remaining.slice(inlineIdx + inlineMatch[0].length);
        }
    }

    // Render each token to HTML
    return tokens
        .map((token) => {
            switch (token.type) {
                case 'block':
                    return renderMath(token.value, true);
                case 'inline':
                    return renderMath(token.value, false);
                case 'text':
                default:
                    return renderText(token.value);
            }
        })
        .join('');
}

/**
 * Renders a LaTeX string with KaTeX. Falls back to an error box on failure.
 */
function renderMath(latex, displayMode) {
    try {
        const html = katex.renderToString(latex.trim(), {
            displayMode,
            throwOnError: false,
            strict: false,
            trust: true,
            output: 'html',
        });

        if (displayMode) {
            return `<div class="latex-block">${html}</div>`;
        }
        return `<span class="latex-inline">${html}</span>`;
    } catch (err) {
        const escapedLatex = escapeHtml(latex);
        const label = displayMode ? 'Block equation error' : 'Inline math error';
        return `<span class="latex-error" title="${label}: ${escapeHtml(err.message)}"><code>${escapedLatex}</code></span>`;
    }
}

/**
 * Wraps plain text segments into <p> tags, splitting on double-newlines
 * for paragraph breaks. Single newlines become <br>.
 */
function renderText(text) {
    const paragraphs = text.split(/\n\s*\n/);
    return paragraphs
        .map((p) => {
            const trimmed = p.trim();
            if (!trimmed) return '';
            const withBreaks = escapeHtml(trimmed).replace(/\n/g, '<br />');
            return `<p class="latex-text">${withBreaks}</p>`;
        })
        .filter(Boolean)
        .join('');
}

/** Simple HTML escape */
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
