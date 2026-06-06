// invoice business logic
class Invoice {
    constructor(orderRepository, bookRepository) {
        this.orderRepository = orderRepository;
        this.bookRepository = bookRepository;
    }

    // includes book details so the frontend receipt can show title/author/unit price
    generateInvoice(orderId) {
        const order = this.orderRepository.getOrder(orderId);
        if (!order) {
            throw new Error('Order not found');
        }
        const book = this.bookRepository.getBookById(order.bookId);
        const invoice = {
            id: `INV-${order.id}`,
            orderId: order.id,
            accountId: order.accountId,
            bookId: order.bookId,
            title: book ? book.title : 'Unknown',
            author: book ? book.author : 'Unknown',
            unitPrice: book ? book.price : 0,
            quantity: order.quantity,
            date: order.date || new Date().toISOString(),
            totalAmount: this.calculateTotal(order)
        };
        return invoice;
    }

    // books use `price`, not `pricePerCopy`
    calculateTotal(order) {
        const book = this.bookRepository.getBookById(order.bookId);
        const pricePerBook = book ? book.price : 0;
        return order.quantity * pricePerBook;
    }
}

module.exports = Invoice;