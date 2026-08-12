import { memo, useEffect, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import BrushSweep from "@/components/BrushSweep";
import GinkgoLeaves from "@/components/GinkgoLeaves";
import { useCart } from "@/context/CartContext";

const BACKEND_ORIGIN = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_ORIGIN}/api`;

const SECRET_INTERVAL_MS = 10800;
const WIPE_DURATION = 0.9;
const HOLD_DURATION = 0.5;
const FADE_DURATION = 0.6;

function resolveAsset(path) {
  if (!path) return path;
  return /^https?:\/\//.test(path) ? path : `${BACKEND_ORIGIN}${path}`;
}

function ProductDetail({ product, onClose }) {
  const { addItem, isAdding } = useCart();
  const sizes = product.sizes || [];
  const colors = product.colors || [];
  const [selectedSize, setSelectedSize] = useState(sizes[0] || null);
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name || null);

  const handleAddToCart = () => {
    const amount = String(product.price || "").replace(/[^0-9.]/g, "");
    addItem({
      id: `${product.id}-${selectedSize || "onesize"}-${selectedColor || "default"}`,
      merchandiseId: product.id,
      title: product.name,
      image: resolveAsset(product.image),
      price: { amount, currencyCode: "USD" },
      quantity: 1,
    });
  };

  return (
    <motion.div
      data-testid={`product-detail-${product.id}`}
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 32 }}
      transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
      className="flex flex-col gap-6 w-full max-w-sm pt-2"
    >
      <div>
        <h2 className="font-display text-3xl sm:text-4xl" style={{ color: "var(--ink)" }}>
          {product.name}
        </h2>
        <p className="font-mono-label mt-3" style={{ color: "var(--crimson)" }}>
          {product.price}
        </p>
      </div>

      <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        {product.description}
      </p>

      {colors.length > 0 && (
        <div className="flex gap-3">
          {colors.map((c) => (
            <button
              key={c.name}
              type="button"
              aria-label={c.name}
              data-testid={`color-swatch-${c.name}`}
              onClick={() => setSelectedColor(c.name)}
              className="w-7 h-7 rounded-full transition-transform hover:scale-110"
              style={{
                background: c.hex,
                outline: selectedColor === c.name ? "2px solid var(--ink)" : "1px solid var(--border-ink)",
                outlineOffset: "2px",
              }}
            />
          ))}
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <span className="font-mono-label opacity-60 block mb-2">Size</span>
          <div className="flex gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                data-testid={`size-option-${s}`}
                onClick={() => setSelectedSize(s)}
                className="font-mono-label w-11 h-11 border transition-colors"
                style={
                  selectedSize === s
                    ? { background: "var(--ink)", color: "var(--bg)", borderColor: "var(--ink)" }
                    : { borderColor: "var(--border-ink)", color: "var(--ink)" }
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        data-testid={`add-to-cart-${product.id}`}
        onClick={handleAddToCart}
        disabled={isAdding}
        className="btn-ink btn-ink-crimson mt-2 self-start disabled:opacity-50"
      >
        {isAdding ? "Adding…" : "Add to Cart"}
      </button>

      <button
        type="button"
        onClick={onClose}
        data-testid={`close-detail-${product.id}`}
        className="font-mono-label opacity-50 hover:opacity-100 transition-opacity self-start"
      >
        ← Back
      </button>
    </motion.div>
  );
}

const DropEntry = memo(function DropEntry({ product }) {
  const [cycleKey, setCycleKey] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!product.has_secret_variant) return;
    const interval = setInterval(() => {
      setCycleKey((k) => k + 1);
    }, SECRET_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [product.has_secret_variant]);

  return (
    <div data-testid={`product-${product.id}`} className="flex justify-center">
      <motion.div
        layout
        onClick={() => setExpanded((e) => !e)}
        className={`relative aspect-[4/5] group cursor-pointer select-none ${
          expanded ? "w-64 sm:w-80" : "w-72 sm:w-96 md:w-[28rem]"
        }`}
        transition={{ layout: { duration: 0.7, ease: [0.25, 1, 0.5, 1] } }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={resolveAsset(product.image)}
            alt={product.name}
            data-testid={`product-image-${product.id}`}
            loading="eager"
            draggable={false}
            className="absolute inset-0 w-full h-full object-contain mix-blend-multiply transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
          />
          {product.has_secret_variant && product.secret_image && cycleKey > 0 && (
            <motion.div
              key={cycleKey}
              data-testid={`product-secret-${product.id}`}
              className="absolute inset-0"
              style={{ isolation: "isolate" }}
              initial={{ clipPath: "circle(0% at 50% 50%)", opacity: 1 }}
              animate={{ clipPath: "circle(78% at 50% 50%)", opacity: 0 }}
              transition={{
                clipPath: { duration: WIPE_DURATION, ease: [0.45, 0, 0.2, 1] },
                opacity: { delay: WIPE_DURATION + HOLD_DURATION, duration: FADE_DURATION, ease: "easeInOut" },
              }}
            >
              {/* opaque backing so the secret image's multiply-blend mixes with the
                  page colour, not with the tee photo underneath it */}
              <div className="absolute inset-0" style={{ background: "var(--bg)" }} />
              <img
                src={resolveAsset(product.secret_image)}
                alt=""
                className="absolute inset-0 w-full h-full object-contain mix-blend-multiply"
              />
            </motion.div>
          )}
          {product.has_secret_variant && cycleKey > 0 && (
            <BrushSweep key={`sweep-${cycleKey}`} duration={WIPE_DURATION} />
          )}
          {!expanded && (
            <div
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                WebkitMaskImage: `url(${resolveAsset(product.image)})`,
                maskImage: `url(${resolveAsset(product.image)})`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-black/55" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col gap-4 -rotate-12" style={{ width: "170%" }}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <span
                      key={i}
                      className="block text-center font-bold uppercase tracking-tight text-3xl sm:text-4xl whitespace-nowrap"
                      style={{ color: "var(--bg)", fontFamily: "Outfit, sans-serif" }}
                    >
                      VIEW DETAILS &nbsp;&nbsp; VIEW DETAILS &nbsp;&nbsp; VIEW DETAILS
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <AnimatePresence>
          {expanded && (
            <div
              className="absolute top-0 left-full ml-10 sm:ml-16 w-[85vw] max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <ProductDetail product={product} onClose={() => setExpanded(false)} />
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
});

export default function Drops() {
  const { data: drops = [] } = useQuery({
    queryKey: ["drops"],
    queryFn: () => axios.get(`${API}/drops`).then((r) => r.data.drops || []),
  });

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center gap-10 sm:gap-16 px-6 fade-up"
      data-testid="drops-page"
      style={{ background: "var(--bg)" }}
    >
      <GinkgoLeaves />

      <div className="relative flex flex-wrap justify-center items-center gap-10 sm:gap-16 md:gap-24" style={{ zIndex: 2 }}>
        {drops.map((p) => (
          <DropEntry product={p} key={p.id} />
        ))}
      </div>
    </main>
  );
}
