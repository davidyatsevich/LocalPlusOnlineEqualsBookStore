//=============================================================================
// SWE30003 - Bookstore Web Frontend: Home View
// Reference Coding Standard: Google JavaScript Style Guide (ES6 Modules)
//=============================================================================

export function renderHome() {
  return `
    <div class="view-content animate-fade">
      <section class="hero">
        <h2 class="hero-heading">A bookstore worth visiting,<br>and a website worth using.</h2>
        <p class="hero-subtitle">
          Glenferrie Road, Hawthorn &mdash; now online.
          Browse our hand-picked collection, build your cart, and get an itemised invoice in minutes.
        </p>
        <button class="btn-primary" data-nav="browse">Browse Our Collection</button>
      </section>

      <section class="features-section">
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-dominant)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <h3>Curated Selection</h3>
            <p>Every title in our store is chosen with care &mdash; a compact catalogue of essential reads spanning literature, fiction, and the classics.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-dominant)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h3>Secure Checkout</h3>
            <p>Build your cart and review your order before placing it. Your selections are tracked clearly at every step of the process.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-dominant)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <h3>Instant Invoices</h3>
            <p>Every order generates a fully itemised tax invoice complete with GST breakdown &mdash; ready to save or print immediately.</p>
          </div>
        </div>
      </section>
    </div>
  `;
}
