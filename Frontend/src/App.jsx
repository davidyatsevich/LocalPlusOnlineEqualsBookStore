import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await fetch("/api/books");
        const data = await res.json();
        setBooks(data);
      } catch (err) {
        console.error("Failed to load books:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);

  return (
    <div className="container">
      <h1>Catalogue</h1>

      {loading ? (
        <p>Loading books...</p>
      ) : (
        <div className="grid">
          {books.map((book) => (
            <div className="card" key={book.id}>
              <h2>{book.title}</h2>
              <p><b>Author:</b> {book.author}</p>
              <p><b>Price:</b> ${book.price}</p>
              <p><b>Stock:</b> {book.stock}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}