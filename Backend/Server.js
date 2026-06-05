const fastify = require("fastify")({ logger: true });
const cors = require("@fastify/cors");

// persistence-------------------------------------------
const db = require("./Persistence/persistence");

// require busisness and repository layer-------------------------------------------
const Catalogue = require("./BusinessLogic/Catalogue");
const BookRepository = require("./Repositories/BookRepository");
const AccountsRepository = require("./Repositories/AccountsRepository");

// create repo instances
const bookRepo = new BookRepository();
const accountsRepo = new AccountsRepository(db);

// enable CORS-------------------------------------------
fastify.register(cors, {
  origin: true,
});


// login: customer and staff-------------------------------------------
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


// Catlalogue-------------------------------------------

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


// Start Server-------------------------------------------
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