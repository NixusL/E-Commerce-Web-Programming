import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const CartContext = createContext(null);

function loadCart() {
  try {
    const raw = localStorage.getItem("cart");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  try {
    localStorage.setItem("cart", JSON.stringify(items));
  } catch {
    // ignore
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const { item, qty } = action.payload;
      const existing = state.find((x) => x.productId === item.productId);
      if (existing) {
        return state.map((x) =>
          x.productId === item.productId ? { ...x, qty: x.qty + qty } : x
        );
      }
      return [...state, { ...item, qty }];
    }

    case "ADD_RAW": {
      const raw = action.payload.item; // includes qty already
      const existing = state.find((x) => x.productId === raw.productId);
      if (existing) {
        // if it already exists, just set to existing + raw.qty
        return state.map((x) =>
          x.productId === raw.productId ? { ...x, qty: x.qty + (raw.qty || 0) } : x
        );
      }
      return [...state, raw];
    }

    case "REMOVE":
      return state.filter((x) => x.productId !== action.payload.productId);

    case "SET_QTY": {
      const { productId, qty } = action.payload;
      const q = Number(qty);
      if (!Number.isFinite(q)) return state;
      if (q <= 0) return state.filter((x) => x.productId !== productId);
      return state.map((x) => (x.productId === productId ? { ...x, qty: q } : x));
    }

    case "CLEAR":
      return [];

    case "REPLACE":
      return Array.isArray(action.payload.items) ? action.payload.items : state;

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const api = useMemo(() => {
    const addToCart = (product, qty = 1) => {
      const id = product?._id || product?.id;
      if (!id) throw new Error("Missing product id");

      const q = Number(qty);
      const safeQty = Number.isFinite(q) && q > 0 ? q : 1;

      const item = {
        productId: id,
        name: product?.name || "Unnamed product",
        price: Number(product?.price) || 0,
        emoji: product?.emoji || "🛒",
        imageUrl: product?.imageUrl || product?.image || "",
      };

      dispatch({ type: "ADD", payload: { item, qty: safeQty } });
    };

    const addRawItem = (rawItem) => {
      // rawItem must have {productId, name, price, emoji, imageUrl, qty}
      if (!rawItem?.productId) return;
      const safe = {
        productId: rawItem.productId,
        name: rawItem.name || "Unnamed product",
        price: Number(rawItem.price) || 0,
        emoji: rawItem.emoji || "🛒",
        imageUrl: rawItem.imageUrl || "",
        qty: Number(rawItem.qty) > 0 ? Number(rawItem.qty) : 1,
      };
      dispatch({ type: "ADD_RAW", payload: { item: safe } });
    };

    const removeFromCart = (productId) => {
      dispatch({ type: "REMOVE", payload: { productId } });
    };

    const setQty = (productId, qty) => {
      dispatch({ type: "SET_QTY", payload: { productId, qty } });
    };

    const clearCart = () => dispatch({ type: "CLEAR" });

    const replaceCart = (newItems) => {
      dispatch({ type: "REPLACE", payload: { items: newItems } });
    };

    const cartCount = items.reduce((sum, x) => sum + (x.qty || 0), 0);
    const cartTotal = items.reduce(
      (sum, x) => sum + (x.qty || 0) * (x.price || 0),
      0
    );

    return {
      items,
      addToCart,
      addRawItem,
      removeFromCart,
      setQty,
      clearCart,
      replaceCart,
      cartCount,
      cartTotal,
    };
  }, [items]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
