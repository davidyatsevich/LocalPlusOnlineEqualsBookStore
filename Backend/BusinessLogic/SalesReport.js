// sales report — reads from OrderRepository only
class SalesReport {
   constructor(orderRepository) {
       this.orderRepository = orderRepository;
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
}


module.exports = SalesReport;