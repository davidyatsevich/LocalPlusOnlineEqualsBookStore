//=============================================================================
// SWE30003 - Bookstore Web Frontend: Cart View
// Reference Coding Standard: Google JavaScript Style Guide (ES6 Modules)
//=============================================================================

import { getCartTotal } from '../../store/cart.js';

/**
 * Renders the cart view HTML.
 * @param {Array} cart - The current cart array.
 * @returns {string} HTML string.
 */
export function renderCart(cart) {
  if (cart.length === 0) {
    return `
      <div class="view-content animate-fade">
        <h2>Your Cart</h2>
        <div class="empty-state">
          <p>Your cart is empty.</p>
          <button class="btn-secondary" data-nav="browse">Browse Books</button>
        </div>
      </div>
    `;
  }

  const subtotal = getCartTotal(cart);
  const gst = subtotal * 0.1;
  const total = subtotal + gst;

  const rows = cart.map((entry) => `
    <tr>
      <td>${entry.book.title}</td>
      <td>${entry.book.author}</td>
      <td>$${entry.book.pricePerCopy.toFixed(2)}</td>
      <td>${entry.quantity}</td>
      <td>$${(entry.book.pricePerCopy * entry.quantity).toFixed(2)}</td>
      <td>
        <button class="btn-danger remove-btn" data-book-id="${entry.book.id}" aria-label="Remove ${entry.book.title} from cart">
          Remove
        </button>
      </td>
    </tr>
  `).join('');

  return `
    <div class="view-content animate-fade">
      <h2>Your Cart</h2>
      <div class="table-wrapper">
        <table class="cart-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Price ea</th>
              <th>Qty</th>
              <th>Line Total</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" style="text-align:right;font-weight:600;">Subtotal</td>
              <td>$${subtotal.toFixed(2)}</td>
              <td></td>
            </tr>
            <tr>
              <td colspan="4" style="text-align:right;font-weight:600;">GST (10%)</td>
              <td>$${gst.toFixed(2)}</td>
              <td></td>
            </tr>
            <tr>
              <td colspan="4" style="text-align:right;font-weight:700;font-size:1.05rem;">Total</td>
              <td style="font-weight:700;">$${total.toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div class="cart-actions">
        <button class="btn-primary" id="placeOrderBtn">Place Order</button>
      </div>
      <div id="invoiceSection"></div>
    </div>
  `;
}

/**
 * Wires up Remove and Place Order listeners after Cart is rendered into the DOM.
 * @param {Array} cart
 * @param {Function} removeFromCartFn
 * @param {Function} clearCartFn
 * @param {Function} rerenderFn - Called to re-render the cart view.
 */
export function setupCartListeners(cart, removeFromCartFn, clearCartFn, rerenderFn) {
  // Remove buttons
  document.querySelectorAll('.remove-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      removeFromCartFn(Number(btn.dataset.bookId));
      rerenderFn();
    });
  });

  // Place Order button
  const placeOrderBtn = document.getElementById('placeOrderBtn');
  if (!placeOrderBtn) return;

  placeOrderBtn.addEventListener('click', () => {
    if (cart.length === 0) return;

    const subtotal = getCartTotal(cart);
    const gst = subtotal * 0.1;
    const total = subtotal + gst;
    const invoiceNumber = `INV-${Date.now()}`;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' });

    const itemLines = cart.map((entry) =>
      `  ${entry.book.title.padEnd(32)} x${entry.quantity}  $${(entry.book.pricePerCopy * entry.quantity).toFixed(2)}`
    ).join('\n');

    const invoiceSection = document.getElementById('invoiceSection');
    invoiceSection.innerHTML = `
      <div class="invoice-box" id="invoiceBox">
        <p><strong>Favourite Books Online</strong><br/>
        Glenferrie Road, Hawthorn</p>
        <hr style="border:none;border-top:1px dashed var(--color-accent-tan);margin:10px 0;"/>
        <p>Invoice No: <strong>${invoiceNumber}</strong><br/>
        Date: ${dateStr}</p>
        <hr style="border:none;border-top:1px dashed var(--color-accent-tan);margin:10px 0;"/>
        <pre style="margin:0;font-size:0.88rem;">${itemLines}</pre>
        <hr style="border:none;border-top:1px dashed var(--color-accent-tan);margin:10px 0;"/>
        <p style="margin:2px 0;">Subtotal: $${subtotal.toFixed(2)}<br/>
        GST (10%): $${gst.toFixed(2)}<br/>
        <strong>Total: $${total.toFixed(2)}</strong></p>
        <hr style="border:none;border-top:1px dashed var(--color-accent-tan);margin:10px 0;"/>
        <p style="font-size:0.85rem;color:#666;">Thank you for your order.</p>
        <button class="btn-secondary" id="newOrderBtn" style="margin-top:12px;">New Order</button>
      </div>
    `;

    // Disable Place Order button
    placeOrderBtn.disabled = true;
    placeOrderBtn.style.opacity = '0.5';

    // New Order button
    document.getElementById('newOrderBtn').addEventListener('click', () => {
      clearCartFn();
      rerenderFn();
    });

    invoiceSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
