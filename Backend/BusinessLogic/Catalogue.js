const bookRepository = require("../Repositories/BookRepository");

class Catalogue {

    //get books------------------------------------------------
    getAllBooks() {
        return bookRepository.getAllBooks();
    }

    // search by title------------------------------------------------
    searchByTitle(title) {
        if (!title) return [];

        return bookRepository
            .getAllBooks()
            .filter(book =>
                book.title.toLowerCase().includes(title.toLowerCase())
            );
    }

    //search by author------------------------------------------------
    searchByAuthor(author) {
        if (!author) return [];

        return bookRepository
            .getAllBooks()
            .filter(book =>
                book.author.toLowerCase().includes(author.toLowerCase())
            );
    }

    // filter books a-z------------------------------------------------
    getBooksAlphabetical() {
    return bookRepository
        .getAllBooks()
        .slice() 
        .sort((a, b) =>
            a.title.toLowerCase().localeCompare(b.title.toLowerCase())
        );
    }

    // filter by price------------------------------------------------
    filterByPrice(min, max) {
        return bookRepository
            .getAllBooks()
            .filter(book =>
                book.price >= min && book.price <= max
            );
    }
}

module.exports = new Catalogue();