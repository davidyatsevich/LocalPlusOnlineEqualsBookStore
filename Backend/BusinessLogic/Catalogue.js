// read-only views over the book inventory
// takes a BookRepository instance so it stays in sync with staff stock updates
class Catalogue {

    constructor(bookRepository) {
        this.bookRepository = bookRepository;
    }

    getAllBooks() {
        return this.bookRepository.getAllBooks();
    }

    searchByTitle(title) {
        if (!title) return [];

        return this.bookRepository
            .getAllBooks()
            .filter(book =>
                book.title.toLowerCase().includes(title.toLowerCase())
            );
    }

    searchByAuthor(author) {
        if (!author) return [];

        return this.bookRepository
            .getAllBooks()
            .filter(book =>
                book.author.toLowerCase().includes(author.toLowerCase())
            );
    }

    getBooksAlphabetical() {
        return this.bookRepository
            .getAllBooks()
            .slice()
            .sort((a, b) =>
                a.title.toLowerCase().localeCompare(b.title.toLowerCase())
            );
    }

    // only books with stock > 0
    getAvailableBooks() {
        return this.bookRepository
            .getAllBooks()
            .filter(book => book.stock > 0);
    }

    filterByPrice(min, max) {
        return this.bookRepository
            .getAllBooks()
            .filter(book =>
                book.price >= min && book.price <= max
            );
    }
}

module.exports = Catalogue;
