const Book = require("../BusinessLogic/Book");

class BookRepository {


    constructor(db) {
        this.db = db; 
        this.db.Books = this.db.Books.map(
            b => new Book(b.id, b.title, b.author, b.price, b.stock)
        );
    }

    getAllBooks() {
        return this.db.Books;
    }

    //get book by id
    getBookById(id){
        return this.db.Books.find(book => book.id === Number(id));
    }

    //get book by title
    getBookByTitle(title){
        return this.db.Books.filter(book =>
            book.title.toLowerCase().includes(title.toLowerCase())
        );
    }

    //get book by author
    getBookByAuthor(author){
        return this.db.Books.filter(book =>
            book.author.toLowerCase().includes(author.toLowerCase())
        );
    }

    addBook(book) {
        if (this.getBookById(book.id)) {
            throw new Error("Book ID already exists");
        }
        this.db.Books.push(book);
        this.db.saveBooks();
        return book;
    }

    updateBook(id, updatedBook) {
        const index = this.db.Books.findIndex(b => b.id === Number(id));
        if (index === -1){
            return false;
        }

        Object.assign(this.db.Books[index], updatedBook);
        this.saveBooks();
        return true;
    }

    deleteBook(id){
        const initialLength = this.db.Books.length;

        this.books = this.db.Books.filter(b => b.id !== Number(id));

        if (this.db.Books.length === initialLength) {
            return false;
        }

        this.db.saveBooks();
        return true;
    }

    reduceBookStock(id, copies){
        const book = this.getBookById(id);

        if (!book) return false;

        // reduce stock throws if the quantity is invalid or exceeds stock
        try { 
            book.reduceStock(Number(copies));
        } catch (err) {
            return false;
        }
        this.db.saveBooks();
        return true;
    }

    increaseBookStock(id, copies) {
        const book = this.getBookById(id);

        if (!book) return false;

        try {
            book.increaseStock(Number(copies));
        } catch (err) {
            return false;
        }
        this.db.saveBooks();
        return true;
    }
}

module.exports = BookRepository;