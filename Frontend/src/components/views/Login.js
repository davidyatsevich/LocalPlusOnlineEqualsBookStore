//=============================================================================
// SWE30003 - Bookstore Web Frontend: Login View (placeholder — Cindy's area)
// Reference Coding Standard: Google JavaScript Style Guide (ES6 Modules)
//=============================================================================

export function renderLogin() {
  return `
    <div class="view-content animate-fade">
      <h2>Account Login</h2>
      <p class="login-coming-soon">
        Login functionality is coming soon &mdash; managed by the account team.
      </p>

      <div class="login-shell">
        <div class="form-group">
          <label class="form-label" for="loginEmail">Email address</label>
          <input
            type="text"
            id="loginEmail"
            class="form-input"
            placeholder="you@example.com"
            disabled
            aria-disabled="true"
          />
        </div>
        <div class="form-group">
          <label class="form-label" for="loginPassword">Password</label>
          <input
            type="password"
            id="loginPassword"
            class="form-input"
            placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
            disabled
            aria-disabled="true"
          />
        </div>
        <button class="btn-primary login-disabled-btn" disabled aria-disabled="true">
          Login
        </button>
      </div>

      <p class="login-register-note">
        New customer? Registration coming soon.
      </p>
    </div>
  `;
}
