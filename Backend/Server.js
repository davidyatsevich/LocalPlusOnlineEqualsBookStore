const fastify = require("fastify")({ logger: true });
const cors = require("@fastify/cors");

// Business logic
const catalogue = require("./BusinessLogic/Catalogue");

// Enable CORS for frontend (Vite)
fastify.register(cors, {
  origin: true,
});

// ==========================
// GET ALL BOOKS (CATALOGUE)
// ==========================
fastify.get("/api/books", async (request, reply) => {
  try {
    return catalogue.getAllBooks();
  } catch (err) {
    reply.code(500).send({ error: err.message });
  }
});

// ==========================
// START SERVER
// ==========================
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