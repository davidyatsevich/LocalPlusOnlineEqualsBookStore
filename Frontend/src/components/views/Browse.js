//=============================================================================
// SWE30003 - Bookstore Web Frontend: Browse Catalogue View
// Reference Coding Standard: Google JavaScript Style Guide (ES6 Modules)
//=============================================================================

import { BOOKS } from '../../store/books.js';

export function renderBrowse() {
  const rows = BOOKS.map((book) => `
    <tr>
      <td>${book.id}</td>
      <td class="col-author">${book.author}</td>
      <td>${book.title}</td>
      <td>$${book.pricePerCopy.toFixed(2)}</td>
      <td>${book.copiesInStock}</td>
      <td>
        <input
          type="number"
          class="qty-input"
          id="qty-${book.id}"
          value="1"
          min="1"
          max="${book.copiesInStock}"
          aria-label="Quantity for ${book.title}"
        />
      </td>
      <td>
        <button
          class="btn-primary add-to-cart-btn"
          data-book-id="${book.id}"
          aria-label="Add ${book.title} to cart"
        >Add to Cart</button>
        <span class="inline-success" id="success-${book.id}" aria-live="polite"></span>
      </td>
    </tr>
  `).join('');

  return `
    <div class="view-content animate-fade">
      <h2>Browse Our Collection</h2>
      <p>Select a quantity and add books to your cart. Stock levels are shown in the table.</p>
      <div class="table-wrapper">
        <table class="cart-table browse-table">
          <thead>
            <tr>
              <th>ID</th>
              <th class="col-author">Author</th>
              <th>Title</th>
              <th>Price (ea)</th>
              <th>In Stock</th>
              <th>Qty</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * Wires up Add-to-Cart click handlers after Browse is rendered into the DOM.
 * @param {Array} cartRef - Reference to the shared cart array.
 * @param {Function} addToCartFn - addToCart(bookId, qty, books)
 * @param {Function} updateCountFn - Callback to update the cart count badge.
 */
export function setupBrowseListeners(cartRef, addToCartFn, updateCountFn) {
  document.querySelectorAll('.add-to-cart-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const bookId = Number(btn.dataset.bookId);
      const book = BOOKS.find((b) => b.id === bookId);
      if (!book) return;

      const qtyInput = document.getElementById(`qty-${bookId}`);
      const qty = parseInt(qtyInput.value, 10);
      const successEl = document.getElementById(`success-${bookId}`);

      if (isNaN(qty) || qty < 1) {
        successEl.textContent = 'Enter a valid quantity.';
        successEl.style.color = 'var(--color-error)';
        return;
      }

      if (qty > book.copiesInStock) {
        successEl.textContent = `Only ${book.copiesInStock} in stock.`;
        successEl.style.color = 'var(--color-error)';
        return;
      }

      addToCartFn(bookId, qty, BOOKS);
      updateCountFn();

      successEl.textContent = `Added ${qty} to cart.`;
      successEl.style.color = 'var(--color-success)';

      setTimeout(() => {
        successEl.textContent = '';
      }, 2500);
    });
  });
}
