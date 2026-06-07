
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, registerAccount } from '../api.js';
import { useAuth } from '../state/auth.jsx';

// basic email format check
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // reset everything when switching between login and register
  const switchMode = (newMode) => {
    setMode(newMode);
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrors({});
    setApiError('');
    setSuccessMsg('');
  };

  const validateLogin = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!isValidEmail(email.trim())) errs.email = 'Please enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    return { valid: Object.keys(errs).length === 0, errors: errs };
  };

  const validateRegister = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required.';
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!isValidEmail(email.trim())) errs.email = 'Please enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password.';
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    return { valid: Object.keys(errs).length === 0, errors: errs };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMsg('');

    const { valid, errors: validationErrors } =
      mode === 'login' ? validateLogin() : validateRegister();

    if (!valid) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      if (mode === 'login') {
        const user = await login(email.trim(), password);
        signIn({ id: user.id, name: user.name, role: user.role });
        setSuccessMsg(`Welcome back, ${user.name}! Redirecting…`);
        setTimeout(() => {
          navigate(user.role === 'staff' ? '/staff' : '/browse');
        }, 1000);
      } else {
        const user = await registerAccount(name.trim(), email.trim(), password);
        signIn({ id: user.id, name: user.name, role: user.role });
        navigate('/browse');
      }
    } catch (err) {
      setApiError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isLoginMode = mode === 'login';

  return (
    <div className="animate-fade auth-shell">
      <h2>{isLoginMode ? 'Login to Your Account' : 'Create a New Account'}</h2>

      <form onSubmit={handleSubmit} noValidate>
        {/* name field — register only */}
        {!isLoginMode && (
          <div className="field-group">
            <label htmlFor="auth-name">Full Name</label>
            <input
              id="auth-name"
              type="text"
              placeholder="Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              autoComplete="name"
            />
            {errors.name && <span className="error-msg">{errors.name}</span>}
          </div>
        )}

        {/* email */}
        <div className="field-group">
          <label htmlFor="auth-email">Email Address</label>
          <input
            id="auth-email"
            type="text"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
          />
          {errors.email && <span className="error-msg">{errors.email}</span>}
        </div>

        {/* password */}
        <div className="field-group">
          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            placeholder={isLoginMode ? 'Enter your password' : 'Min. 6 characters'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete={isLoginMode ? 'current-password' : 'new-password'}
          />
          {errors.password && <span className="error-msg">{errors.password}</span>}
        </div>

        {/* confirm password — register only */}
        {!isLoginMode && (
          <div className="field-group">
            <label htmlFor="auth-confirm-password">Confirm Password</label>
            <input
              id="auth-confirm-password"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <span className="error-msg">{errors.confirmPassword}</span>
            )}
          </div>
        )}

        {apiError && <p className="error-msg">{apiError}</p>}

        {successMsg && <p className="success-msg">{successMsg}</p>}
        <div className="form-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Please wait…' : isLoginMode ? 'Login' : 'Create Account'}
          </button>
          <button
            type="button"
            onClick={() => switchMode(isLoginMode ? 'register' : 'login')}
            disabled={loading}
            style={{
              background: 'none',
              border: '2px solid #0c5a3a',
              color: '#0c5a3a',
              fontWeight: 700,
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              font: 'inherit',
            }}
          >
            {isLoginMode ? 'Register' : 'Back to Login'}
          </button>
        </div>
      </form>

      {/* demo accounts for marking */}
      <aside className="muted" style={{ marginTop: '2rem', fontSize: '0.85rem' }}>
        <strong>Demo accounts (for marking):</strong>
        <ul style={{ margin: '0.4rem 0 0 1.2rem', lineHeight: '1.7' }}>
          <li>
            Customer: <code>john@gmail.com</code> / <code>customer123</code>
          </li>
          <li>
            Staff: <code>admin@bookstore.com</code> / <code>admin123</code>
          </li>
        </ul>
      </aside>
    </div>
  );
}
