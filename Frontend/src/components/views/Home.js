//=============================================================================
// SWE30003 - Bookstore Web Frontend: Home 
// Reference Coding Standard: Google JavaScript Style Guide (ES6 Modules)

export function renderHome() {
    return `
        <div class="view-content animate-fade">
            <h2>🏠 Welcome to Favourite Books Online</h2>
            <p>Discover your next great read from our curated physical store hub on Glenferrie Road. Manage your account, browse our live inventory, and checkout securely all in one place.</p>
            
            <div class="features-grid" style="display: flex; gap: 20px; margin-top: 20px;">
                <div style="flex: 1; padding: 15px; background: #f1f3f5; border-radius: 6px;">
                    <h3>⚡ Fast & Easy</h3>
                    <p>Build your virtual cart basket and move seamlessly through our secure payment simulation gateway.</p>
                </div>
                <div style="flex: 1; padding: 15px; background: #f1f3f5; border-radius: 6px;">
                    <h3>📋 Real Invoices</h3>
                    <p>Instantly compile structural object data to generate and print legal, itemized tax invoice layouts (10% GST included).</p>
                </div>
            </div>
        </div>
    `;
}