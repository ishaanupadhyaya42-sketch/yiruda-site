import { motion } from "framer-motion";

/**
 * 4-second layered brushstroke reveal of the "YIRUDA" wordmark.
 * Uses SVG path-draw with sequenced strokes evoking sumi-e ink painting.
 */
export default function BrushOpening({ onComplete }) {
  // Sequence (seconds):
  // 0.0  background paper darken
  // 0.4  Y stroke 1 (vertical), 0.6s
  // 0.9  Y stroke 2 (diagonal), 0.5s
  // 1.3  I stroke (vertical), 0.4s
  // 1.6  R curve, 0.7s
  // 2.0  U curve, 0.7s
  // 2.4  D bowl, 0.7s
  // 2.8  A peak, 0.6s
  // 3.3  underline accent + tagline fade in
  // 4.0  fade overall component reveal complete

  const easeBrush = [0.25, 1, 0.5, 1];
  const strokeColor = "#0F0E0E";

  const stroke = (delay, duration = 0.55) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { delay, duration, ease: easeBrush },
  });

  return (
    <div
      className="relative w-full flex flex-col items-center justify-center"
      data-testid="brush-opening"
    >
      <svg
        viewBox="0 0 1200 320"
        className="w-full max-w-[1100px] h-auto"
        preserveAspectRatio="xMidYMid meet"
        style={{ filter: "drop-shadow(0 0 0.5px rgba(15,14,14,0.2))" }}
      >
        {/* Underlying paper accent stroke - subtle gold */}
        <motion.path
          d="M 140 280 C 400 270, 800 285, 1060 275"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.55"
          {...stroke(3.3, 0.9)}
        />

        {/* Y */}
        <motion.path
          d="M 170 80 C 175 130, 190 175, 220 200"
          fill="none"
          stroke={strokeColor}
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...stroke(0.4, 0.6)}
        />
        <motion.path
          d="M 280 75 C 270 130, 250 175, 220 200 L 215 250"
          fill="none"
          stroke={strokeColor}
          strokeWidth="14"
          strokeLinecap="round"
          {...stroke(0.9, 0.55)}
        />

        {/* I */}
        <motion.path
          d="M 360 80 L 360 250"
          fill="none"
          stroke={strokeColor}
          strokeWidth="14"
          strokeLinecap="round"
          {...stroke(1.35, 0.45)}
        />

        {/* R */}
        <motion.path
          d="M 430 250 L 430 80 C 460 78, 510 78, 510 130 C 510 175, 460 178, 430 175"
          fill="none"
          stroke={strokeColor}
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...stroke(1.65, 0.7)}
        />
        <motion.path
          d="M 470 178 L 525 250"
          fill="none"
          stroke={strokeColor}
          strokeWidth="14"
          strokeLinecap="round"
          {...stroke(2.1, 0.4)}
        />

        {/* U */}
        <motion.path
          d="M 580 80 L 580 200 C 580 245, 660 255, 680 230 C 690 215, 690 100, 690 80"
          fill="none"
          stroke={strokeColor}
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...stroke(2.05, 0.7)}
        />

        {/* D */}
        <motion.path
          d="M 760 80 L 760 250 C 820 250, 880 230, 880 165 C 880 100, 820 80, 760 80 Z"
          fill="none"
          stroke={strokeColor}
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...stroke(2.45, 0.75)}
        />

        {/* A */}
        <motion.path
          d="M 940 250 L 1000 80 L 1060 250"
          fill="none"
          stroke={strokeColor}
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...stroke(2.95, 0.55)}
        />
        <motion.path
          d="M 960 195 L 1040 195"
          fill="none"
          stroke={strokeColor}
          strokeWidth="12"
          strokeLinecap="round"
          {...stroke(3.45, 0.3)}
        />

        {/* Korean seal / 印 stamp */}
        <motion.g
          initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 3.5, duration: 0.45, ease: easeBrush }}
        >
          <rect x="1090" y="170" width="46" height="46" fill="#9E1B1B" />
          <text
            x="1113"
            y="201"
            textAnchor="middle"
            fontFamily="Nanum Myeongjo, serif"
            fontSize="26"
            fill="#F9F6F0"
            fontWeight="700"
          >이</text>
        </motion.g>
      </svg>

      <motion.div
        className="mt-8 text-center px-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.6, duration: 0.9, ease: easeBrush }}
        onAnimationComplete={() => onComplete && onComplete()}
      >
        <p className="font-display italic text-2xl sm:text-3xl text-[var(--ink-soft)]">
          A wearable scroll, painted at dawn.
        </p>
        <p className="font-mono-label mt-4 text-[var(--ink-soft)]">
          이루다 — <span className="font-korean not-italic">이루다</span> · est. 二〇二六
        </p>
      </motion.div>
    </div>
  );
}
