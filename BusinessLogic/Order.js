//=================================
// Order - Business Logic
// Delegates order operations to OrderRepository
class Order {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    //=================
    // Create a new order
    createOrder(accountId, bookId, quantity) {
        return this.orderRepository.createOrder(accountId, bookId, quantity);
    }

    //=================
    // Get all orders for a specific account
    getOrdersByAccount(accountId) {
        return this.orderRepository.getAllOrders()
            .filter(order => order.accountId === accountId);
    }
}

module.exports = Order;