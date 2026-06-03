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
}


module.exports = SalesReport;
