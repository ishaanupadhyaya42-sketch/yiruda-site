import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { WordmarkPaint, strokeRevealDuration, WORD_PATH_COUNT } from "@/components/BrushPaintLogo";

const WORD_TIMING = { count: WORD_PATH_COUNT, startDelay: 0, gap: 0.25, strokeDuration: 0.9 };
const REVEAL_COMPLETE_AT = strokeRevealDuration(WORD_TIMING) + 0.9;

/**
 * Opening sequence: the YIRUDA wordmark is painted in stroke-by-stroke, left
 * to right, following the order the brush actually laid down ink.
 */
function Opening({ onComplete }) {
  return (
    <div
      className="relative w-full max-w-[680px] mx-auto"
      data-testid="brush-opening"
    >
      <WordmarkPaint delay={WORD_TIMING.startDelay} />

      {/* completion trigger (invisible) */}
      <motion.div
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ delay: REVEAL_COMPLETE_AT, duration: 0.01 }}
        onAnimationComplete={() => onComplete && onComplete()}
      />
    </div>
  );
}

export default function Landing() {
  const [revealComplete, setRevealComplete] = useState(false);
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" || e.key === "Enter") setSkip(true);
    };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => setRevealComplete(true), 3300);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, []);

  const showCta = revealComplete || skip;

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      data-testid="landing-page"
      onClick={() => {
        if (!revealComplete && !skip) setSkip(true);
      }}
      style={{ cursor: !revealComplete && !skip ? "pointer" : "default" }}
    >
      <div className="w-full flex flex-col items-center gap-10">
        <Opening onComplete={() => setRevealComplete(true)} />

        {showCta && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="flex justify-center"
          >
            <Link to="/drops" data-testid="view-drops-cta" className="btn-ink">
              View Drops
            </Link>
          </motion.div>
        )}
      </div>
    </main>
  );
}
