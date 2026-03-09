import { cleanTitle, cleanLine, extractSubHeading, renderInline } from './markdownUtils';
import SectionCard from './SectionCard';
import MindMapBlock from './MindMapBlock';
import TakeawayCard from './TakeawayCard';
import BulletList from './BulletList';
import FlashcardGrid from './FlashcardGrid';
import FinalNotesBox from './FinalNotesBox';
import TikzDiagram from './TikzDiagram';
import { isLatexContent } from '../../utils/parseTikz';

/* ═════════════════════ Section type detection ═════════════════════ */

const SECTION_TYPES = {
    flashcard: /flash.?card|q\s*&?\s*a|quiz|review.?card/i,
    mindmap: /mind.?map|concept.?map|overview.*diagram|topic.*map/i,
    takeaway: /takeaway|key.?point|highlight|summary.?point|quick.*note/i,
    bullet: /detail|bullet|breakdown|point|list|elaborat/i,
    notes: /final.*note|conclusion|closing|remark|summary|wrap.*up/i,
};

function detectType(heading) {
    for (const [type, pattern] of Object.entries(SECTION_TYPES)) {
        if (pattern.test(heading)) return type;
    }
    return 'generic';
}

/* ═════════════════════ Text → sections parser ═════════════════════ */

/**
 * Splits raw synthesis text into typed sections by heading (##, ###, #).
 * Section titles have their markdown markers cleaned automatically.
 */
function parseSections(text) {
    const lines = text.split('\n');
    const sections = [];
    let current = null;

    for (const line of lines) {
        const headingMatch = line.match(/^#{1,4}\s+(.+)/);

        if (headingMatch) {
            if (current) sections.push(current);
            const title = headingMatch[1].trim(); // already stripped of #
            current = { type: detectType(title), title, lines: [] };
        } else if (current) {
            current.lines.push(line);
        } else if (line.trim()) {
            // Content before the first heading → intro section
            if (!current) current = { type: 'intro', title: null, lines: [] };
            current.lines.push(line);
        }
    }

    if (current) sections.push(current);
    return sections;
}

/* ═════════════════════ Section renderer ═════════════════════ */

function renderSection(section, index) {
    const delay = 0.05 + index * 0.1;
    const nonEmpty = section.lines.filter(l => l.trim());
    if (!nonEmpty.length) return null;

    switch (section.type) {
        case 'flashcard':
            return (
                <FlashcardGrid
                    key={index}
                    title={section.title}
                    items={section.lines}
                    delay={delay}
                />
            );

        case 'mindmap':
            return (
                <MindMapBlock
                    key={index}
                    title={section.title}
                    items={section.lines}
                    delay={delay}
                />
            );

        case 'takeaway':
            return (
                <TakeawayCard
                    key={index}
                    title={section.title}
                    items={section.lines}
                    delay={delay}
                />
            );

        case 'bullet':
            return (
                <BulletList
                    key={index}
                    title={section.title}
                    items={section.lines}
                    delay={delay}
                />
            );

        case 'notes':
            return (
                <FinalNotesBox
                    key={index}
                    title={section.title}
                    lines={section.lines}
                    delay={delay}
                />
            );

        case 'intro':
        default:
            return (
                <SectionCard
                    key={index}
                    title={section.title ? cleanTitle(section.title) : null}
                    accent="violet"
                    delay={delay}
                >
                    <div className="flex flex-col gap-2.5">
                        {section.lines.map((rawLine, i) => {
                            // --- separator
                            if (!rawLine.trim() || /^[-*_]{3,}$/.test(rawLine.trim()))
                                return <hr key={i} className="border-white/10 my-1" />;

                            // Sub-heading inside body (#### or **Full Line Bold**)
                            const subH = extractSubHeading(rawLine);
                            if (subH) {
                                return (
                                    <p key={i} className="text-sm font-semibold text-violet-300 mt-3 first:mt-0">
                                        {subH}
                                    </p>
                                );
                            }

                            const text = cleanLine(rawLine);
                            if (!text) return null;

                            // Bullet lines inside generic section
                            const isBullet = /^[\-*•]\s/.test(rawLine.trimStart());
                            return (
                                <div key={i} className={`flex items-start gap-3 ${isBullet ? 'ml-1' : ''}`}>
                                    {isBullet && (
                                        <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-violet-400" />
                                    )}
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        {renderInline(text, `g-${index}-${i}`)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </SectionCard>
            );
    }
}

/* ═════════════════════ Main component ═════════════════════ */

/**
 * Parses the raw `synthesis` / `content` string and renders each section
 * with the appropriate visual component. No raw markdown symbols are shown.
 */
export default function ResultRenderer({ content }) {
    if (!content?.trim()) return null;

    // ── LaTeX / TikZ detection: delegate to diagram renderer ──
    if (isLatexContent(content)) {
        return <TikzDiagram latex={content} />;
    }

    const sections = parseSections(content);

    // If no headings detected, render as plain cleaned paragraphs
    if (sections.length === 1 && sections[0].type === 'intro') {
        return (
            <SectionCard accent="violet" delay={0.05}>
                <div className="flex flex-col gap-2.5">
                    {content.split('\n').map((rawLine, i) => {
                        if (!rawLine.trim() || /^[-*_]{3,}$/.test(rawLine.trim()))
                            return <hr key={i} className="border-white/10 my-1" />;
                        const text = cleanLine(rawLine);
                        if (!text) return null;
                        return (
                            <p key={i} className="text-sm text-slate-300 leading-relaxed">
                                {renderInline(text, `p-${i}`)}
                            </p>
                        );
                    })}
                </div>
            </SectionCard>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            {sections.map((section, i) => renderSection(section, i))}
        </div>
    );
}
