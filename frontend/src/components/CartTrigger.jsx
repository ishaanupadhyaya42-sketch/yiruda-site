import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { CART } from "@/constants/testIds";

export default function CartTrigger() {
  const { totalQuantity, openCart } = useCart();

  return (
    <button
      type="button"
      data-testid={CART.trigger}
      aria-label="Open cart"
      onClick={openCart}
      className="relative transition-transform hover:scale-110"
    >
      <ShoppingBag className="w-5 h-5" />
      {totalQuantity > 0 && (
        <span
          className="absolute -top-2 -right-2 flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-mono-label"
          style={{ background: "var(--crimson)", color: "var(--bg)" }}
        >
          {totalQuantity}
        </span>
      )}
    </button>
  );
}
