// cart context — client-side only, totals derived from book.price (GST shown separately)
import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export const GST_RATE = 0.1; // 10% Australian GST, shown as an informational line

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  // merges with an existing line if the book is already in the cart; stock validated by caller
  const addItem = (book, quantity) => {
    setItems((prev) => {
      const existing = prev.find((entry) => entry.book.id === book.id);
      if (existing) {
        return prev.map((entry) =>
          entry.book.id === book.id
            ? { ...entry, quantity: entry.quantity + quantity }
            : entry
        );
      }
      return [...prev, { book, quantity }];
    });
  };

  const setQuantity = (bookId, quantity) => {
    setItems((prev) =>
      prev.map((entry) =>
        entry.book.id === bookId ? { ...entry, quantity } : entry
      )
    );
  };

  const removeItem = (bookId) => {
    setItems((prev) => prev.filter((entry) => entry.book.id !== bookId));
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce(
    (sum, entry) => sum + entry.book.price * entry.quantity,
    0
  );
  const gst = subtotal * GST_RATE;
  const total = subtotal + gst;
  const count = items.reduce((sum, entry) => sum + entry.quantity, 0);

  const value = {
    items,
    addItem,
    setQuantity,
    removeItem,
    clearCart,
    subtotal,
    gst,
    total,
    count,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
