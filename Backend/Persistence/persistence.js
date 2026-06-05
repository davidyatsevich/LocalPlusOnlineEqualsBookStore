const fs = require('fs');
const path = require('path');

class Database {
    //=================
    // Loads data from JSON files into memory at startup
    // Do not access arrays directly - use repositories only
    constructor() {
        this.booksPath = path.join(__dirname, 'books.json');
        this.accountsPath = path.join(__dirname, 'accounts.json');
        this.ordersPath = path.join(__dirname, 'orders.json');

        this.Books = JSON.parse(fs.readFileSync(this.booksPath)).Books;
        this.Accounts = JSON.parse(fs.readFileSync(this.accountsPath)).Accounts;
        this.Orders = JSON.parse(fs.readFileSync(this.ordersPath)).Orders;
    }

    // =========================
    // Save Accounts
    saveAccounts() {
        fs.writeFileSync(
            this.accountsPath,
            JSON.stringify({ Accounts: this.Accounts }, null, 2)
        );
    }

    // =========================
    // Save Books

    saveBooks() {
        fs.writeFileSync(
            this.booksPath,
            JSON.stringify({ Books: this.Books }, null, 2)
        );
    }

    // =========================
    // Save Orders
  
    saveOrders() {
        fs.writeFileSync(
            this.ordersPath,
            JSON.stringify({ Orders: this.Orders }, null, 2)
        );
    }
}
//=================
//import but do not instantiate or initialise a database elsewhere
module.exports = new Database();