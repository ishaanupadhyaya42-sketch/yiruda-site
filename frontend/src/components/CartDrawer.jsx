import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { CART } from "@/constants/testIds";
import { formatMoney } from "@/lib/utils";

function CartLine({ line }) {
  const { updateItem, removeItem } = useCart();

  return (
    <div
      data-testid={CART.lineItem}
      className="flex items-center gap-4 py-4"
      style={{ borderBottom: "1px solid var(--border-ink)" }}
    >
      {line.image && (
        <img src={line.image} alt={line.title} className="w-16 h-16 object-contain mix-blend-multiply" />
      )}
      <div className="flex-1">
        <p className="font-mono-label text-sm" style={{ color: "var(--ink)" }}>
          {line.title}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>
          {formatMoney(line.price)}
        </p>
      </div>
      <input
        type="number"
        min={1}
        value={line.quantity}
        data-testid={CART.quantityInput}
        onChange={(e) =>
          updateItem({ lineId: line.id, quantity: Math.max(1, Number(e.target.value) || 1) })
        }
        className="paper-input w-14 text-center"
      />
      <button
        type="button"
        data-testid={CART.removeButton}
        onClick={() => removeItem(line.id)}
        className="font-mono-label text-xs opacity-60 hover:opacity-100"
        style={{ color: "var(--crimson)" }}
      >
        remove
      </button>
    </div>
  );
}

export default function CartDrawer() {
  const { cart, isOpen, closeCart, checkout } = useCart();
  const lines = cart?.lines || [];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        data-testid={CART.drawer}
        style={{ background: "var(--bg)", color: "var(--ink)", borderLeft: "1px solid var(--border-ink)" }}
      >
        <SheetHeader>
          <SheetTitle className="font-mono-label" style={{ color: "var(--ink)" }}>
            Cart
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 flex-1 overflow-y-auto">
          {lines.length === 0 ? (
            <p data-testid={CART.emptyState} className="font-mono-label text-sm opacity-60 mt-10 text-center">
              your cart is empty
            </p>
          ) : (
            lines.map((line) => <CartLine key={line.id} line={line} />)
          )}
        </div>

        {lines.length > 0 && (
          <SheetFooter className="mt-6 flex-col gap-3 sm:flex-col">
            <div className="flex items-center justify-between w-full">
              <span className="font-mono-label text-sm">subtotal</span>
              <span className="font-mono-label text-sm">{formatMoney(cart?.cost?.totalAmount)}</span>
            </div>
            <button
              type="button"
              data-testid={CART.checkoutButton}
              onClick={checkout}
              className="btn-ink w-full"
            >
              checkout
            </button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
