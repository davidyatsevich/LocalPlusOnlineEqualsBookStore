// cart, checkout, receipt and order history
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, GST_RATE } from '../state/cart.jsx';
import { useAuth } from '../state/auth.jsx';
import {
  createOrder,
  getInvoice,
  getOrdersByAccount,
  getBooks,
  processPayment,
} from '../api.js';

// "$12.50" formatter
function fmt(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

// basic card number check: digits only, 12–19 chars
function validateCard(value) {
  const stripped = value.replace(/\s+/g, '');
  if (!stripped) return 'Card number is required.';
  if (!/^\d+$/.test(stripped)) return 'Card number must contain digits only.';
  if (stripped.length < 12 || stripped.length > 19)
    return 'Card number must be between 12 and 19 digits.';
  return null;
}

// tax invoice block — used for both the post-checkout receipt and order history
function InvoiceBox({ invoices, date, referenceIds, payment }) {
  const lineSubtotal = invoices.reduce(
    (sum, inv) => sum + Number(inv.totalAmount),
    0
  );
  const gstAmount = lineSubtotal * GST_RATE;
  const grandTotal = lineSubtotal + gstAmount;

  return (
    <div className="invoice-box" style={{ marginTop: '20px' }}>
      <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '1rem' }}>
        === FAVOURITE BOOKS — TAX INVOICE ===
      </div>
      <div>Order Reference: {referenceIds}</div>
      <div>Date: {date}</div>
      <hr style={{ borderColor: '#8c6548', margin: '10px 0' }} />
      {invoices.map((inv) => (
        <div key={inv.id} style={{ marginBottom: '4px' }}>
          {inv.title} — {inv.author}
          {'  '}Qty: {inv.quantity}{'  '}
          @ {fmt(inv.unitPrice)}{'  '}
          Line total: {fmt(Number(inv.unitPrice) * Number(inv.quantity))}
        </div>
      ))}
      <hr style={{ borderColor: '#8c6548', margin: '10px 0' }} />
      <div>Subtotal: {fmt(lineSubtotal)}</div>
      <div>GST (10%): {fmt(gstAmount)}</div>
      <div style={{ fontWeight: 'bold', marginTop: '4px' }}>
        TOTAL: {fmt(grandTotal)}
      </div>
      {payment && (
        <>
          <hr style={{ borderColor: '#8c6548', margin: '10px 0' }} />
          <div>Payment: {payment.status === 'approved' ? 'APPROVED' : payment.status} (simulated)</div>
          <div>Reference: {payment.reference}</div>
          {payment.cardLast4 && <div>Card: **** **** **** {payment.cardLast4}</div>}
        </>
      )}
      <div style={{ marginTop: '8px', fontStyle: 'italic' }}>
        Thank you for shopping at Favourite Books!
      </div>
    </div>
  );
}

export default function Cart() {
  const { items, setQuantity, removeItem, clearCart, subtotal, gst, total } =
    useCart();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [qtyErrors, setQtyErrors] = useState({});

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardError, setCardError] = useState('');

  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [receipt, setReceipt] = useState(null); // { invoices, date, referenceIds }

  const [orders, setOrders] = useState([]);
  const [bookMap, setBookMap] = useState({});
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [viewedInvoices, setViewedInvoices] = useState({}); // orderId -> invoice data

  const loadHistory = useCallback(async () => {
    if (!isLoggedIn) return;
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const [fetchedOrders, books] = await Promise.all([
        getOrdersByAccount(user.id),
        getBooks(),
      ]);
      const map = {};
      books.forEach((b) => { map[b.id] = b.title; });
      setBookMap(map);
      setOrders(fetchedOrders);
    } catch (err) {
      setHistoryError(`Failed to load order history: ${err.message}`);
    } finally {
      setHistoryLoading(false);
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  function handleQtyChange(book, rawValue) {
    const parsed = parseInt(rawValue, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      setQtyErrors((prev) => ({
        ...prev,
        [book.id]: 'Quantity must be a positive whole number.',
      }));
      return;
    }
    if (parsed > book.stock) {
      setQtyErrors((prev) => ({
        ...prev,
        [book.id]: `Only ${book.stock} in stock.`,
      }));
      return;
    }
    setQtyErrors((prev) => { const next = { ...prev }; delete next[book.id]; return next; });
    setQuantity(book.id, parsed);
  }

  async function handlePlaceOrder() {
    setCheckoutError('');

    if (!isLoggedIn) {
      setCheckoutError('Please log in to place an order.');
      return;
    }

    const cardErr = validateCard(cardNumber);
    if (cardErr) {
      setCardError(cardErr);
      return;
    }
    setCardError('');

    if (items.length === 0) {
      setCheckoutError('Your cart is empty.');
      return;
    }

    setCheckoutLoading(true);
    try {
      // simulated payment first, then create orders, then fetch invoices
      const payment = await processPayment(cardName, cardNumber, total);

      // one order per cart line; stock is decremented server-side
      const createdOrders = await Promise.all(
        items.map((entry) =>
          createOrder(user.id, entry.book.id, entry.quantity)
        )
      );

      const invoices = await Promise.all(
        createdOrders.map((order) => getInvoice(order.id))
      );

      const referenceIds = createdOrders.map((o) => `#${o.id}`).join(', ');
      const date = new Date().toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      setReceipt({ invoices, date, referenceIds, payment });
      clearCart();
      // refresh history so the new orders show up
      await loadHistory();
    } catch (err) {
      setCheckoutError(`Order failed: ${err.message}`);
    } finally {
      setCheckoutLoading(false);
    }
  }

  // toggle invoice display for a past order
  async function handleViewInvoice(orderId) {
    if (viewedInvoices[orderId]) {
      // already open — close it
      setViewedInvoices((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
      return;
    }
    try {
      const inv = await getInvoice(orderId);
      setViewedInvoices((prev) => ({ ...prev, [orderId]: inv }));
    } catch (err) {
      setHistoryError(`Could not load invoice: ${err.message}`);
    }
  }

  return (
    <div className="animate-fade">
      <h1>Your Cart</h1>

      {/* receipt — shown after checkout */}
      {receipt && (
        <div>
          <p className="success-msg">Order placed successfully!</p>
          <InvoiceBox
            invoices={receipt.invoices}
            date={receipt.date}
            referenceIds={receipt.referenceIds}
            payment={receipt.payment}
          />
        </div>
      )}

      {/* empty state */}
      {items.length === 0 && !receipt && (
        <div className="empty-state" style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ fontSize: '1.1rem' }}>Your cart is empty.</p>
          <Link to="/browse">
            <button type="button">Browse Books</button>
          </Link>
        </div>
      )}

      {/* cart table */}
      {items.length > 0 && (
        <section>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th className="text-right">Unit Price</th>
                <th>Quantity</th>
                <th className="text-right">Line Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map(({ book, quantity }) => (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td className="text-right">{fmt(book.price)}</td>
                  <td>
                    <input
                      type="number"
                      className="inline-input"
                      style={{ width: '70px', maxWidth: '70px', display: 'inline-block' }}
                      min={1}
                      max={book.stock}
                      value={quantity}
                      onChange={(e) => handleQtyChange(book, e.target.value)}
                    />
                    {qtyErrors[book.id] && (
                      <span
                        className="error-msg"
                        style={{ display: 'block', padding: '4px 8px', marginTop: '4px', fontSize: '0.85rem' }}
                      >
                        {qtyErrors[book.id]}
                      </span>
                    )}
                  </td>
                  <td className="text-right">{fmt(book.price * quantity)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-danger"
                      style={{ backgroundColor: '#843919', color: '#fff', padding: '6px 14px' }}
                      onClick={() => removeItem(book.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="totals-row">
                <td colSpan={4} className="text-right" style={{ fontWeight: 600 }}>
                  Subtotal
                </td>
                <td className="text-right">{fmt(subtotal)}</td>
                <td />
              </tr>
              <tr className="totals-row">
                <td colSpan={4} className="text-right" style={{ fontWeight: 600 }}>
                  GST (10%)
                </td>
                <td className="text-right">{fmt(gst)}</td>
                <td />
              </tr>
              <tr className="totals-row">
                <td
                  colSpan={4}
                  className="text-right"
                  style={{ fontWeight: 700, fontSize: '1.05rem' }}
                >
                  Total
                </td>
                <td
                  className="text-right"
                  style={{ fontWeight: 700, fontSize: '1.05rem' }}
                >
                  {fmt(total)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>

          {/* payment section */}
          <section style={{ marginTop: '24px' }}>
            <h2>Payment</h2>
            <p
              className="muted"
              style={{
                background: '#fff8e1',
                border: '1px solid #f0c040',
                padding: '10px 14px',
                borderRadius: '4px',
                color: '#7a5c00',
                fontWeight: 600,
                marginBottom: '16px',
              }}
            >
              Payment is simulated for this assignment — no real transaction occurs.
            </p>

            <label htmlFor="cardName" style={{ display: 'block', fontWeight: 600, marginBottom: '2px' }}>
              Name on Card
            </label>
            <input
              id="cardName"
              type="text"
              placeholder="e.g. Jane Smith"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              style={{ maxWidth: '320px' }}
            />

            <label
              htmlFor="cardNumber"
              style={{ display: 'block', fontWeight: 600, marginBottom: '2px', marginTop: '12px' }}
            >
              Card Number
            </label>
            <input
              id="cardNumber"
              type="text"
              placeholder="e.g. 4111 1111 1111 1111"
              value={cardNumber}
              onChange={(e) => { setCardNumber(e.target.value); setCardError(''); }}
              style={{ maxWidth: '320px' }}
            />
            {cardError && (
              <p className="error-msg" style={{ maxWidth: '320px' }}>
                {cardError}
              </p>
            )}
          </section>

          {/* checkout button / errors */}
          <div style={{ marginTop: '20px' }}>
            {!isLoggedIn && (
              <p className="error-msg">
                Please <Link to="/login">log in</Link> to place an order.
              </p>
            )}
            {checkoutError && (
              <p className="error-msg">{checkoutError}</p>
            )}
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={checkoutLoading || !isLoggedIn}
              style={{ marginTop: '10px', opacity: checkoutLoading ? 0.7 : 1 }}
            >
              {checkoutLoading ? 'Placing Order…' : 'Place Order'}
            </button>
          </div>
        </section>
      )}

      {/* order history — shown to logged-in users regardless of cart state */}
      {isLoggedIn && (
        <section style={{ marginTop: '40px' }}>
          <h2>Order History</h2>

          {historyLoading && <p className="muted">Loading orders…</p>}
          {historyError && <p className="error-msg">{historyError}</p>}

          {!historyLoading && orders.length === 0 && (
            <p className="muted" style={{ color: '#888' }}>
              No previous orders.
            </p>
          )}

          {orders.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Book</th>
                  <th>Quantity</th>
                  <th>Date</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{bookMap[order.bookId] || `Book #${order.bookId}`}</td>
                    <td>{order.quantity}</td>
                    <td>
                      {order.date
                        ? new Date(order.date).toLocaleDateString('en-AU')
                        : '—'}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{
                          backgroundColor: '#8c6548',
                          color: '#fff',
                          padding: '6px 14px',
                          fontSize: '0.85rem',
                        }}
                        onClick={() => handleViewInvoice(order.id)}
                      >
                        {viewedInvoices[order.id] ? 'Hide Receipt' : 'View Receipt'}
                      </button>
                      {viewedInvoices[order.id] && (
                        <InvoiceBox
                          invoices={[viewedInvoices[order.id]]}
                          date={
                            order.date
                              ? new Date(order.date).toLocaleDateString('en-AU', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })
                              : '—'
                          }
                          referenceIds={`#${order.id}`}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  );
}
