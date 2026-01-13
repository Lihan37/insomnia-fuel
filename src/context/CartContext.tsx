import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export type CartItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
};

type CartApiResponse = {
  items: CartItem[];
  subtotal: number;
};

type CartContextValue = {
  items: CartItem[];
  total: number;
  addItem: (menuItem: any) => Promise<void>;
  /** decrease quantity by 1 (remove if reaches 0) */
  removeItem: (menuItemId: string) => Promise<void>;
  /** remove the whole line, regardless of quantity */
  removeLine: (menuItemId: string) => Promise<void>;
  clear: () => Promise<void>;
  placeOrder: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const GUEST_STORAGE_KEY = "cart:guest";

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const playOrderSound = () => {
    if (typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    try {
      const ctx = new AudioCtx();
      const gain = ctx.createGain();
      gain.gain.value = 0.15;
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(660, now + 0.2);
      osc1.connect(gain);

      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1320, now);
      osc2.frequency.exponentialRampToValueAtTime(990, now + 0.2);
      osc2.connect(gain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.25);
      osc2.stop(now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc2.onended = () => {
        ctx.close().catch(() => undefined);
      };
    } catch (err) {
      console.error("Failed to play order sound:", err);
    }
  };

  // ---------- Initial load (after auth is known) ----------
  useEffect(() => {
    const hydrate = async () => {
      // Wait until Firebase auth state is known
      if (authLoading) return;

      try {
        if (user) {
          // Logged-in → get from backend
          const res = await api.get<CartApiResponse>("/api/cart");
          setItems(res.data.items || []);
        } else {
          // Guest → get from localStorage
          if (typeof window !== "undefined") {
            const raw = window.localStorage.getItem(GUEST_STORAGE_KEY);
            if (raw) {
              const parsed = JSON.parse(raw) as CartItem[];
              if (Array.isArray(parsed)) {
                setItems(parsed);
              } else {
                setItems([]);
              }
            } else {
              setItems([]);
            }
          } else {
            setItems([]);
          }
        }
      } catch (err) {
        console.error("Failed to load cart:", err);
        setItems([]);
      } finally {
        setHydrated(true);
      }
    };

    hydrate();
  }, [user?.uid, authLoading]);

  // ---------- Persist guest cart ----------
  useEffect(() => {
    if (!hydrated) return;
    if (user) return; // don’t touch localStorage for logged-in cart

    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(items));
      }
    } catch (err) {
      console.error("Failed to save guest cart:", err);
    }
  }, [items, user, hydrated]);

  // ---------- Derived total ----------
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  // ---------- Actions ----------
  const addItem = async (menuItem: any) => {
    const id = menuItem._id;
    if (!id) {
      console.error("Menu item missing _id", menuItem);
      return;
    }

    if (user) {
      // Logged-in: compute new quantity and send to backend
      const existing = items.find((i) => i.menuItemId === id);
      const newQty = (existing?.quantity ?? 0) + 1;

      try {
        const res = await api.post<CartApiResponse>("/api/cart", {
          menuItemId: id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: newQty,
        });
        setItems(res.data.items || []);
      } catch (err) {
        console.error("addItem cart error:", err);
      }
    } else {
      // Guest: local-only
      setItems((prev) => {
        const existing = prev.find((i) => i.menuItemId === id);
        if (existing) {
          return prev.map((i) =>
            i.menuItemId === id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [
          ...prev,
          {
            menuItemId: id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1,
          },
        ];
      });
    }
  };

  const removeItem = async (menuItemId: string) => {
    if (user) {
      const existing = items.find((i) => i.menuItemId === menuItemId);
      if (!existing) return;

      const newQty = existing.quantity - 1;

      try {
        let res;
        if (newQty <= 0) {
          res = await api.delete<CartApiResponse>(`/api/cart/${menuItemId}`);
        } else {
          res = await api.post<CartApiResponse>("/api/cart", {
            menuItemId,
            name: existing.name,
            price: existing.price,
            quantity: newQty,
          });
        }
        setItems(res.data.items || []);
      } catch (err) {
        console.error("removeItem cart error:", err);
      }
    } else {
      // Guest
      setItems((prev) =>
        prev
          .map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity: i.quantity - 1 } : i
          )
          .filter((i) => i.quantity > 0)
      );
    }
  };

  const removeLine = async (menuItemId: string) => {
    if (user) {
      try {
        const res = await api.delete<CartApiResponse>(
          `/api/cart/${menuItemId}`
        );
        setItems(res.data.items || []);
      } catch (err) {
        console.error("removeLine cart error:", err);
      }
    } else {
      setItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
    }
  };

  const clear = async () => {
    if (user) {
      try {
        const res = await api.delete<CartApiResponse>("/api/cart");
        setItems(res.data.items || []);
      } catch (err) {
        console.error("clear cart error:", err);
      }
    } else {
      setItems([]);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(GUEST_STORAGE_KEY);
      }
    }
  };

  // CartContext.tsx – inside CartProvider

  const placeOrder = async () => {
    if (!user) {
      alert("Please sign in to place an order.");
      return;
    }
    if (items.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    try {
      const res = await api.post<{
        orderId?: string;
        order?: { _id?: string };
      }>("/api/orders", {
        items,
      });
      const orderId = res.data?.order?._id ?? res.data?.orderId ?? null;

      try {
        await api.delete<CartApiResponse>("/api/cart");
      } catch (err) {
        console.error("Failed to clear cart after order:", err);
      }

      setItems([]);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(GUEST_STORAGE_KEY);
      }

      playOrderSound();
      const target = orderId
        ? `/order/placed?orderId=${encodeURIComponent(orderId)}`
        : "/order/placed";
      setTimeout(() => {
        window.location.href = target;
      }, 200);
    } catch (err) {
      console.error("Error placing order", err);
      alert("Failed to place your order. Please try again.");
    }
  };

  const value: CartContextValue = {
    items,
    total,
    addItem,
    removeItem,
    removeLine,
    clear,
    placeOrder,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
