class OrderRepository {
    constructor(db) {
        this.db = db;
    }
    createOrder(order) {
        this.db.Orders.push(order);
        return order;
    }

    getOrder(orderId) {
        const order = this.db.Orders.find(order => order.id === orderId);
        if (!order) return null;
        return order;
    }

    getAllOrders() {
        return this.db.Orders;
    }

    updateOrder(orderId, updatedOrder) {
        const index = this.db.Orders.findIndex(order => order.id === orderId);
        if (index !== -1) {
            this.db.Orders[index] = { ...this.db.Orders[index], ...updatedOrder };
        }
        return orderId;
    }
    
    deleteOrder(orderId) {
        this.db.Orders = this.db.Orders.filter(order => order.id !== orderId);
        return orderId;
    }

}