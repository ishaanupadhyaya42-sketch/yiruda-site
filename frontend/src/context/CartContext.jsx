import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addCartLines,
  createCart,
  getCart,
  isShopifyConfigured,
  removeCartLines,
  updateCartLines,
} from "@/lib/shopify";

const CART_ID_KEY = "yiruda_shopify_cart_id";
const LOCAL_CART_KEY = "yiruda_local_cart";
const CartContext = createContext(null);

function readLocalCart() {
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const configured = isShopifyConfigured();
  const queryClient = useQueryClient();
  const [cartId, setCartId] = useState(() => localStorage.getItem(CART_ID_KEY));
  const [isOpen, setIsOpen] = useState(false);

  // Local, browser-only cart used until a real Shopify store is wired up —
  // same shape/interface as the Shopify-backed cart below so callers don't care which is active.
  const [localLines, setLocalLines] = useState(() => (configured ? [] : readLocalCart()));
  useEffect(() => {
    if (!configured) localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(localLines));
  }, [configured, localLines]);

  const cartQuery = useQuery({
    queryKey: ["shopify-cart", cartId],
    queryFn: () => getCart(cartId),
    enabled: Boolean(cartId) && configured,
  });

  useEffect(() => {
    if (configured && cartQuery.data === null && cartId) {
      localStorage.removeItem(CART_ID_KEY);
      setCartId(null);
    }
  }, [configured, cartQuery.data, cartId]);

  const persistCart = useCallback(
    (cart) => {
      localStorage.setItem(CART_ID_KEY, cart.id);
      setCartId(cart.id);
      queryClient.setQueryData(["shopify-cart", cart.id], cart);
    },
    [queryClient]
  );

  const shopifyAddItem = useMutation({
    mutationFn: async ({ merchandiseId, quantity = 1 }) => {
      if (!cartId) return createCart([{ merchandiseId, quantity }]);
      return addCartLines(cartId, [{ merchandiseId, quantity }]);
    },
    onSuccess: (cart) => {
      persistCart(cart);
      setIsOpen(true);
    },
    onError: () => toast.error("couldn't add that to your cart"),
  });

  const shopifyUpdateItem = useMutation({
    mutationFn: ({ lineId, quantity }) => updateCartLines(cartId, [{ id: lineId, quantity }]),
    onSuccess: (cart) => persistCart(cart),
    onError: () => toast.error("couldn't update your cart"),
  });

  const shopifyRemoveItem = useMutation({
    mutationFn: (lineId) => removeCartLines(cartId, [lineId]),
    onSuccess: (cart) => persistCart(cart),
    onError: () => toast.error("couldn't update your cart"),
  });

  const addLocalItem = useCallback((line) => {
    setLocalLines((lines) => {
      const existing = lines.find((l) => l.id === line.id);
      if (existing) {
        return lines.map((l) =>
          l.id === line.id ? { ...l, quantity: l.quantity + (line.quantity || 1) } : l
        );
      }
      return [...lines, { ...line, quantity: line.quantity || 1 }];
    });
    setIsOpen(true);
  }, []);

  const updateLocalItem = useCallback(({ lineId, quantity }) => {
    setLocalLines((lines) => lines.map((l) => (l.id === lineId ? { ...l, quantity } : l)));
  }, []);

  const removeLocalItem = useCallback((lineId) => {
    setLocalLines((lines) => lines.filter((l) => l.id !== lineId));
  }, []);

  const localCart = useMemo(() => {
    const totalQuantity = localLines.reduce((sum, l) => sum + l.quantity, 0);
    const totalAmount = localLines.reduce(
      (sum, l) => sum + Number(l.price?.amount || 0) * l.quantity,
      0
    );
    return {
      lines: localLines,
      totalQuantity,
      cost: { totalAmount: { amount: totalAmount.toFixed(2), currencyCode: "USD" } },
    };
  }, [localLines]);

  const checkout = useCallback(() => {
    if (configured) {
      const url = cartQuery.data?.checkoutUrl;
      if (url) window.location.href = url;
      return;
    }
    toast.info("Checkout is launching soon — hang tight.");
  }, [configured, cartQuery.data]);

  const value = useMemo(
    () => ({
      configured,
      cart: configured ? cartQuery.data || null : localCart,
      isLoading: configured ? cartQuery.isLoading : false,
      totalQuantity: configured ? cartQuery.data?.totalQuantity ?? 0 : localCart.totalQuantity,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem: configured ? shopifyAddItem.mutate : addLocalItem,
      isAdding: configured ? shopifyAddItem.isPending : false,
      updateItem: configured ? shopifyUpdateItem.mutate : updateLocalItem,
      removeItem: configured ? shopifyRemoveItem.mutate : removeLocalItem,
      checkout,
    }),
    [
      configured,
      cartQuery.data,
      cartQuery.isLoading,
      isOpen,
      localCart,
      shopifyAddItem.mutate,
      shopifyAddItem.isPending,
      addLocalItem,
      shopifyUpdateItem.mutate,
      updateLocalItem,
      shopifyRemoveItem.mutate,
      removeLocalItem,
      checkout,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
