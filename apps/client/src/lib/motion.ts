/**
 * Framer Motion Factory - Centralized motion component creation
 * 
 * This reduces bundle size by:
 * 1. Creating reusable motion components with defaults
 * 2. Avoiding duplicate imports across 74+ files
 * 3. Enabling consistent animation patterns
 */

import { motion, Variants, Transition } from 'framer-motion';

// Default transitions for consistency
export const transitions = {
  fast: { duration: 0.2, ease: 'easeOut' },
  default: { duration: 0.3, ease: 'easeInOut' },
  slow: { duration: 0.5, ease: 'easeInOut' },
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  bounce: { type: 'spring', stiffness: 400, damping: 10 },
} as const;

// Common animation variants
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export const slideUp: Variants = {
  hidden: { y: 50, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 20 }
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  },
};

// Pre-configured motion components
export const MotionDiv = motion.div;
export const MotionSection = motion.section;
export const MotionArticle = motion.article;
export const MotionHeader = motion.header;
export const MotionFooter = motion.footer;
export const MotionMain = motion.main;
export const MotionAside = motion.aside;
export const MotionNav = motion.nav;
export const MotionSpan = motion.span;
export const MotionP = motion.p;
export const MotionH1 = motion.h1;
export const MotionH2 = motion.h2;
export const MotionH3 = motion.h3;
export const MotionH4 = motion.h4;
export const MotionH5 = motion.h5;
export const MotionH6 = motion.h6;
export const MotionUl = motion.ul;
export const MotionOl = motion.ol;
export const MotionLi = motion.li;
export const MotionButton = motion.button;
export const MotionA = motion.a;
export const MotionImg = motion.img;
export const MotionSvg = motion.svg;
export const MotionPath = motion.path;
export const MotionCircle = motion.circle;
export const MotionRect = motion.rect;

// Re-export types
export type { Variants, Transition };

/**
 * Usage example:
 * 
 * import { MotionDiv, fadeInUp, transitions } from '@/lib/motion';
 * 
 * <MotionDiv
 *   initial="hidden"
 *   whileInView="visible"
 *   viewport={{ once: true }}
 *   variants={fadeInUp}
 *   transition={transitions.default}
 * >
 *   Content
 * </MotionDiv>
 */