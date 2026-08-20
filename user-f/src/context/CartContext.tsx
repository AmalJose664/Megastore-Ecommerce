import React, { createContext, useContext, useReducer, useEffect, ReactNode, useRef } from "react";
import { Product } from "@/data/products";
import { useAuth } from "./AuthContext";
import { fetchCart, addToCartApi, updateCartItemApi, removeFromCartApi, clearCartApi, mergeCartApi } from "@/lib/api";
import { toast } from "sonner";

export interface CartItem {
  product: Product;
  variantId?: string;
  selectedVariant?: any;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; product: Product; quantity?: number; variantId?: string; selectedVariant?: any }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "LOAD_CART"; items: CartItem[] };

interface CartContextType extends CartState {
  addItem: (product: Product, quantity?: number, variantId?: string) => void;
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
        (item) =>
          (item.product.id || (item.product as any)._id) === (action.product.id || (action.product as any)._id) &&
          (action.variantId ? item.variantId === action.variantId : !item.variantId)
      );
      if (existingIndex > -1) {
        const newItems = [...state.items];
        newItems[existingIndex].quantity += action.quantity || 1;
        return { ...state, items: newItems, isOpen: true };
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            product: action.product,
            quantity: action.quantity || 1,
            variantId: action.variantId,
            selectedVariant: action.selectedVariant,
          },
        ],
        isOpen: true,
      };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(
          (item) => (item.product.id || (item.product as any)._id) !== action.productId
        ),
      };
    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (item) => (item.product.id || (item.product as any)._id) !== action.productId
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          (item.product.id || (item.product as any)._id) === action.productId
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

const mapBackendItems = (items: any[]): CartItem[] => {
  return (items || []).map((item: any) => ({
    product: item.product,
    variantId: item.variantId,
    selectedVariant: item.selectedVariant,
    quantity: item.quantity,
  }));
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  });
  const { user, isAuthenticated } = useAuth();
  const isInitialMount = useRef(true);

  // Sync with Backend when Logged In (including merging guest cart from localStorage)
  useEffect(() => {
    if (isAuthenticated && user) {
      const syncCartWithBackend = async () => {
        try {
          const savedGuestCart = localStorage.getItem(CART_STORAGE_KEY);
          let guestItems: any[] = [];
          if (savedGuestCart) {
            try {
              guestItems = JSON.parse(savedGuestCart);
            } catch {
              guestItems = [];
            }
          }

          let res;
          if (Array.isArray(guestItems) && guestItems.length > 0) {
            // Merge guest items into user cart on backend
            const itemsToMerge = guestItems.map((item: any) => ({
              productId: item.product.id || item.product._id,
              quantity: item.quantity,
            }));
            res = await mergeCartApi(itemsToMerge);
            // Clear guest cart from localStorage after successful merge
            localStorage.removeItem(CART_STORAGE_KEY);
            toast.success("Guest cart merged with your account!");
          } else {
            // No guest cart to merge, just fetch user cart
            res = await fetchCart();
          }

          if (res && res.success && res.data) {
            dispatch({ type: "LOAD_CART", items: mapBackendItems(res.data.items) });
          }
        } catch (error) {
          console.error("Failed to sync cart with backend:", error);
        }
      };
      syncCartWithBackend();
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

  const addItem = async (product: Product, quantity?: number, variantId?: string) => {
    const q = quantity || 1;
    const prodId = product.id || (product as any)._id;
    if (isAuthenticated) {
      try {
        const res = await addToCartApi(prodId, q, variantId);
        if (res.success) {
          dispatch({ type: "LOAD_CART", items: mapBackendItems(res.data.items) });
          dispatch({ type: "OPEN_CART" });
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to add to cart");
      }
    } else {
      let selectedVariant: any = undefined;
      if (variantId && (product as any).hasVariants && Array.isArray((product as any).variants)) {
        selectedVariant = (product as any).variants.find((v: any) => (v._id || v.id)?.toString() === variantId);
      }
      dispatch({ type: "ADD_ITEM", product, quantity, variantId, selectedVariant });
    }
  };

  const removeItem = async (productId: string) => {
    if (isAuthenticated) {
      try {
        const res = await removeFromCartApi(productId);
        if (res.success) {
          dispatch({ type: "LOAD_CART", items: mapBackendItems(res.data.items) });
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
          dispatch({ type: "LOAD_CART", items: mapBackendItems(res.data.items) });
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
    (sum, item) => sum + (item.selectedVariant?.price || item.product?.price || 0) * item.quantity,
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
