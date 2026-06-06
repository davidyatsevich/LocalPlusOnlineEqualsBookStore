// thin wrapper around the Fastify backend (proxied at /api)
async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

// accounts
export const registerAccount = (name, email, password) =>
  request('/api/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

export const login = (email, password) =>
  request('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

// catalogue
export const getBooks = () => request('/api/books');
export const searchByTitle = (title) =>
  request(`/api/books/search/title?title=${encodeURIComponent(title)}`);
export const searchByAuthor = (author) =>
  request(`/api/books/search/author?author=${encodeURIComponent(author)}`);
export const getBooksSorted = () => request('/api/books/sort/az');
export const getAvailableBooks = () => request('/api/books/available');

// staff: inventory
export const updateStock = (bookId, type, amount) =>
  request(`/api/staff/books/${bookId}/stock`, {
    method: 'PUT',
    body: JSON.stringify({ type, amount: Number(amount) }),
  });

export const addBook = (title, author, price, stock) =>
  request('/api/staff/books', {
    method: 'POST',
    body: JSON.stringify({
      title,
      author,
      price: Number(price),
      stock: Number(stock),
    }),
  });

// payment (simulated — no real transaction)
export const processPayment = (cardName, cardNumber, amount) =>
  request('/api/payment', {
    method: 'POST',
    body: JSON.stringify({ cardName, cardNumber, amount }),
  });

// orders & invoices
export const createOrder = (accountId, bookId, quantity) =>
  request('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      accountId: Number(accountId),
      bookId: Number(bookId),
      quantity: Number(quantity),
    }),
  });

export const getOrdersByAccount = (accountId) =>
  request(`/api/orders/account/${accountId}`);

export const getInvoice = (orderId) => request(`/api/invoice/${orderId}`);

// sales report (staff only)
export const getWeeklySales = () => request('/api/sales/weekly');
export const getSalesSummary = () => request('/api/sales/summary');
export const getTotalSalesByBook = (bookId) => request(`/api/sales/book/${bookId}`);
