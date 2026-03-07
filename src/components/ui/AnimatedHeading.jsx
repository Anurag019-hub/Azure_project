import { motion } from 'framer-motion';

/**
 * AnimatedHeading — letter-by-letter reveal animation.
 *
 * Usage:
 *   <AnimatedHeading text="Hello World" className="text-4xl font-bold" delay={0.1} />
 *
 * Each character fades up with a stagger, creating a typewriter-like reveal.
 */
export default function AnimatedHeading({
    text = '',
    className = '',
    delay = 0,
    stagger = 0.03,
    Tag = 'h2',
}) {
    const words = text.split(' ');

    const container = {
        hidden: {},
        visible: {
            transition: { staggerChildren: stagger, delayChildren: delay },
        },
    };

    const letter = {
        hidden: { opacity: 0, y: 20, rotateX: -40 },
        visible: {
            opacity: 1,
            y: 0,
            rotateX: 0,
            transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
        },
    };

    const MotionTag = motion[Tag] || motion.h2;

    return (
        <MotionTag
            className={`${className} overflow-hidden`}
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ perspective: 400 }}
        >
            {words.map((word, wi) => (
                <span key={wi} className="inline-block mr-[0.25em] last:mr-0">
                    {word.split('').map((char, ci) => (
                        <motion.span
                            key={ci}
                            variants={letter}
                            className="inline-block"
                            style={{ display: 'inline-block' }}
                        >
                            {char}
                        </motion.span>
                    ))}
                </span>
            ))}
        </MotionTag>
    );
}
