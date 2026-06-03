import { renderHome } from './home.js';
import { renderBrowse } from './browse.js';
import { renderAbout } from './about.js';

const viewContainer = document.getElementById('mainViewContent');

// Default initial viewport boot layout state
viewContainer.innerHTML = renderHome();

// Navigation Event Binder Hookups
document.getElementById('navHome').addEventListener('click', () => {
    viewContainer.innerHTML = renderHome();
});

document.getElementById('navAbout').addEventListener('click', () => {
    viewContainer.innerHTML = renderAbout();
});

document.getElementById('navBrowse').addEventListener('click', () => {
    viewContainer.innerHTML = renderBrowse();
    setupCartButtonListeners(); // Wire up click captures on newly appended DOM buttons
});

function setupCartButtonListeners() {
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookId = e.target.getAttribute('data-id');
            const title = e.target.getAttribute('data-title');
            const qtyInput = document.getElementById(`qty-${bookId}`);
            const quantity = parseInt(qtyInput.value, 10);
            
            // Reuses your strict data type boundary check validations!
            if (isNaN(quantity) || quantity <= 0) {
                alert("❌ Usability Error: Quantity must be a valid positive integer numeric type.");
                return;
            }
            
            // Push selection to array logic
            sessionCart.push({ bookId, title, quantity });
            alert(`✅ Added ${quantity} copy/copies of "${title}" to your cart.`);
        });
    });
}