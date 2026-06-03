//=============================================================================
// SWE30003 - Bookstore Web Frontend: Browse Catalog 
// Reference Coding Standard: Google JavaScript Style Guide (ES6 Modules)
//=============================================================================

// Shared mock database matching your sample.js matrix definitions
const mockBookCatalog = [
    { id: 'BK-101', title: '[Book 1]', pricePerCopy: 15.99 },
    { id: 'BK-202', title: '[Book 2]', pricePerCopy: 18.50 },
    { id: 'BK-303', title: '[Book 3]', pricePerCopy: 14.25 },
    { id: 'BK-404', title: '[Book 4]', pricePerCopy: 16.95 }
];

export function renderBrowse() {
    let tableRows = mockBookCatalog.map((book) => {
        return `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px; font-family: monospace;">${book.id}</td>
                <td style="padding: 12px; font-weight: bold;">${book.title}</td>
                <td style="padding: 12px;">$${book.pricePerCopy.toFixed(2)} AUD</td>
                <td style="padding: 12px;">
                    <div style="display: flex; gap: 5px; align-items: center;">
                        <input type="number" id="qty-${book.id}" value="1" min="1" style="width: 60px; padding: 4px; margin: 0;">
                        <button class="add-to-cart-btn" data-id="${book.id}" data-title="${book.title}" style="padding: 6px 12px; margin: 0; background-color: #28a745;">
                            🛒 Add
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    return `
        <div class="view-content animate-fade">
            <h2>📚 Browse Store Inventory</h2>
            <p>Select items from our available stocks and update quantities before reviewing your cart.</p>
            
            <table style="width: 100%; border-collapse: collapse; text-align: left; background: #ffffff;">
                <thead>
                    <tr style="background-color: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                        <th style="padding: 12px;">Book ID</th>
                        <th style="padding: 12px;">Title</th>
                        <th style="padding: 12px;">Price (ea)</th>
                        <th style="padding: 12px;">Action Matrix</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
}