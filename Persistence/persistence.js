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
//=================
// Singleton instance - import but do not instantiate or initialise a database elsewhere
module.exports = new Database();