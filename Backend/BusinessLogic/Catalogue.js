const Book = require("./Book");
const bookRepository = require("../Repositories/BookRepository");

class Catalogue {

    getAllBooks() {
        return bookRepository.getAllBooks();
    }

    addNewBook(bookData) {
        const newBook = new Book(
            bookData.id,
            bookData.title,
            bookData.author,
            bookData.price,
            bookData.stock
        );

        bookRepository.addBook(newBook);
    }
}

module.exports = new Catalogue();