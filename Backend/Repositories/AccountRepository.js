class AccountsRepository {
    constructor(db) {
        this.db = db;
    }


    // Create new account (customer or staff)
    createAccount(account) {
        this.db.accounts.push(account);
        return account;
    }

    // Get all accounts
    getAllAccounts() {
        return this.db.accounts;
    }

    //Find account by ID
    getAccountById(id) {
        return this.db.accounts.find(acc => acc.id === id) || null;
    }

    //Find account by email (used for login)
    getAccountByEmail(email) {
        return this.db.accounts.find(acc => acc.email === email) || null;
    }

    //Validate login credentials
    validateLogin(email, password) {
        const account = this.getAccountByEmail(email);

        if (!account) return null;

        if (account.password !== password) return null;

        return account; // login success
    }

    // Update account details
    updateAccount(id, updatedData) {
        const index = this.db.accounts.findIndex(acc => acc.id === id);

        if (index === -1) return null;

        this.db.accounts[index] = {
            ...this.db.accounts[index],
            ...updatedData
        };

        return this.db.accounts[index];
    }

    //Delete account
    deleteAccount(id) {
        const initialLength = this.db.accounts.length;

        this.db.accounts = this.db.accounts.filter(acc => acc.id !== id);

        return this.db.accounts.length < initialLength;
    }
}

module.exports = AccountsRepository;