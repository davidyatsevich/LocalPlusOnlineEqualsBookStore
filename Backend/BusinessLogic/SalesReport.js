// sales report — reads orders, plus book prices for revenue
class SalesReport {
   constructor(orderRepository, bookRepository) {
       this.orderRepository = orderRepository;
       this.bookRepository = bookRepository;
   }


   getTotalSalesByBook(bookId) {
       // coerce IDs — URL params are strings, stored IDs are numbers
       const orders = this.orderRepository.getAllOrders();
       return orders.filter(order => Number(order.bookId) === Number(bookId))
           .reduce((total, order) => total + order.quantity, 0);
   }


   getTotalSalesByAccount(accountId) {
       const orders = this.orderRepository.getAllOrders();
       return orders.filter(order => Number(order.accountId) === Number(accountId))
           .reduce((total, order) => total + order.quantity, 0);
   }

    getWeeklySalesByBook(bookId) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const orders = this.orderRepository.getAllOrders();
    return orders
        .filter(order => Number(order.bookId) === Number(bookId) && new Date(order.date) >= oneWeekAgo)
        .reduce((total, order) => total + order.quantity, 0);
    }


    // returns a { bookId: quantity } map for the last 7 days
    getWeeklySalesAllBooks() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const orders = this.orderRepository.getAllOrders()
        .filter(order => new Date(order.date) >= oneWeekAgo);

    const summary = {};
    orders.forEach(order => {
        summary[order.bookId] = (summary[order.bookId] || 0) + order.quantity;
    });
    return summary;
    }

    // headline figures for the dashboard over the last 7 days
    getWeeklySummary() {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const orders = this.orderRepository.getAllOrders()
            .filter(order => new Date(order.date) >= oneWeekAgo);

        const byBook = {};
        let units = 0;
        orders.forEach(order => {
            byBook[order.bookId] = (byBook[order.bookId] || 0) + order.quantity;
            units += order.quantity;
        });

        let revenue = 0;
        let bestSeller = null;
        Object.keys(byBook).forEach(bookId => {
            const qty = byBook[bookId];
            const book = this.bookRepository ? this.bookRepository.getBookById(bookId) : null;
            if (book) revenue += book.price * qty;
            if (!bestSeller || qty > bestSeller.quantity) {
                bestSeller = { bookId: Number(bookId), title: book ? book.title : null, quantity: qty };
            }
        });

        return { units, orders: orders.length, revenue, bestSeller };
    }
}


module.exports = SalesReport;