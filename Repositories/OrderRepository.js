//=================================
// Order Repository
// GateKeeper for orders data only
const fs = require('fs');
const path = require('path');
const ORDERS_PATH = path.join(__dirname, '../Persistence/orders.json');

class OrderRepository {
    constructor(db) {
        this.db = db;
    }
    //=================
    // CRUD Operations
    //=================

    //=================
    // Saves current orders to orders.json
    saveOrders() {
        fs.writeFileSync(ORDERS_PATH, JSON.stringify({ Orders: this.db.Orders }, null, 2));
    }
    //=================
    // Create a new order
    createOrder(order) {
        this.db.Orders.push(order);
        this.saveOrders();
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
    // Get all existing orders
    getAllOrders() {
        return this.db.Orders;
    }
    //=================
    // Update an existing order
    updateOrder(orderId, updatedOrder) {
        const index = this.db.Orders.findIndex(order => order.id === orderId);
        if (index !== -1) {
            this.db.Orders[index] = { ...this.db.Orders[index], ...updatedOrder };
            this.saveOrders();
        }
        return orderId;
    }
    //=================
    // Delete an existing order
    deleteOrder(orderId) {
        this.db.Orders = this.db.Orders.filter(order => order.id !== orderId);
        this.saveOrders();
        return orderId;
    }
}

module.exports = OrderRepository;