import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../api';
import { useAuth } from '../../context/AuthContext';
import './AdminLogin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await loginUser(form.email, form.password);
      if (data.token) {
        login(data.user, data.token);
        navigate('/admin/add-gem');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Server error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <div className="logo-text">
            <span className="logo-natural">Natural</span>
            <span className="logo-gems">Gems</span>
          </div>
          <span className="logo-diamond">◇</span>
        </div>
        <h2>Admin Portal</h2>
        <p className="login-sub">Sign in to manage your gem collection</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="admin@naturalgems.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="login-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'SIGN IN'}
          </button>
        </form>
        <p className="login-footer">©Natural Gems. All Rights Reserved, 2026</p>
      </div>
    </div>
  );
}
