import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const fmt = (n) => 'LKR.' + Number(n).toLocaleString('en-LK');

export default function Dashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [gems, setGems] = useState([]);
  const [stats, setStats] = useState({ totalGems: 0, availableGems: 0, soldGems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, gem: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch('http://localhost:5000/api/gems/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      setStats({
        totalGems:     statsData.totalGems     || 0,
        availableGems: statsData.availableGems || 0,
        soldGems:      statsData.soldGems      || 0,
      });
      setGems(statsData.recentGems || []);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [token]);

  const handleDeleteClick = (gem) => setDeleteModal({ open: true, gem });
  const handleDeleteCancel = () => setDeleteModal({ open: false, gem: null });

  const handleDeleteConfirm = async () => {
    if (!deleteModal.gem) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/gems/${deleteModal.gem._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDeleteModal({ open: false, gem: null });
        showToast('Gem deleted successfully');
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.message || 'Failed to delete gem', 'error');
      }
    } catch {
      showToast('Server error. Please try again.', 'error');
    }
    setDeleteLoading(false);
  };

  return (
    <AdminLayout title="Dashboard" subtitle="Admin Panel">

      {/* Toast Notification */}
      {toast.show && (
        <div className={`dash-toast dash-toast--${toast.type}`}>
          <span className="toast-icon">{toast.type === 'success' ? '✓' : '✕'}</span>
          {toast.message}
        </div>
      )}

      {error && <div className="dash-error">{error}</div>}

      {/* Stat Cards */}
      <div className="dash-stats">
        <StatCard icon={<GemIcon color="#3b6dd0" />} label="Total Gems"  value={loading ? '...' : stats.totalGems}     accent="blue"  />
        <StatCard icon={<CheckIcon />}                label="Available"  value={loading ? '...' : stats.availableGems} accent="green" />
        <StatCard icon={<SoldIcon />}                 label="Sold"       value={loading ? '...' : stats.soldGems}      accent="red"   />
      </div>

      {/* Recent Gems Table */}
      <section className="dash-table-section">
        <div className="dash-table-header">
          <h2 className="dash-table-title">Recent Gems</h2>
          <button className="dash-add-btn" onClick={() => navigate('/admin/add-gem')}>
            + Add New Gem
          </button>
        </div>

        <div className="dash-table-wrap">
          {loading ? (
            <div className="dash-loading">
              <div className="dash-spinner" />
              Loading gems...
            </div>
          ) : gems.length === 0 ? (
            <div className="dash-empty">No gems found. Add your first gem!</div>
          ) : (
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {gems.map((gem) => (
                  <tr key={gem._id}>
                    <td className="td-name">{gem.name}</td>
                    <td>{gem.category}</td>
                    <td className="td-price">{fmt(gem.price)}</td>
                    <td>
                      <span className={`dash-badge ${gem.status === 'Sold' ? 'badge-sold' : 'badge-available'}`}>
                        {gem.status}
                      </span>
                    </td>
                    <td>
                      <div className="dash-actions">
                        <button
                          className="dash-edit-btn"
                          onClick={() => navigate(`/admin/edit-gem/${gem._id}`)}
                          title="Edit gem"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </button>
                        <button
                          className="dash-delete-btn"
                          onClick={() => handleDeleteClick(gem)}
                          title="Delete gem"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <div className="dash-footer">©Natural Gems. All Rights Reserved, 2026</div>


      {deleteModal.open && (
        <div className="modal-overlay" onClick={handleDeleteCancel}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </div>
            <h3 className="modal-title">Delete Gem</h3>
            <p className="modal-message">
              Are you sure you want to delete <strong>"{deleteModal.gem?.name}"</strong>?
              <br />This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={handleDeleteCancel} disabled={deleteLoading}>
                Cancel
              </button>
              <button className="modal-delete-btn" onClick={handleDeleteConfirm} disabled={deleteLoading}>
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div className={`stat-card stat-card--${accent}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
      </div>
    </div>
  );
}

function GemIcon({ color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
      <line x1="12" y1="22" x2="12" y2="2"/>
      <line x1="2" y1="8.5" x2="22" y2="8.5"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}

function SoldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
}