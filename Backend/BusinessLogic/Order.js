// order business logic
class Order {
    constructor(orderRepository, bookRepository) {
        this.orderRepository = orderRepository;
        this.bookRepository = bookRepository;
    }

    // validates stock and decrements it before creating the order record;
    // throws on missing book, bad quantity, or insufficient stock
    createOrder(accountId, bookId, quantity) {
        const qty = Number(quantity);
        const book = this.bookRepository ? this.bookRepository.getBookById(bookId) : null;

        if (this.bookRepository) {
            if (!book) {
                throw new Error('Book not found.');
            }
            if (!Number.isInteger(qty) || qty <= 0) {
                throw new Error('Quantity must be a positive whole number.');
            }
            if (book.stock < qty) {
                throw new Error(`Insufficient stock for "${book.title}" (only ${book.stock} left).`);
            }
            this.bookRepository.reduceBookStock(bookId, qty);
        }

        return this.orderRepository.createOrder(accountId, bookId, qty);
    }

    getOrdersByAccount(accountId) {
        // coerce both sides — URL params are strings, stored IDs are numbers
        return this.orderRepository.getAllOrders()
            .filter(order => Number(order.accountId) === Number(accountId));
    }
}

module.exports = Order;