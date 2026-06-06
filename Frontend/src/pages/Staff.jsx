
import { useState, useEffect, useCallback } from 'react';
import { getBooks, updateStock, getWeeklySales } from '../api.js';
import { useAuth } from '../state/auth.jsx';

function isPositiveInteger(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1;
}

function InventorySection() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amounts, setAmounts] = useState({});
  const [messages, setMessages] = useState({});

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBooks();
      setBooks(data);
      const initial = {};
      data.forEach((b) => { initial[b.id] = 1; });
      setAmounts((prev) => {
        const merged = { ...initial };
        Object.keys(prev).forEach((k) => { if (k in merged) merged[k] = prev[k]; });
        return merged;
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBooks(); }, [loadBooks]);

  const handleUpdate = async (book, type) => {
    const amount = amounts[book.id];

    if (!isPositiveInteger(amount)) {
      setMessages((prev) => ({
        ...prev,
        [book.id]: { kind: 'error', text: 'Amount must be a positive whole number.' },
      }));
      return;
    }

    setMessages((prev) => ({ ...prev, [book.id]: null }));

    try {
      await updateStock(book.id, type, Number(amount));
      await loadBooks();
      const verb = type === 'increase' ? 'increased' : 'decreased';
      setMessages((prev) => ({
        ...prev,
        [book.id]: {
          kind: 'success',
          text: `"${book.title}" stock ${verb} by ${amount}.`,
        },
      }));
    } catch (err) {
      setMessages((prev) => ({
        ...prev,
        [book.id]: {
          kind: 'error',
          text: err.message || 'Cannot decrease: not enough stock.',
        },
      }));
    }
  };

  const handleAmountChange = (bookId, value) => {
    setAmounts((prev) => ({ ...prev, [bookId]: value }));
  };

  if (loading) return <p className="muted">Loading inventory…</p>;

  return (
    <section>
      <h2>Update Inventory</h2>
      {books.length === 0 ? (
        <p className="muted empty-state">No books found in the catalogue.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Current Stock</th>
              <th>Adjust</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => {
              const msg = messages[book.id];
              return (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.stock}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <input
                        className="inline-input"
                        type="number"
                        min={1}
                        value={amounts[book.id] ?? 1}
                        onChange={(e) => handleAmountChange(book.id, e.target.value)}
                        aria-label={`Adjust amount for ${book.title}`}
                      />
                      <button
                        onClick={() => handleUpdate(book, 'increase')}
                        className="btn-secondary"
                        aria-label={`Increase stock for ${book.title}`}
                      >
                        Increase
                      </button>
                      <button
                        onClick={() => handleUpdate(book, 'decrease')}
                        className="btn-danger"
                        aria-label={`Decrease stock for ${book.title}`}
                      >
                        Decrease
                      </button>
                    </div>
                    {msg && (
                      <p className={msg.kind === 'error' ? 'error-msg' : 'success-msg'}>
                        {msg.text}
                      </p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}

function SalesReportSection() {
  const [sales, setSales] = useState(null);
  const [bookMap, setBookMap] = useState({});
  const [loading, setLoading] = useState(true);

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const [salesData, books] = await Promise.all([getWeeklySales(), getBooks()]);
      const map = {};
      books.forEach((b) => { map[b.id] = b.title; });
      setSales(salesData);
      setBookMap(map);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadReport(); }, [loadReport]);

  const salesEntries = sales ? Object.entries(sales) : [];

  return (
    <section style={{ marginTop: '2rem' }}>
      <h2>Weekly Sales (last 7 days)</h2>
      <button
        className="btn-secondary"
        onClick={loadReport}
        disabled={loading}
        style={{ marginBottom: '1rem' }}
      >
        {loading ? 'Loading…' : 'Refresh'}
      </button>

      {loading ? (
        <p className="muted">Loading sales data…</p>
      ) : salesEntries.length === 0 ? (
        <p className="muted empty-state">No sales recorded in the last 7 days.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Book</th>
              <th>Units Sold (this week)</th>
            </tr>
          </thead>
          <tbody>
            {salesEntries.map(([bookId, qty]) => (
              <tr key={bookId}>
                <td>{bookMap[bookId] ?? `Book #${bookId}`}</td>
                <td>{qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default function Staff() {
  const { user } = useAuth();

  return (
    <div className="animate-fade">
      <h1>Staff Dashboard</h1>
      {user?.name && (
        <p className="muted" style={{ marginBottom: '1.5rem' }}>
          Welcome back, {user.name}.
        </p>
      )}
      <InventorySection />
      <SalesReportSection />
    </div>
  );
}
