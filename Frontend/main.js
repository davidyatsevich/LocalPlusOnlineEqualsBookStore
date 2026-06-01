async function loadBooks() {
  try {
    const res = await fetch("/api/books");
    const books = await res.json();

    const app = document.querySelector("#app");

    app.innerHTML = `
      <h1>Catalogue</h1>

      <div class="grid">
        ${books.map(book => `
          <div class="card">
            <h2>${book.title}</h2>
            <p><b>Author:</b> ${book.author}</p>
            <p><b>Price:</b> $${book.price}</p>
            <p><b>Stock:</b> ${book.stock}</p>
          </div>
        `).join("")}
      </div>
    `;

  } catch (err) {
    document.querySelector("#app").innerHTML =
      "<p>Failed to load books</p>";
    console.error(err);
  }
}

loadBooks();