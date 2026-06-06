// landing page
import { Link } from 'react-router-dom';
import { useAuth } from '../state/auth.jsx';

export default function Home() {
  const { isLoggedIn, user, isStaff } = useAuth();

  return (
    <div className="animate-fade">
      <h1>Favourite Books — Online</h1>
      <p>
        Welcome to Favourite Books, Glenferrie Road&apos;s bookstore — now online.
        Browse our catalogue, build a cart, and check out from anywhere in Australia.
      </p>

      {isLoggedIn ? (
        <p className="success-msg">
          Signed in as <strong>{user.name}</strong> ({user.role}).
        </p>
      ) : (
        <p>
          <Link to="/login">Log in or create an account</Link> to place an order.
        </p>
      )}

      <div className="home-cards">
        <div className="home-card">
          <h3>Browse the catalogue</h3>
          <p>Search by title or author, sort alphabetically, and check stock.</p>
          <Link to="/browse"><button type="button">Browse Books</button></Link>
        </div>

        {!isStaff && (
          <div className="home-card">
            <h3>Shop &amp; check out</h3>
            <p>Add books to your cart and place an order to get a receipt.</p>
            <Link to="/cart"><button type="button">View Cart</button></Link>
          </div>
        )}

        {isStaff && (
          <div className="home-card">
            <h3>Staff tools</h3>
            <p>Update inventory levels and review weekly sales.</p>
            <Link to="/staff"><button type="button">Staff Dashboard</button></Link>
          </div>
        )}
      </div>
    </div>
  );
}
