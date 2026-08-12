import { motion } from "framer-motion";

const INK = "#0F0E0E";

/**
 * A rough-edged ink blot that blooms outward from the center once, used to
 * mask the cut when a product image swaps to its secret variant.
 */
export default function BrushSweep({ duration = 0.5 }) {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 pointer-events-none"
      style={{ width: "150%", height: "150%", x: "-50%", y: "-50%" }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: [0, 0.22, 0.22, 0] }}
      transition={{
        scale: { duration, ease: [0.45, 0, 0.2, 1] },
        opacity: { duration, times: [0, 0.2, 0.7, 1] },
      }}
    >
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <filter id="brush-bloom-rough" x="-40%" y="-40%" width="180%" height="180%">
            <feTurbulence baseFrequency="0.02" numOctaves="3" seed="11" />
            <feDisplacementMap in="SourceGraphic" scale="20" />
          </filter>
        </defs>
        <g filter="url(#brush-bloom-rough)">
          <circle cx="100" cy="100" r="70" fill={INK} />
        </g>
      </svg>
    </motion.div>
  );
}
