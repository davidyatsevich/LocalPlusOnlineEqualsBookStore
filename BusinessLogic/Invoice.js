//=================================
// Invoice - Business Logic
// Reads from OrderRepository to generate invoices
class Invoice {
    constructor(orderRepository, bookRepository) {
        this.orderRepository = orderRepository;
        this.bookRepository = bookRepository;
    }

    //=================
    // Generate an invoice for a specific order
    generateInvoice(orderId) {
        const order = this.orderRepository.getOrder(orderId);
        if (!order) {
            throw new Error('Order not found');
        }
        const invoice = {
            id: `INV-${order.id}`,
            orderId: order.id,
            accountId: order.accountId,
            bookId: order.bookId,
            quantity: order.quantity,
            date: new Date().toISOString(),
            totalAmount: this.calculateTotal(order)
        };
        return invoice;
    }

    //=================
    // Calculate total amount from order and book price
    calculateTotal(order) {
        const book = this.bookRepository.getBook(order.bookId);
        const pricePerBook = book ? book.pricePerCopy : 10;
        return order.quantity * pricePerBook;
    }
}

module.exports = Invoice;