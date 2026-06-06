// simulated payment — no real banking integration, just validates and returns a ref
class PaymentDetails {
    constructor(cardName, cardNumber, amount) {
        this.cardName = (cardName || '').trim();
        this.cardNumber = String(cardNumber || '').replace(/\s+/g, '');
        this.amount = Number(amount);
    }

    validate() {
        if (!this.cardName) {
            return { valid: false, error: 'Name on card is required.' };
        }
        if (!/^\d{12,19}$/.test(this.cardNumber)) {
            return { valid: false, error: 'Card number must be 12-19 digits.' };
        }
        if (!Number.isFinite(this.amount) || this.amount <= 0) {
            return { valid: false, error: 'Payment amount must be greater than zero.' };
        }
        return { valid: true, error: null };
    }

    process() {
        const { valid, error } = this.validate();
        if (!valid) {
            throw new Error(error);
        }
        return {
            status: 'approved',
            message: 'Payment processed successfully (simulated).',
            reference: `PAY-${Date.now()}`,
            amount: this.amount,
            cardLast4: this.cardNumber.slice(-4),
            processedAt: new Date().toISOString()
        };
    }
}

module.exports = PaymentDetails;
