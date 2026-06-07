const fastify = require("fastify")({ logger: true });
const cors = require("@fastify/cors");

const db = require("./Persistence/persistence");

const Catalogue = require("./BusinessLogic/Catalogue");
const BookRepository = require("./Repositories/BookRepository");
const AccountsRepository = require("./Repositories/AccountRepository");
const OrderRepository = require("./Repositories/OrderRepository");
const Invoice = require("./BusinessLogic/Invoice");
const Order = require("./BusinessLogic/Order");
const SalesReport = require("./BusinessLogic/SalesReport");
const ShoppingCart = require("./BusinessLogic/ShoppingCart");
const PaymentDetails = require("./BusinessLogic/PaymentDetails");
const Book = require("./BusinessLogic/Book");


// shared instances — catalogue and order both need the same bookRepo
const bookRepo = new BookRepository(db);
const accountsRepo = new AccountsRepository(db);
const orderRepo = new OrderRepository(db);
const catalogue = new Catalogue(bookRepo);
const invoice = new Invoice(orderRepo, bookRepo);
const order = new Order(orderRepo, bookRepo);
const salesReport = new SalesReport(orderRepo, bookRepo); // bookRepo for revenue


fastify.register(cors, {
  origin: true,
});


fastify.post("/api/register", async (req, reply) => {
  const { name, email, password } = req.body;

  const existing = accountsRepo.getAccountByEmail(email);
  if (existing) {
    return reply.code(409).send({ error: "Email already in use" });
  }

  const newAccount = accountsRepo.createAccount({
    id: Date.now(),
    name,
    email,
    password,
    role: "customer"
  });

  return {
    id: newAccount.id,
    name: newAccount.name,
    role: newAccount.role
  };
});





// login for both customers and staff
fastify.post("/api/login", async (req, reply) => {

  const { email, password } = req.body;

  const user = accountsRepo.validateLogin(email, password);

  if (!user) {
    return reply.code(401).send({ error: "Invalid credentials" });
  }

  // frontend uses role to redirect user
  return {
    id: user.id,
    name: user.name,
    role: user.role
  };
});


// --- catalogue ---

fastify.get("/api/books", async () => {
  return catalogue.getAllBooks();
});

fastify.get("/api/books/search/title", async (req) => {
  return catalogue.searchByTitle(req.query.title || "");
});

fastify.get("/api/books/search/author", async (req) => {
  return catalogue.searchByAuthor(req.query.author || "");
});

fastify.get("/api/books/available", async () => {
  return catalogue.getAvailableBooks();
});

fastify.get("/api/books/sort/az", async () => {
  return catalogue.getBooksAlphabetical();
});





// --- staff: stock management ---

fastify.put("/api/staff/books/:id/stock", async (req, reply) => {

  const {id} = req.params;
  const {type, amount} = req.body;

  let success = false;

  if (type === "increase") {
    success = bookRepo.increaseBookStock(id, amount);
  }

  if (type === "decrease") {
    success = bookRepo.reduceBookStock(id, amount);
  }

  if (!success) {
    return reply.code(400).send({ error: "Stock update failed" });
  }

  return { message: "Stock updated successfully" };
});


// add a new book to the catalogue
fastify.post("/api/staff/books", async (req, reply) => {

  const { title, author, price, stock } = req.body;

  // basic validation
  if (!title || !title.trim() || !author || !author.trim()) {
    return reply.code(400).send({ error: "Title and author are required" });
  }
  if (isNaN(price) || Number(price) <= 0) {
    return reply.code(400).send({ error: "Price must be greater than 0" });
  }
  if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
    return reply.code(400).send({ error: "Stock must be a whole number of 0 or more" });
  }

  // next id = highest existing id + 1
  const books = bookRepo.getAllBooks();
  const nextId = books.reduce((max, b) => Math.max(max, b.id), 0) + 1;
  const newBook = new Book(nextId, title.trim(), author.trim(), Number(price), Number(stock));

  try {
    bookRepo.addBook(newBook);
  } catch (err) {
    return reply.code(400).send({ error: err.message });
  }

  return newBook;
});


// --- cart ---
// cart state lives on the frontend; each request rebuilds it server-side

fastify.post("/api/cart/add", async (req) => {

  const { cartItems, book, quantity } = req.body;
  const cart = new ShoppingCart();

  cartItems.forEach(item => cart.addItem(item.book, item.quantity));
  cart.addItem(book, quantity);
  return { items: cart.items, total: cart.getTotal() };
});

fastify.post("/api/cart/remove", async (req) => {

  const { cartItems, bookId } = req.body;
  const cart = new ShoppingCart();
  cartItems.forEach(item => cart.addItem(item.book, item.quantity));
  cart.removeItem(bookId);
  return { items: cart.items, total: cart.getTotal() };
});

fastify.post("/api/cart/total", async (req) => {

  const { cartItems } = req.body;
  const cart = new ShoppingCart();
  cartItems.forEach(item => cart.addItem(item.book, item.quantity));
  return { total: cart.getTotal() };
});



// payment is simulated — validates card details and returns a transaction ref
fastify.post("/api/payment", async (req, reply) => {

  const { cardName, cardNumber, amount } = req.body;
  const payment = new PaymentDetails(cardName, cardNumber, amount);

  try {
    return payment.process();
  } catch (err) {
    return reply.code(400).send({ error: err.message });
  }
});


// --- orders ---

fastify.post("/api/orders", async (req, reply) => {

  const { accountId, bookId, quantity } = req.body;

  try {
    const newOrder = order.createOrder(accountId, bookId, quantity);
    return newOrder;
  } catch (err) {
    return reply.code(400).send({ error: err.message });
  }
});

fastify.get("/api/orders/account/:accountId", async (req) => {

  const { accountId } = req.params;
  return order.getOrdersByAccount(accountId);
});






// --- invoice ---

fastify.get("/api/invoice/:orderId", async (req, reply) => {

  const orderId = Number(req.params.orderId);
  try {

    return invoice.generateInvoice(orderId);

  } catch (err) {

    return reply.code(404).send({ error: err.message });

  }
});





// --- sales report ---

fastify.get("/api/sales/book/:bookId", async (req) => {

  const {bookId} = req.params;
  const total = salesReport.getTotalSalesByBook(bookId);

  return {bookId, totalSold: total};
});

fastify.get("/api/sales/account/:accountId", async (req) => {

  const {accountId} = req.params;
  const total = salesReport.getTotalSalesByAccount(accountId);

  return {accountId, totalSold: total};
});

fastify.get("/api/sales/book/:bookId/weekly", async (req) => {

  const {bookId} = req.params;
  const total = salesReport.getWeeklySalesByBook(bookId);

  return {bookId, weeklySold: total};
});

// all books — used by the staff dashboard
fastify.get("/api/sales/weekly", async () => {

  return salesReport.getWeeklySalesAllBooks();
});

// headline numbers for the dashboard (units, revenue, orders, best seller)
fastify.get("/api/sales/summary", async () => {

  return salesReport.getWeeklySummary();
});




const start = async () => {
  try {
    await fastify.listen({ port: 8000 });
    console.log("Server running on http://localhost:8000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();