//=================================
// Main Entry Point
// Initialises and connects all layers

//=================
// Persistence
const db = require('./Persistence/persistence');

//=================
// Repositories
const OrderRepository = require('./Backend/Repositories/OrderRepository');

//=================
// Business Logic
const Order = require('./BusinessLogic/Order');
const Invoice = require('./BusinessLogic/Invoice');

//=================
// Actors
const { Customer, Staff } = require('./Actors/actors');

//=================
// Initialise Repositories
const orderRepository = new OrderRepository(db);

//=================
// Initialise Business Logic
const order = new Order(orderRepository);
const invoice = new Invoice(orderRepository);

//=================
// Future imports (not yet implemented?
// const BookRepository = require('./Repositories/BookRepository');
// const AccountRepository = require('./Repositories/AccountRepository');
// const { Book } = require('./BusinessLogic/Book');
// const { Catalogue } = require('./BusinessLogic/Catalogue');
// const { ShoppingCart } = require('./BusinessLogic/ShoppingCart');
// const { PaymentDetails } = require('./BusinessLogic/PaymentDetails');
// const { SalesReport } = require('./BusinessLogic/SalesReport');
// const UI = require('./Frontend/sample');

console.log("Favourite Books - Online Bookstore initialised");