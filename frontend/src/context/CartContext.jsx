import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);
const STORAGE_KEY = 'itrafume_cart';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product, variant, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === product._id && i.variantId === variant._id
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(updated[existingIndex].quantity + quantity, variant.stock);
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        return updated;
      }
      return [
        ...prev,
        {
          productId: product._id,
          slug: product.slug,
          variantId: variant._id,
          name: product.name,
          size: variant.size,
          price: variant.price,
          image: product.media?.find((m) => m.type === 'image')?.url || '',
          quantity: Math.min(quantity, variant.stock),
          maxStock: variant.stock,
        },
      ];
    });
    toast.success(`${product.name} (${variant.size}) added to cart`);
  };

  const updateQuantity = (productId, variantId, quantity) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.variantId === variantId
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
          : i
      )
    );
  };

  const removeFromCart = (productId, variantId) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.variantId === variantId)));
  };

  const clearCart = () => setItems([]);

  const { subtotal, totalQuantity } = useMemo(() => {
    return items.reduce(
      (acc, i) => ({
        subtotal: acc.subtotal + i.price * i.quantity,
        totalQuantity: acc.totalQuantity + i.quantity,
      }),
      { subtotal: 0, totalQuantity: 0 }
    );
  }, [items]);

  return (
    <CartContext.Provider
      value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, subtotal, totalQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
