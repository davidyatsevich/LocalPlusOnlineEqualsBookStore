// app shell — routing + nav bar
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from './state/auth.jsx';
import { useCart } from './state/cart.jsx';

import Home from './pages/Home.jsx';
import Browse from './pages/Browse.jsx';
import Cart from './pages/Cart.jsx';
import Login from './pages/Login.jsx';
import Staff from './pages/Staff.jsx';

// redirects non-staff users to login
function StaffRoute({ children }) {
  const { isStaff } = useAuth();
  return isStaff ? children : <Navigate to="/login" replace />;
}

function NavBar() {
  const { user, isLoggedIn, isStaff, signOut } = useAuth();
  const { count } = useCart();

  return (
    <nav className="nav-tabs" aria-label="Main navigation">
      <NavLink to="/" end>Home</NavLink>
      <NavLink to="/browse">Browse Books</NavLink>
      {!isStaff && (
        <NavLink to="/cart">Cart{count > 0 ? ` (${count})` : ''}</NavLink>
      )}
      {isStaff && <NavLink to="/staff">Staff Dashboard</NavLink>}

      <span className="nav-spacer" />

      {isLoggedIn ? (
        <>
          <span className="nav-user">Hi, {user.name}</span>
          <button type="button" onClick={signOut}>Log out</button>
        </>
      ) : (
        <NavLink to="/login">Login</NavLink>
      )}
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <NavBar />
        <main id="mainViewContent">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/staff"
              element={
                <StaffRoute>
                  <Staff />
                </StaffRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
