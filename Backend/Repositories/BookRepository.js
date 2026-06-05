const fs = require("fs");
const path = require("path")
const Book = require("../BusinessLogic/Book");

class BookRepository {

    constructor() {
        this.filePath = path.join(__dirname, "../Persistence/books.json");
        this.books = this.loadBooks();
    }


    //load books from books.json-----------------------------------------------
    loadBooks() {
        const data = JSON.parse(fs.readFileSync(this.filePath, "utf-8"))
        return data.Books.map(
            b => new Book(b.id, b.title, b.author, b.price, b.stock)

        );
    }


    //save books to books.json----------------------------------------------------
    saveBooks() {
        fs.writeFileSync(
            this.filePath,
            JSON.stringify({Books: this.books }, null, 2)
        );
    }


    //Read Operation-------------------------------------------------------------------

    //get all books
    getAllBooks() {
        return this.books;
    }

    //get book by id
    getBookById(id){
        return this.books.find(book => book.id === Number(id));
    }

    //get book by title
    getBookByTitle(title){
        return this.books.filter(book =>
            book.title.toLowerCase().includes(title.toLowerCase())
        );
    }

    //get book by author
    getBookByAuthor(author){
        return this.books.filter(book =>
            book.author.toLowerCase().includes(author.toLowerCase())
        );
    }

    //add book-----------------------------------------------------------------
    addBook(book) {   
    // prevent duplicate IDs
        if (this.getBookById(book.id)) {
            throw new Error("Book ID already exists");
        }
        this.books.push(book);
        this.saveBooks();
        return book;
    }

    //update book---------------------------------------------------------------
    updateBook(id, updatedBook) {
        const index = this.books.findIndex(b => b.id === Number(id));
        if (index === -1){
            return false;
        }

        Object.assign(book, updatedData);
        this.saveBooks();
        return true;
    }

    //delete books---------------------------------------------------------------------
    deleteBook(id){
        const initialLength = this.books.length;

        this.books = this.books.filter(b => b.id !== Number(id));

        if (this.books.length === initialLength) {
            return false;
        }

        this.saveBooks();
        return true;
    }

    //stock operation------------------------------------------------------------
    reduceBookStock(id, copies){
        const book = this.getBookById(id);

        if (!book) return false;

        book.reduceStock(copies);
        this.saveBooks();
        return true;
    }

    increaseBookStock(id, copies) {
        const book = this.getBookById(id);

        if (!book) return false;

        book.increaseStock(copies);
        this.saveBooks();
        return true;
    }
}

module.exports = BookRepository;