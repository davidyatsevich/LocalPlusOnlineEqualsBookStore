// browse / search the catalogue
import { useState, useEffect } from 'react';
import {
  getBooks,
  getBooksSorted,
  searchByTitle,
  searchByAuthor,
} from '../api.js';
import { useCart } from '../state/cart.jsx';

// how many of this book are already in the cart
function cartQtyFor(items, bookId) {
  const entry = items.find((e) => e.book.id === bookId);
  return entry ? entry.quantity : 0;
}

// validates the qty input; returns { valid, qty, error }
function parseQty(raw) {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return { valid: false, qty: 0, error: 'Quantity must not be blank.' };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { valid: false, qty: 0, error: 'Quantity must be a positive whole number.' };
  }
  const qty = parseInt(trimmed, 10);
  if (qty <= 0) {
    return { valid: false, qty: 0, error: 'Quantity must be at least 1.' };
  }
  return { valid: true, qty, error: null };
}

export default function Browse() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState('title');
  const [rowQtys, setRowQtys] = useState({});
  const [statusMsg, setStatusMsg] = useState(null); // { type: 'error'|'success', text }

  const { items, addItem } = useCart();

  async function loadAll() {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getBooks();
      setBooks(data);
    } catch (err) {
      setFetchError(err.message || 'Failed to load books.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleSearch() {
    setStatusMsg(null);

    if (searchTerm.trim() === '') {
      setStatusMsg({ type: 'error', text: 'Please enter a search term.' });
      return;
    }

    setLoading(true);
    setFetchError(null);
    try {
      let data;
      if (searchMode === 'title') {
        data = await searchByTitle(searchTerm.trim());
      } else {
        data = await searchByAuthor(searchTerm.trim());
      }
      setBooks(data);
    } catch (err) {
      setFetchError(err.message || 'Search failed.');
    } finally {
      setLoading(false);
    }
  }


  async function handleSort() {
    setStatusMsg(null);
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getBooksSorted();
      setBooks(data);
    } catch (err) {
      setFetchError(err.message || 'Sort failed.');
    } finally {
      setLoading(false);
    }
  }
  

  async function handleReset() {
    setStatusMsg(null);
    setSearchTerm('');
    setSearchMode('title');
    await loadAll();
  }

  function handleSearchKeyDown(e) {
    if (e.key === 'Enter') handleSearch();
  }

  function handleQtyChange(bookId, value) {
    setRowQtys((prev) => ({ ...prev, [bookId]: value }));
  }

  // validates qty and checks stock before adding to cart
  function handleAddToCart(book) {
    const rawQty = rowQtys[book.id] !== undefined ? rowQtys[book.id] : '1';
    const { valid, qty, error } = parseQty(String(rawQty));

    if (!valid) {
      setStatusMsg({ type: 'error', text: error });
      return;
    }

    const alreadyInCart = cartQtyFor(items, book.id);
    const totalRequested = qty + alreadyInCart;

    if (totalRequested > book.stock) {
      const msg =
        alreadyInCart > 0
          ? `Only ${book.stock} in stock (you already have ${alreadyInCart} in your cart).`
          : `Only ${book.stock} in stock.`;
      setStatusMsg({ type: 'error', text: msg });
      return;
    }

    addItem(book, qty);
    setStatusMsg({
      type: 'success',
      text: `Added ${qty} × "${book.title}" to your cart.`,
    });
    // reset to 1 after a successful add
    setRowQtys((prev) => ({ ...prev, [book.id]: '1' }));
  }

  return (
    <div className="animate-fade">
      <h1>Browse Books</h1>

      {statusMsg && (
        <p className={statusMsg.type === 'error' ? 'error-msg' : 'success-msg'}>
          {statusMsg.text}
        </p>
      )}

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search books…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          aria-label="Search term"
        />

        <select
          value={searchMode}
          onChange={(e) => setSearchMode(e.target.value)}
          aria-label="Search by"
        >
          <option value="title">Title</option>
          <option value="author">Author</option>
        </select>

        <button type="button" onClick={handleSearch}>
          Search
        </button>

        <button type="button" className="btn-secondary" onClick={handleSort}>
          Sort A–Z
        </button>

        <button type="button" className="btn-secondary" onClick={handleReset}>
          Reset
        </button>
      </div>

      {loading && <p className="muted">Loading books…</p>}

      {!loading && fetchError && (
        <p className="error-msg">{fetchError}</p>
      )}

      {!loading && !fetchError && books.length === 0 && (
        <p className="empty-state">No books found.</p>
      )}

      {!loading && !fetchError && books.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Quantity</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => {
              const outOfStock = book.stock === 0;
              const rowQty = rowQtys[book.id] !== undefined ? rowQtys[book.id] : '1';

              return (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>${book.price.toFixed(2)}</td>
                  <td>
                    {outOfStock ? (
                      <span className="muted">Out of stock</span>
                    ) : (
                      book.stock
                    )}
                  </td>
                  <td>
                    <input
                      type="number"
                      className="inline-input"
                      min={1}
                      value={rowQty}
                      disabled={outOfStock}
                      onChange={(e) => handleQtyChange(book.id, e.target.value)}
                      aria-label={`Quantity for ${book.title}`}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      disabled={outOfStock}
                      onClick={() => handleAddToCart(book)}
                    >
                      {outOfStock ? 'Out of stock' : 'Add to Cart'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
