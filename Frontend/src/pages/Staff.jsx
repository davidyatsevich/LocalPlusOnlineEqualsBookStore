
import { useState, useEffect, useCallback } from 'react';
import { getBooks, updateStock, addBook, getWeeklySales, getSalesSummary } from '../api.js';
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
  const [form, setForm] = useState({ title: '', author: '', price: '', stock: '' });
  const [addMsg, setAddMsg] = useState(null);

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

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleAddBook = async (e) => {
    e.preventDefault();
    const { title, author, price, stock } = form;

    if (!title.trim() || !author.trim()) {
      setAddMsg({ kind: 'error', text: 'Title and author are required.' });
      return;
    }
    if (price === '' || isNaN(price) || Number(price) <= 0) {
      setAddMsg({ kind: 'error', text: 'Price must be greater than 0.' });
      return;
    }
    if (stock === '' || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
      setAddMsg({ kind: 'error', text: 'Stock must be a whole number (0 or more).' });
      return;
    }

    try {
      const created = await addBook(title.trim(), author.trim(), price, stock);
      setForm({ title: '', author: '', price: '', stock: '' });
      setAddMsg({ kind: 'success', text: `Added "${created.title}" to the catalogue.` });
      await loadBooks();
    } catch (err) {
      setAddMsg({ kind: 'error', text: err.message || 'Could not add book.' });
    }
  };

  if (loading) return <p className="muted">Loading inventory…</p>;

  return (
    <section>
      <h2>Update Inventory</h2>

      <form onSubmit={handleAddBook} style={{ marginBottom: '1.5rem' }}>
        <h3>Add a new book</h3>
        <div className="toolbar">
          <input type="text" placeholder="Title" value={form.title}
            onChange={(e) => setField('title', e.target.value)} aria-label="New book title" />
          <input type="text" placeholder="Author" value={form.author}
            onChange={(e) => setField('author', e.target.value)} aria-label="New book author" />
          <input type="number" placeholder="Price" min="0" step="0.01" className="inline-input"
            style={{ width: '90px' }} value={form.price}
            onChange={(e) => setField('price', e.target.value)} aria-label="New book price" />
          <input type="number" placeholder="Stock" min="0" className="inline-input"
            style={{ width: '90px' }} value={form.stock}
            onChange={(e) => setField('stock', e.target.value)} aria-label="New book stock" />
          <button type="submit">Add Book</button>
        </div>
        {addMsg && (
          <p className={addMsg.kind === 'error' ? 'error-msg' : 'success-msg'}>{addMsg.text}</p>
        )}
      </form>

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
  const [summary, setSummary] = useState(null);
  const [bookMap, setBookMap] = useState({});
  const [loading, setLoading] = useState(true);

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const [salesData, books, summaryData] = await Promise.all([
        getWeeklySales(), getBooks(), getSalesSummary(),
      ]);
      const map = {};
      books.forEach((b) => { map[b.id] = b.title; });
      setSales(salesData);
      setSummary(summaryData);
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

      {summary && (
        <div className="home-cards" style={{ marginTop: 0, marginBottom: '18px' }}>
          <div className="home-card">
            <h3>Units sold</h3>
            <p style={{ fontSize: '1.5rem', margin: 0 }}>{summary.units}</p>
            <p className="muted" style={{ margin: 0 }}>this week</p>
          </div>
          <div className="home-card">
            <h3>Revenue</h3>
            <p style={{ fontSize: '1.5rem', margin: 0 }}>${summary.revenue.toFixed(2)}</p>
            <p className="muted" style={{ margin: 0 }}>this week</p>
          </div>
          <div className="home-card">
            <h3>Orders</h3>
            <p style={{ fontSize: '1.5rem', margin: 0 }}>{summary.orders}</p>
            <p className="muted" style={{ margin: 0 }}>this week</p>
          </div>
          <div className="home-card">
            <h3>Best seller</h3>
            <p style={{ margin: '4px 0 0' }}>
              {summary.bestSeller
                ? `${summary.bestSeller.title ?? `Book #${summary.bestSeller.bookId}`} (${summary.bestSeller.quantity} sold)`
                : '—'}
            </p>
          </div>
        </div>
      )}

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
