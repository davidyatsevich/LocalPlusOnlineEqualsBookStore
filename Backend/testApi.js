// end-to-end API tests — run with: node testApi.js (server must be on :8000)
// prints PASS/FAIL per check and exits non-zero on any failure
const BASE = 'http://localhost:8000';

let passed = 0;
let failed = 0;

function check(name, condition, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${name}  ${detail}`);
  }
}

async function api(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { data = null; }
  return { status: res.status, data };
}

async function run() {
  console.log('\n=== 1. CATALOGUE (browse / search / sort) ===');
  const all = await api('GET', '/api/books');
  check('GET /api/books returns array of 5', Array.isArray(all.data) && all.data.length === 5, JSON.stringify(all.data).slice(0, 120));
  check('book has price + stock fields', all.data[0] && typeof all.data[0].price === 'number' && typeof all.data[0].stock === 'number');

  const byTitle = await api('GET', '/api/books/search/title?title=1984');
  check('search by title "1984" finds 1', Array.isArray(byTitle.data) && byTitle.data.length === 1 && byTitle.data[0].title === '1984');

  const byAuthor = await api('GET', '/api/books/search/author?author=orwell');
  check('search by author "orwell" finds >=1', Array.isArray(byAuthor.data) && byAuthor.data.length >= 1);

  const sorted = await api('GET', '/api/books/sort/az');
  const titles = sorted.data.map((b) => b.title);
  const isSorted = titles.every((t, i) => i === 0 || titles[i - 1].toLowerCase() <= t.toLowerCase());
  check('sort A-Z returns ascending titles', isSorted, titles.join(', '));

  const avail = await api('GET', '/api/books/available');
  check('available books endpoint works (no 500)', Array.isArray(avail.data));

  console.log('\n=== 2. LOGIN / REGISTER ===');
  const badLogin = await api('POST', '/api/login', { email: 'nobody@x.com', password: 'wrong' });
  check('bad login -> 401', badLogin.status === 401, `status ${badLogin.status}`);

  const custLogin = await api('POST', '/api/login', { email: 'john@gmail.com', password: 'customer123' });
  check('customer login -> role customer', custLogin.data && custLogin.data.role === 'customer', JSON.stringify(custLogin.data));

  const staffLogin = await api('POST', '/api/login', { email: 'admin@bookstore.com', password: 'admin123' });
  check('staff login -> role staff', staffLogin.data && staffLogin.data.role === 'staff', JSON.stringify(staffLogin.data));

  const email = `tester_${Date.now()}@example.com`;
  const reg = await api('POST', '/api/register', { name: 'Test User', email, password: 'pass123' });
  check('register new account -> customer', reg.data && reg.data.role === 'customer' && reg.data.id, JSON.stringify(reg.data));
  const newUserId = reg.data && reg.data.id;

  const dupe = await api('POST', '/api/register', { name: 'Dup', email, password: 'pass123' });
  check('duplicate email register -> 409', dupe.status === 409, `status ${dupe.status}`);

  console.log('\n=== 3. PAYMENT (simulated) ===');
  const payOk = await api('POST', '/api/payment', { cardName: 'Test User', cardNumber: '4111111111111111', amount: 25.98 });
  check('valid payment -> approved + reference', payOk.data && payOk.data.status === 'approved' && /^PAY-/.test(payOk.data.reference), JSON.stringify(payOk.data));
  check('payment masks card to last 4', payOk.data && payOk.data.cardLast4 === '1111', JSON.stringify(payOk.data));
  const payBad = await api('POST', '/api/payment', { cardName: '', cardNumber: '123', amount: 10 });
  check('invalid payment -> 400', payBad.status === 400, `status ${payBad.status}`);

  console.log('\n=== 4. CART / ORDER / INVOICE (Add to Cart and Purchase) ===');
  const stockBeforeOrder = (await api('GET', '/api/books')).data.find((b) => b.id === 1).stock;
  const order = await api('POST', '/api/orders', { accountId: newUserId, bookId: 1, quantity: 2 });
  check('create order returns id', order.data && order.data.id, JSON.stringify(order.data));
  const orderId = order.data && order.data.id;
  const stockAfterOrder = (await api('GET', '/api/books')).data.find((b) => b.id === 1).stock;
  check('order decremented book stock by 2 (new feature)', stockAfterOrder === stockBeforeOrder - 2, `before ${stockBeforeOrder} after ${stockAfterOrder}`);
  const overOrder = await api('POST', '/api/orders', { accountId: newUserId, bookId: 3, quantity: 999999 });
  check('order beyond stock rejected -> 400 (new feature)', overOrder.status === 400, `status ${overOrder.status}`);

  const invoice = await api('GET', `/api/invoice/${orderId}`);
  check('invoice generated (not 500)', invoice.status === 200, `status ${invoice.status}`);
  check('invoice has title + correct total', invoice.data && invoice.data.title === 'Macbeth' && invoice.data.totalAmount === 2 * 12.99, JSON.stringify(invoice.data));

  const history = await api('GET', `/api/orders/account/${newUserId}`);
  check('order history returns the order (ID coercion fix)', Array.isArray(history.data) && history.data.length === 1 && history.data[0].id === orderId, JSON.stringify(history.data));

  const badInvoice = await api('GET', '/api/invoice/999999999');
  check('invoice for unknown order -> 404', badInvoice.status === 404, `status ${badInvoice.status}`);

  console.log('\n=== 5. STAFF: UPDATE INVENTORY + SALES REPORT ===');
  const before = (await api('GET', '/api/books')).data.find((b) => b.id === 2).stock;
  const inc = await api('PUT', '/api/staff/books/2/stock', { type: 'increase', amount: 5 });
  check('increase stock -> 200', inc.status === 200, JSON.stringify(inc.data));
  const afterInc = (await api('GET', '/api/books')).data.find((b) => b.id === 2).stock;
  check('stock increased by 5', afterInc === before + 5, `before ${before} after ${afterInc}`);

  const dec = await api('PUT', '/api/staff/books/2/stock', { type: 'decrease', amount: 5 });
  check('decrease stock -> 200', dec.status === 200);
  const afterDec = (await api('GET', '/api/books')).data.find((b) => b.id === 2).stock;
  check('stock restored', afterDec === before, `restored to ${afterDec}`);

  const overDraw = await api('PUT', '/api/staff/books/2/stock', { type: 'decrease', amount: 999999 });
  check('decrease below 0 rejected cleanly -> 400 (not 500)', overDraw.status === 400, `status ${overDraw.status}`);

  const sales = await api('GET', '/api/sales/weekly');
  check('weekly sales reflects the order (book 1 -> 2)', sales.data && Number(sales.data['1']) === 2, JSON.stringify(sales.data));

  const salesByBook = await api('GET', '/api/sales/book/1');
  check('sales by book 1 -> 2 (ID coercion fix)', salesByBook.data && salesByBook.data.totalSold === 2, JSON.stringify(salesByBook.data));

  console.log(`\n=== SUMMARY: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed === 0 ? 0 : 1);
}

run().catch((err) => {
  console.error('Test harness error:', err);
  process.exit(1);
});
