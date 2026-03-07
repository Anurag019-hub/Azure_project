/**
 * Shared Framer Motion animation variants.
 * Import into any component — no Framer Motion boilerplate needed.
 *
 * Usage:
 *   import { fadeUp, stagger, scaleIn } from '../../utils/animations';
 *   <motion.div variants={stagger} initial="hidden" animate="visible">
 *     <motion.div variants={fadeUp}>…</motion.div>
 *   </motion.div>
 */

/** Default ease curve — snappy and satisfying */
export const EASE = [0.22, 1, 0.36, 1];

/* ── Entry animations ── */

export const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.3, ease: EASE } },
};

export const fadeDown = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
    exit: { opacity: 0, y: 10, transition: { duration: 0.25 } },
};

export const fadeLeft = {
    hidden: { opacity: 0, x: 24 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
    exit: { opacity: 0, x: 12, transition: { duration: 0.25 } },
};

export const fadeRight = {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
    exit: { opacity: 0, x: -12, transition: { duration: 0.25 } },
};

export const scaleIn = {
    hidden: { opacity: 0, scale: 0.88 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: EASE, type: 'spring', stiffness: 240, damping: 22 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.25 } },
};

export const slideUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

/* ── Page-level transition ── */

export const pageTransition = {
    hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.42, ease: EASE } },
    exit: { opacity: 0, y: -10, filter: 'blur(2px)', transition: { duration: 0.28, ease: EASE } },
};

/* ── Container stagger ── */

export const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

export const staggerFast = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
};

export const staggerSlow = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.18 } },
};

/* ── Hover / tap helpers (pass directly to motion props) ── */

/** Lift card on hover */
export const hoverLift = { y: -5, transition: { duration: 0.2 } };

/** Scale slightly on hover */
export const hoverScale = { scale: 1.04, transition: { duration: 0.18 } };

/** Button press */
export const tapPress = { scale: 0.96 };

/* ── Viewport trigger props (spread into motion.div) ── */

/**
 * Trigger animation once when element enters viewport.
 * Usage: <motion.div variants={fadeUp} {...viewport} />
 */
export const viewport = {
    initial: 'hidden',
    whileInView: 'visible',
    viewport: { once: true, margin: '-60px' },
};

/**
 * Trigger stagger container when it enters viewport.
 */
export const viewportStagger = {
    initial: 'hidden',
    whileInView: 'visible',
    viewport: { once: true, margin: '-40px' },
    variants: stagger,
};
