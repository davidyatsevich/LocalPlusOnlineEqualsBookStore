//=================================
// Order Repository
// GateKeeper for orders data only
class OrderRepository {
    constructor(db) {
        this.db = db;
    }
    //=================
    // CRUD Operations
    //=================

    //=================
    // Create a new order
    createOrder(order) {
        this.db.Orders.push(order);
        return order;
    }
    //=================
    // Get an existing order
    getOrder(orderId) {
        const order = this.db.Orders.find(order => order.id === orderId);
        if (!order) return null;
        return order;
    }
    //=================
    // Get all existing order
    getAllOrders() {
        return this.db.Orders;
    }
    //=================
    // Update an existing order
    updateOrder(orderId, updatedOrder) {
        const index = this.db.Orders.findIndex(order => order.id === orderId);
        if (index !== -1) {
            this.db.Orders[index] = { ...this.db.Orders[index], ...updatedOrder };
        }
        return orderId;
    }
    //=================
    // Delete an existing order
    deleteOrder(orderId) {
        this.db.Orders = this.db.Orders.filter(order => order.id !== orderId);
        return orderId;
    }

}