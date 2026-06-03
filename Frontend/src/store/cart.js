//=============================================================================
// SWE30003 - Bookstore Web Frontend: Cart State Module
// Reference Coding Standard: Google JavaScript Style Guide (ES6 Modules)
//=============================================================================

/** Shared mutable cart state — module-level singleton array. */
export const cart = [];

/**
 * Adds a book to the cart or increments its quantity if already present.
 * @param {number} bookId
 * @param {number} quantity
 * @param {Array} books - The BOOKS catalogue array to look up from.
 */
export function addToCart(bookId, quantity, books) {
  const book = books.find((b) => b.id === bookId);
  if (!book) return;

  const existing = cart.find((entry) => entry.book.id === bookId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ book, quantity });
  }
}

/**
 * Removes a cart entry by book ID.
 * @param {number} bookId
 */
export function removeFromCart(bookId) {
  const idx = cart.findIndex((entry) => entry.book.id === bookId);
  if (idx !== -1) cart.splice(idx, 1);
}

/** Empties the cart. */
export function clearCart() {
  cart.splice(0, cart.length);
}

/**
 * Returns the subtotal (before GST) for the given cart array.
 * @param {Array} cartArray
 * @returns {number}
 */
export function getCartTotal(cartArray) {
  return cartArray.reduce((sum, entry) => sum + entry.book.pricePerCopy * entry.quantity, 0);
}
