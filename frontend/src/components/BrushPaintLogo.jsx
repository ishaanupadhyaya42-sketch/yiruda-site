import { motion } from "framer-motion";
import { wordPaths, wordViewBox } from "@/assets/logoPaths";

const INK = "#0F0E0E";
const PAD = 16;

function StrokeReveal({ idPrefix, paths, viewBox, startDelay, gap, strokeDuration, onDone }) {
  return (
    <svg
      viewBox={`0 0 ${viewBox[2]} ${viewBox[3]}`}
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {paths.map((p, i) => {
          const [minX, minY, maxX, maxY] = p.bbox;
          const delay = startDelay + i * gap;
          return (
            <clipPath id={`${idPrefix}-${i}`} key={i}>
              <motion.rect
                x={minX - PAD}
                y={minY - PAD}
                height={maxY - minY + PAD * 2}
                initial={{ width: 0 }}
                animate={{ width: maxX - minX + PAD * 2 }}
                transition={{ delay, duration: strokeDuration, ease: [0.22, 1, 0.36, 1] }}
              />
            </clipPath>
          );
        })}
      </defs>
      {paths.map((p, i) => {
        const delay = startDelay + i * gap;
        const isLast = i === paths.length - 1;
        return (
          <motion.path
            key={i}
            d={p.d}
            fill={INK}
            clipPath={`url(#${idPrefix}-${i})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay, duration: 0.05 }}
            onAnimationComplete={isLast ? onDone : undefined}
          />
        );
      })}
    </svg>
  );
}

export function strokeRevealDuration({ count, startDelay, gap, strokeDuration }) {
  return startDelay + (count - 1) * gap + strokeDuration;
}

export function WordmarkPaint({ delay = 0, gap = 0.25, strokeDuration = 0.9, onDone }) {
  return (
    <StrokeReveal
      idPrefix="word-stroke"
      paths={wordPaths}
      viewBox={wordViewBox}
      startDelay={delay}
      gap={gap}
      strokeDuration={strokeDuration}
      onDone={onDone}
    />
  );
}

export const WORD_PATH_COUNT = wordPaths.length;

export function WordmarkStatic({ className }) {
  return (
    <svg
      viewBox={`0 0 ${wordViewBox[2]} ${wordViewBox[3]}`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      {wordPaths.map((p, i) => (
        <path key={i} d={p.d} fill="currentColor" />
      ))}
    </svg>
  );
}
