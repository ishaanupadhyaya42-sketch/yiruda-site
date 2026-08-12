import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import goldLeaf from "@/assets/ginkgo-leaf-gold.png";
import paleLeaf from "@/assets/ginkgo-leaf-pale.png";
import amberLeaf from "@/assets/ginkgo-leaf-amber.png";
import oliveLeaf from "@/assets/ginkgo-leaf-olive.png";
import bronzeLeaf from "@/assets/ginkgo-leaf-bronze.png";

const LEAF_ASPECT = 304 / 250; // height / width of the source clip

// A handful of leaves scattered as an asymmetric backdrop — each one keeps
// playing its own boomerang clip (color fill -> ink outline -> back),
// just not moving across the screen.
const LEAVES = [
  { id: 0, x: -6, y: 55, size: 380, rot: -12, flip: false, delay: 0,   src: goldLeaf },
  { id: 1, x: 78, y: 2,  size: 170, rot: 25,  flip: true,  delay: 1.8, src: oliveLeaf },
  { id: 2, x: 90, y: 55, size: 260, rot: -20, flip: false, delay: 3.4, src: amberLeaf },
  { id: 3, x: 34, y: -8, size: 120, rot: 8,   flip: true,  delay: 0.9, src: paleLeaf },
  { id: 4, x: 55, y: 78, size: 190, rot: 15,  flip: false, delay: 2.6, src: bronzeLeaf },
];

const GinkgoLeaf = memo(function GinkgoLeaf({ leaf }) {
  const height = leaf.size * LEAF_ASPECT;

  // Mount the clip on its own delay so every leaf's boomerang loop
  // starts out of phase with the others instead of all ticking in sync.
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), leaf.delay * 1000);
    return () => clearTimeout(t);
  }, [leaf.delay]);

  return (
    <div
      style={{
        position: "absolute",
        left: `${leaf.x}%`,
        top: `${leaf.y}%`,
        width: leaf.size,
        height,
        pointerEvents: "none",
        transform: `rotate(${leaf.rot}deg) scaleX(${leaf.flip ? -1 : 1})`,
      }}
    >
      {started && (
        <motion.img
          src={leaf.src}
          alt=""
          width="100%"
          height="100%"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.68 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          style={{ display: "block", filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.08))" }}
        />
      )}
    </div>
  );
});

export default function GinkgoLeaves() {
  return (
    <div
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 1 }}
    >
      {LEAVES.map((leaf) => (
        <GinkgoLeaf key={leaf.id} leaf={leaf} />
      ))}
    </div>
  );
}
