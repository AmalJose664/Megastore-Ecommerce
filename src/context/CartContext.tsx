import React, { createContext, useContext, useReducer, useEffect, ReactNode, useRef } from "react";
import { Product } from "@/data/products";
import { useAuth } from "./AuthContext";
import { fetchCart, addToCartApi, updateCartItemApi, removeFromCartApi, clearCartApi } from "@/lib/api";
import { toast } from "sonner";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; product: Product; quantity?: number }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "LOAD_CART"; items: CartItem[] };

interface CartContextType extends CartState {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "builderio-cart";

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingIndex = state.items.findIndex(
        (item) => item.product.id === action.product.id
      );
      if (existingIndex > -1) {
        const newItems = [...state.items];
        newItems[existingIndex].quantity += action.quantity || 1;
        return { ...state, items: newItems, isOpen: true };
      }
      return {
        ...state,
        items: [...state.items, { product: action.product, quantity: action.quantity || 1 }],
        isOpen: true,
      };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.product.id !== action.productId),
      };
    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.product.id !== action.productId),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.product.id === action.productId
            ? { ...item, quantity: action.quantity }
            : item
        ),
      };
    }
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };
    case "OPEN_CART":
      return { ...state, isOpen: true };
    case "CLOSE_CART":
      return { ...state, isOpen: false };
    case "LOAD_CART":
      return { ...state, items: action.items };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  });
  const { user, isAuthenticated } = useAuth();
  const isInitialMount = useRef(true);
  const isSyncing = useRef(false);

  // Sync with Backend when Logged In
  useEffect(() => {
    if (isAuthenticated && user) {
      const syncCart = async () => {
        try {
          const res = await fetchCart();
          if (res.success && res.data) {
            // Map backend items to frontend structure
            const backendItems = res.data.items.map((item: any) => ({
              product: item.product,
              quantity: item.quantity
            }));
            dispatch({ type: "LOAD_CART", items: backendItems });
          }
        } catch (error) {
          console.error("Failed to sync cart with backend:", error);
        }
      };
      syncCart();
    } else if (!isAuthenticated && isInitialMount.current) {
      // Guest: Load from localStorage only on first mount
      try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) {
          dispatch({ type: "LOAD_CART", items: JSON.parse(saved) });
        }
      } catch (error) {
        console.error("Local load failed:", error);
      }
    }
    isInitialMount.current = false;
  }, [isAuthenticated, user]);

  // Save guest cart to localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    }
  }, [state.items, isAuthenticated]);

  const addItem = async (product: Product, quantity?: number) => {
    const q = quantity || 1;
    if (isAuthenticated) {
      try {
        const res = await addToCartApi(product.id, q);
        if (res.success) {
          const backendItems = res.data.items.map((item: any) => ({
            product: item.product,
            quantity: item.quantity
          }));
          dispatch({ type: "LOAD_CART", items: backendItems });
          dispatch({ type: "OPEN_CART" });
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to add to cart");
      }
    } else {
      dispatch({ type: "ADD_ITEM", product, quantity });
    }
  };

  const removeItem = async (productId: string) => {
    if (isAuthenticated) {
      try {
        const res = await removeFromCartApi(productId);
        if (res.success) {
          const backendItems = res.data.items.map((item: any) => ({
            product: item.product,
            quantity: item.quantity
          }));
          dispatch({ type: "LOAD_CART", items: backendItems });
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to remove item");
      }
    } else {
      dispatch({ type: "REMOVE_ITEM", productId });
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (isAuthenticated) {
      try {
        const res = await updateCartItemApi(productId, quantity);
        if (res.success) {
          const backendItems = res.data.items.map((item: any) => ({
            product: item.product,
            quantity: item.quantity
          }));
          dispatch({ type: "LOAD_CART", items: backendItems });
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to update quantity");
      }
    } else {
      dispatch({ type: "UPDATE_QUANTITY", productId, quantity });
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await clearCartApi();
        dispatch({ type: "CLEAR_CART" });
      } catch (err: any) {
        console.error("Clear cart failed:", err);
      }
    } else {
      dispatch({ type: "CLEAR_CART" });
    }
  };

  const toggleCart = () => {
    dispatch({ type: "TOGGLE_CART" });
  };

  const openCart = () => {
    dispatch({ type: "OPEN_CART" });
  };

  const closeCart = () => {
    dispatch({ type: "CLOSE_CART" });
  };

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
