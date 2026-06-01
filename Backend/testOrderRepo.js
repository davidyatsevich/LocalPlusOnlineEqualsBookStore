const db = require('./Persistence/persistence');
const OrderRepository = require('./Repositories/OrderRepository');

const orderRepo = new OrderRepository(db);

//=================
// Test createOrder
const order1 = orderRepo.createOrder(1, 1, 2);
const order2 = orderRepo.createOrder(1, 2, 3);
console.log("Create order1:", order1);
console.log("Create order2:", order2);

//=================
// Test getOrder
console.log("Get order1:", orderRepo.getOrder(order1.id));

//=================
// Test getAllOrders
console.log("Get All:", orderRepo.getAllOrders());

//=================
// Test updateOrder
console.log("Update order2:", orderRepo.updateOrder(order2.id, { quantity: 5 }));
console.log("After Update:", orderRepo.getOrder(order2.id));

//=================
// Test deleteOrder + full cleanup
orderRepo.deleteOrder(order1.id);
orderRepo.deleteOrder(order2.id);
console.log("After Full Cleanup:", orderRepo.getAllOrders()); // should be []