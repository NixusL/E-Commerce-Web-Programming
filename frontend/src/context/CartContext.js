import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { API_BASE, getToken } from "../services/apiClient";

const CartContext = createContext(null);

// Convert backend cart -> frontend items
function mapServerCartToItems(cart) {
  const items = Array.isArray(cart?.items) ? cart.items : [];
  return items
    .filter((x) => x?.product)
    .map((x) => ({
      productId: x.product._id,
      name: x.product.name || "Unnamed product",
      price: Number(x.product.price) || 0,
      qty: Number(x.qty) || 1,
      // your schema doesn't have emoji; keep fallback for UI
      emoji: x.product.emoji || "🛒",
      image: x.product.image || "", // "/uploads/..."
    }));
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  // avoid overlapping refresh calls
  const refreshingRef = useRef(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const refreshCart = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setItems([]);
      setHydrated(true);
      return;
    }

    if (refreshingRef.current) return;
    refreshingRef.current = true;

    try {
      const res = await fetch(`${API_BASE}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setItems([]);
        setHydrated(true);
        return;
      }

      const data = await res.json();
      setItems(mapServerCartToItems(data));
      setHydrated(true);
    } catch {
      setItems([]);
      setHydrated(true);
    } finally {
      refreshingRef.current = false;
    }
  }, []);

  // Refresh on mount + when auth changes
  useEffect(() => {
    refreshCart();

    function onAuthChange() {
      refreshCart();
    }

    window.addEventListener("authchange", onAuthChange);
    window.addEventListener("storage", onAuthChange);

    return () => {
      window.removeEventListener("authchange", onAuthChange);
      window.removeEventListener("storage", onAuthChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Define cart mutation helpers inside useMemo to avoid cross-hook dependency issues

  const api = useMemo(() => {
    // Define functions here so they capture the latest refreshCart reference
    async function addToCart(product, qty = 1) {
      const token = getToken();
      if (!token) throw new Error("You must be logged in to add to cart");

      const id = product?._id || product?.id || product?.productId;
      if (!id) throw new Error("Missing product id");

      const q = Number(qty);
      const safeQty = Number.isFinite(q) && q > 0 ? q : 1;

      const res = await fetch(`${API_BASE}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: id, qty: safeQty }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Failed to add to cart");
      }

      await res.json().catch(() => null);
      await refreshCart();
    }

    async function removeFromCart(productId) {
      const token = getToken();
      if (!token) throw new Error("You must be logged in to modify cart");
      if (!productId) return;

      const res = await fetch(`${API_BASE}/api/cart/remove/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Failed to remove from cart");
      }

      await res.json().catch(() => null);
      await refreshCart();
    }

    async function setQty(productId, newQty) {
      const token = getToken();
      if (!token) throw new Error("You must be logged in to modify cart");

      const n = Number(newQty);
      if (!Number.isFinite(n)) return;

      if (n <= 0) {
        await removeFromCart(productId);
        return;
      }

      const removeRes = await fetch(`${API_BASE}/api/cart/remove/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!removeRes.ok) {
        const data = await removeRes.json().catch(() => ({}));
        throw new Error(data?.message || "Failed to update quantity");
      }

      const addRes = await fetch(`${API_BASE}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, qty: n }),
      });

      if (!addRes.ok) {
        const data = await addRes.json().catch(() => ({}));
        throw new Error(data?.message || "Failed to update quantity");
      }

      await addRes.json().catch(() => null);
      await refreshCart();
    }

    async function clearCart() {
      const token = getToken();
      if (!token) throw new Error("You must be logged in to modify cart");

      const res = await fetch(`${API_BASE}/api/cart/clear`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Failed to clear cart");
      }

      await res.json().catch(() => null);
      await refreshCart();
    }
    const cartCount = items.reduce((sum, x) => sum + (x.qty || 0), 0);
    const cartTotal = items.reduce(
      (sum, x) => sum + (x.qty || 0) * (x.price || 0),
      0
    );

    return {
      items,
      hydrated,
      refreshCart,
      addToCart,
      removeFromCart,
      setQty,
      clearCart,
      cartCount,
      cartTotal,
    };
  }, [items, hydrated, refreshCart]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
