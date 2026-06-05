const fastify = require("fastify")({ logger: true });
const cors = require("@fastify/cors");

// persistence----------------------------------------------------------------------
const db = require("./Persistence/persistence");

// require business and repository layer-------------------------------------------
const Catalogue = require("./BusinessLogic/Catalogue");
const BookRepository = require("./Repositories/BookRepository");
const AccountsRepository = require("./Repositories/AccountRepository");
const OrderRepository = require("./Repositories/OrderRepository");
const Invoice = require("./BusinessLogic/Invoice");
const Order = require("./BusinessLogic/Order");
const SalesReport = require("./BusinessLogic/SalesReport");
const ShoppingCart = require("./BusinessLogic/ShoppingCart");


// create instances----------------------------------------------------------------
const bookRepo = new BookRepository();
const accountsRepo = new AccountsRepository(db);
const orderRepo = new OrderRepository(db);
const invoice = new Invoice(orderRepo, bookRepo);
const order = new Order(orderRepo);
const salesReport = new SalesReport(orderRepo);


// enable CORS---------------------------------------------------------------------------
fastify.register(cors, {
  origin: true,
});



// Register new account-------------------------------------------------------------------
fastify.post("/api/register", async (req, reply) => {
  const { name, email, password } = req.body;

  // Check if email already exists
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





// login: customer and staff---------------------------------------------------
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


// Catalogue------------------------------------------------------------------
// Get all books
fastify.get("/api/books", async () => {
  return Catalogue.getAllBooks();
});

// Search by title
fastify.get("/api/books/search/title", async (req) => {
  return Catalogue.searchByTitle(req.query.title || "");
});

// Search by author
fastify.get("/api/books/search/author", async (req) => {
  return Catalogue.searchByAuthor(req.query.author || "");
});

// Filter available books
fastify.get("/api/books/available", async () => {
  return Catalogue.getAvailableBooks();
});

// Sort A-Z
fastify.get("/api/books/sort/az", async () => {
  return Catalogue.getBooksAlphabetical();
});





// update book inventory (staff)-------------------------------------------

// Update stock (increase / decrease)
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


// Shopping Cart----------------------------------------------------------------

// Each request carries the cart state from the frontend
// Add item to cart
fastify.post("/api/cart/add", async (req) => {

  const { cartItems, book, quantity } = req.body;
  const cart = new ShoppingCart();

  // restore existing cart state
  cartItems.forEach(item => cart.addItem(item.book, item.quantity));
  cart.addItem(book, quantity);
  return { items: cart.items, total: cart.getTotal() };
});

// Remove item from cart
fastify.post("/api/cart/remove", async (req) => {

  const { cartItems, bookId } = req.body;
  const cart = new ShoppingCart();
  cartItems.forEach(item => cart.addItem(item.book, item.quantity));
  cart.removeItem(bookId);
  return { items: cart.items, total: cart.getTotal() };
});

// Get cart total
fastify.post("/api/cart/total", async (req) => {

  const { cartItems } = req.body;
  const cart = new ShoppingCart();
  cartItems.forEach(item => cart.addItem(item.book, item.quantity));
  return { total: cart.getTotal() };
});



// Orders------------------------------------------------------------------

// Create a new order
fastify.post("/api/orders", async (req, reply) => {

  const { accountId, bookId, quantity } = req.body;
  const newOrder = order.createOrder(accountId, bookId, quantity);

  return newOrder;
});

// Get all orders for an account
fastify.get("/api/orders/account/:accountId", async (req) => {

  const { accountId } = req.params;
  return order.getOrdersByAccount(accountId);
});






// Invoice-----------------------------------------------------------

// Generate invoice for an order
fastify.get("/api/invoice/:orderId", async (req, reply) => {

  const orderId = Number(req.params.orderId);
  try {

    return invoice.generateInvoice(orderId);

  } catch (err) {

    return reply.code(404).send({ error: err.message });

  }
});





// Sales Report--------------------------------------------------------

// Total sales by book
fastify.get("/api/sales/book/:bookId", async (req) => {

  const {bookId} = req.params;
  const total = salesReport.getTotalSalesByBook(bookId);

  return {bookId, totalSold: total};
});

// Total sales by account
fastify.get("/api/sales/account/:accountId", async (req) => {

  const {accountId} = req.params;
  const total = salesReport.getTotalSalesByAccount(accountId);

  return {accountId, totalSold: total};
});

// Weekly sales by book
fastify.get("/api/sales/book/:bookId/weekly", async (req) => {

  const {bookId} = req.params;
  const total = salesReport.getWeeklySalesByBook(bookId);

  return {bookId, weeklySold: total};
});

// Weekly sales all books (for staff dashboard)
fastify.get("/api/sales/weekly", async () => {

  return salesReport.getWeeklySalesAllBooks();
});




// Start Server------------------------------------------------------------
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