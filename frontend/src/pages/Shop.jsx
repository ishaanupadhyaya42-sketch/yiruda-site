import { useQuery } from "@tanstack/react-query";
import { getProducts, isShopifyConfigured } from "@/lib/shopify";
import { useCart } from "@/context/CartContext";
import { SHOP } from "@/constants/testIds";

function formatMoney({ amount, currencyCode } = {}) {
  if (!amount) return "";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode || "USD" }).format(
    Number(amount)
  );
}

function ShopProductCard({ product }) {
  const { addItem, isAdding } = useCart();
  const firstAvailable = product.variants.find((v) => v.availableForSale) || product.variants[0];

  return (
    <div
      data-testid={SHOP.productCard}
      className="flex flex-col items-center gap-4 w-44 sm:w-56 md:w-64"
    >
      <div className="relative w-full aspect-[4/5]">
        {product.image && (
          <img
            src={product.image}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-contain mix-blend-multiply"
          />
        )}
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="font-mono-label text-sm" style={{ color: "var(--ink)" }}>
          {product.title}
        </p>
        <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
          {formatMoney(product.price)}
        </p>
      </div>
      <button
        type="button"
        data-testid={SHOP.addToCartButton}
        disabled={!firstAvailable?.availableForSale || isAdding}
        onClick={() => addItem({ merchandiseId: firstAvailable.id, quantity: 1 })}
        className="btn-ink"
      >
        {firstAvailable?.availableForSale ? "add to cart" : "sold out"}
      </button>
    </div>
  );
}

export default function Shop() {
  const configured = isShopifyConfigured();

  const { data: products = [] } = useQuery({
    queryKey: ["shopify-products"],
    queryFn: () => getProducts(),
    enabled: configured,
  });

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center gap-10 sm:gap-16 px-6 fade-up"
      data-testid={SHOP.page}
      style={{ background: "var(--bg)" }}
    >
      <span className="font-mono-label text-[var(--ink-soft)] opacity-70">Shop</span>

      {!configured ? (
        <p
          data-testid={SHOP.notConfiguredState}
          className="font-mono-label text-sm opacity-60 text-center max-w-xs"
        >
          shop coming soon
        </p>
      ) : (
        <div className="flex flex-wrap justify-center items-center gap-10 sm:gap-16 md:gap-24">
          {products.map((product) => (
            <ShopProductCard product={product} key={product.id} />
          ))}
        </div>
      )}
    </main>
  );
}
