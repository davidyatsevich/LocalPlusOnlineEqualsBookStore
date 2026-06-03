//=============================================================================
// SWE30003 - Bookstore Web Frontend: Application Entry Point
// Reference Coding Standard: Google JavaScript Style Guide (ES6 Modules)
//=============================================================================

import './style.css';

import { renderHome } from './components/views/Home.js';
import { renderBrowse, setupBrowseListeners } from './components/views/Browse.js';
import { renderCart, setupCartListeners } from './components/views/Cart.js';
import { renderLogin } from './components/views/Login.js';

import { cart, addToCart, removeFromCart, clearCart, getCartTotal } from './store/cart.js';

// ---------------------------------------------------------------------------
// App shell
// ---------------------------------------------------------------------------
const appEl = document.querySelector('#app');

appEl.innerHTML = `
  <div class="container">
    <header>
      <h1>Favourite Books</h1>
      <p class="store-subtitle">Glenferrie Road, Hawthorn</p>
    </header>
    <nav class="nav-tabs" aria-label="Main navigation">
      <button class="nav-btn active" data-view="home">Home</button>
      <button class="nav-btn" data-view="browse">Browse Books</button>
      <button class="nav-btn" data-view="cart">Cart (<span id="cartCount">0</span>)</button>
      <button class="nav-btn" data-view="login">Login</button>
    </nav>
    <main id="viewContent"></main>
  </div>
`;

const viewContent = document.getElementById('viewContent');

// ---------------------------------------------------------------------------
// Cart count badge
// ---------------------------------------------------------------------------
function updateCartCount() {
  const countEl = document.getElementById('cartCount');
  if (countEl) {
    const total = cart.reduce((sum, entry) => sum + entry.quantity, 0);
    countEl.textContent = total;
  }
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------
let currentView = null;

/**
 * Navigate to a named view. Pass null to only update the cart count badge
 * without changing the rendered view.
 * @param {string|null} view
 */
function navigateTo(view) {
  if (view === null) {
    updateCartCount();
    return;
  }

  currentView = view;

  // Update active class on nav buttons
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });

  // Render the appropriate view
  switch (view) {
    case 'home':
      viewContent.innerHTML = renderHome();
      break;

    case 'browse':
      viewContent.innerHTML = renderBrowse();
      setupBrowseListeners(cart, addToCart, updateCartCount);
      break;

    case 'cart':
      viewContent.innerHTML = renderCart(cart);
      setupCartListeners(
        cart,
        removeFromCart,
        clearCart,
        () => {
          updateCartCount();
          navigateTo('cart');
        }
      );
      break;

    case 'login':
      viewContent.innerHTML = renderLogin();
      break;

    default:
      viewContent.innerHTML = renderHome();
  }

  updateCartCount();

  // Scroll back to top of view on navigation
  viewContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---------------------------------------------------------------------------
// Event delegation — nav buttons
// ---------------------------------------------------------------------------
document.querySelector('.nav-tabs').addEventListener('click', (e) => {
  const btn = e.target.closest('.nav-btn');
  if (btn && btn.dataset.view) {
    navigateTo(btn.dataset.view);
  }
});

// ---------------------------------------------------------------------------
// Event delegation — [data-nav] links inside view content
// ---------------------------------------------------------------------------
viewContent.addEventListener('click', (e) => {
  const trigger = e.target.closest('[data-nav]');
  if (trigger) {
    e.preventDefault();
    navigateTo(trigger.dataset.nav);
  }
});

// ---------------------------------------------------------------------------
// Initial render
// ---------------------------------------------------------------------------
navigateTo('home');
