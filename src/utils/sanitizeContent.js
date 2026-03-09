/**
 * sanitizeContent.js
 *
 * Deep-cleans a raw API response string so it is ready for display in the UI.
 *
 * Pipeline:
 *  1. Remove technical API noise ("Object", "Array(3)", "undefined", "null")
 *  2. Convert LaTeX commands and environments to plain readable text
 *  3. Strip stray escape characters and symbols (\, extra *, {}, [], etc.)
 *  4. Collapse excessive blank lines and whitespace
 */

/* ═══════════════════ LaTeX → plain text ═══════════════════ */

/**
 * Convert LaTeX figure / equation environments into labelled blocks:
 *   \begin{figure}...\end{figure}   →  Figure: ...
 *   \begin{equation}...\end{equation} →  Equation: ...
 */
function convertLatexEnvironments(text) {
    // Figures
    text = text.replace(
        /\\begin\{figure\}[\s\S]*?\\caption\{([^}]*)\}[\s\S]*?\\end\{figure\}/gi,
        (_m, caption) => `Figure: ${cleanLatexInner(caption)}`
    );

    // Equations — keep them labelled but strip the math noise
    text = text.replace(
        /\\begin\{equation\*?\}([\s\S]*?)\\end\{equation\*?\}/gi,
        (_m, body) => `Equation: ${cleanLatexInner(body)}`
    );

    // Generic environments (table, align, itemize…) — just unwrap
    text = text.replace(/\\begin\{[^}]+\}/g, '');
    text = text.replace(/\\end\{[^}]+\}/g, '');

    return text;
}

/**
 * Convert common LaTeX commands to their readable equivalents.
 */
function convertLatexCommands(text) {
    // \textbf{...} → bold marker (will be handled by renderInline downstream)
    text = text.replace(/\\textbf\{([^}]*)\}/g, '**$1**');
    // \textit{...} / \emph{...}
    text = text.replace(/\\(?:textit|emph)\{([^}]*)\}/g, '$1');
    // \underline{...}
    text = text.replace(/\\underline\{([^}]*)\}/g, '$1');
    // \text{...} (used inside math)
    text = text.replace(/\\text\{([^}]*)\}/g, '$1');
    // \frac{a}{b} → a/b
    text = text.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2');
    // \sqrt{x} → sqrt(x)
    text = text.replace(/\\sqrt\{([^}]*)\}/g, 'sqrt($1)');
    // Superscript: x^{n} → x^n  |  x^n remains
    text = text.replace(/\^\{([^}]*)\}/g, '^$1');
    // Subscript: x_{n} → x_n
    text = text.replace(/\_\{([^}]*)\}/g, '_$1');
    // \item → bullet
    text = text.replace(/\\item\s*/g, '• ');
    // \caption{...}
    text = text.replace(/\\caption\{([^}]*)\}/g, '$1');
    // \label{...} — remove entirely
    text = text.replace(/\\label\{[^}]*\}/g, '');
    // \ref{...} / \cite{...} — just show the key
    text = text.replace(/\\(?:ref|cite)\{([^}]*)\}/g, '$1');
    // \section / \subsection etc — convert to markdown headings (ResultRenderer handles these)
    text = text.replace(/\\section\*?\{([^}]*)\}/g, '## $1');
    text = text.replace(/\\subsection\*?\{([^}]*)\}/g, '### $1');
    text = text.replace(/\\subsubsection\*?\{([^}]*)\}/g, '#### $1');
    // \paragraph{...}
    text = text.replace(/\\paragraph\{([^}]*)\}/g, '**$1**');

    // Strip remaining \command sequences (e.g. \hline, \centering, \newpage, \documentclass, \usepackage...)
    text = text.replace(/\\[a-zA-Z]+(?:\[[^\]]*\])?(?:\{[^}]*\})?/g, '');

    return text;
}

/**
 * Strip inline math delimiters: $...$ and $$...$$.
 * Keep the inner content (already cleaned of commands by convertLatexCommands).
 */
function stripMathDelimiters(text) {
    // Display math $$...$$
    text = text.replace(/\$\$([^$]*)\$\$/g, '$1');
    // Inline math $...$
    text = text.replace(/\$([^$]*)\$/g, '$1');
    return text;
}

/** Clean inner LaTeX fragment (used for captions, equations). */
function cleanLatexInner(text) {
    text = convertLatexCommands(text);
    text = stripMathDelimiters(text);
    text = stripEscapeNoise(text);
    return text.trim();
}

/* ═══════════════════ Escape & noise removal ═══════════════════ */

function stripEscapeNoise(text) {
    // Literal escaped newlines written as text (e.g. the two-char sequence \ n)
    text = text.replace(/\\n/g, '\n');
    // Literal \t, \r
    text = text.replace(/\\t/g, ' ');
    text = text.replace(/\\r/g, '');
    // Double-backslash → single (before removing remaining stray ones)
    text = text.replace(/\\\\/g, ' ');
    // Stray single backslashes not followed by letter (those are handled as commands above)
    text = text.replace(/\\(?![a-zA-Z])/g, '');
    // Remove stray curly braces
    text = text.replace(/[{}]/g, '');
    // Remove stray square brackets (but keep content inside)
    text = text.replace(/\[|\]/g, '');
    return text;
}

/**
 * Remove technical artifacts that leak from JSON serialisation.
 */
function stripApiNoise(text) {
    // "Object", "[object Object]"
    text = text.replace(/\[?object\s+Object\]?/gi, '');
    // "Array(3)", "Array (5)", etc.
    text = text.replace(/Array\s*\(\d+\)/gi, '');
    // Standalone "undefined" / "null"
    text = text.replace(/\b(undefined|null)\b/gi, '');
    return text;
}

/* ═══════════════════ Whitespace normalisation ═══════════════════ */

function normaliseWhitespace(text) {
    // Replace 3+ blank lines with exactly 2
    text = text.replace(/\n{3,}/g, '\n\n');
    // Trim trailing whitespace per line
    text = text.replace(/[ \t]+$/gm, '');
    return text.trim();
}

/* ═══════════════════ Main export ═══════════════════ */

/**
 * Sanitise a raw API response string into clean, readable markdown-ish text
 * that the ResultRenderer pipeline can handle directly.
 *
 * @param {string} raw — the raw synthesis / content string from the API
 * @returns {string} — cleaned string
 */
export default function sanitizeContent(raw = '') {
    if (!raw || typeof raw !== 'string') return '';

    let text = raw;

    // ── Pre-process raw JSON formatting ──
    try {
        const obj = JSON.parse(text);
        if (obj && typeof obj === 'object') {
            let md = '';

            // Explanation blocks
            const mainText = obj.latex || obj.content || obj.synthesis || obj.explanation || obj.summary || '';
            if (mainText) {
                md += `## Explanation\n\n${mainText}\n\n`;
            }

            // Other dynamic fields (arrays to bullets, strings to text)
            for (const key of Object.keys(obj)) {
                const lowerKey = key.toLowerCase();
                if (['latex', 'content', 'synthesis', 'explanation', 'summary', 'result', 'flashcards'].includes(lowerKey)) continue;

                const val = obj[key];
                if (Array.isArray(val)) {
                    md += `## ${key.charAt(0).toUpperCase() + key.slice(1)}\n\n` + val.map(v => `• ${v}`).join('\n') + '\n\n';
                } else if (typeof val === 'string') {
                    md += `## ${key.charAt(0).toUpperCase() + key.slice(1)}\n\n${val}\n\n`;
                }
            }

            // Flashcards mapping
            if (obj.flashcards && Array.isArray(obj.flashcards)) {
                md += `## Flashcards\n\n`;
                obj.flashcards.forEach((card, i) => {
                    md += `Card ${i + 1}\n`;
                    md += `Question: ${card.question}\n`;
                    md += `Answer: ${card.answer}\n\n`;
                });
            }

            text = md;
        }
    } catch (e) {
        // Not valid JSON, continue normal sanitization
    }

    // 1. Technical API noise
    text = stripApiNoise(text);

    // 2. LaTeX environments (figures, equations, tables…)
    text = convertLatexEnvironments(text);

    // 3. LaTeX commands → readable text
    text = convertLatexCommands(text);

    // 4. Math delimiters
    text = stripMathDelimiters(text);

    // 5. Escape chars & stray symbols
    text = stripEscapeNoise(text);

    // 6. Whitespace
    text = normaliseWhitespace(text);

    return text;
}
