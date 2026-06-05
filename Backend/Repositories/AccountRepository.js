class AccountsRepository {

    constructor(db) {
        this.db = db;
    }

    // Create Account -------------------------------------------------------
    createAccount(account) {

        // Add new account to memory
        this.db.Accounts.push(account);

        // Save changes to accounts.json
        this.db.saveAccounts();

        return account;
    }

    // Get all accounts-------------------------------------------------------
    getAllAccounts() {
        return this.db.Accounts;
    }

    // Find account by id-------------------------------------------------------
    getAccountById(id) {
        return this.db.Accounts.find(a => a.id === Number(id)) || null;
    }

    // find account by email-------------------------------------------------------
    getAccountByEmail(email) {
        return this.db.Accounts.find(
            a => a.email.toLowerCase() === email.toLowerCase()
        ) || null;
    }

    // login validation-------------------------------------------------------
    validateLogin(email, password) {
        const acc = this.getAccountByEmail(email);
        if (!acc) return null;

        return acc.password === password ? acc : null;
    }

    // update account and save -------------------------------------------------------
    updateAccount(id, data) {

        const acc = this.getAccountById(id);
        if (!acc) return false;

        // Update fields in memory
        Object.assign(acc, data);

        //Save changes to accounts.json
        this.db.saveAccounts();

        return true;
    }

    // delete account and save -------------------------------------------------------
    deleteAccount(id) {

        const before = this.db.Accounts.length;

        // Remove account from memory
        this.db.Accounts = this.db.Accounts.filter(
            a => a.id !== Number(id)
        );

        const changed = this.db.Accounts.length < before;

        // Save only if something was deleted
        if (changed) {
            this.db.saveAccounts();
        }

        return changed;
    }

    // filter customers-------------------------------------------------------
    getCustomers() {
        return this.db.Accounts.filter(a => a.role === "customer");
    }

    // filter staff-------------------------------------------------------
    getStaff() {
        return this.db.Accounts.filter(a => a.role === "staff");
    }
}

module.exports = AccountsRepository;