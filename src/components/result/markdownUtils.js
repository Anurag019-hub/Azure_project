/**
 * Shared markdown parsing utilities for result components.
 *
 * Kept as .js (not .jsx) — uses React.createElement instead of JSX
 * so Vite compiles it correctly without needing JSX transformation.
 */

import { createElement } from 'react';

/**
 * Strips heading markers (#, ##, ###, ####) from a title string.
 */
export function cleanTitle(text = '') {
    return text.replace(/^#{1,4}\s*/, '').trim();
}

/**
 * Strips leading bullet markers (-, *, •) from a line.
 * Returns null for horizontal rule lines (---) to signal a divider.
 */
export function cleanLine(text = '') {
    if (/^[-*_]{3,}$/.test(text.trim())) return null;
    return text.replace(/^[\s\-*•]+/, '').trim();
}

/**
 * Converts inline markdown to styled React elements — no JSX needed:
 *   **text** → <strong>
 *   `text`   → <code>
 *   Plain text passes through unchanged.
 *
 * @param {string} text
 * @param {string} [key] - React key prefix for list rendering
 * @returns {React.ReactNode[]}
 */
export function renderInline(text = '', key = '') {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return createElement(
                'strong',
                { key: `${key}-b${i}`, className: 'text-white font-semibold' },
                part.slice(2, -2)
            );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return createElement(
                'code',
                {
                    key: `${key}-c${i}`,
                    className: 'text-violet-300 bg-violet-500/10 px-1.5 py-0.5 rounded text-sm font-mono',
                },
                part.slice(1, -1)
            );
        }
        return part;
    });
}

/**
 * Detects sub-headings inside body text:
 *   #### heading  →  returns the cleaned heading text
 *   **Full line** →  returns text (treated as a sub-heading)
 *   Anything else →  returns null
 */
export function extractSubHeading(line = '') {
    const match = line.match(/^#{1,4}\s+(.+)/);
    if (match) return match[1].trim();
    if (/^\*\*[^*]+\*\*$/.test(line.trim())) return line.trim().slice(2, -2);
    return null;
}
