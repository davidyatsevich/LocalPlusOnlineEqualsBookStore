const db = require('./Persistence/persistence');
const OrderRepository = require('./Repositories/OrderRepository');

const orderRepo = new OrderRepository(db);

// Test createOrder
const newOrder = { id: 1, bookId: 1, customerId: 1, quantity: 2 };
console.log("Create:", orderRepo.createOrder(newOrder));

// Test getOrder
console.log("Get:", orderRepo.getOrder(1));

// Test getAllOrders
console.log("Get All:", orderRepo.getAllOrders());

// Test updateOrder
console.log("Update:", orderRepo.updateOrder(1, { quantity: 5 }));
console.log("After Update:", orderRepo.getOrder(1));

// Test deleteOrder
console.log("Delete:", orderRepo.deleteOrder(1));
console.log("After Delete:", orderRepo.getAllOrders());