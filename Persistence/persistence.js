class Database {
    //=================
    // Simulated in-memory database
    // Do not access arrays directly - use repositories only
    constructor() {
        this.Accounts = [];
        this.Books = [];
        this.Orders = [];
    }
}
module.exports = new Database();