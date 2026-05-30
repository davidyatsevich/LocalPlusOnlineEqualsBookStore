const fs = require('fs');
const path = require('path');

class Database {
    //=================
    // Loads data from JSON files into memory at startup
    // Do not access arrays directly - use repositories only
    constructor() {
        this.Books = JSON.parse(fs.readFileSync(path.join(__dirname, 'books.json'))).Books;
        this.Accounts = JSON.parse(fs.readFileSync(path.join(__dirname, 'accounts.json'))).Accounts;
        this.Orders = JSON.parse(fs.readFileSync(path.join(__dirname, 'orders.json'))).Orders;
    }
}
//=================
// Singleton instance - import but do not instantiate or initialise a database elsewhere
module.exports = new Database();