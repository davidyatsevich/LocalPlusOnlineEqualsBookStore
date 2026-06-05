//=================================
// SalesReport - Business Logic
// Reads from OrderRepository only
class SalesReport {
   constructor(orderRepository) {
       this.orderRepository = orderRepository;
   }


   //=================
   // Get total sales for a specific book
   getTotalSalesByBook(bookId) {
       const orders = this.orderRepository.getAllOrders();
       return orders.filter(order => order.bookId === bookId)
           .reduce((total, order) => total + order.quantity, 0);
   }


   //=================
   // Get total sales for a specific account
   getTotalSalesByAccount(accountId) {
       const orders = this.orderRepository.getAllOrders();
       return orders.filter(order => order.accountId === accountId)
           .reduce((total, order) => total + order.quantity, 0);
   }

   // Get total sales for a specific book in the last 7 days
    getWeeklySalesByBook(bookId) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const orders = this.orderRepository.getAllOrders();
    return orders
        .filter(order => order.bookId === bookId && new Date(order.date) >= oneWeekAgo)
        .reduce((total, order) => total + order.quantity, 0);
    }



    //Get weekly sales for all books 
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